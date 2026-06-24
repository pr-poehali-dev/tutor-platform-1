"""YooKassa webhook handler for payment notifications."""
import json
import os
import base64
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError

import psycopg2

# =============================================================================
# CONSTANTS
# =============================================================================

HEADERS = {
    'Content-Type': 'application/json'
}

YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments"


# =============================================================================
# SECURITY
# =============================================================================

def verify_payment_via_api(payment_id: str, shop_id: str, secret_key: str) -> dict | None:
    """Verify payment status via YooKassa API.

    YooKassa doesn't use webhook signatures. The recommended approach is to
    verify payment status by making a GET request to the API.
    """
    auth_string = f"{shop_id}:{secret_key}"
    auth_bytes = base64.b64encode(auth_string.encode()).decode()

    request = Request(
        f"{YOOKASSA_API_URL}/{payment_id}",
        headers={
            'Authorization': f'Basic {auth_bytes}',
            'Content-Type': 'application/json'
        },
        method='GET'
    )

    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode())
    except (HTTPError, Exception):
        return None


# =============================================================================
# DATABASE
# =============================================================================

def get_connection():
    """Get database connection."""
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema() -> str:
    """Get database schema prefix."""
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    return f"{schema}." if schema else ""


# Акция «Приведи друга»: пригласившему +300 ЗНАЕК, когда друг впервые купил курс.
PROMO_ZNAIKA_START_ISO = '2026-06-23 00:00:00+03'
PROMO_PURCHASE_ZNAIKA = 300
_ZN_LEVELS = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000]


def _zn_level(total_earned: int) -> int:
    lvl = 1
    for i, threshold in enumerate(_ZN_LEVELS, start=1):
        if total_earned >= threshold:
            lvl = i
    return lvl


def award_referral_purchase_znaika(cur, S: str, buyer_user_id: int) -> None:
    """Если покупатель был приглашён по реферальному коду в рамках акции
    (с 23.06.2026) и бонус за покупку ещё не выдан — начислить пригласившему
    +1000 ЗНАЕК. Срабатывает один раз на приглашённого (по флагу)."""
    cur.execute(
        f"SELECT id, inviter_user_id FROM {S}referral_invites "
        f"WHERE invited_user_id = %s AND znaika_purchase_awarded = FALSE "
        f"AND created_at >= %s::timestamptz LIMIT 1",
        (buyer_user_id, PROMO_ZNAIKA_START_ISO)
    )
    row = cur.fetchone()
    if not row:
        return
    invite_id, inviter_uid = row
    # Помечаем сразу (защита от двойного начисления при гонке вебхук/sync)
    cur.execute(
        f"UPDATE {S}referral_invites SET znaika_purchase_awarded = TRUE "
        f"WHERE id = %s AND znaika_purchase_awarded = FALSE",
        (invite_id,)
    )
    if cur.rowcount == 0:
        return
    cur.execute(
        f"INSERT INTO {S}znaika_balances (user_id) VALUES (%s) "
        f"ON CONFLICT (user_id) DO NOTHING",
        (inviter_uid,)
    )
    cur.execute(
        f"UPDATE {S}znaika_balances SET balance = balance + %s, "
        f"total_earned = total_earned + %s, updated_at = now() "
        f"WHERE user_id = %s RETURNING total_earned",
        (PROMO_PURCHASE_ZNAIKA, PROMO_PURCHASE_ZNAIKA, inviter_uid)
    )
    total_earned = cur.fetchone()[0]
    cur.execute(f"UPDATE {S}znaika_balances SET level=%s WHERE user_id=%s",
                (_zn_level(total_earned), inviter_uid))
    cur.execute(
        f"INSERT INTO {S}znaika_transactions "
        f"(user_id, amount, kind, reason, description, meta) "
        f"VALUES (%s, %s, 'earn', 'referral_purchase', %s, '{{}}'::jsonb)",
        (inviter_uid, PROMO_PURCHASE_ZNAIKA, 'Друг купил курс по твоему промокоду')
    )
    cur.execute(
        f"INSERT INTO {S}notifications (user_id, kind, title, body, icon, url) "
        f"VALUES (%s, 'referral', %s, %s, 'Gift', '/referral')",
        (inviter_uid, 'Друг купил курс!',
         f'Тебе начислено +{PROMO_PURCHASE_ZNAIKA} ЗНАЕК за то, что друг купил курс по твоему промокоду. Спасибо!')
    )


# =============================================================================
# HANDLER
# =============================================================================

def handler(event, context):
    """Handle YooKassa webhook notification."""
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': HEADERS,
            'body': json.dumps({'error': 'Method not allowed'})
        }

    # Parse body
    body = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body = base64.b64decode(body).decode('utf-8')

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': HEADERS,
            'body': json.dumps({'error': 'Invalid JSON'})
        }

    # Extract payment info
    event_type = data.get('event', '')
    payment_object = data.get('object', {})
    payment_id = payment_object.get('id', '')
    metadata = payment_object.get('metadata', {})

    if not payment_id:
        return {
            'statusCode': 400,
            'headers': HEADERS,
            'body': json.dumps({'error': 'Missing payment id'})
        }

    # Security: Verify payment via API (most reliable)
    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')

    if not shop_id or not secret_key:
        # Без ключей подтверждать платёж по телу запроса небезопасно (подделка уведомления).
        print('[yookassa-webhook] credentials missing — rejecting unverified webhook')
        return {
            'statusCode': 503,
            'headers': HEADERS,
            'body': json.dumps({'error': 'Payment verification unavailable'})
        }

    verified_payment = verify_payment_via_api(payment_id, shop_id, secret_key)
    if not verified_payment:
        return {
            'statusCode': 400,
            'headers': HEADERS,
            'body': json.dumps({'error': 'Payment verification failed'})
        }
    # Use verified status from YooKassa API instead of webhook data
    payment_status = verified_payment.get('status', '')

    S = get_schema()
    conn = get_connection()

    try:
        cur = conn.cursor()
        now = datetime.utcnow().isoformat()

        # ── Branch S: подписка (subscriptions) ──
        if metadata.get('kind') == 'subscription':
            sub_id_raw = metadata.get('subscription_id')
            try:
                sub_id = int(sub_id_raw) if sub_id_raw is not None else None
            except (TypeError, ValueError):
                sub_id = None
            try:
                period_days = int(metadata.get('period_days') or 30)
            except (TypeError, ValueError):
                period_days = 30
            if not sub_id:
                return {
                    'statusCode': 400,
                    'headers': HEADERS,
                    'body': json.dumps({'error': 'Missing subscription_id in metadata'})
                }
            coupon_rid_raw = metadata.get('coupon_redemption_id')
            try:
                coupon_rid = int(coupon_rid_raw) if coupon_rid_raw is not None else None
            except (TypeError, ValueError):
                coupon_rid = None

            if payment_status == 'succeeded':
                cur.execute(f"""
                    UPDATE {S}subscriptions
                    SET status = 'active',
                        payment_id = %s,
                        started_at = COALESCE(started_at, NOW()),
                        expires_at = NOW() + (%s || ' days')::interval,
                        updated_at = NOW()
                    WHERE id = %s AND status <> 'active'
                """, (payment_id, str(period_days), sub_id))
                # Гасим использованный промокод
                if coupon_rid:
                    cur.execute(f"""
                        UPDATE {S}znaika_redemptions
                        SET status = 'used', used_at = NOW()
                        WHERE id = %s AND status = 'reserved'
                    """, (coupon_rid,))
                conn.commit()
            elif payment_status == 'canceled':
                cur.execute(f"""
                    UPDATE {S}subscriptions
                    SET status = 'canceled', updated_at = NOW()
                    WHERE id = %s AND status = 'pending'
                """, (sub_id,))
                # Возвращаем зарезервированный купон в активные
                if coupon_rid:
                    cur.execute(f"""
                        UPDATE {S}znaika_redemptions
                        SET status = 'active'
                        WHERE id = %s AND status = 'reserved'
                    """, (coupon_rid,))
                conn.commit()
            return {
                'statusCode': 200,
                'headers': HEADERS,
                'body': json.dumps({'status': 'ok', 'kind': 'subscription'})
            }

        # ── Branch A: разовая покупка курса (course_purchases) ──
        if metadata.get('kind') == 'course_purchase':
            purchase_id_raw = metadata.get('purchase_id')
            try:
                purchase_id = int(purchase_id_raw) if purchase_id_raw is not None else None
            except (TypeError, ValueError):
                purchase_id = None

            if not purchase_id:
                return {
                    'statusCode': 400,
                    'headers': HEADERS,
                    'body': json.dumps({'error': 'Missing purchase_id in metadata'})
                }

            if payment_status == 'succeeded':
                cur.execute(f"""
                    UPDATE {S}course_purchases
                    SET status = 'paid', payment_id = %s, purchased_at = NOW(), updated_at = NOW()
                    WHERE id = %s AND status <> 'paid'
                    RETURNING user_id
                """, (payment_id, purchase_id))
                paid_row = cur.fetchone()
                if paid_row:
                    award_referral_purchase_znaika(cur, S, paid_row[0])
                conn.commit()
            elif payment_status == 'canceled':
                cur.execute(f"""
                    UPDATE {S}course_purchases
                    SET status = 'canceled', updated_at = NOW()
                    WHERE id = %s AND status = 'pending'
                """, (purchase_id,))
                conn.commit()

            return {
                'statusCode': 200,
                'headers': HEADERS,
                'body': json.dumps({'status': 'ok', 'kind': 'course_purchase'})
            }

        # ── Branch B: обычный заказ из orders (магазин) ──
        # Find order by payment_id
        cur.execute(f"""
            SELECT id, status FROM {S}orders
            WHERE yookassa_payment_id = %s
        """, (payment_id,))

        row = cur.fetchone()

        if not row:
            # Try to find by order_id from metadata
            order_id_meta = metadata.get('order_id')
            if order_id_meta:
                cur.execute(f"""
                    SELECT id, status FROM {S}orders WHERE id = %s
                """, (int(order_id_meta),))
                row = cur.fetchone()

        if not row:
            return {
                'statusCode': 404,
                'headers': HEADERS,
                'body': json.dumps({'error': 'Order not found'})
            }

        order_id, current_status = row

        # Update based on verified payment status
        if payment_status == 'succeeded':
            if current_status != 'paid':
                cur.execute(f"""
                    UPDATE {S}orders
                    SET status = 'paid', paid_at = %s, updated_at = %s
                    WHERE id = %s
                """, (now, now, order_id))
                conn.commit()

        elif payment_status == 'canceled':
            if current_status not in ('paid', 'canceled'):
                cur.execute(f"""
                    UPDATE {S}orders
                    SET status = 'canceled', updated_at = %s
                    WHERE id = %s
                """, (now, order_id))
                conn.commit()

        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'status': 'ok'})
        }

    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps({'error': 'Internal error'})
        }
    finally:
        conn.close()