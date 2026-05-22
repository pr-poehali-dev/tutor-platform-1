"""
Контроль доступа к платному контенту.
GET  /?action=check&course_id=N   header: X-Auth-Token  -> { has_subscription, purchased_course_ids, course_access }
POST /?action=buy_course          body: {course_id}     -> создаёт запись course_purchases (pending) и возвращает её id
"""
import json
import os
from datetime import datetime, timezone
import psycopg2


GRADE_PRICE_KOPECKS = {
    "1-4": 39000,
    "5-9": 59000,
    "10-11": 89000,
    "oge": 99000,
    "ege": 129000,
    "all": 59000,
}


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(data, ensure_ascii=False)}


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


def get_subscription_active(cur, user_id: int) -> bool:
    cur.execute(
        "SELECT 1 FROM subscriptions WHERE user_id = %s AND status = 'active' "
        "AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1",
        (user_id,)
    )
    return cur.fetchone() is not None


def get_purchased_courses(cur, user_id: int) -> list:
    cur.execute(
        "SELECT course_id FROM course_purchases WHERE user_id = %s AND status = 'paid'",
        (user_id,)
    )
    return [r[0] for r in cur.fetchall()]


def handle_check(token: str, course_id: int | None) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return ok({
                    'authenticated': False,
                    'has_subscription': False,
                    'purchased_course_ids': [],
                    'course_access': False,
                })
            has_sub = get_subscription_active(cur, user_id)
            purchased = get_purchased_courses(cur, user_id)
            course_access = False
            if course_id is not None:
                course_access = has_sub or (course_id in purchased)
            return ok({
                'authenticated': True,
                'has_subscription': has_sub,
                'purchased_course_ids': purchased,
                'course_access': course_access,
            })
    finally:
        conn.close()


def handle_buy_course(token: str, body: dict) -> dict:
    course_id = body.get('course_id')
    grade = (body.get('grade') or 'all').strip()
    title = (body.get('title') or 'Курс').strip()[:200]

    try:
        course_id = int(course_id)
    except (TypeError, ValueError):
        return err('Не указан курс', 400)

    amount = GRADE_PRICE_KOPECKS.get(grade, GRADE_PRICE_KOPECKS['all'])

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            cur.execute(
                "SELECT id FROM course_purchases WHERE user_id = %s AND course_id = %s AND status = 'paid' LIMIT 1",
                (user_id, course_id)
            )
            if cur.fetchone():
                return ok({'already_purchased': True, 'course_id': course_id})

            cur.execute(
                "INSERT INTO course_purchases (user_id, course_id, amount_kopecks, status) "
                "VALUES (%s, %s, %s, 'pending') RETURNING id",
                (user_id, course_id, amount)
            )
            purchase_id = cur.fetchone()[0]
            conn.commit()

            return ok({
                'purchase_id': purchase_id,
                'course_id': course_id,
                'amount_kopecks': amount,
                'amount_rub': amount // 100,
                'title': title,
                'status': 'pending',
            })
    finally:
        conn.close()


def handle_confirm_demo(token: str, body: dict) -> dict:
    """Демо-подтверждение покупки курса БЕЗ оплаты (для тестов / промо).
    В проде должно вызываться только webhook'ом ЮKassa."""
    purchase_id = body.get('purchase_id')
    try:
        purchase_id = int(purchase_id)
    except (TypeError, ValueError):
        return err('Не указан purchase_id', 400)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)
            cur.execute(
                "UPDATE course_purchases SET status = 'paid', purchased_at = NOW(), updated_at = NOW() "
                "WHERE id = %s AND user_id = %s AND status = 'pending' RETURNING course_id",
                (purchase_id, user_id)
            )
            row = cur.fetchone()
            if not row:
                return err('Покупка не найдена', 404)
            conn.commit()
            return ok({'success': True, 'course_id': row[0]})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Доступ к платным курсам: проверка подписки/покупки и инициация разовой покупки курса"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'check')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    try:
        if action == 'check' and method == 'GET':
            course_id_raw = qs.get('course_id')
            course_id = None
            if course_id_raw is not None:
                try:
                    course_id = int(course_id_raw)
                except ValueError:
                    course_id = None
            return handle_check(token, course_id)
        if action == 'buy_course' and method == 'POST':
            return handle_buy_course(token, body)
        if action == 'confirm_demo' and method == 'POST':
            return handle_confirm_demo(token, body)
        return err('Unknown action', 404)
    except psycopg2.Error as e:
        return err(f'DB error: {str(e)[:200]}', 500)
    except Exception as e:
        return err(f'Server error: {str(e)[:200]}', 500)
