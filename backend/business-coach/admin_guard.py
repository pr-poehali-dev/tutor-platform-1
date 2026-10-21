"""Проверка PIN администратора: без PIN по умолчанию, сравнение без утечки по времени,
блокировка IP после 10 неудачных попыток за 15 минут (защита от подбора)."""
import hmac
import os

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
MAX_FAILS = 10
WINDOW_MIN = 15
MIN_PIN_LEN = 4


def _header(headers: dict, name: str) -> str:
    return (headers.get(name) or headers.get(name.lower()) or '').strip()


def client_ip(headers: dict) -> str:
    fwd = _header(headers, 'X-Forwarded-For')
    if fwd:
        return fwd.split(',')[0].strip()[:64]
    return (_header(headers, 'X-Real-Ip') or 'unknown')[:64]


def _db():
    import psycopg2
    return psycopg2.connect(os.environ['DATABASE_URL'], connect_timeout=3)


def _locked(ip: str) -> bool:
    try:
        conn = _db()
        try:
            with conn.cursor() as cur:
                cur.execute(f"SELECT count(*) FROM {SCHEMA}.admin_auth_attempts WHERE ip=%s AND ok=FALSE "
                            f"AND created_at > now() - interval '{WINDOW_MIN} minutes'", (ip,))
                return cur.fetchone()[0] >= MAX_FAILS
        finally:
            conn.close()
    except Exception as e:
        print(f'admin_guard: lock check failed: {type(e).__name__}')
        return False


def _record_fail(ip: str) -> None:
    try:
        conn = _db()
        try:
            with conn.cursor() as cur:
                cur.execute(f"INSERT INTO {SCHEMA}.admin_auth_attempts (ip, ok) VALUES (%s, FALSE)", (ip,))
                cur.execute(f"DELETE FROM {SCHEMA}.admin_auth_attempts WHERE created_at < now() - interval '2 days'")
            conn.commit()
        finally:
            conn.close()
    except Exception as e:
        print(f'admin_guard: record failed: {type(e).__name__}')


def check_pin(headers: dict) -> bool:
    """True только если в окружении задан ADMIN_PIN и заголовок X-Admin-Pin с ним совпадает."""
    headers = headers or {}
    expected = os.environ.get('ADMIN_PIN', '').strip()
    pin = _header(headers, 'X-Admin-Pin')
    if not expected or len(expected) < MIN_PIN_LEN or not pin:
        return False
    ip = client_ip(headers)
    if _locked(ip):
        print(f'admin_guard: IP {ip} заблокирован после {MAX_FAILS} неудачных попыток')
        return False
    if hmac.compare_digest(pin.encode('utf-8'), expected.encode('utf-8')):
        return True
    _record_fail(ip)
    return False
