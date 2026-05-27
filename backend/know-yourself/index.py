"""
Сохранение результатов профориентационного теста "Познай себя" в личном кабинете.

POST /?action=save     header: X-Auth-Token   body: {answers, result}  -> сохраняет в БД
GET  /?action=latest   header: X-Auth-Token                            -> последний результат пользователя
GET  /?action=history  header: X-Auth-Token                            -> история прохождений (макс. 20)
"""
import json
import os
from datetime import datetime, timezone
import psycopg2


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT s.user_id, s.expires_at, s.revoked_at "
        "FROM auth_sessions s WHERE s.token = %s LIMIT 1",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    user_id, expires_at, revoked_at = row
    if revoked_at is not None:
        return None
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    return user_id


def handle_save(token: str, body: dict) -> dict:
    answers = body.get('answers') or {}
    result = body.get('result') or {}

    if not isinstance(answers, dict) or len(answers) == 0:
        return err('Нет ответов для сохранения', 400)
    if not isinstance(result, dict):
        return err('Неверный формат результата', 400)

    top_riasec_list = result.get('topRiasec') or []
    top_riasec = ''.join([c for c in top_riasec_list if isinstance(c, str)])[:3]

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            cur.execute(
                "INSERT INTO know_yourself_results (user_id, answers, result, top_riasec) "
                "VALUES (%s, %s, %s, %s) RETURNING id, created_at",
                (user_id, json.dumps(answers, ensure_ascii=False),
                 json.dumps(result, ensure_ascii=False), top_riasec)
            )
            row = cur.fetchone()
            conn.commit()
            return ok({
                'saved': True,
                'id': row[0],
                'created_at': row[1].isoformat() if row[1] else None,
                'top_riasec': top_riasec,
            })
    finally:
        conn.close()


def handle_latest(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return ok({'authenticated': False, 'result': None})

            cur.execute(
                "SELECT id, answers, result, top_riasec, created_at "
                "FROM know_yourself_results WHERE user_id = %s "
                "ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            row = cur.fetchone()
            if not row:
                return ok({'authenticated': True, 'result': None})

            return ok({
                'authenticated': True,
                'result': {
                    'id': row[0],
                    'answers': row[1],
                    'result': row[2],
                    'top_riasec': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                }
            })
    finally:
        conn.close()


def handle_history(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            cur.execute(
                "SELECT id, top_riasec, created_at FROM know_yourself_results "
                "WHERE user_id = %s ORDER BY created_at DESC LIMIT 20",
                (user_id,)
            )
            rows = cur.fetchall()
            items = [
                {'id': r[0], 'top_riasec': r[1], 'created_at': r[2].isoformat() if r[2] else None}
                for r in rows
            ]
            return ok({'items': items})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Эндпоинт сохранения профориентационного теста: save / latest / history."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'latest').strip()

    headers = event.get('headers') or {}
    token = (
        headers.get('X-Auth-Token')
        or headers.get('x-auth-token')
        or ''
    ).strip()

    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    if action == 'save' and method == 'POST':
        return handle_save(token, body)
    if action == 'latest':
        return handle_latest(token)
    if action == 'history':
        return handle_history(token)

    return err('Неизвестное действие', 404)
