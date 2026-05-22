"""
Контроль доступа к платному контенту + создание платежей в ЮKassa.
GET  /?action=check[&course_id=N]   header: X-Auth-Token  -> { has_subscription, purchased_course_ids, course_access }
POST /?action=buy_course            body: {course_id, grade, title, return_url} -> создаёт платёж ЮKassa за курс
POST /?action=buy_subscription      body: {plan_id, return_url, email?} -> создаёт платёж ЮKassa за подписку
POST /?action=confirm_demo          body: {purchase_id, kind?} -> демо-активация без оплаты (для тестов)
"""
import json
import os
import uuid
import base64
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import psycopg2


GRADE_PRICE_KOPECKS = {
    "1-4": 39000,
    "5-9": 59000,
    "10-11": 89000,
    "oge": 99000,
    "ege": 129000,
    "all": 59000,
}

# Тарифы подписки (server-side, нельзя подделать с клиента)
SUBSCRIPTION_PLANS = {
    "base":   {"name": "Базовый",  "price_kopecks":  59000, "period_days": 30},
    "pro":    {"name": "Профи",    "price_kopecks": 129000, "period_days": 30},
    "family": {"name": "Семейный", "price_kopecks": 199000, "period_days": 30},
}

YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments"


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


def get_user_email(cur, user_id: int) -> str | None:
    cur.execute("SELECT email FROM auth_users WHERE id = %s LIMIT 1", (user_id,))
    row = cur.fetchone()
    if not row:
        return None
    return row[0]


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


def create_yookassa_payment(shop_id: str, secret_key: str, amount_rub: float,
                             description: str, return_url: str,
                             customer_email: str, metadata: dict) -> dict:
    """Создаёт платёж в ЮKassa и возвращает ответ API."""
    auth = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    idempotence_key = str(uuid.uuid4())

    payload = {
        "amount": {"value": f"{amount_rub:.2f}", "currency": "RUB"},
        "capture": True,
        "confirmation": {"type": "redirect", "return_url": return_url},
        "description": description[:128],
        "metadata": metadata,
        "receipt": {
            "customer": {"email": customer_email},
            "items": [{
                "description": description[:128],
                "quantity": "1.000",
                "amount": {"value": f"{amount_rub:.2f}", "currency": "RUB"},
                "vat_code": 1,
                "payment_subject": "service",
                "payment_mode": "full_payment",
            }],
        },
    }
    request = Request(
        YOOKASSA_API_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Basic {auth}',
            'Idempotence-Key': idempotence_key,
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    with urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode())


def handle_buy_course(token: str, body: dict) -> dict:
    course_id = body.get('course_id')
    grade = (body.get('grade') or 'all').strip()
    title = (body.get('title') or 'Курс').strip()[:200]
    return_url = (body.get('return_url') or '').strip()
    customer_email_override = (body.get('email') or '').strip()

    try:
        course_id = int(course_id)
    except (TypeError, ValueError):
        return err('Не указан курс', 400)

    if not return_url.startswith('https://'):
        return err('return_url должен быть https', 400)

    amount_kopecks = GRADE_PRICE_KOPECKS.get(grade, GRADE_PRICE_KOPECKS['all'])
    amount_rub = amount_kopecks / 100

    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')

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

            email = customer_email_override or get_user_email(cur, user_id) or ''
            if not email or '@' not in email:
                return err('Укажи email — на него придёт чек по 54-ФЗ', 400)

            # Сохраняем email в профиле, чтобы не спрашивать повторно
            if customer_email_override and '@' in customer_email_override:
                cur.execute(
                    "UPDATE auth_users SET email = %s WHERE id = %s AND (email IS NULL OR email = '' OR email <> %s)",
                    (customer_email_override, user_id, customer_email_override)
                )
                conn.commit()

            cur.execute(
                "INSERT INTO course_purchases (user_id, course_id, amount_kopecks, status, payment_provider) "
                "VALUES (%s, %s, %s, 'pending', 'yookassa') RETURNING id",
                (user_id, course_id, amount_kopecks)
            )
            purchase_id = cur.fetchone()[0]
            conn.commit()

            if not shop_id or not secret_key:
                return ok({
                    'purchase_id': purchase_id,
                    'course_id': course_id,
                    'amount_rub': amount_kopecks // 100,
                    'title': title,
                    'status': 'pending',
                    'demo_mode': True,
                    'message': 'YooKassa не настроена (нет YOOKASSA_SECRET_KEY). Используй confirm_demo для активации.',
                })

            try:
                metadata = {
                    'kind': 'course_purchase',
                    'purchase_id': str(purchase_id),
                    'user_id': str(user_id),
                    'course_id': str(course_id),
                }
                yk = create_yookassa_payment(
                    shop_id=shop_id,
                    secret_key=secret_key,
                    amount_rub=amount_rub,
                    description=f"Курс «{title}»",
                    return_url=return_url,
                    customer_email=email,
                    metadata=metadata,
                )
            except HTTPError as e:
                detail = ''
                try:
                    detail = e.read().decode()[:400]
                except Exception:
                    pass
                cur.execute(
                    "UPDATE course_purchases SET status = 'failed', updated_at = NOW() WHERE id = %s",
                    (purchase_id,)
                )
                conn.commit()
                return err(f'Ошибка ЮKassa ({e.code}): {detail}', 502)
            except (URLError, Exception) as e:
                cur.execute(
                    "UPDATE course_purchases SET status = 'failed', updated_at = NOW() WHERE id = %s",
                    (purchase_id,)
                )
                conn.commit()
                return err(f'Не удалось создать платёж: {str(e)[:200]}', 502)

            payment_id = yk.get('id', '')
            confirmation_url = (yk.get('confirmation') or {}).get('confirmation_url', '')

            cur.execute(
                "UPDATE course_purchases SET payment_id = %s, updated_at = NOW() WHERE id = %s",
                (payment_id, purchase_id)
            )
            conn.commit()

            return ok({
                'purchase_id': purchase_id,
                'course_id': course_id,
                'amount_rub': amount_kopecks // 100,
                'payment_id': payment_id,
                'payment_url': confirmation_url,
                'status': 'pending',
            })
    finally:
        conn.close()


def handle_buy_subscription(token: str, body: dict) -> dict:
    """Создаёт pending-подписку и платёж ЮKassa. Возвращает payment_url."""
    plan_id = (body.get('plan_id') or '').strip()
    return_url = (body.get('return_url') or '').strip()
    customer_email_override = (body.get('email') or '').strip()

    plan = SUBSCRIPTION_PLANS.get(plan_id)
    if not plan:
        return err('Неизвестный тариф', 400)
    if not return_url.startswith('https://'):
        return err('return_url должен быть https', 400)

    amount_kopecks = plan['price_kopecks']
    amount_rub = amount_kopecks / 100

    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            # Если уже есть активная — сообщаем
            cur.execute(
                "SELECT id, expires_at FROM subscriptions WHERE user_id = %s AND status = 'active' "
                "AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY id DESC LIMIT 1",
                (user_id,)
            )
            row = cur.fetchone()
            if row:
                return ok({
                    'already_subscribed': True,
                    'subscription_id': row[0],
                    'expires_at': row[1].isoformat() if row[1] else None,
                })

            email = customer_email_override or get_user_email(cur, user_id) or ''
            if not email or '@' not in email:
                return err('Укажи email — на него придёт чек по 54-ФЗ', 400)

            # Сохраняем email в профиле, чтобы не спрашивать повторно
            if customer_email_override and '@' in customer_email_override:
                cur.execute(
                    "UPDATE auth_users SET email = %s WHERE id = %s AND (email IS NULL OR email = '' OR email <> %s)",
                    (customer_email_override, user_id, customer_email_override)
                )
                conn.commit()

            cur.execute(
                "INSERT INTO subscriptions (user_id, plan_id, status, amount_kopecks, payment_provider) "
                "VALUES (%s, %s, 'pending', %s, 'yookassa') RETURNING id",
                (user_id, plan_id, amount_kopecks)
            )
            subscription_id = cur.fetchone()[0]
            conn.commit()

            if not shop_id or not secret_key:
                return ok({
                    'subscription_id': subscription_id,
                    'plan_id': plan_id,
                    'amount_rub': amount_kopecks // 100,
                    'status': 'pending',
                    'demo_mode': True,
                    'message': 'YooKassa не настроена. Используй confirm_demo для активации.',
                })

            try:
                metadata = {
                    'kind': 'subscription',
                    'subscription_id': str(subscription_id),
                    'user_id': str(user_id),
                    'plan_id': plan_id,
                    'period_days': str(plan['period_days']),
                }
                yk = create_yookassa_payment(
                    shop_id=shop_id,
                    secret_key=secret_key,
                    amount_rub=amount_rub,
                    description=f"Подписка «{plan['name']}» на {plan['period_days']} дн.",
                    return_url=return_url,
                    customer_email=email,
                    metadata=metadata,
                )
            except HTTPError as e:
                detail = ''
                try:
                    detail = e.read().decode()[:400]
                except Exception:
                    pass
                cur.execute(
                    "UPDATE subscriptions SET status = 'failed', updated_at = NOW() WHERE id = %s",
                    (subscription_id,)
                )
                conn.commit()
                return err(f'Ошибка ЮKassa ({e.code}): {detail}', 502)
            except (URLError, Exception) as e:
                cur.execute(
                    "UPDATE subscriptions SET status = 'failed', updated_at = NOW() WHERE id = %s",
                    (subscription_id,)
                )
                conn.commit()
                return err(f'Не удалось создать платёж: {str(e)[:200]}', 502)

            payment_id = yk.get('id', '')
            confirmation_url = (yk.get('confirmation') or {}).get('confirmation_url', '')

            cur.execute(
                "UPDATE subscriptions SET payment_id = %s, updated_at = NOW() WHERE id = %s",
                (payment_id, subscription_id)
            )
            conn.commit()

            return ok({
                'subscription_id': subscription_id,
                'plan_id': plan_id,
                'amount_rub': amount_kopecks // 100,
                'payment_id': payment_id,
                'payment_url': confirmation_url,
                'status': 'pending',
            })
    finally:
        conn.close()


def handle_confirm_demo(token: str, body: dict) -> dict:
    """Демо-подтверждение покупки БЕЗ оплаты — только если YooKassa не настроена.
    kind='course' (по умолчанию) или 'subscription'."""
    if os.environ.get('YOOKASSA_SECRET_KEY'):
        return err('Демо-режим отключён — настроена реальная оплата', 403)

    kind = (body.get('kind') or 'course').strip()
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

            if kind == 'subscription':
                cur.execute(
                    "SELECT plan_id FROM subscriptions WHERE id = %s AND user_id = %s AND status = 'pending'",
                    (purchase_id, user_id)
                )
                row = cur.fetchone()
                if not row:
                    return err('Подписка не найдена', 404)
                plan_id = row[0]
                period_days = SUBSCRIPTION_PLANS.get(plan_id, {}).get('period_days', 30)
                cur.execute(
                    "UPDATE subscriptions SET status = 'active', started_at = NOW(), "
                    "expires_at = NOW() + (%s || ' days')::interval, updated_at = NOW() "
                    "WHERE id = %s RETURNING expires_at",
                    (str(period_days), purchase_id)
                )
                conn.commit()
                expires_at = cur.fetchone()[0]
                return ok({'success': True, 'subscription_id': purchase_id,
                          'expires_at': expires_at.isoformat() if expires_at else None})

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
    """Доступ к платным курсам: проверка подписки/покупки и создание платежа ЮKassa"""
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
        if action == 'buy_subscription' and method == 'POST':
            return handle_buy_subscription(token, body)
        if action == 'confirm_demo' and method == 'POST':
            return handle_confirm_demo(token, body)
        return err('Unknown action', 404)
    except psycopg2.Error as e:
        return err(f'DB error: {str(e)[:200]}', 500)
    except Exception as e:
        return err(f'Server error: {str(e)[:200]}', 500)