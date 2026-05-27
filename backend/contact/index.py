"""
Отзывы и обратная связь.

REVIEWS:
GET  /?action=reviews_list                   -> опубликованные отзывы
POST /?action=review_submit  X-Auth-Token    body: {author_name, author_role, rating, text}

FEEDBACK:
POST /?action=feedback_submit                body: {contact_name, contact_email|phone, subject, message}
"""
import json
import os
import re
from datetime import datetime, timezone
import psycopg2

ALLOWED_ROLES = {'student', 'parent', 'teacher'}
ALLOWED_SUBJECTS = {'general', 'payment', 'tech', 'idea', 'cooperation', 'press'}


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d: dict, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(),
            'body': json.dumps(d, ensure_ascii=False, default=str)}


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


def handle_reviews_list() -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, author_name, author_role, rating, text, avatar_url, created_at "
                "FROM reviews WHERE status='published' ORDER BY created_at DESC LIMIT 30"
            )
            items = [
                {
                    'id': r[0], 'author_name': r[1], 'author_role': r[2],
                    'rating': r[3], 'text': r[4], 'avatar_url': r[5],
                    'created_at': r[6].isoformat() if r[6] else None,
                }
                for r in cur.fetchall()
            ]
            avg = round(sum(i['rating'] for i in items) / len(items), 2) if items else 0
            return ok({'items': items, 'total': len(items), 'avg_rating': avg})
    finally:
        conn.close()


def handle_review_submit(token: str, body: dict) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Чтобы оставить отзыв, войди в кабинет', 401)
            name = (body.get('author_name') or '').strip()[:160]
            role = (body.get('author_role') or 'student').strip()
            text = (body.get('text') or '').strip()[:2000]
            try:
                rating = int(body.get('rating') or 5)
            except (TypeError, ValueError):
                return err('rating обязателен', 400)
            if rating < 1 or rating > 5:
                return err('rating от 1 до 5', 400)
            if role not in ALLOWED_ROLES:
                return err('role: student|parent|teacher', 400)
            if not name or len(name) < 2:
                return err('Укажи имя', 400)
            if len(text) < 30:
                return err('Текст отзыва — минимум 30 символов', 400)
            cur.execute(
                "INSERT INTO reviews (user_id, author_name, author_role, rating, text, status) "
                "VALUES (%s,%s,%s,%s,%s,'pending') RETURNING id",
                (uid, name, role, rating, text)
            )
            rid = cur.fetchone()[0]
            conn.commit()
            return ok({
                'ok': True, 'id': rid,
                'message': 'Спасибо! Отзыв опубликуем после проверки (обычно за сутки).',
            })
    finally:
        conn.close()


EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_RE = re.compile(r'^[\d\s\+\-\(\)]{7,20}$')


def handle_feedback_submit(token: str, body: dict, source_ip: str) -> dict:
    name = (body.get('contact_name') or '').strip()[:160]
    email = (body.get('contact_email') or '').strip().lower()[:200]
    phone = (body.get('contact_phone') or '').strip()[:40]
    subject = (body.get('subject') or 'general').strip()
    message = (body.get('message') or '').strip()[:5000]

    if subject not in ALLOWED_SUBJECTS:
        subject = 'general'
    if not name or len(name) < 2:
        return err('Укажи имя', 400)
    if not message or len(message) < 10:
        return err('Сообщение слишком короткое', 400)
    if email and not EMAIL_RE.match(email):
        return err('Email указан некорректно', 400)
    if phone and not PHONE_RE.match(phone):
        return err('Телефон указан некорректно', 400)
    if not email and not phone:
        return err('Укажи email или телефон для связи', 400)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            cur.execute(
                "INSERT INTO feedback_requests "
                "(user_id, contact_name, contact_email, contact_phone, subject, message) "
                "VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                (uid, name, email or None, phone or None, subject, message)
            )
            fid = cur.fetchone()[0]
            conn.commit()
            return ok({
                'ok': True, 'id': fid,
                'message': 'Спасибо за обращение! Ответим в течение 24 часов.',
            })
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Отзывы и обратная связь."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'reviews_list').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}
    rc = (event.get('requestContext') or {})
    ip = ((rc.get('identity') or {}).get('sourceIp')) or ''

    if action == 'reviews_list':
        return handle_reviews_list()
    if action == 'review_submit' and method == 'POST':
        return handle_review_submit(token, body)
    if action == 'feedback_submit' and method == 'POST':
        return handle_feedback_submit(token, body, ip)

    return err('Неизвестное действие', 404)
