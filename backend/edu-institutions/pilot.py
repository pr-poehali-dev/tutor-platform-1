"""Пилот по городам: список городов, статистика, загрузка школ из реестра, авторассылка с дневным лимитом."""
import os
import time
from datetime import datetime, timedelta, timezone

import helper_letters
import kids_pilot
import outreach
import wave2
import registry_extra
import registry_regions
import registry_samara_region
import registry_wave1
import registry_wave2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
TABLE = f'{SCHEMA}.edu_institutions'
CITY_COLS = 'slug, name, name_in, name_gen, promo_code, campaign_code, wave, active, page_slug'
# Функция обрывается платформой по таймауту — укладываемся с запасом.
TIME_BUDGET_SEC = 20


def _city(r) -> dict:
    return dict(zip(('slug', 'name', 'name_in', 'name_gen', 'promo_code', 'campaign_code', 'wave', 'active', 'page_slug'), r))


def get_city(cur, slug: str):
    cur.execute(f'SELECT {CITY_COLS} FROM {SCHEMA}.pilot_cities WHERE slug=%s', (slug,))
    r = cur.fetchone()
    return _city(r) if r else None


def all_cities(cur) -> list:
    cur.execute(f'SELECT {CITY_COLS} FROM {SCHEMA}.pilot_cities ORDER BY queue_order, wave, name')
    return [_city(r) for r in cur.fetchall()]


def audience_where(city: dict) -> str:
    """Школы города с почтой, не отписавшиеся и ещё не получившие письмо этой кампании.
    Значения подставлены из таблицы городов (не из запроса), экранирование — на всякий случай."""
    name = city['name'].replace("'", "''")
    camp = city['campaign_code'].replace("'", "''")
    return (f"audience='school' AND city='{name}' AND email<>'' AND unsubscribed_at IS NULL AND status NOT IN ('declined','partner') "
            f"AND NOT EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends s WHERE s.institution_id={TABLE}.id "
            f"AND s.campaign_code='{camp}' AND s.status='sent' AND s.is_test=FALSE) "
            # Отказы «подозрение на спам» — про репутацию ящика, а не про адрес школы: их не считаем.
            f"AND (SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
            f"AND f.campaign_code='{camp}' AND f.status='failed' AND f.is_test=FALSE "
            f"AND coalesce(f.error,'') NOT ILIKE '%%spam%%' AND coalesce(f.error,'') NOT LIKE '%%5.7.1%%') "
            f"< {outreach.MAX_ATTEMPTS} "
            f"AND (SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
            f"AND f.status='failed' AND f.is_test=FALSE "
            f"AND (f.error ILIKE '%%spam%%' OR f.error LIKE '%%5.7.1%%')) < {outreach.SPAM_PER_ADDRESS_MAX}")


def failed_order(city: dict) -> str:
    """Школы с неудачными попытками — в конец очереди, чтобы одна не блокировала остальные."""
    camp = city['campaign_code'].replace("'", "''")
    return (f"(SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
            f"AND f.campaign_code='{camp}' AND f.status='failed' AND f.is_test=FALSE), id")


# Отказ «спам» по адресу, на который уже был такой отказ, — проблема адреса, в паузу всей рассылки не идёт.
SPAM_SQL = (f"((error ILIKE '%%spam%%' OR error LIKE '%%5.7.1%%') AND NOT EXISTS (SELECT 1 FROM "
            f"{SCHEMA}.edu_campaign_sends p WHERE p.to_email = edu_campaign_sends.to_email "
            "AND p.status='failed' AND p.created_at < edu_campaign_sends.created_at "
            "AND (p.error ILIKE '%%spam%%' OR p.error LIKE '%%5.7.1%%')))")
QUOTA_SQL = ("(error ILIKE '%%quota%%' OR error ILIKE '%%limit%%' OR error LIKE '%%SMTPSenderRefused%%' "
             "OR error LIKE '%%5.4.%%' OR error LIKE '%%4.2.%%')")


def spam_cooldown_min(cur) -> int:
    """Сколько минут ещё ждать после отказа Яндекса (0 — можно слать).
    Пауза растёт с числом отказов «спам» за сутки, а при упоре в суточный лимит — 24 часа."""
    cur.execute(f"SELECT max(created_at) FILTER (WHERE {SPAM_SQL} AND NOT {QUOTA_SQL}), "
                f"count(*) FILTER (WHERE {SPAM_SQL} AND NOT {QUOTA_SQL}), "
                f"max(created_at) FILTER (WHERE {QUOTA_SQL}) "
                f"FROM {SCHEMA}.edu_campaign_sends WHERE status='failed' AND created_at > now() - interval '48 hours'")
    last_spam, spam_n, last_quota = cur.fetchone()
    now = datetime.now(timezone.utc)
    left = 0.0
    if last_spam:
        cur.execute(f"SELECT count(*) FROM {SCHEMA}.edu_campaign_sends WHERE status='failed' AND {SPAM_SQL} "
                    f"AND NOT {QUOTA_SQL} AND created_at > %s - interval '24 hours'", (last_spam,))
        n = cur.fetchone()[0]
        step = outreach.SPAM_COOLDOWN_STEPS_MIN[min(n, len(outreach.SPAM_COOLDOWN_STEPS_MIN)) - 1]
        left = max(left, step - (now - last_spam).total_seconds() / 60)
    if last_quota:
        left = max(left, outreach.QUOTA_COOLDOWN_MIN - (now - last_quota).total_seconds() / 60)
    return max(0, int(left + 0.999))


def spam_rejects_24h(cur) -> int:
    cur.execute(f"SELECT count(*) FROM {SCHEMA}.edu_campaign_sends WHERE status='failed' AND {SPAM_SQL} "
                f"AND created_at > now() - interval '24 hours'")
    return cur.fetchone()[0]


def pending_by_city(cur, cities: list) -> dict:
    """Очередь первой волны по всем городам одним запросом (раньше — запрос на город, упирались в лимит базы)."""
    if not cities:
        return {}
    pairs = ','.join(cur.mogrify('(%s,%s)', (c['name'], c['campaign_code'])).decode() for c in cities)
    cur.execute(
        f"WITH c(name, camp) AS (VALUES {pairs}), "
        f"f AS (SELECT institution_id, campaign_code, "
        f"count(*) FILTER (WHERE status='sent') AS sent, "
        f"count(*) FILTER (WHERE status='failed' AND coalesce(error,'') NOT ILIKE '%%spam%%' AND coalesce(error,'') NOT LIKE '%%5.7.1%%') AS fails "
        f"FROM {SCHEMA}.edu_campaign_sends WHERE is_test=FALSE GROUP BY 1,2), "
        f"sp AS (SELECT institution_id, count(*) AS spam FROM {SCHEMA}.edu_campaign_sends "
        f"WHERE is_test=FALSE AND status='failed' AND (error ILIKE '%%spam%%' OR error LIKE '%%5.7.1%%') GROUP BY 1) "
        f"SELECT c.name, count(e.id) FROM c JOIN {TABLE} e ON e.city=c.name AND e.audience='school' "
        f"LEFT JOIN f ON f.institution_id=e.id AND f.campaign_code=c.camp "
        f"LEFT JOIN sp ON sp.institution_id=e.id "
        f"WHERE e.email<>'' AND e.unsubscribed_at IS NULL AND e.status NOT IN ('declined','partner') "
        f"AND coalesce(f.sent,0)=0 AND coalesce(f.fails,0) < {outreach.MAX_ATTEMPTS} "
        f"AND coalesce(sp.spam,0) < {outreach.SPAM_PER_ADDRESS_MAX} GROUP BY c.name")
    return dict(cur.fetchall())


def overview(cur) -> dict:
    cities = all_cities(cur)
    cur.execute(f"SELECT city, count(*), count(*) FILTER (WHERE email<>''), "
                f"count(*) FILTER (WHERE unsubscribed_at IS NOT NULL) FROM {TABLE} WHERE audience='school' GROUP BY city")
    base = {c: (t, e, u) for c, t, e, u in cur.fetchall()}
    cur.execute(f"SELECT campaign_code, status, count(*) FROM {SCHEMA}.edu_campaign_sends "
                f"WHERE is_test=FALSE GROUP BY 1,2")
    sends = {}
    for camp, st, n in cur.fetchall():
        sends.setdefault(camp, {})[st] = n
    cur.execute(f"SELECT code, used_count FROM {SCHEMA}.access_promo_codes")
    used = {c: n for c, n in cur.fetchall()}
    queue = pending_by_city(cur, cities)
    out = []
    for c in cities:
        pending = queue.get(c['name'], 0)
        t, e, u = base.get(c['name'], (0, 0, 0))
        s = sends.get(c['campaign_code'], {})
        out.append({**c, 'total': t, 'with_email': e, 'unsubscribed': u, 'pending': pending,
                    'sent': s.get('sent', 0), 'failed': s.get('failed', 0),
                    # Промокод региона общий с центром — активации показываем только в строке центра.
                    'activations': 0 if c.get('page_slug') else used.get(c['promo_code'], 0)})
    st = settings(cur)
    return {'cities': out, 'auto': st, 'sent_today': sent_today(cur), 'cooldown_min': spam_cooldown_min(cur),
            'effective_limit': effective_limit(cur, st), 'interval_min': batch_interval_min(effective_limit(cur, st)),
            'registry_rows': registry_size()}


def settings(cur) -> dict:
    cur.execute(f'SELECT auto_enabled, daily_limit, last_tick_at FROM {SCHEMA}.outreach_settings WHERE id=1')
    r = cur.fetchone() or (False, 250, None)
    return {'enabled': bool(r[0]), 'daily_limit': min(int(r[1]), outreach.DAILY_LIMIT_MAX),
            'last_tick_at': r[2].isoformat() if r[2] else None}


def effective_limit(cur, st: dict) -> int:
    """Лимит на ближайшие сутки: после отказов «спам» вдвое ниже, пока репутация ящика не восстановится."""
    limit = st['daily_limit']
    if spam_rejects_24h(cur) > 0:
        limit = limit // 2
    return max(10, limit)


def save_settings(cur, body: dict) -> dict:
    cur_s = settings(cur)
    enabled = bool(body.get('enabled')) if 'enabled' in body else cur_s['enabled']
    try:
        limit = int(body.get('daily_limit') or cur_s['daily_limit'])
    except (TypeError, ValueError):
        limit = cur_s['daily_limit']
    limit = max(10, min(limit, outreach.DAILY_LIMIT_MAX))
    cur.execute(f'UPDATE {SCHEMA}.outreach_settings SET auto_enabled=%s, daily_limit=%s, updated_at=now() WHERE id=1',
                (enabled, limit))
    return {'enabled': enabled, 'daily_limit': limit, 'last_tick_at': cur_s['last_tick_at']}


def sent_today(cur) -> int:
    """Писем за последние 24 часа — так считает Яндекс. И вручную, и автоматически, включая тесты."""
    cur.execute(f"SELECT count(*) FROM {SCHEMA}.edu_campaign_sends WHERE status='sent' "
                f"AND created_at > now() - interval '24 hours'")
    return cur.fetchone()[0]


def registry_size() -> int:
    return sum(len(r.ROWS) for r in REGISTRIES.values())


REGISTRIES = {'wave1': registry_wave1, 'wave2': registry_wave2, 'samara_region': registry_samara_region,
              'extra': registry_extra}


def import_registry(cur, conn, name: str = 'wave1') -> dict:
    """Загружает школы из реестра одним запросом. Повторный запуск ничего не дублирует (ключ — город + ИНН)."""
    if name in registry_regions.SLUGS:
        rows, source = registry_regions.rows(name), registry_regions.SOURCE
    elif name in REGISTRIES:
        rows, source = REGISTRIES[name].ROWS, REGISTRIES[name].SOURCE
    else:
        return {'error': 'Неизвестный реестр'}
    if not rows:
        return {'inserted': 0, 'skipped': 0, 'total': 0}
    cur.execute(f'SELECT count(*) FROM {TABLE}')
    before = cur.fetchone()[0]
    values = ','.join(cur.mogrify('(%s,%s,%s,%s,%s,%s,%s,%s)', r).decode('utf-8') for r in rows)
    cur.execute(
        f"INSERT INTO {TABLE} (org_name, kind, contact_name, phone, email, city, status, address, segment, "
        f"source, note, unsubscribe_token) "
        f"SELECT left(v.n,300), 'other', left(v.d,200), left(v.p,50), left(v.e,200), v.c, 'new', left(v.a,400), v.s, "
        f"%s, 'ИНН ' || v.i, md5(random()::text || clock_timestamp()::text || v.n || v.c) "
        f"FROM (VALUES {values}) AS v(n, d, p, e, c, a, s, i) "
        f"WHERE NOT EXISTS (SELECT 1 FROM {TABLE} x WHERE x.city = v.c AND x.note = 'ИНН ' || v.i)",
        (source[:300],))
    conn.commit()
    cur.execute(f'SELECT count(*) FROM {TABLE}')
    inserted = cur.fetchone()[0] - before
    return {'inserted': inserted, 'skipped': len(rows) - inserted, 'total': len(rows)}


def send_for_city(cur, conn, city: dict, limit: int, unsub_url, inst_by_id, ensure_token, started: float) -> dict:
    """Отправляет до limit писем школам города. Останавливается при сбое почты или нехватке времени."""
    cur.execute(f'SELECT id FROM {TABLE} WHERE {audience_where(city)} ORDER BY {failed_order(city)} LIMIT %s', (limit,))
    ids = [r[0] for r in cur.fetchall()]
    sent, failed, errors, stop = 0, 0, [], False
    if not ids:
        return {'sent': 0, 'failed': 0, 'errors': [], 'stop': False}
    smtp = outreach.open_smtp()
    try:
        for rid in ids:
            if time.time() - started > TIME_BUDGET_SEC:
                break
            inst, token = inst_by_id(cur, rid)
            token = ensure_token(cur, rid, token)
            unsub = unsub_url(token)
            subject, html, text, reply = outreach.build_letter(inst, unsub, city)
            try:
                outreach.send_one(smtp, inst['email'], subject, html, text, unsub, reply)
                cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status) "
                            f"VALUES (%s,%s,%s,'sent')", (city['campaign_code'], rid, inst['email']))
                cur.execute(f"UPDATE {TABLE} SET last_mailed_at=now(), mail_count=mail_count+1, "
                            f"status=CASE WHEN status='new' THEN 'contacted' ELSE status END, updated_at=now() "
                            f"WHERE id=%s", (rid,))
                sent += 1
            except Exception as e:
                msg = f'{type(e).__name__}: {str(e)[:300]}'
                cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status, error) "
                            f"VALUES (%s,%s,%s,'failed',%s)", (city['campaign_code'], rid, inst['email'], msg))
                failed += 1
                errors.append({'org': inst['org_name'], 'email': inst['email'], 'error': msg})
                # Почтовый сервер ограничил отправку — дальше не пытаемся, иначе ящик заблокируют.
                if 'SMTPDataError' in msg or 'SMTPSenderRefused' in msg or 'quota' in msg.lower():
                    stop = 'spam' if outreach.is_spam_reject(msg) else 'blocked'
                    conn.commit()
                    break
            conn.commit()
            outreach.pause()
    finally:
        try:
            smtp.quit()
        except Exception:
            pass
    return {'sent': sent, 'failed': failed, 'errors': errors[:5], 'stop': stop}


def batch_interval_min(limit: int) -> int:
    """Через сколько минут следующая партия, чтобы письма шли равномерно круглые сутки."""
    return max(5, int(1440 * outreach.AUTO_BATCH / max(1, limit)))


def first_wave_pending(cur) -> int:
    return sum(pending_by_city(cur, [c for c in all_cities(cur) if c['active']]).values())


def wave2_pending(cur) -> int:
    cur.execute(f'SELECT count(*) FROM {TABLE} WHERE {wave2.audience_where()}')
    return cur.fetchone()[0]


def wave2_enabled(cur) -> bool:
    cur.execute(f'SELECT wave2_enabled FROM {SCHEMA}.outreach_settings WHERE id=1')
    r = cur.fetchone()
    return bool(r and r[0])


def send_wave2(cur, conn, limit: int, unsub_url, inst_by_id, ensure_token, started: float) -> dict:
    """Письма «Расскажите о школе». Те же правила осторожности, что и у первой волны."""
    cur.execute(f'SELECT id FROM {TABLE} WHERE {wave2.audience_where()} ORDER BY rating_score DESC, id LIMIT %s', (limit,))
    ids = [r[0] for r in cur.fetchall()]
    sent, failed, errors, stop = 0, 0, [], False
    if not ids:
        return {'sent': 0, 'failed': 0, 'errors': [], 'stop': False}
    smtp = outreach.open_smtp()
    try:
        for rid in ids:
            if time.time() - started > TIME_BUDGET_SEC:
                break
            inst, token = inst_by_id(cur, rid)
            token = ensure_token(cur, rid, token)
            subject, html, text, reply = wave2.letter_for(cur, rid, inst, unsub_url(token))
            try:
                outreach.send_one(smtp, inst['email'], subject, html, text, unsub_url(token), reply)
                cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status) "
                            f"VALUES (%s,%s,%s,'sent')", (wave2.CAMPAIGN, rid, inst['email']))
                cur.execute(f"UPDATE {TABLE} SET last_mailed_at=now(), mail_count=mail_count+1, updated_at=now() WHERE id=%s", (rid,))
                sent += 1
            except Exception as e:
                msg = f'{type(e).__name__}: {str(e)[:300]}'
                cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status, error) "
                            f"VALUES (%s,%s,%s,'failed',%s)", (wave2.CAMPAIGN, rid, inst['email'], msg))
                failed += 1
                errors.append({'org': inst['org_name'], 'email': inst['email'], 'error': msg})
                if 'SMTPDataError' in msg or 'SMTPSenderRefused' in msg or 'quota' in msg.lower():
                    stop = 'spam' if outreach.is_spam_reject(msg) else 'blocked'
                    conn.commit()
                    break
            conn.commit()
            outreach.pause()
    finally:
        try:
            smtp.quit()
        except Exception:
            pass
    return {'sent': sent, 'failed': failed, 'errors': errors[:5], 'stop': stop}


def auto_tick(cur, conn, unsub_url, inst_by_id, ensure_token) -> dict:
    """Шаг авторассылки 24/7: вызывается планировщиком и с сайта при посещениях. Шлёт маленькую партию,
    равномерно по суткам, не превышая лимит Яндекса за последние 24 часа."""
    cur.execute(f'UPDATE {SCHEMA}.outreach_settings SET last_tick_at=now() WHERE id=1')
    conn.commit()
    st = settings(cur)
    if not st['enabled']:
        return {'skipped': 'disabled'}
    user, password = outreach.smtp_creds()
    if not (user and password):
        return {'skipped': 'smtp_not_configured'}
    # Одна партия за раз и не чаще раза в 3 минуты: защищает от параллельных вызовов из многих вкладок.
    # Захват «замка» одной строкой: сработает только у одного из параллельных вызовов.
    cur.execute(f"UPDATE {SCHEMA}.outreach_settings SET locked_until = now() + interval '1 minute' "
                f"WHERE id=1 AND (locked_until IS NULL OR locked_until < now()) RETURNING id")
    got = cur.fetchone()
    conn.commit()
    if not got:
        return {'skipped': 'busy'}
    try:
        return _auto_batch(cur, conn, st, unsub_url, inst_by_id, ensure_token)
    finally:
        cur.execute(f"UPDATE {SCHEMA}.outreach_settings SET locked_until = NULL WHERE id=1")
        conn.commit()


def _auto_batch(cur, conn, st, unsub_url, inst_by_id, ensure_token) -> dict:
    if spam_cooldown_min(cur) > 0:
        return {'skipped': 'spam_cooldown'}
    limit = effective_limit(cur, st)
    cur.execute(f"SELECT max(created_at) FROM {SCHEMA}.edu_campaign_sends WHERE is_test=FALSE")
    last = cur.fetchone()[0]
    if last and datetime.now(timezone.utc) - last < timedelta(minutes=batch_interval_min(limit)):
        return {'skipped': 'too_soon'}
    left_today = limit - sent_today(cur)
    if left_today <= 0:
        return {'skipped': 'daily_limit'}
    batch = min(outreach.AUTO_BATCH, left_today)
    started = time.time()
    total = {'sent': 0, 'failed': 0, 'cities': []}
    # Пилот «Малыш»: детским домам и садам — половина каждой партии, чтобы большая школьная очередь их не вытесняла.
    if kids_pilot.settings(cur):
        kr = kids_pilot.send_batch(cur, conn, (batch + 1) // 2, unsub_url, inst_by_id, ensure_token, started)
        if kr['sent'] or kr['failed']:
            total['cities'].append({'city': 'Малыш: сады и детские дома', 'sent': kr['sent'], 'failed': kr['failed']})
        total['sent'] += kr['sent']
        total['failed'] += kr['failed']
        batch -= kr['sent'] + kr['failed']
        if kr['stop']:
            total['stopped'] = f'Яндекс ограничил отправку — пауза {spam_cooldown_min(cur)} мин.'
            return total
    # Второе письмо «ИИ-помощник для родителей»: только когда писем о «Малыше» в этой партии уже нет,
    # и не больше половины партии — школьная очередь первой волны не останавливается.
    if total['sent'] == 0 and total['failed'] == 0 and batch > 0 and kids_pilot.settings(cur):
        hr = helper_letters.send_batch(cur, conn, (batch + 1) // 2, unsub_url, inst_by_id, ensure_token,
                                       started, TIME_BUDGET_SEC)
        if hr['sent'] or hr['failed']:
            total['cities'].append({'city': 'ИИ-помощник для родителей', 'sent': hr['sent'], 'failed': hr['failed']})
        total['sent'] += hr['sent']
        total['failed'] += hr['failed']
        batch -= hr['sent'] + hr['failed']
        if hr['stop']:
            total['stopped'] = f'Яндекс ограничил отправку — пауза {spam_cooldown_min(cur)} мин.'
            return total
    for city in all_cities(cur):
        if not city['active'] or batch <= 0:
            continue
        r = send_for_city(cur, conn, city, batch, unsub_url, inst_by_id, ensure_token, started)
        if r['sent'] or r['failed']:
            total['cities'].append({'city': city['name'], 'sent': r['sent'], 'failed': r['failed']})
        total['sent'] += r['sent']
        total['failed'] += r['failed']
        batch -= r['sent'] + r['failed']
        if r['stop']:
            # Пауза считается по журналу отказов (spam_cooldown_min), авторассылка продолжит сама.
            total['stopped'] = f'Яндекс ограничил отправку — пауза {spam_cooldown_min(cur)} мин.'
            break
        if time.time() - started > TIME_BUDGET_SEC:
            break
    # Первая волна пуста (ничего не ушло) — партия уходит второй волне «Расскажите о школе».
    if total['sent'] == 0 and total['failed'] == 0 and not total.get('stopped') and wave2_enabled(cur):
        r = send_wave2(cur, conn, batch, unsub_url, inst_by_id, ensure_token, started)
        if r['sent'] or r['failed']:
            total['cities'].append({'city': 'Вторая волна', 'sent': r['sent'], 'failed': r['failed']})
        total['sent'] += r['sent']
        total['failed'] += r['failed']
        if r['stop']:
            total['stopped'] = f'Яндекс ограничил отправку — пауза {spam_cooldown_min(cur)} мин.'
    return total
