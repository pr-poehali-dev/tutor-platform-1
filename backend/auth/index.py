"""
Авторизация по email + пароль.
POST /?action=register  body: {"email","password","name"}
POST /?action=login     body: {"email","password"}
POST /?action=logout    header: X-Auth-Token
GET  /?action=me        header: X-Auth-Token
"""
import json
import os
import re
import secrets
import hashlib
import base64
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta, timezone
import psycopg2


YANDEX_AUTH_URL = "https://oauth.yandex.ru/authorize"
YANDEX_TOKEN_URL = "https://oauth.yandex.ru/token"
YANDEX_INFO_URL = "https://login.yandex.ru/info"


SESSION_TTL_DAYS = 30
PBKDF2_ITERATIONS = 200_000
SALT_BYTES = 16
HASH_ALGO = "sha256"

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
MIN_PASSWORD_LEN = 6
MAX_PASSWORD_LEN = 128


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


def normalize_email(raw: str) -> str:
    return (raw or '').strip().lower()


def is_valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email or ''))


def hash_password(password: str) -> str:
    """Возвращает строку вида pbkdf2_sha256$iterations$salt_b64$hash_b64"""
    salt = secrets.token_bytes(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(HASH_ALGO, password.encode('utf-8'), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_{algo}${iters}${salt}${hash}".format(
        algo=HASH_ALGO,
        iters=PBKDF2_ITERATIONS,
        salt=base64.b64encode(salt).decode('ascii'),
        hash=base64.b64encode(digest).decode('ascii'),
    )


def verify_password(password: str, stored: str) -> bool:
    if not stored or not password:
        return False
    try:
        scheme, iters_str, salt_b64, hash_b64 = stored.split('$')
        if not scheme.startswith('pbkdf2_'):
            return False
        algo = scheme.split('_', 1)[1]
        iters = int(iters_str)
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        actual = hashlib.pbkdf2_hmac(algo, password.encode('utf-8'), salt, iters)
        return secrets.compare_digest(actual, expected)
    except Exception:
        return False


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def create_session(cur, user_id: int, user_agent: str, ip: str) -> str:
    token = secrets.token_urlsafe(48)
    session_expires = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
    cur.execute(
        "INSERT INTO auth_sessions (user_id, token, user_agent, ip, expires_at) "
        "VALUES (%s, %s, %s, %s, %s)",
        (user_id, token, user_agent[:500], ip[:50], session_expires)
    )
    return token


def handle_register(body: dict, user_agent: str, ip: str) -> dict:
    email = normalize_email(body.get('email', ''))
    password = (body.get('password') or '').strip()
    name = (body.get('name') or '').strip()[:120]

    if not is_valid_email(email):
        return err('Введи корректный email')
    if len(password) < MIN_PASSWORD_LEN:
        return err(f'Пароль должен быть минимум {MIN_PASSWORD_LEN} символов')
    if len(password) > MAX_PASSWORD_LEN:
        return err('Пароль слишком длинный')

    pwd_hash = hash_password(password)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM auth_users WHERE LOWER(email) = %s LIMIT 1", (email,))
            if cur.fetchone():
                return err('Этот email уже зарегистрирован. Войди в свой аккаунт.', 409)

            try:
                cur.execute(
                    "INSERT INTO auth_users (email, name, password_hash, phone, last_login_at) "
                    "VALUES (%s, %s, %s, '', NOW()) RETURNING id",
                    (email, name or None, pwd_hash)
                )
            except Exception as db_exc:
                conn.rollback()
                pgcode = getattr(db_exc, 'pgcode', None)
                msg = str(db_exc).lower()
                if pgcode == '23505' or 'unique' in msg or 'duplicate' in msg:
                    return err('Этот email уже зарегистрирован. Войди в свой аккаунт.', 409)
                raise

            user_id = cur.fetchone()[0]
            token = create_session(cur, user_id, user_agent, ip)
            conn.commit()

            return ok({
                'success': True,
                'token': token,
                'is_new': True,
                'user': {'id': user_id, 'email': email, 'name': name or None, 'phone': None}
            })
    finally:
        conn.close()


def handle_login(body: dict, user_agent: str, ip: str) -> dict:
    email = normalize_email(body.get('email', ''))
    password = (body.get('password') or '').strip()

    if not is_valid_email(email) or not password:
        return err('Введи email и пароль')

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, password_hash, phone FROM auth_users WHERE LOWER(email) = %s LIMIT 1",
                (email,)
            )
            row = cur.fetchone()
            if not row:
                return err('Неверный email или пароль', 401)
            user_id, name, pwd_hash, phone = row
            if not pwd_hash or not verify_password(password, pwd_hash):
                return err('Неверный email или пароль', 401)

            cur.execute("UPDATE auth_users SET last_login_at = NOW() WHERE id = %s", (user_id,))
            token = create_session(cur, user_id, user_agent, ip)
            conn.commit()

            return ok({
                'success': True,
                'token': token,
                'is_new': False,
                'user': {'id': user_id, 'email': email, 'name': name, 'phone': phone or None}
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
                "SELECT s.user_id, s.expires_at, s.revoked_at, u.phone, u.name, u.email, u.created_at, u.avatar_url "
                "FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id "
                "WHERE s.token = %s",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return err('Сессия не найдена', 401)
            user_id, expires_at, revoked_at, phone, name, email, created_at, avatar_url = row
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
                    'phone': phone or None,
                    'name': name,
                    'email': email,
                    'avatar_url': avatar_url,
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


def handle_yandex_url() -> dict:
    """Возвращает URL для редиректа пользователя на страницу авторизации Яндекса."""
    client_id = os.environ.get('YANDEX_CLIENT_ID', '')
    redirect_uri = os.environ.get('YANDEX_REDIRECT_URI', '')
    if not client_id or not redirect_uri:
        return err('Вход через Яндекс ещё не настроен', 503)
    state = secrets.token_urlsafe(16)
    params = urllib.parse.urlencode({
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'state': state,
    })
    return ok({'auth_url': f'{YANDEX_AUTH_URL}?{params}', 'state': state})


def _yandex_exchange_code(code: str) -> dict | None:
    """Меняет authorization code на access_token Яндекса."""
    client_id = os.environ.get('YANDEX_CLIENT_ID', '')
    client_secret = os.environ.get('YANDEX_CLIENT_SECRET', '')
    redirect_uri = os.environ.get('YANDEX_REDIRECT_URI', '')
    data = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
    }).encode('utf-8')
    req = urllib.request.Request(YANDEX_TOKEN_URL, data=data, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f'[auth] yandex token HTTP {e.code}: {e.read()[:200]}')
        return None
    except Exception as e:
        print(f'[auth] yandex token error: {str(e)[:200]}')
        return None


def _yandex_get_user(access_token: str) -> dict | None:
    """Получает профиль пользователя Яндекса по access_token."""
    req = urllib.request.Request(
        f'{YANDEX_INFO_URL}?format=json',
        headers={'Authorization': f'OAuth {access_token}'},
        method='GET',
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f'[auth] yandex info error: {str(e)[:200]}')
        return None


def handle_yandex_callback(body: dict, user_agent: str, ip: str) -> dict:
    """Обмен code на профиль Яндекса, привязка/создание пользователя, выдача сессии.

    Логика связывания:
    1. По yandex_id — если найден, логиним.
    2. По email — если найден, привязываем yandex_id к существующему аккаунту.
    3. Иначе — создаём нового пользователя.
    """
    code = (body.get('code') or '').strip()
    if not code:
        return err('Не передан код авторизации')

    token_data = _yandex_exchange_code(code)
    if not token_data or not token_data.get('access_token'):
        return err('Не удалось получить токен от Яндекса', 502)

    profile = _yandex_get_user(token_data['access_token'])
    if not profile or not profile.get('id'):
        return err('Не удалось получить данные профиля Яндекса', 502)

    yandex_id = str(profile['id'])
    email = normalize_email(profile.get('default_email') or '')
    name = (profile.get('real_name') or profile.get('display_name') or profile.get('first_name') or '').strip()[:120]
    avatar_url = None
    avatar_id = profile.get('default_avatar_id')
    if avatar_id and not profile.get('is_avatar_empty', False):
        avatar_url = f'https://avatars.yandex.net/get-yapic/{avatar_id}/islands-200'

    conn = get_db()
    try:
        with conn.cursor() as cur:
            # 1. По yandex_id
            cur.execute(
                "SELECT id, email, name FROM auth_users WHERE yandex_id = %s LIMIT 1",
                (yandex_id,)
            )
            row = cur.fetchone()
            is_new = False

            if row:
                user_id, db_email, db_name = row
                cur.execute(
                    "UPDATE auth_users SET last_login_at = NOW(), "
                    "avatar_url = COALESCE(%s, avatar_url), "
                    "name = COALESCE(NULLIF(name, ''), %s) WHERE id = %s",
                    (avatar_url, name or None, user_id)
                )
                email = db_email or email
                name = db_name or name
            else:
                # 2. По email — привязываем к существующему
                existing = None
                if email:
                    cur.execute("SELECT id, name FROM auth_users WHERE LOWER(email) = %s LIMIT 1", (email,))
                    existing = cur.fetchone()

                if existing:
                    user_id, db_name = existing
                    cur.execute(
                        "UPDATE auth_users SET yandex_id = %s, last_login_at = NOW(), "
                        "avatar_url = COALESCE(%s, avatar_url), "
                        "name = COALESCE(NULLIF(name, ''), %s) WHERE id = %s",
                        (yandex_id, avatar_url, name or None, user_id)
                    )
                    name = db_name or name
                else:
                    # 3. Новый пользователь
                    cur.execute(
                        "INSERT INTO auth_users (email, name, yandex_id, avatar_url, phone, last_login_at) "
                        "VALUES (%s, %s, %s, %s, '', NOW()) RETURNING id",
                        (email or None, name or None, yandex_id, avatar_url)
                    )
                    user_id = cur.fetchone()[0]
                    is_new = True

            session_token = create_session(cur, user_id, user_agent, ip)
            conn.commit()

            return ok({
                'success': True,
                'token': session_token,
                'is_new': is_new,
                'user': {
                    'id': user_id,
                    'email': email or None,
                    'name': name or None,
                    'phone': None,
                    'avatar_url': avatar_url,
                }
            })
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Авторизация по email и паролю: регистрация, вход, профиль, выход"""
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
            body = {}

    try:
        if action == 'register' and method == 'POST':
            return handle_register(body, user_agent, ip)
        if action == 'login' and method == 'POST':
            return handle_login(body, user_agent, ip)
        if action == 'logout' and method == 'POST':
            return handle_logout(token)
        if action == 'me' and method == 'GET':
            return handle_me(token)
        if action == 'yandex-url' and method == 'GET':
            return handle_yandex_url()
        if action == 'yandex-callback' and method == 'POST':
            return handle_yandex_callback(body, user_agent, ip)
        return err('Unknown action', 404)
    except psycopg2.Error as e:
        print(f'[auth] DB error: {str(e)[:500]}')
        return err('Сервис временно недоступен. Попробуй ещё раз через минуту.', 500)
    except Exception as e:
        print(f'[auth] Server error: {str(e)[:500]}')
        return err('Что-то пошло не так. Попробуй ещё раз чуть позже.', 500)