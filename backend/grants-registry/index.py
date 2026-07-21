"""
Реестр актуальных грантов и конкурсов (grants-registry).

Витрина проверенных грантов с настоящими датами дедлайнов. Статус ("открыт",
"скоро", "завершён") и число дней до дедлайна вычисляются на сервере по текущей
дате — поэтому сроки всегда актуальны и не могут "разъехаться".

GET /                 -> {items: [...], today: "YYYY-MM-DD"}  все опубликованные гранты
GET /?slug=xxx        -> {item: {...}}                         один грант по slug
"""
import json
import os
from datetime import date
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(),
            'body': json.dumps(d, ensure_ascii=False, default=str)}


def compute_status(starts_on, deadline_on, today: date) -> str:
    """Статус приёма заявок по текущей дате."""
    if deadline_on and today > deadline_on:
        return 'closed'
    if starts_on and today < starts_on:
        return 'soon'
    return 'open'


def days_left(deadline_on, today: date):
    if not deadline_on:
        return None
    return (deadline_on - today).days


def row_to_item(r: dict, today: date) -> dict:
    status = compute_status(r['starts_on'], r['deadline_on'], today)
    return {
        'slug': r['slug'],
        'name': r['name'],
        'organizer': r['organizer'],
        'description': r['description'],
        'category': r['category'],
        'region': r['region'],
        'amount_min': r['amount_min'],
        'amount_max': r['amount_max'],
        'amount_text': r['amount_text'],
        'starts_on': r['starts_on'].isoformat() if r['starts_on'] else None,
        'deadline_on': r['deadline_on'].isoformat() if r['deadline_on'] else None,
        'results_on': r['results_on'].isoformat() if r['results_on'] else None,
        'official_url': r['official_url'],
        'source_verified': r['source_verified'],
        'verified_at': r['verified_at'].isoformat() if r['verified_at'] else None,
        'status': status,
        'days_left': days_left(r['deadline_on'], today),
    }


COLS = ('slug, name, organizer, description, category, region, amount_min, '
        'amount_max, amount_text, starts_on, deadline_on, results_on, '
        'official_url, source_verified, verified_at')


def handler(event: dict, context) -> dict:
    """Публичный реестр грантов с автоматическим статусом по дате."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    today = date.today()
    params = event.get('queryStringParameters') or {}
    slug = (params.get('slug') or '').strip()
    table = f'{SCHEMA}.grants_registry'

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()
        if slug:
            safe = slug.replace("'", "''")
            cur.execute(
                f"SELECT {COLS} FROM {table} "
                f"WHERE is_published = true AND slug = '{safe}' LIMIT 1"
            )
        else:
            cur.execute(
                f"SELECT {COLS} FROM {table} WHERE is_published = true "
                f"ORDER BY (deadline_on IS NULL), deadline_on ASC"
            )
        colnames = [c[0] for c in cur.description]
        rows = [dict(zip(colnames, r)) for r in cur.fetchall()]
        cur.close()
    finally:
        conn.close()

    items = [row_to_item(r, today) for r in rows]

    if slug:
        if not items:
            return ok({'error': 'not_found'}, 404)
        return ok({'item': items[0], 'today': today.isoformat()})

    # Порядок: сначала открытые/скоро (по дедлайну), потом завершённые
    order = {'open': 0, 'soon': 1, 'closed': 2}
    items.sort(key=lambda x: (order.get(x['status'], 3),
                              x['days_left'] if x['days_left'] is not None else 9999))
    return ok({'items': items, 'today': today.isoformat()})
