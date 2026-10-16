"""Пилот по городам: список городов, статистика, загрузка школ из реестра, авторассылка с дневным лимитом."""
import os
import time
from datetime import datetime, timedelta, timezone

import outreach
import registry_regions
import registry_samara_region
import registry_wave1

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
    cur.execute(f'SELECT {CITY_COLS} FROM {SCHEMA}.pilot_cities ORDER BY wave, name')
    return [_city(r) for r in cur.fetchall()]


def audience_where(city: dict) -> str:
    """Школы города с почтой, не отписавшиеся и ещё не получившие письмо этой кампании.
    Значения подставлены из таблицы городов (не из запроса), экранирование — на всякий случай."""
    name = city['name'].replace("'", "''")
    camp = city['campaign_code'].replace("'", "''")
    return (f"city='{name}' AND email<>'' AND unsubscribed_at IS NULL AND status NOT IN ('declined','partner') "
            f"AND NOT EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends s WHERE s.institution_id={TABLE}.id "
            f"AND s.campaign_code='{camp}' AND s.status='sent' AND s.is_test=FALSE) "
            # Отказы «подозрение на спам» — про репутацию ящика, а не про адрес школы: их не считаем.
            f"AND (SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
            f"AND f.campaign_code='{camp}' AND f.status='failed' AND f.is_test=FALSE "
            f"AND coalesce(f.error,'') NOT ILIKE '%%spam%%' AND coalesce(f.error,'') NOT LIKE '%%5.7.1%%') "
            f"< {outreach.MAX_ATTEMPTS}")


def failed_order(city: dict) -> str:
    """Школы с неудачными попытками — в конец очереди, чтобы одна не блокировала остальные."""
    camp = city['campaign_code'].replace("'", "''")
    return (f"(SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
            f"AND f.campaign_code='{camp}' AND f.status='failed' AND f.is_test=FALSE), id")


def spam_cooldown_min(cur) -> int:
    """Сколько минут ещё ждать после последнего отказа «подозрение на спам» (0 — можно слать)."""
    cur.execute(f"SELECT max(created_at) FROM {SCHEMA}.edu_campaign_sends WHERE status='failed' "
                f"AND (error ILIKE '%%spam%%' OR error LIKE '%%5.7.1%%')")
    last = cur.fetchone()[0]
    if not last:
        return 0
    left = outreach.SPAM_COOLDOWN_MIN - (datetime.now(timezone.utc) - last).total_seconds() / 60
    return max(0, int(left + 0.999))


def overview(cur) -> dict:
    cities = all_cities(cur)
    cur.execute(f"SELECT city, count(*), count(*) FILTER (WHERE email<>''), "
                f"count(*) FILTER (WHERE unsubscribed_at IS NOT NULL) FROM {TABLE} GROUP BY city")
    base = {c: (t, e, u) for c, t, e, u in cur.fetchall()}
    cur.execute(f"SELECT campaign_code, status, count(*) FROM {SCHEMA}.edu_campaign_sends "
                f"WHERE is_test=FALSE GROUP BY 1,2")
    sends = {}
    for camp, st, n in cur.fetchall():
        sends.setdefault(camp, {})[st] = n
    cur.execute(f"SELECT code, used_count FROM {SCHEMA}.access_promo_codes")
    used = {c: n for c, n in cur.fetchall()}
    out = []
    for c in cities:
        cur.execute(f'SELECT count(*) FROM {TABLE} WHERE {audience_where(c)}')
        pending = cur.fetchone()[0]
        t, e, u = base.get(c['name'], (0, 0, 0))
        s = sends.get(c['campaign_code'], {})
        out.append({**c, 'total': t, 'with_email': e, 'unsubscribed': u, 'pending': pending,
                    'sent': s.get('sent', 0), 'failed': s.get('failed', 0),
                    # Промокод региона общий с центром — активации показываем только в строке центра.
                    'activations': 0 if c.get('page_slug') else used.get(c['promo_code'], 0)})
    st = settings(cur)
    return {'cities': out, 'auto': st, 'sent_today': sent_today(cur), 'cooldown_min': spam_cooldown_min(cur),
            'registry_rows': registry_size()}


def settings(cur) -> dict:
    cur.execute(f'SELECT auto_enabled, daily_limit FROM {SCHEMA}.outreach_settings WHERE id=1')
    r = cur.fetchone() or (False, 200)
    return {'enabled': bool(r[0]), 'daily_limit': int(r[1])}


def save_settings(cur, body: dict) -> dict:
    cur_s = settings(cur)
    enabled = bool(body.get('enabled')) if 'enabled' in body else cur_s['enabled']
    try:
        limit = int(body.get('daily_limit') or cur_s['daily_limit'])
    except (TypeError, ValueError):
        limit = cur_s['daily_limit']
    limit = max(10, min(limit, 300))
    cur.execute(f'UPDATE {SCHEMA}.outreach_settings SET auto_enabled=%s, daily_limit=%s, updated_at=now() WHERE id=1',
                (enabled, limit))
    return {'enabled': enabled, 'daily_limit': limit}


def sent_today(cur) -> int:
    """Писем, ушедших сегодня (по московской дате) — и вручную, и автоматически, включая тесты."""
    cur.execute(f"SELECT count(*) FROM {SCHEMA}.edu_campaign_sends WHERE status='sent' "
                f"AND (created_at AT TIME ZONE 'Europe/Moscow')::date = (now() AT TIME ZONE 'Europe/Moscow')::date")
    return cur.fetchone()[0]


def registry_size() -> int:
    return sum(len(r.ROWS) for r in REGISTRIES.values())


REGISTRIES = {'wave1': registry_wave1, 'samara_region': registry_samara_region}


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


def auto_tick(cur, conn, unsub_url, inst_by_id, ensure_token) -> dict:
    """Шаг авторассылки: вызывается с сайта при посещениях. Шлёт небольшую партию,
    если авторассылка включена, сейчас 9:00–19:00 МСК в будний день и дневной лимит не исчерпан."""
    st = settings(cur)
    if not st['enabled']:
        return {'skipped': 'disabled'}
    now_msk = datetime.now(timezone.utc) + timedelta(hours=3)
    if now_msk.weekday() >= 5 or not (9 <= now_msk.hour < 19):
        return {'skipped': 'off_hours'}
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
    cur.execute(f"SELECT max(created_at) FROM {SCHEMA}.edu_campaign_sends WHERE is_test=FALSE")
    last = cur.fetchone()[0]
    if last and datetime.now(timezone.utc) - last < timedelta(minutes=5):
        return {'skipped': 'too_soon'}
    left_today = st['daily_limit'] - sent_today(cur)
    if left_today <= 0:
        return {'skipped': 'daily_limit'}
    batch = min(outreach.BATCH_MAX, left_today)
    started = time.time()
    total = {'sent': 0, 'failed': 0, 'cities': []}
    for city in all_cities(cur):
        if not city['active'] or batch <= 0:
            continue
        r = send_for_city(cur, conn, city, batch, unsub_url, inst_by_id, ensure_token, started)
        if r['sent'] or r['failed']:
            total['cities'].append({'city': city['name'], 'sent': r['sent'], 'failed': r['failed']})
        total['sent'] += r['sent']
        total['failed'] += r['failed']
        batch -= r['sent'] + r['failed']
        if r['stop'] == 'spam':
            # Временная мера Яндекса: ждём час, авторассылка продолжит сама.
            total['stopped'] = f'Яндекс заподозрил спам — пауза {outreach.SPAM_COOLDOWN_MIN} минут'
            break
        if r['stop']:
            cur.execute(f'UPDATE {SCHEMA}.outreach_settings SET auto_enabled=FALSE, updated_at=now() WHERE id=1')
            conn.commit()
            total['stopped'] = 'Почтовый сервер ограничил отправку — авторассылка выключена, проверьте ящик'
            break
        if time.time() - started > TIME_BUDGET_SEC:
            break
    return total
