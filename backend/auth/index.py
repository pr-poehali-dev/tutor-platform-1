"""
Авторизация пользователей по телефону через SMS-код.
POST /?action=send_code  body: {"phone": "+79991234567"}
POST /?action=verify_code body: {"phone": "+79991234567", "code": "1234"}
GET  /?action=me  header: X-Auth-Token
"""
import json
import os
import re
import secrets
import random
from datetime import datetime, timedelta, timezone
import psycopg2


SESSION_TTL_DAYS = 30
CODE_TTL_MIN = 10
MAX_ATTEMPTS = 5
TEST_PHONE_PREFIX = "+7000"
TEST_CODE = "1234"


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(data, ensure_ascii=False)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def normalize_phone(raw: str) -> str:
    digits = re.sub(r'\D', '', raw or '')
    if len(digits) == 11 and digits.startswith('8'):
        digits = '7' + digits[1:]
    if len(digits) == 10:
        digits = '7' + digits
    if not digits.startswith('7') or len(digits) != 11:
        return ''
    return '+' + digits


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def generate_code(phone: str) -> str:
    if phone.startswith(TEST_PHONE_PREFIX):
        return TEST_CODE
    return f"{random.randint(0, 9999):04d}"


def handle_send_code(body: dict) -> dict:
    phone = normalize_phone(body.get('phone', ''))
    if not phone:
        return err('Неверный формат телефона. Пример: +79991234567')

    code = generate_code(phone)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=CODE_TTL_MIN)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COUNT(*) FROM sms_codes WHERE phone = %s AND created_at > NOW() - INTERVAL '1 minute'",
                (phone,)
            )
            recent = cur.fetchone()[0]
            if recent >= 1:
                return err('Подожди минуту перед повторной отправкой кода', 429)

            cur.execute(
                "INSERT INTO sms_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
                (phone, code, expires_at)
            )
            conn.commit()
    finally:
        conn.close()

    # TODO: интегрировать SMS.RU/smsc.ru. Пока возвращаем флаг для тестовых номеров.
    response = {'success': True, 'phone': phone, 'expires_in': CODE_TTL_MIN * 60}
    if phone.startswith(TEST_PHONE_PREFIX):
        response['test_mode'] = True
        response['hint'] = f'Тестовый номер. Код: {TEST_CODE}'
    return ok(response)


def handle_verify_code(body: dict, user_agent: str, ip: str) -> dict:
    phone = normalize_phone(body.get('phone', ''))
    code = (body.get('code') or '').strip()
    if not phone or not re.fullmatch(r'\d{4,6}', code):
        return err('Неверный телефон или код')

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, code, attempts, expires_at, used_at FROM sms_codes "
                "WHERE phone = %s ORDER BY created_at DESC LIMIT 1",
                (phone,)
            )
            row = cur.fetchone()
            if not row:
                return err('Сначала запроси код', 404)

            code_id, real_code, attempts, expires_at, used_at = row
            if used_at is not None:
                return err('Этот код уже использован', 410)
            if attempts >= MAX_ATTEMPTS:
                return err('Превышено количество попыток. Запроси новый код', 429)
            if expires_at < datetime.now(timezone.utc):
                return err('Срок действия кода истёк', 410)

            if code != real_code:
                cur.execute("UPDATE sms_codes SET attempts = attempts + 1 WHERE id = %s", (code_id,))
                conn.commit()
                return err('Неверный код', 400)

            cur.execute("UPDATE sms_codes SET used_at = NOW() WHERE id = %s", (code_id,))

            cur.execute("SELECT id, name FROM auth_users WHERE phone = %s", (phone,))
            user_row = cur.fetchone()
            if user_row:
                user_id, name = user_row
                cur.execute("UPDATE auth_users SET last_login_at = NOW() WHERE id = %s", (user_id,))
                is_new = False
            else:
                cur.execute(
                    "INSERT INTO auth_users (phone, last_login_at) VALUES (%s, NOW()) RETURNING id, name",
                    (phone,)
                )
                user_id, name = cur.fetchone()
                is_new = True

            token = secrets.token_urlsafe(48)
            session_expires = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
            cur.execute(
                "INSERT INTO auth_sessions (user_id, token, user_agent, ip, expires_at) "
                "VALUES (%s, %s, %s, %s, %s)",
                (user_id, token, user_agent[:500], ip[:50], session_expires)
            )
            conn.commit()

            return ok({
                'success': True,
                'token': token,
                'is_new': is_new,
                'user': {'id': user_id, 'phone': phone, 'name': name}
            })
    finally:
        conn.close()


def handle_me(token: str) -> dict:
    if not token:
        return err('Не авторизован', 401)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT s.user_id, s.expires_at, s.revoked_at, u.phone, u.name, u.email, u.created_at "
                "FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id "
                "WHERE s.token = %s",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return err('Сессия не найдена', 401)
            user_id, expires_at, revoked_at, phone, name, email, created_at = row
            if revoked_at is not None or expires_at < datetime.now(timezone.utc):
                return err('Сессия истекла', 401)

            cur.execute(
                "SELECT plan_id, status, expires_at FROM subscriptions "
                "WHERE user_id = %s AND status = 'active' "
                "ORDER BY expires_at DESC NULLS LAST LIMIT 1",
                (user_id,)
            )
            sub_row = cur.fetchone()
            subscription = None
            if sub_row:
                subscription = {
                    'plan_id': sub_row[0],
                    'status': sub_row[1],
                    'expires_at': sub_row[2].isoformat() if sub_row[2] else None
                }

            return ok({
                'user': {
                    'id': user_id,
                    'phone': phone,
                    'name': name,
                    'email': email,
                    'created_at': created_at.isoformat() if created_at else None
                },
                'subscription': subscription
            })
    finally:
        conn.close()


def handle_logout(token: str) -> dict:
    if not token:
        return ok({'success': True})
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE auth_sessions SET revoked_at = NOW() WHERE token = %s", (token,))
            conn.commit()
    finally:
        conn.close()
    return ok({'success': True})


def handler(event: dict, context) -> dict:
    """Авторизация по SMS: отправка кода, проверка, профиль, выход"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'me')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    user_agent = headers.get('User-Agent') or headers.get('user-agent') or ''
    ip = (event.get('requestContext') or {}).get('identity', {}).get('sourceIp', '')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            return err('Невалидный JSON')

    if action == 'send_code':
        return handle_send_code(body)
    if action == 'verify_code':
        return handle_verify_code(body, user_agent, ip)
    if action == 'me':
        return handle_me(token)
    if action == 'logout':
        return handle_logout(token)

    return err('Неизвестное действие', 404)
