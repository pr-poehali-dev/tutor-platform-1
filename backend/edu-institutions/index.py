"""
База учебных заведений (онлайн-школы, колледжи, техникумы) для кабинета администратора.
Actions: list (список с фильтрами), create (добавить), update (изменить), delete (удалить), export (CSV).
Доступ только по PIN администратора (заголовок X-Admin-Pin).
"""
import json
import os
import csv
import io
import time

import psycopg2

import outreach
import pilot

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
TABLE = f'{SCHEMA}.edu_institutions'

KINDS = {'online_school', 'college', 'technical_school', 'other'}
STATUSES = {'new', 'contacted', 'negotiation', 'partner', 'declined'}


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d: dict, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(), 'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def check_admin(headers: dict) -> bool:
    pin_env = os.environ.get('ADMIN_PIN', '') or '7777'
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return bool(pin_env) and pin == pin_env


def row_to_item(r) -> dict:
    return {
        'id': r[0], 'org_name': r[1], 'kind': r[2], 'contact_name': r[3],
        'phone': r[4], 'email': r[5], 'city': r[6], 'website': r[7],
        'status': r[8], 'note': r[9],
        'created_at': r[10].isoformat() if r[10] else None,
        'updated_at': r[11].isoformat() if r[11] else None,
        'address': r[12] or '', 'segment': r[13] or '', 'source': r[14] or '',
        'unsubscribed': bool(r[15]), 'last_mailed_at': r[16].isoformat() if r[16] else None,
        'mail_count': r[17] or 0,
    }


COLS = ('id, org_name, kind, contact_name, phone, email, city, website, '
        'status, note, created_at, updated_at, address, segment, source, '
        'unsubscribed_at, last_mailed_at, mail_count')


def handle_list(qs: dict) -> dict:
    kind = (qs.get('kind') or '').strip()
    status = (qs.get('status') or '').strip()
    search = (qs.get('q') or '').strip()
    city = (qs.get('city') or '').strip()
    where, args = [], []
    if city:
        where.append('city = %s')
        args.append(city)
    if kind in KINDS:
        where.append('kind = %s')
        args.append(kind)
    if status in STATUSES:
        where.append('status = %s')
        args.append(status)
    if search:
        where.append('(org_name ILIKE %s OR contact_name ILIKE %s OR phone ILIKE %s OR email ILIKE %s '
                     'OR city ILIKE %s OR address ILIKE %s)')
        like = f'%{search}%'
        args.extend([like, like, like, like, like, like])
    clause = ('WHERE ' + ' AND '.join(where)) if where else ''
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f'SELECT {COLS} FROM {TABLE} {clause} ORDER BY created_at DESC LIMIT 2000', tuple(args))
            items = [row_to_item(r) for r in cur.fetchall()]
            cur.execute(f'SELECT kind, COUNT(*) FROM {TABLE} GROUP BY kind')
            by_kind = {k: c for k, c in cur.fetchall()}
            cur.execute(f'SELECT COUNT(*) FROM {TABLE}')
            total = cur.fetchone()[0]
            return ok({'items': items, 'total': total, 'by_kind': by_kind})
    finally:
        conn.close()


def _clean(body: dict) -> dict:
    kind = (body.get('kind') or 'online_school').strip()
    if kind not in KINDS:
        kind = 'online_school'
    status = (body.get('status') or 'new').strip()
    if status not in STATUSES:
        status = 'new'
    return {
        'org_name': str(body.get('org_name') or '').strip()[:300],
        'kind': kind,
        'contact_name': str(body.get('contact_name') or '').strip()[:200],
        'phone': str(body.get('phone') or '').strip()[:50],
        'email': str(body.get('email') or '').strip()[:200],
        'city': str(body.get('city') or '').strip()[:120],
        'website': str(body.get('website') or '').strip()[:300],
        'status': status,
        'note': str(body.get('note') or '').strip()[:4000],
    }


def handle_create(body: dict) -> dict:
    d = _clean(body)
    if not d['org_name'] and not d['contact_name'] and not d['phone'] and not d['email']:
        return err('Заполните хотя бы название или контакт', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f'INSERT INTO {TABLE} (org_name, kind, contact_name, phone, email, city, website, status, note) '
                f'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING {COLS}',
                (d['org_name'], d['kind'], d['contact_name'], d['phone'], d['email'],
                 d['city'], d['website'], d['status'], d['note']),
            )
            conn.commit()
            return ok({'item': row_to_item(cur.fetchone())}, 201)
    finally:
        conn.close()


def handle_update(body: dict) -> dict:
    try:
        rid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    d = _clean(body)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f'UPDATE {TABLE} SET org_name=%s, kind=%s, contact_name=%s, phone=%s, email=%s, '
                f'city=%s, website=%s, status=%s, note=%s, updated_at=now() WHERE id=%s RETURNING {COLS}',
                (d['org_name'], d['kind'], d['contact_name'], d['phone'], d['email'],
                 d['city'], d['website'], d['status'], d['note'], rid),
            )
            if cur.rowcount == 0:
                conn.rollback()
                return err('Запись не найдена', 404)
            conn.commit()
            return ok({'item': row_to_item(cur.fetchone())})
    finally:
        conn.close()


def handle_delete(body: dict) -> dict:
    try:
        rid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f'DELETE FROM {TABLE} WHERE id=%s', (rid,))
            if cur.rowcount == 0:
                conn.rollback()
                return err('Запись не найдена', 404)
            conn.commit()
            return ok({'ok': True, 'id': rid})
    finally:
        conn.close()


def handle_export() -> dict:
    labels = {'online_school': 'Онлайн-школа', 'college': 'Колледж',
              'technical_school': 'Техникум', 'other': 'Другое'}
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f'SELECT {COLS} FROM {TABLE} ORDER BY created_at DESC LIMIT 5000')
            buf = io.StringIO()
            buf.write('\ufeff')  # BOM для Excel
            w = csv.writer(buf, delimiter=';')
            w.writerow(['Название', 'Тип', 'ФИО контакта', 'Телефон', 'Email', 'Город', 'Сайт', 'Статус'])
            for r in cur.fetchall():
                it = row_to_item(r)
                w.writerow([it['org_name'], labels.get(it['kind'], it['kind']), it['contact_name'],
                            it['phone'], it['email'], it['city'], it['website'], it['status']])
            return ok({'csv': buf.getvalue()})
    finally:
        conn.close()


KIND_ALIASES = {
    'онлайн-школа': 'online_school', 'онлайн школа': 'online_school', 'школа': 'online_school',
    'online_school': 'online_school', 'online': 'online_school',
    'колледж': 'college', 'college': 'college',
    'техникум': 'technical_school', 'technical_school': 'technical_school', 'тех': 'technical_school',
    'другое': 'other', 'other': 'other',
}


def _norm_kind(v: str) -> str:
    return KIND_ALIASES.get(str(v or '').strip().lower(), 'online_school')


def handle_import(body: dict) -> dict:
    """Массовый импорт: body.rows — список объектов с полями учреждений."""
    rows = body.get('rows')
    if not isinstance(rows, list) or not rows:
        return err('Нет данных для импорта', 400)
    if len(rows) > 5000:
        return err('За один раз можно импортировать не более 5000 строк', 400)

    conn = get_db()
    inserted = 0
    skipped = 0
    try:
        with conn.cursor() as cur:
            for raw in rows:
                if not isinstance(raw, dict):
                    skipped += 1
                    continue
                d = _clean(raw)
                d['kind'] = _norm_kind(raw.get('kind'))
                if not d['org_name'] and not d['contact_name'] and not d['phone'] and not d['email']:
                    skipped += 1
                    continue
                # Дедупликация: по email или по паре название+город
                if d['email']:
                    cur.execute(f'SELECT 1 FROM {TABLE} WHERE lower(email)=lower(%s) LIMIT 1', (d['email'],))
                elif d['org_name']:
                    cur.execute(
                        f'SELECT 1 FROM {TABLE} WHERE lower(org_name)=lower(%s) AND lower(city)=lower(%s) LIMIT 1',
                        (d['org_name'], d['city']),
                    )
                else:
                    cur.execute(f'SELECT 1 FROM {TABLE} WHERE phone=%s LIMIT 1', (d['phone'],))
                if cur.fetchone():
                    skipped += 1
                    continue
                cur.execute(
                    f'INSERT INTO {TABLE} (org_name, kind, contact_name, phone, email, city, website, status, note) '
                    f'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                    (d['org_name'], d['kind'], d['contact_name'], d['phone'], d['email'],
                     d['city'], d['website'], d['status'], d['note']),
                )
                inserted += 1
            conn.commit()
            return ok({'inserted': inserted, 'skipped': skipped, 'total': len(rows)})
    finally:
        conn.close()


# ─────────────── Рассылка директорам (пилот Самары) ───────────────

def _inst_by_id(cur, rid):
    cur.execute(f'SELECT {COLS}, unsubscribe_token FROM {TABLE} WHERE id=%s', (rid,))
    r = cur.fetchone()
    if not r:
        return None, None
    return row_to_item(r), r[18]


def _ensure_token(cur, rid, token):
    if token:
        return token
    cur.execute(f"UPDATE {TABLE} SET unsubscribe_token=md5(random()::text||clock_timestamp()::text) "
                f"WHERE id=%s RETURNING unsubscribe_token", (rid,))
    return cur.fetchone()[0]


def _unsub_url(event, token):
    return f'{outreach.SITE}/unsubscribe?t={token}'


def _audience_where():
    return pilot.audience_where({'name': 'Самара', 'campaign_code': outreach.CAMPAIGN})


def handle_outreach_status() -> dict:
    user, password = outreach.smtp_creds()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT count(*) FROM {TABLE} WHERE city='Самара'")
            total = cur.fetchone()[0]
            cur.execute(f"SELECT count(*) FROM {TABLE} WHERE city='Самара' AND email<>''")
            with_email = cur.fetchone()[0]
            cur.execute(f"SELECT count(*) FROM {TABLE} WHERE city='Самара' AND unsubscribed_at IS NOT NULL")
            unsub = cur.fetchone()[0]
            cur.execute(f'SELECT count(*) FROM {TABLE} WHERE {_audience_where()}')
            pending = cur.fetchone()[0]
            cur.execute(f"SELECT status, is_test, count(*) FROM {SCHEMA}.edu_campaign_sends "
                        f"WHERE campaign_code=%s GROUP BY 1,2", (outreach.CAMPAIGN,))
            sends = [{'status': a, 'is_test': b, 'count': c} for a, b, c in cur.fetchall()]
            cur.execute(f"SELECT s.to_email, s.status, left(coalesce(s.error,''),200), s.is_test, s.created_at, "
                        f"coalesce(i.org_name,'') FROM {SCHEMA}.edu_campaign_sends s "
                        f"LEFT JOIN {TABLE} i ON i.id=s.institution_id WHERE s.campaign_code=%s "
                        f"ORDER BY s.id DESC LIMIT 25", (outreach.CAMPAIGN,))
            last = [{'to': a, 'status': b, 'error': c, 'is_test': d, 'at': e, 'org': f}
                    for a, b, c, d, e, f in cur.fetchall()]
        return ok({'smtp_configured': bool(user and password), 'sender': user or None,
                   'subject': outreach.SUBJECT, 'total': total, 'with_email': with_email,
                   'unsubscribed': unsub, 'pending': pending, 'sends': sends, 'last': last,
                   'batch_max': outreach.BATCH_MAX})
    finally:
        conn.close()


def handle_outreach_preview(qs, event) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            rid = qs.get('id')
            if rid:
                inst, token = _inst_by_id(cur, int(rid))
            else:
                cur.execute(f"SELECT id FROM {TABLE} WHERE city='Самара' AND email<>'' ORDER BY id LIMIT 1")
                r = cur.fetchone()
                inst, token = _inst_by_id(cur, r[0]) if r else ({'org_name': 'МБОУ СОШ № 1 г.о. Самара',
                                                                   'contact_name': 'Иванова Мария Петровна'}, 'demo')
            if not inst:
                return err('Учреждение не найдено', 404)
            subject, html, text, _ = outreach.build_letter(inst, _unsub_url(event, token or 'demo'))
            return ok({'subject': subject, 'html': html, 'text': text, 'to': inst.get('email', '')})
    finally:
        conn.close()


def handle_outreach_test(body, event) -> dict:
    to = str(body.get('email') or '').strip()
    if '@' not in to or len(to) > 200:
        return err('Укажите корректный email для проверки', 400)
    user, password = outreach.smtp_creds()
    if not (user and password):
        return err('Почта не подключена: в секретах проекта не заполнены SMTP_USER и SMTP_PASSWORD', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {TABLE} WHERE city='Самара' AND email<>'' ORDER BY id LIMIT 1")
            r = cur.fetchone()
            inst, token = _inst_by_id(cur, r[0]) if r else ({'org_name': 'Тестовая школа', 'contact_name': ''}, 'demo')
            subject, html, text, reply = outreach.build_letter(inst, _unsub_url(event, token or 'demo'))
            status, error = 'sent', None
            try:
                smtp = outreach.open_smtp()
                try:
                    outreach.send_one(smtp, to, '[ТЕСТ] ' + subject, html, text, _unsub_url(event, 'demo'), reply)
                finally:
                    smtp.quit()
            except Exception as e:
                status, error = 'failed', f'{type(e).__name__}: {str(e)[:300]}'
            cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status, error, is_test) "
                        f"VALUES (%s, NULL, %s, %s, %s, TRUE)", (outreach.CAMPAIGN, to, status, error))
            conn.commit()
            if status != 'sent':
                return ok({'ok': False, 'error': error})
            return ok({'ok': True, 'to': to})
    finally:
        conn.close()


def handle_outreach_send(body, event) -> dict:
    if body.get('confirm') != 'SEND':
        return err('Нужно подтверждение отправки', 400)
    try:
        limit = max(1, min(int(body.get('limit') or 10), outreach.BATCH_MAX))
    except (TypeError, ValueError):
        limit = 10
    user, password = outreach.smtp_creds()
    if not (user and password):
        return err('Почта не подключена: в секретах проекта не заполнены SMTP_USER и SMTP_PASSWORD', 400)
    conn = get_db()
    sent, failed, errors = 0, 0, []
    try:
        with conn.cursor() as cur:
            wait = pilot.spam_cooldown_min(cur)
            if wait > 0:
                return err(f'Яндекс недавно отклонил письмо как подозрительное. Чтобы ящик не заблокировали, '
                           f'отправка на паузе ещё {wait} мин.', 429)
            cur.execute(f"SELECT id FROM {TABLE} WHERE {_audience_where()} ORDER BY "
                        f"{pilot.failed_order({'campaign_code': outreach.CAMPAIGN})} LIMIT %s", (limit,))
            ids = [r[0] for r in cur.fetchall()]
            if not ids:
                return ok({'sent': 0, 'failed': 0, 'left': 0, 'done': True})
            try:
                smtp = outreach.open_smtp()
            except Exception as e:
                return err(f'Не удалось подключиться к почте: {type(e).__name__}: {str(e)[:200]}', 502)
            try:
                for rid in ids:
                    inst, token = _inst_by_id(cur, rid)
                    token = _ensure_token(cur, rid, token)
                    unsub = _unsub_url(event, token)
                    subject, html, text, reply = outreach.build_letter(inst, unsub)
                    try:
                        outreach.send_one(smtp, inst['email'], subject, html, text, unsub, reply)
                        cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status) "
                                    f"VALUES (%s,%s,%s,'sent')", (outreach.CAMPAIGN, rid, inst['email']))
                        cur.execute(f"UPDATE {TABLE} SET last_mailed_at=now(), mail_count=mail_count+1, "
                                    f"status=CASE WHEN status='new' THEN 'contacted' ELSE status END, updated_at=now() "
                                    f"WHERE id=%s", (rid,))
                        sent += 1
                    except Exception as e:
                        msg = f'{type(e).__name__}: {str(e)[:300]}'
                        cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status, error) "
                                    f"VALUES (%s,%s,%s,'failed',%s)", (outreach.CAMPAIGN, rid, inst['email'], msg))
                        failed += 1
                        errors.append({'org': inst['org_name'], 'email': inst['email'], 'error': msg})
                        if 'SMTPDataError' in msg or 'SMTPSenderRefused' in msg or 'quota' in msg.lower():
                            break
                    conn.commit()
                    outreach.pause()
            finally:
                try:
                    smtp.quit()
                except Exception:
                    pass
            cur.execute(f'SELECT count(*) FROM {TABLE} WHERE {_audience_where()}')
            left = cur.fetchone()[0]
            return ok({'sent': sent, 'failed': failed, 'errors': errors[:5], 'left': left, 'done': left == 0})
    finally:
        conn.close()


# ─────────────── Пилот по городам ───────────────

def _city_or_err(cur, slug):
    c = pilot.get_city(cur, (slug or '').strip())
    return c


def handle_pilot_overview() -> dict:
    user, password = outreach.smtp_creds()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            data = pilot.overview(cur)
            cur.execute(f"SELECT s.to_email, s.status, left(coalesce(s.error,''),200), s.is_test, s.created_at, "
                        f"coalesce(i.org_name,''), coalesce(i.city,'') FROM {SCHEMA}.edu_campaign_sends s "
                        f"LEFT JOIN {TABLE} i ON i.id=s.institution_id ORDER BY s.id DESC LIMIT 30")
            data['last'] = [{'to': a, 'status': b, 'error': c, 'is_test': d, 'at': e, 'org': f, 'city': g}
                            for a, b, c, d, e, f, g in cur.fetchall()]
        data.update({'smtp_configured': bool(user and password), 'sender': user or None,
                     'batch_max': outreach.BATCH_MAX})
        return ok(data)
    finally:
        conn.close()


def _sample_inst(cur, city):
    cur.execute(f"SELECT id FROM {TABLE} WHERE city=%s AND email<>'' ORDER BY id LIMIT 1", (city['name'],))
    r = cur.fetchone()
    if r:
        return _inst_by_id(cur, r[0])
    return {'org_name': 'МБОУ «Школа № 1»', 'contact_name': 'Иванова Мария Петровна'}, 'demo'


def handle_pilot_preview(qs, event) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            city = _city_or_err(cur, qs.get('city'))
            if not city:
                return err('Город не найден', 404)
            inst, token = _sample_inst(cur, city)
            subject, html, text, _ = outreach.build_letter(inst, _unsub_url(event, token or 'demo'), city)
            return ok({'subject': subject, 'html': html, 'text': text, 'to': inst.get('email', '')})
    finally:
        conn.close()


def handle_pilot_test(body, event) -> dict:
    to = str(body.get('email') or '').strip()
    if '@' not in to or len(to) > 200:
        return err('Укажите корректный email для проверки', 400)
    user, password = outreach.smtp_creds()
    if not (user and password):
        return err('Почта не подключена: в секретах проекта не заполнены SMTP_USER и SMTP_PASSWORD', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            city = _city_or_err(cur, body.get('city'))
            if not city:
                return err('Город не найден', 404)
            inst, _ = _sample_inst(cur, city)
            subject, html, text, reply = outreach.build_letter(inst, _unsub_url(event, 'demo'), city)
            status, error = 'sent', None
            try:
                smtp = outreach.open_smtp()
                try:
                    outreach.send_one(smtp, to, '[ТЕСТ] ' + subject, html, text, _unsub_url(event, 'demo'), reply)
                finally:
                    smtp.quit()
            except Exception as e:
                status, error = 'failed', f'{type(e).__name__}: {str(e)[:300]}'
            cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status, error, is_test) "
                        f"VALUES (%s, NULL, %s, %s, %s, TRUE)", (city['campaign_code'], to, status, error))
            conn.commit()
            return ok({'ok': status == 'sent', 'to': to, 'error': error})
    finally:
        conn.close()


def handle_pilot_send(body, event) -> dict:
    if body.get('confirm') != 'SEND':
        return err('Нужно подтверждение отправки', 400)
    try:
        limit = max(1, min(int(body.get('limit') or 10), outreach.BATCH_MAX))
    except (TypeError, ValueError):
        limit = 10
    user, password = outreach.smtp_creds()
    if not (user and password):
        return err('Почта не подключена: в секретах проекта не заполнены SMTP_USER и SMTP_PASSWORD', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            city = _city_or_err(cur, body.get('city'))
            if not city:
                return err('Город не найден', 404)
            wait = pilot.spam_cooldown_min(cur)
            if wait > 0:
                return err(f'Яндекс недавно отклонил письмо как подозрительное. Чтобы ящик не заблокировали, '
                           f'отправка на паузе ещё {wait} мин.', 429)
            st = pilot.settings(cur)
            left_today = st['daily_limit'] - pilot.sent_today(cur)
            if left_today <= 0:
                return err(f"Дневной лимит {st['daily_limit']} писем исчерпан — продолжим завтра, чтобы ящик не заблокировали", 429)
            limit = min(limit, left_today)
            try:
                r = pilot.send_for_city(cur, conn, city, limit, lambda t: _unsub_url(event, t),
                                        _inst_by_id, _ensure_token, time.time())
            except Exception as e:
                return err(f'Не удалось подключиться к почте: {type(e).__name__}: {str(e)[:200]}', 502)
            cur.execute(f'SELECT count(*) FROM {TABLE} WHERE {pilot.audience_where(city)}')
            left = cur.fetchone()[0]
            return ok({'sent': r['sent'], 'failed': r['failed'], 'errors': r['errors'], 'left': left, 'done': left == 0})
    finally:
        conn.close()


def handle_pilot_settings(body) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            st = pilot.save_settings(cur, body)
            conn.commit()
            return ok(st)
    finally:
        conn.close()


def handle_pilot_import() -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            return ok(pilot.import_registry(cur, conn))
    finally:
        conn.close()


def handle_pilot_tick(event) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            try:
                r = pilot.auto_tick(cur, conn, lambda t: _unsub_url(event, t), _inst_by_id, _ensure_token)
            except Exception as e:
                conn.rollback()
                print(f'pilot_tick failed: {type(e).__name__}: {e}')
                return ok({'ok': False})
            conn.commit()
            return ok({'ok': True, 'sent': r.get('sent', 0)})
    finally:
        conn.close()


def handle_unsubscribe(qs) -> dict:
    token = (qs.get('t') or '').strip()
    if len(token) < 16:
        return err('Ссылка недействительна', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE {TABLE} SET unsubscribed_at=coalesce(unsubscribed_at, now()), updated_at=now() "
                        f"WHERE unsubscribe_token=%s RETURNING org_name", (token,))
            r = cur.fetchone()
            conn.commit()
            if not r:
                return err('Ссылка недействительна', 404)
            return ok({'ok': True, 'org': r[0]})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Кабинет администратора: база учебных заведений (CRUD + импорт + экспорт)."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    headers = event.get('headers') or {}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'list').strip()

    # Отписка — публичная, по личной ссылке из письма.
    if action == 'unsubscribe':
        return handle_unsubscribe(qs)
    # Шаг авторассылки — публичный: дёргается с сайта при посещениях.
    # Сам ничего не раскрывает и шлёт только если авторассылку включил админ.
    if action == 'pilot_tick':
        return handle_pilot_tick(event)

    if not check_admin(headers):
        return err('Нет доступа', 403)

    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}

    if action == 'list':
        return handle_list(qs)
    if action == 'export':
        return handle_export()
    if action == 'import':
        return handle_import(body)
    if action == 'create':
        return handle_create(body)
    if action == 'update':
        return handle_update(body)
    if action == 'delete':
        return handle_delete(body)
    if action == 'outreach_status':
        return handle_outreach_status()
    if action == 'outreach_preview':
        return handle_outreach_preview(qs, event)
    if action == 'outreach_test' and method == 'POST':
        return handle_outreach_test(body, event)
    if action == 'outreach_send' and method == 'POST':
        return handle_outreach_send(body, event)
    if action == 'pilot_overview':
        return handle_pilot_overview()
    if action == 'pilot_preview':
        return handle_pilot_preview(qs, event)
    if action == 'pilot_test' and method == 'POST':
        return handle_pilot_test(body, event)
    if action == 'pilot_send' and method == 'POST':
        return handle_pilot_send(body, event)
    if action == 'pilot_settings' and method == 'POST':
        return handle_pilot_settings(body)
    if action == 'pilot_import' and method == 'POST':
        return handle_pilot_import()
    return err('Неизвестное действие', 400)