"""
База учебных заведений (онлайн-школы, колледжи, техникумы) для кабинета администратора.
Actions: list (список с фильтрами), create (добавить), update (изменить), delete (удалить), export (CSV).
Доступ только по PIN администратора (заголовок X-Admin-Pin).
"""
import json
import os
import csv
import io
import psycopg2

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
    }


COLS = ('id, org_name, kind, contact_name, phone, email, city, website, '
        'status, note, created_at, updated_at')


def handle_list(qs: dict) -> dict:
    kind = (qs.get('kind') or '').strip()
    status = (qs.get('status') or '').strip()
    search = (qs.get('q') or '').strip()
    where, args = [], []
    if kind in KINDS:
        where.append('kind = %s')
        args.append(kind)
    if status in STATUSES:
        where.append('status = %s')
        args.append(status)
    if search:
        where.append('(org_name ILIKE %s OR contact_name ILIKE %s OR phone ILIKE %s OR email ILIKE %s OR city ILIKE %s)')
        like = f'%{search}%'
        args.extend([like, like, like, like, like])
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


def handler(event: dict, context) -> dict:
    """Кабинет администратора: база учебных заведений (CRUD + импорт + экспорт)."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    headers = event.get('headers') or {}
    if not check_admin(headers):
        return err('Нет доступа', 403)

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'list').strip()

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
    return err('Неизвестное действие', 400)