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

# Цены профессиональных курсов для взрослых (grade='adult') по направлению, в копейках.
# СИНХРОНИЗИРОВАНО с ADULT_SUBJECT_PRICE на фронте (src/components/courses/coursesData.ts).
# Subject берётся из БД (course_curricula) по course_id — цену нельзя подделать с клиента.
ADULT_SUBJECT_PRICE_KOPECKS = {
    "ai": 599000,
    "cs": 699000,
    "datascience": 699000,
    "product": 599000,
    "marketing": 499000,
    "business": 599000,
    "prompteng": 499000,
    "neuroincome": 399000,
    "design": 399000,
    "smartmach": 599000,
    "tenders": 699000,
    "ved": 799000,
    "sales": 599000,
    "chinese": 499000,
    "korean": 499000,
    "avangard": 499900,
    "roomscan": 499000,
}
ADULT_DEFAULT_KOPECKS = 399000


def get_course_subject(cur, course_id: int):
    """Возвращает subject курса из БД (для расчёта цены adult-курсов)."""
    cur.execute(
        "SELECT subject FROM course_curricula WHERE course_id = %s LIMIT 1",
        (course_id,)
    )
    row = cur.fetchone()
    return row[0] if row else None

# Курсы, бесплатные навсегда — оплата за них не создаётся (доступ открыт всем).
# Список синхронизирован с FREE_FOREVER_COURSE_IDS на фронте.
FREE_FOREVER_COURSE_IDS = {2, 37, 64}

# Индивидуальная цена за конкретный курс (по id), в копейках. Приоритетнее grade/subject.
# СИНХРОНИЗИРОВАНО с COURSE_ID_PRICE на фронте (src/components/courses/coursesData.ts).
COURSE_ID_PRICE_KOPECKS = {
    17: 659900,    # Английский с нуля
    57: 990000,    # Профессия интернет-маркетолог
    65: 1290000,   # Нейросети с нуля
    72: 499900,    # Производитель работ (прораб)
    # Супер-курсы (физика/математика/информатика) — разовая покупка предмета.
    9001: 199000,  # Супер-курс: Физика
    9002: 199000,  # Супер-курс: Математика
    9003: 199000,  # Супер-курс: Информатика
}

# Тарифы подписки (server-side, нельзя подделать с клиента).
# Годовая цена = 12 мес со скидкой 40% (платишь как за ~7 месяцев).
SUBSCRIPTION_PLANS = {
    "base":   {"name": "Базовый",  "price_kopecks": 399900, "period_days": 30},
    "pro":    {"name": "Профи",    "price_kopecks": 599000, "period_days": 30},
    "family": {"name": "Семейный", "price_kopecks": 999000, "period_days": 30},
    # Абонемент «Малыш»: 399 ₽/мес. Первый платёж по акции — 1 ₽ за 3 месяца.
    "kids":   {"name": "Малыш",    "price_kopecks":  39900, "period_days": 30},
}

# Акция для абонемента «Малыш»: первые 3 месяца за 1 ₽ (один раз на пользователя).
# Действует до 01.09.2026 (синхронно с фронтом kidsPromoConfig.ts).
KIDS_INTRO_KOPECKS = 100      # 1 ₽
KIDS_INTRO_PERIOD_DAYS = 90   # 3 месяца
KIDS_PROMO_END_ISO = "2026-09-01T23:59:59+03:00"


def is_kids_promo_active() -> bool:
    return datetime.now(timezone.utc) <= datetime.fromisoformat(KIDS_PROMO_END_ISO)

# Скидка на годовую оплату
YEAR_DISCOUNT = 0.40

# Акция «ДОБРО»: всё бесплатно, платежи на паузе.
# Даты должны совпадать с фронтом (src/components/promo/dobroConfig.ts).
PROMO_START_ISO = "2026-05-28T00:00:00+03:00"
PROMO_END_ISO = "2026-06-15T23:59:59+03:00"


def is_promo_active() -> bool:
    now = datetime.now(timezone.utc)
    start = datetime.fromisoformat(PROMO_START_ISO)
    end = datetime.fromisoformat(PROMO_END_ISO)
    return start <= now <= end


# Акция «Приведи друга»: пригласившему +300 ЗНАЕК, когда друг впервые купил курс.
REFERRAL_PROMO_START_ISO = '2026-06-23 00:00:00+03'
REFERRAL_PURCHASE_ZNAIKA = 300
_ZN_LEVELS = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000]


def _zn_level(total_earned: int) -> int:
    lvl = 1
    for i, threshold in enumerate(_ZN_LEVELS, start=1):
        if total_earned >= threshold:
            lvl = i
    return lvl


def award_referral_purchase_znaika(cur, buyer_user_id: int) -> None:
    """Подстраховка для вебхука: если друг (приглашённый в рамках акции с 23.06.2026)
    впервые купил курс, начисляем пригласившему +1000 ЗНАЕК. Один раз на приглашённого."""
    cur.execute(
        "SELECT id, inviter_user_id FROM referral_invites "
        "WHERE invited_user_id = %s AND znaika_purchase_awarded = FALSE "
        "AND created_at >= %s::timestamptz LIMIT 1",
        (buyer_user_id, REFERRAL_PROMO_START_ISO)
    )
    row = cur.fetchone()
    if not row:
        return
    invite_id, inviter_uid = row
    cur.execute(
        "UPDATE referral_invites SET znaika_purchase_awarded = TRUE "
        "WHERE id = %s AND znaika_purchase_awarded = FALSE",
        (invite_id,)
    )
    if cur.rowcount == 0:
        return
    cur.execute(
        "INSERT INTO znaika_balances (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
        (inviter_uid,)
    )
    cur.execute(
        "UPDATE znaika_balances SET balance = balance + %s, "
        "total_earned = total_earned + %s, updated_at = now() "
        "WHERE user_id = %s RETURNING total_earned",
        (REFERRAL_PURCHASE_ZNAIKA, REFERRAL_PURCHASE_ZNAIKA, inviter_uid)
    )
    total_earned = cur.fetchone()[0]
    cur.execute("UPDATE znaika_balances SET level=%s WHERE user_id=%s",
                (_zn_level(total_earned), inviter_uid))
    cur.execute(
        "INSERT INTO znaika_transactions (user_id, amount, kind, reason, description, meta) "
        "VALUES (%s, %s, 'earn', 'referral_purchase', %s, '{}'::jsonb)",
        (inviter_uid, REFERRAL_PURCHASE_ZNAIKA, 'Друг купил курс по твоему промокоду')
    )
    cur.execute(
        "INSERT INTO notifications (user_id, kind, title, body, icon, url) "
        "VALUES (%s, 'referral', %s, %s, 'Gift', '/referral')",
        (inviter_uid, 'Друг купил курс!',
         f'Тебе начислено +{REFERRAL_PURCHASE_ZNAIKA} ЗНАЕК за то, что друг купил курс по твоему промокоду. Спасибо!')
    )


def resolve_plan(plan_id: str, period: str):
    """Возвращает (base_plan_id, plan_dict) с учётом периода month/year.
    Годовой план: цена = месяц * 12 * (1 - YEAR_DISCOUNT), период 365 дней."""
    base_plan = SUBSCRIPTION_PLANS.get(plan_id)
    if not base_plan:
        return None, None
    if period == 'year':
        year_price = int(round(base_plan['price_kopecks'] * 12 * (1 - YEAR_DISCOUNT)))
        return plan_id, {
            'name': f"{base_plan['name']} (год)",
            'price_kopecks': year_price,
            'period_days': 365,
        }
    return plan_id, dict(base_plan)

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
            promo = is_promo_active()
            free_forever = course_id is not None and course_id in FREE_FOREVER_COURSE_IDS
            if not user_id:
                return ok({
                    'authenticated': False,
                    'has_subscription': False,
                    'purchased_course_ids': [],
                    # Бесплатные навсегда курсы и акция открывают доступ даже гостям
                    'course_access': promo or free_forever,
                    'promo_active': promo,
                })
            has_sub = get_subscription_active(cur, user_id)
            purchased = get_purchased_courses(cur, user_id)
            course_access = promo or free_forever
            if not course_access and course_id is not None:
                course_access = has_sub or (course_id in purchased)
            return ok({
                'authenticated': True,
                'has_subscription': has_sub,
                'purchased_course_ids': purchased,
                'course_access': course_access,
                'promo_active': promo,
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


def get_yookassa_payment(payment_id: str, shop_id: str, secret_key: str) -> dict | None:
    """Запрашивает актуальный статус платежа в ЮKassa по его id."""
    if not payment_id or not shop_id or not secret_key:
        return None
    auth = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    request = Request(
        f"{YOOKASSA_API_URL}/{payment_id}",
        headers={'Authorization': f'Basic {auth}', 'Content-Type': 'application/json'},
        method='GET',
    )
    try:
        with urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode())
    except Exception:
        return None


def handle_sync_payment(token: str, body: dict) -> dict:
    """Подстраховка на случай, если вебхук ЮKassa не пришёл.
    Берёт незавершённые заказы пользователя, опрашивает ЮKassa напрямую и,
    если оплата прошла — активирует доступ (подписку или курс)."""
    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
    if not shop_id or not secret_key:
        return ok({'synced': False, 'reason': 'yookassa_not_configured'})

    activated = []
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            # ── Подписки: и pending, и недавно отменённые по таймауту ──
            # Если деньги реально списаны (succeeded в ЮKassa), но webhook не дошёл
            # и запись успела отмениться — восстанавливаем доступ.
            cur.execute(
                "SELECT id, payment_id, period_days FROM subscriptions "
                "WHERE user_id = %s AND status IN ('pending', 'canceled') "
                "AND payment_id IS NOT NULL AND created_at > NOW() - INTERVAL '7 days' "
                "ORDER BY id DESC LIMIT 10",
                (user_id,)
            )
            for sub_id, payment_id, period_days in cur.fetchall():
                pay = get_yookassa_payment(payment_id, shop_id, secret_key)
                if not pay:
                    continue
                status = pay.get('status', '')
                if status == 'succeeded':
                    cur.execute(
                        "UPDATE subscriptions SET status = 'active', "
                        "started_at = COALESCE(started_at, NOW()), "
                        "expires_at = NOW() + (%s || ' days')::interval, updated_at = NOW() "
                        "WHERE id = %s AND status <> 'active'",
                        (str(period_days or 30), sub_id)
                    )
                    conn.commit()
                    activated.append({'kind': 'subscription', 'id': sub_id})
                elif status == 'canceled':
                    cur.execute(
                        "UPDATE subscriptions SET status = 'canceled', updated_at = NOW() "
                        "WHERE id = %s AND status = 'pending'",
                        (sub_id,)
                    )
                    conn.commit()

            # ── Покупки курсов: и pending, и недавно отменённые по таймауту ──
            cur.execute(
                "SELECT id, payment_id, course_id FROM course_purchases "
                "WHERE user_id = %s AND status IN ('pending', 'canceled') "
                "AND payment_id IS NOT NULL AND created_at > NOW() - INTERVAL '7 days' "
                "ORDER BY id DESC LIMIT 10",
                (user_id,)
            )
            for purchase_id, payment_id, course_id in cur.fetchall():
                pay = get_yookassa_payment(payment_id, shop_id, secret_key)
                if not pay:
                    continue
                status = pay.get('status', '')
                if status == 'succeeded':
                    cur.execute(
                        "UPDATE course_purchases SET status = 'paid', "
                        "purchased_at = NOW(), updated_at = NOW() "
                        "WHERE id = %s AND status <> 'paid' RETURNING user_id",
                        (purchase_id,)
                    )
                    paid_row = cur.fetchone()
                    if paid_row:
                        award_referral_purchase_znaika(cur, paid_row[0])
                    conn.commit()
                    activated.append({'kind': 'course', 'id': purchase_id, 'course_id': course_id})
                elif status == 'canceled':
                    cur.execute(
                        "UPDATE course_purchases SET status = 'canceled', updated_at = NOW() "
                        "WHERE id = %s AND status = 'pending'",
                        (purchase_id,)
                    )
                    conn.commit()

            return ok({'synced': True, 'activated': activated})
    finally:
        conn.close()


def handle_buy_course(token: str, body: dict) -> dict:
    if is_promo_active():
        return err('Во время акции ДОБРО все курсы бесплатны — оплата не нужна', 409)
    course_id = body.get('course_id')
    grade = (body.get('grade') or 'all').strip()
    title = (body.get('title') or 'Курс').strip()[:200]
    return_url = (body.get('return_url') or '').strip()
    customer_email_override = (body.get('email') or '').strip()

    try:
        course_id = int(course_id)
    except (TypeError, ValueError):
        return err('Не указан курс', 400)

    if course_id in FREE_FOREVER_COURSE_IDS:
        return err('Этот курс бесплатный навсегда — оплата не нужна', 409)

    if not return_url.startswith('https://'):
        return err('return_url должен быть https', 400)

    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            # Цена: индивидуальная по course_id приоритетнее; затем adult по subject; иначе по grade.
            if course_id in COURSE_ID_PRICE_KOPECKS:
                amount_kopecks = COURSE_ID_PRICE_KOPECKS[course_id]
            elif grade == 'adult':
                subject = get_course_subject(cur, course_id) or ''
                amount_kopecks = ADULT_SUBJECT_PRICE_KOPECKS.get(subject, ADULT_DEFAULT_KOPECKS)
            else:
                amount_kopecks = GRADE_PRICE_KOPECKS.get(grade, GRADE_PRICE_KOPECKS['all'])
            amount_rub = amount_kopecks / 100

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


def lookup_coupon(cur, user_id: int, coupon_code: str):
    """Возвращает (redemption_id, percent) активного скидочного купона пользователя или (None, 0)."""
    code = (coupon_code or '').strip().upper()
    if not code:
        return None, 0
    cur.execute(
        "SELECT id, payload FROM znaika_redemptions "
        "WHERE user_id = %s AND UPPER(coupon_code) = %s AND kind = 'discount_coupon' "
        "AND status = 'active' LIMIT 1",
        (user_id, code)
    )
    row = cur.fetchone()
    if not row:
        return None, 0
    redemption_id, payload = row
    try:
        percent = int((payload or {}).get('percent') or 0)
    except (TypeError, ValueError, AttributeError):
        percent = 0
    if percent <= 0 or percent > 100:
        return None, 0
    return redemption_id, percent


def handle_validate_coupon(token: str, body: dict) -> dict:
    """Предпросмотр скидки по промокоду для фронта (без списания)."""
    coupon_code = (body.get('coupon_code') or '').strip()
    base_amount_rub = body.get('amount_rub')
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)
            rid, percent = lookup_coupon(cur, user_id, coupon_code)
            if not rid:
                return ok({'valid': False, 'message': 'Промокод не найден или уже использован'})
            result = {'valid': True, 'percent': percent}
            try:
                amount = int(base_amount_rub)
                if amount > 0:
                    discount = amount * percent // 100
                    result['discount_rub'] = discount
                    result['final_rub'] = amount - discount
            except (TypeError, ValueError):
                pass
            return ok(result)
    finally:
        conn.close()


def handle_buy_subscription(token: str, body: dict) -> dict:
    """Создаёт pending-подписку и платёж ЮKassa. Возвращает payment_url."""
    if is_promo_active():
        return err('Во время акции ДОБРО подписка не нужна — всё открыто бесплатно', 409)
    plan_id = (body.get('plan_id') or '').strip()
    period = (body.get('period') or 'month').strip()
    if period not in ('month', 'year'):
        period = 'month'
    return_url = (body.get('return_url') or '').strip()
    customer_email_override = (body.get('email') or '').strip()

    coupon_code = (body.get('coupon_code') or '').strip()

    _, plan = resolve_plan(plan_id, period)
    if not plan:
        return err('Неизвестный тариф', 400)
    if not return_url.startswith('https://'):
        return err('return_url должен быть https', 400)

    base_kopecks = plan['price_kopecks']

    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            # Акция «Малыш»: первые 3 месяца за 1 ₽ — один раз на пользователя.
            # Если у пользователя ещё не было kids-подписки (любой статус) — даём интро-цену.
            kids_intro = False
            period_days = plan['period_days']
            if plan_id == 'kids' and period == 'month' and is_kids_promo_active():
                cur.execute(
                    "SELECT 1 FROM subscriptions WHERE user_id = %s AND plan_id = 'kids' LIMIT 1",
                    (user_id,)
                )
                if not cur.fetchone():
                    kids_intro = True
                    base_kopecks = KIDS_INTRO_KOPECKS
                    period_days = KIDS_INTRO_PERIOD_DAYS

            # Применяем промокод-скидку из магазина ЗНАЕК (если есть и валиден).
            # На интро-акцию «Малыш» купоны не распространяются (цена уже 1 ₽).
            coupon_rid, coupon_percent = (None, 0) if kids_intro else lookup_coupon(cur, user_id, coupon_code)
            amount_kopecks = base_kopecks
            if coupon_rid:
                amount_kopecks = base_kopecks - (base_kopecks * coupon_percent // 100)
                if amount_kopecks < 100:  # минимум 1 ₽ для платежа
                    amount_kopecks = 100
            amount_rub = amount_kopecks / 100

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
                "INSERT INTO subscriptions (user_id, plan_id, status, amount_kopecks, payment_provider, period_days) "
                "VALUES (%s, %s, 'pending', %s, 'yookassa', %s) RETURNING id",
                (user_id, plan_id, amount_kopecks, period_days)
            )
            subscription_id = cur.fetchone()[0]

            # Резервируем купон за этой подпиской (вернём в active, если платёж отменится)
            if coupon_rid:
                cur.execute(
                    "UPDATE znaika_redemptions SET status = 'reserved', "
                    "payload = payload || %s WHERE id = %s AND status = 'active'",
                    (json.dumps({'reserved_subscription_id': subscription_id}), coupon_rid)
                )
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
                    'period': period,
                    'period_days': str(period_days),
                }
                if coupon_rid:
                    metadata['coupon_redemption_id'] = str(coupon_rid)
                yk = create_yookassa_payment(
                    shop_id=shop_id,
                    secret_key=secret_key,
                    amount_rub=amount_rub,
                    description=f"Подписка «{plan['name']}» на {period_days} дн.",
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
                    "SELECT plan_id, period_days FROM subscriptions WHERE id = %s AND user_id = %s AND status = 'pending'",
                    (purchase_id, user_id)
                )
                row = cur.fetchone()
                if not row:
                    return err('Подписка не найдена', 404)
                plan_id, period_days = row[0], row[1] or 30
                cur.execute(
                    "UPDATE subscriptions SET status = 'active', started_at = NOW(), "
                    "expires_at = NOW() + (%s || ' days')::interval, updated_at = NOW() "
                    "WHERE id = %s RETURNING expires_at",
                    (str(period_days), purchase_id)
                )
                expires_at = cur.fetchone()[0]
                # Гасим зарезервированный за этой подпиской купон
                cur.execute(
                    "UPDATE znaika_redemptions SET status = 'used', used_at = NOW() "
                    "WHERE user_id = %s AND status = 'reserved' "
                    "AND (payload->>'reserved_subscription_id') = %s",
                    (user_id, str(purchase_id))
                )
                conn.commit()
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
            award_referral_purchase_znaika(cur, user_id)
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
        if action == 'validate_coupon' and method == 'POST':
            return handle_validate_coupon(token, body)
        if action == 'confirm_demo' and method == 'POST':
            return handle_confirm_demo(token, body)
        if action == 'sync_payment' and method == 'POST':
            return handle_sync_payment(token, body)
        return err('Unknown action', 404)
    except psycopg2.Error as e:
        print(f'[access] DB error: {str(e)[:500]}')
        return err('Сервис временно недоступен. Попробуй ещё раз через минуту.', 500)
    except Exception as e:
        print(f'[access] Server error: {str(e)[:500]}')
        return err('Что-то пошло не так. Попробуй ещё раз чуть позже.', 500)