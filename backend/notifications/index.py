"""
Уведомления пользователя.

GET  /?action=list                  X-Auth-Token   -> последние 30
GET  /?action=unread_count          X-Auth-Token   -> {count: N}
POST /?action=mark_read             X-Auth-Token   body: {id} | {all: true}
POST /?action=create                X-Admin-Key    body: {user_id, kind, title, body, icon, url}
"""
import json
import os
from datetime import datetime, timezone
import psycopg2

ADMIN_KEY = os.environ.get('ADMIN_KEY', '')


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors(),
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token=%s LIMIT 1",
        (token,)
    )
    r = cur.fetchone()
    if not r:
        return None
    uid, exp, rev = r
    if rev is not None:
        return None
    if exp and exp < datetime.now(timezone.utc):
        return None
    return uid


def is_admin(headers: dict) -> bool:
    key = (headers.get('X-Admin-Key') or headers.get('x-admin-key') or '').strip()
    return bool(ADMIN_KEY) and key == ADMIN_KEY


def handle_list(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            cur.execute(
                "SELECT id, kind, title, body, icon, url, is_read, created_at "
                "FROM notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 30",
                (uid,)
            )
            items = [
                {
                    'id': r[0], 'kind': r[1], 'title': r[2], 'body': r[3] or '',
                    'icon': r[4] or 'Bell', 'url': r[5],
                    'is_read': bool(r[6]),
                    'created_at': r[7].isoformat() if r[7] else None,
                }
                for r in cur.fetchall()
            ]
            return ok({'items': items, 'authenticated': True})
    finally:
        conn.close()


def handle_unread_count(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return ok({'count': 0, 'authenticated': False})
            cur.execute(
                "SELECT COUNT(*) FROM notifications WHERE user_id=%s AND is_read=FALSE",
                (uid,)
            )
            cnt = cur.fetchone()[0]
            return ok({'count': cnt, 'authenticated': True})
    finally:
        conn.close()


def handle_mark_read(token: str, body: dict) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            if body.get('all') is True:
                cur.execute(
                    "UPDATE notifications SET is_read=TRUE, read_at=NOW() "
                    "WHERE user_id=%s AND is_read=FALSE",
                    (uid,)
                )
            else:
                try:
                    notif_id = int(body.get('id'))
                except (TypeError, ValueError):
                    return err('id обязателен', 400)
                cur.execute(
                    "UPDATE notifications SET is_read=TRUE, read_at=NOW() "
                    "WHERE id=%s AND user_id=%s",
                    (notif_id, uid)
                )
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def handle_create(headers: dict, body: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    try:
        user_id = int(body.get('user_id'))
    except (TypeError, ValueError):
        return err('user_id обязателен', 400)
    kind = (body.get('kind') or 'system').strip()[:40]
    title = (body.get('title') or '').strip()[:300]
    if not title:
        return err('title обязателен', 400)
    bd = (body.get('body') or '').strip()[:2000] or None
    icon = (body.get('icon') or 'Bell').strip()[:40]
    url = (body.get('url') or '').strip()[:500] or None
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO notifications (user_id, kind, title, body, icon, url) "
                "VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                (user_id, kind, title, bd, icon, url)
            )
            nid = cur.fetchone()[0]
            conn.commit()
            return ok({'ok': True, 'id': nid})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Уведомления пользователя."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'list').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}

    if action == 'list':
        return handle_list(token)
    if action == 'unread_count':
        return handle_unread_count(token)
    if action == 'mark_read' and method == 'POST':
        return handle_mark_read(token, body)
    if action == 'create' and method == 'POST':
        return handle_create(headers, body)

    return err('Неизвестное действие', 404)
