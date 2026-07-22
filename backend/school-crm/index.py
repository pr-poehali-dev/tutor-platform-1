"""
CRM-база маленьких школ — потенциальных клиентов для услуг платформы.

Позволяет вести воронку продаж: список школ, статус сделки, заметки, отметки
о предложенных услугах, добавление новых школ.

GET  /                         -> {items:[...], stats:{...}}   весь список + сводка по воронке
POST / {action:"upsert", ...}  -> {item:{...}}                 создать/обновить школу
POST / {action:"update", id, status?, note?, services_offered?} -> {item:{...}}
POST / {action:"delete", id}   -> {ok:true}
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
TABLE = f'{SCHEMA}.school_prospects'

STATUSES = ('new', 'contacted', 'negotiation', 'client', 'rejected')


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(),
            'body': json.dumps(d, ensure_ascii=False, default=str)}


COLS = ('id, name, segment, subjects, city, size_hint, contact_hint, site, '
        'fit_reason, services_offered, status, note, emoji, color, is_seed, '
        'created_at, updated_at')


def row_to_item(r: dict) -> dict:
    return {
        'id': r['id'],
        'name': r['name'],
        'segment': r['segment'],
        'subjects': r['subjects'] or [],
        'city': r['city'],
        'size_hint': r['size_hint'],
        'contact_hint': r['contact_hint'],
        'site': r['site'],
        'fit_reason': r['fit_reason'],
        'services_offered': r['services_offered'] or [],
        'status': r['status'],
        'note': r['note'] or '',
        'emoji': r['emoji'] or '🏫',
        'color': r['color'] or 'from-purple-500 to-cyan-500',
        'is_seed': r['is_seed'],
    }


def fetch_all(cur) -> list:
    cur.execute(
        f"SELECT {COLS} FROM {TABLE} "
        f"ORDER BY (status='client') DESC, updated_at DESC"
    )
    names = [c[0] for c in cur.description]
    return [row_to_item(dict(zip(names, row))) for row in cur.fetchall()]


def fetch_one(cur, item_id: int):
    cur.execute(f"SELECT {COLS} FROM {TABLE} WHERE id = {int(item_id)} LIMIT 1")
    row = cur.fetchone()
    if not row:
        return None
    names = [c[0] for c in cur.description]
    return row_to_item(dict(zip(names, row)))


def esc(v) -> str:
    return str(v).replace("'", "''")


def handle_get(cur) -> dict:
    items = fetch_all(cur)
    stats = {s: 0 for s in STATUSES}
    for it in items:
        stats[it['status']] = stats.get(it['status'], 0) + 1
    return ok({'items': items, 'stats': stats, 'total': len(items)})


def handle_update(cur, conn, body) -> dict:
    item_id = body.get('id')
    if not item_id:
        return ok({'error': 'id required'}, 400)
    sets = []
    if 'status' in body:
        st = body['status']
        if st not in STATUSES:
            return ok({'error': 'bad status'}, 400)
        sets.append(f"status = '{esc(st)}'")
    if 'note' in body:
        sets.append(f"note = '{esc(body['note'])}'")
    if 'services_offered' in body:
        arr = json.dumps(body['services_offered'], ensure_ascii=False)
        sets.append(f"services_offered = '{esc(arr)}'::jsonb")
    if not sets:
        return ok({'error': 'nothing to update'}, 400)
    sets.append("updated_at = NOW()")
    cur.execute(f"UPDATE {TABLE} SET {', '.join(sets)} WHERE id = {int(item_id)}")
    conn.commit()
    item = fetch_one(cur, item_id)
    if not item:
        return ok({'error': 'not_found'}, 404)
    return ok({'item': item})


def handle_upsert(cur, conn, body) -> dict:
    name = (body.get('name') or '').strip()
    if not name:
        return ok({'error': 'name required'}, 400)
    subjects = json.dumps(body.get('subjects') or [], ensure_ascii=False)
    services = json.dumps(body.get('services_offered') or [], ensure_ascii=False)
    item_id = body.get('id')
    if item_id:
        cur.execute(
            f"UPDATE {TABLE} SET name='{esc(name)}', segment='{esc(body.get('segment','other'))}', "
            f"subjects='{esc(subjects)}'::jsonb, city='{esc(body.get('city',''))}', "
            f"contact_hint='{esc(body.get('contact_hint',''))}', site='{esc(body.get('site',''))}', "
            f"fit_reason='{esc(body.get('fit_reason',''))}', services_offered='{esc(services)}'::jsonb, "
            f"updated_at=NOW() WHERE id={int(item_id)}"
        )
        conn.commit()
        return ok({'item': fetch_one(cur, item_id)})
    cur.execute(
        f"INSERT INTO {TABLE} (name, segment, subjects, city, contact_hint, site, "
        f"fit_reason, services_offered, status, emoji, color) VALUES "
        f"('{esc(name)}', '{esc(body.get('segment','other'))}', '{esc(subjects)}'::jsonb, "
        f"'{esc(body.get('city',''))}', '{esc(body.get('contact_hint',''))}', "
        f"'{esc(body.get('site',''))}', '{esc(body.get('fit_reason',''))}', "
        f"'{esc(services)}'::jsonb, 'new', '{esc(body.get('emoji','🏫'))}', "
        f"'{esc(body.get('color','from-purple-500 to-cyan-500'))}') RETURNING id"
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    return ok({'item': fetch_one(cur, new_id)})


def handle_delete(cur, conn, body) -> dict:
    item_id = body.get('id')
    if not item_id:
        return ok({'error': 'id required'}, 400)
    cur.execute(f"DELETE FROM {TABLE} WHERE id={int(item_id)}")
    conn.commit()
    return ok({'ok': True})


def handler(event: dict, context) -> dict:
    """CRM-база маленьких школ: список, статусы воронки, заметки, предложенные услуги."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()
        if method == 'GET':
            return handle_get(cur)
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', 'update')
        if action == 'update':
            return handle_update(cur, conn, body)
        if action == 'upsert':
            return handle_upsert(cur, conn, body)
        if action == 'delete':
            return handle_delete(cur, conn, body)
        return ok({'error': 'unknown action'}, 400)
    finally:
        conn.close()
