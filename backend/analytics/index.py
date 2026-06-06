import json
import os
import psycopg2

SCHEMA = 't_p78828167_tutor_platform_1'


def handler(event: dict, context) -> dict:
    '''
    Учёт посещений сайта (включая анонимных гостей).
    POST — записать визит: {visitor_id, path, referrer, is_new_visitor, user_uid?}
    GET  — сводка трафика за сегодня и за 7 дней для дашборда.
    '''
    method = event.get('httpMethod', 'GET')

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        visitor_id = str(body.get('visitor_id') or '')[:64]
        path = str(body.get('path') or '/')[:1000]
        referrer = (str(body.get('referrer')) if body.get('referrer') else None)
        user_uid = (str(body.get('user_uid'))[:64] if body.get('user_uid') else None)
        is_new = bool(body.get('is_new_visitor'))

        if not visitor_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'visitor_id required'})}

        headers = event.get('headers') or {}
        ua = (headers.get('User-Agent') or headers.get('user-agent') or '')[:500]
        ident = (event.get('requestContext') or {}).get('identity') or {}
        ip = (ident.get('sourceIp') or '')[:50]

        v_id = visitor_id.replace("'", "''")
        v_path = path.replace("'", "''")
        v_ref = "NULL" if referrer is None else "'" + referrer.replace("'", "''") + "'"
        v_uid = "NULL" if user_uid is None else "'" + user_uid.replace("'", "''") + "'"
        v_ua = ua.replace("'", "''")
        v_ip = ip.replace("'", "''")

        cur.execute(
            f"INSERT INTO {SCHEMA}.page_visits "
            f"(visitor_id, user_uid, path, referrer, user_agent, ip, is_new_visitor) "
            f"VALUES ('{v_id}', {v_uid}, '{v_path}', {v_ref}, '{v_ua}', '{v_ip}', {str(is_new).upper()})"
        )
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    cur.execute(
        f"SELECT "
        f"COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE), "
        f"COUNT(DISTINCT visitor_id) FILTER (WHERE created_at::date = CURRENT_DATE), "
        f"COUNT(*) FILTER (WHERE is_new_visitor AND created_at::date = CURRENT_DATE), "
        f"COUNT(*), COUNT(DISTINCT visitor_id) "
        f"FROM {SCHEMA}.page_visits"
    )
    row = cur.fetchone()
    summary = {
        'views_today': row[0] or 0,
        'visitors_today': row[1] or 0,
        'new_visitors_today': row[2] or 0,
        'views_total': row[3] or 0,
        'visitors_total': row[4] or 0,
    }

    cur.execute(
        f"SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors "
        f"FROM {SCHEMA}.page_visits "
        f"WHERE created_at >= now() - interval '7 days' "
        f"GROUP BY path ORDER BY views DESC LIMIT 15"
    )
    top_pages = [{'path': r[0], 'views': r[1], 'visitors': r[2]} for r in cur.fetchall()]

    cur.close()
    conn.close()
    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'summary': summary, 'top_pages': top_pages}),
    }
