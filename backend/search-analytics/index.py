import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Access-Control-Max-Age': '86400',
}


def _esc(v):
    """Экранируем строку для Simple Query Protocol."""
    return str(v).replace("'", "''")


def handler(event, context):
    """Сбор и просмотр поисковых запросов: что люди ищут и чего не находят."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    try:
        if method == 'POST':
            body = event.get('body') or '{}'
            data = json.loads(body) if isinstance(body, str) else body

            query = str(data.get('query', '')).strip()[:300]
            if not query:
                return {
                    'statusCode': 400,
                    'headers': CORS,
                    'body': json.dumps({'error': 'empty query'}),
                }

            source = str(data.get('source', 'search'))[:30]
            found = int(data.get('found_count', 0) or 0)
            picked = str(data.get('picked_ids', ''))[:300]

            uid = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
            uid_sql = str(int(uid)) if uid and str(uid).isdigit() else 'NULL'

            cur.execute(
                "INSERT INTO ai_search_queries (query, source, found_count, picked_ids, user_id) "
                f"VALUES ('{_esc(query)}', '{_esc(source)}', {found}, '{_esc(picked)}', {uid_sql})"
            )
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # GET — сводка для владельца сайта
        params = event.get('queryStringParameters') or {}
        days = params.get('days', '30')
        days = days if str(days).isdigit() else '30'

        # Самые частые запросы
        cur.execute(
            "SELECT lower(query) q, count(*) c, sum(CASE WHEN found_count=0 THEN 1 ELSE 0 END) empty "
            f"FROM ai_search_queries WHERE created_at > now() - interval '{days} days' "
            "GROUP BY lower(query) ORDER BY c DESC LIMIT 50"
        )
        top = [{'query': r[0], 'count': r[1], 'empty': r[2]} for r in cur.fetchall()]

        # Запросы без результата — прямая подсказка, какого контента не хватает
        cur.execute(
            "SELECT lower(query) q, count(*) c FROM ai_search_queries "
            f"WHERE found_count=0 AND created_at > now() - interval '{days} days' "
            "GROUP BY lower(query) ORDER BY c DESC LIMIT 50"
        )
        missing = [{'query': r[0], 'count': r[1]} for r in cur.fetchall()]

        cur.execute(
            "SELECT source, count(*) FROM ai_search_queries "
            f"WHERE created_at > now() - interval '{days} days' GROUP BY source ORDER BY count(*) DESC"
        )
        by_source = [{'source': r[0], 'count': r[1]} for r in cur.fetchall()]

        cur.execute(
            f"SELECT count(*) FROM ai_search_queries WHERE created_at > now() - interval '{days} days'"
        )
        total = cur.fetchone()[0]

        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({
                'days': int(days),
                'total': total,
                'top': top,
                'missing': missing,
                'by_source': by_source,
            }, ensure_ascii=False),
        }
    finally:
        cur.close()
        conn.close()
