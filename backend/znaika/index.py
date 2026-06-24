"""
Внутренняя валюта УЧИСЬПРО — ЗНАЙКИ.

Курс: 1 ₽ = 1 ЗНАЙКА. Лимит оплаты курса: до 30%.

Эндпоинты (все требуют X-Auth-Token):
  GET  /?action=state        -> баланс, стрик, уровень, история, ачивки
  POST /?action=checkin      -> ежедневный вход (+10, +50 за 7 дней, +200 за 30)
  POST /?action=earn         body: {reason, amount?, meta?} — начислить (с анти-абузом)
  POST /?action=spend        body: {amount, reason, meta?} — списать
  POST /?action=quote_discount body: {price} -> макс. ЗНАЕК к оплате (30%)
"""
import json
import os
from datetime import datetime, timezone, date, timedelta
from typing import Optional, Tuple
import psycopg2


# ---- Конфигурация экономики ----
# Раздаём ЗНАЙКИ умеренно: лёгкая валюта обесценивает и скидки, и сам продукт.
DISCOUNT_PERCENT = 30          # макс. % стоимости курса оплатой ЗНАЙКАМИ
DAILY_CHECKIN = 5              # за обычный вход
WEEKLY_BONUS = 25              # бонус на 7-й день стрика
MONTHLY_BONUS = 100            # бонус на 30-й день стрика
PURCHASE_CASHBACK_PCT = 2      # 2% кэшбек ЗНАЙКАМИ за покупку курса

# Анти-абуз: сколько раз в день можно начислять за reason
DAILY_LIMITS = {
    'lesson_completed': (10, 3),   # до 10 раз, по 3 ЗНАЙКИ
    'review_posted':    (1, 50),
    'feed_reaction':    (5, 1),
}

# Уровни (порог total_earned -> level)
LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7500, 15000, 30000, 60000, 100000]


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


def resolve_user(cur, token: str) -> Optional[int]:
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


def ensure_balance(cur, user_id: int) -> dict:
    """Создаёт строку баланса при первом обращении и возвращает её."""
    cur.execute(
        "INSERT INTO znaika_balances (user_id) VALUES (%s) "
        "ON CONFLICT (user_id) DO NOTHING",
        (user_id,)
    )
    cur.execute(
        "SELECT balance, total_earned, total_spent, current_streak, "
        "       longest_streak, last_check_in, level "
        "FROM znaika_balances WHERE user_id=%s",
        (user_id,)
    )
    r = cur.fetchone()
    return {
        'balance': r[0], 'total_earned': r[1], 'total_spent': r[2],
        'current_streak': r[3], 'longest_streak': r[4],
        'last_check_in': r[5], 'level': r[6],
    }


def calc_level(total_earned: int) -> int:
    lvl = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS, start=1):
        if total_earned >= threshold:
            lvl = i
    return lvl


def credit(cur, user_id: int, amount: int, reason: str,
           description: str = '', meta: Optional[dict] = None) -> int:
    """Начислить ЗНАЙКИ. Возвращает новый баланс."""
    if amount <= 0:
        raise ValueError('amount должен быть > 0')
    ensure_balance(cur, user_id)
    cur.execute(
        "UPDATE znaika_balances "
        "SET balance = balance + %s, "
        "    total_earned = total_earned + %s, "
        "    updated_at = now() "
        "WHERE user_id = %s "
        "RETURNING balance, total_earned",
        (amount, amount, user_id)
    )
    new_balance, total_earned = cur.fetchone()
    new_level = calc_level(total_earned)
    cur.execute("UPDATE znaika_balances SET level=%s WHERE user_id=%s",
                (new_level, user_id))
    cur.execute(
        "INSERT INTO znaika_transactions (user_id, amount, kind, reason, description, meta) "
        "VALUES (%s, %s, 'earn', %s, %s, %s)",
        (user_id, amount, reason, description, json.dumps(meta or {}))
    )
    return new_balance


def debit(cur, user_id: int, amount: int, reason: str,
          description: str = '', meta: Optional[dict] = None) -> int:
    """Списать ЗНАЙКИ. Бросает ValueError если не хватает."""
    if amount <= 0:
        raise ValueError('amount должен быть > 0')
    ensure_balance(cur, user_id)
    cur.execute(
        "SELECT balance FROM znaika_balances WHERE user_id=%s FOR UPDATE",
        (user_id,)
    )
    cur_bal = cur.fetchone()[0]
    if cur_bal < amount:
        raise ValueError(f'Недостаточно ЗНАЕК (есть {cur_bal}, нужно {amount})')
    cur.execute(
        "UPDATE znaika_balances "
        "SET balance = balance - %s, "
        "    total_spent = total_spent + %s, "
        "    updated_at = now() "
        "WHERE user_id = %s "
        "RETURNING balance",
        (amount, amount, user_id)
    )
    new_balance = cur.fetchone()[0]
    cur.execute(
        "INSERT INTO znaika_transactions (user_id, amount, kind, reason, description, meta) "
        "VALUES (%s, %s, 'spend', %s, %s, %s)",
        (user_id, -amount, reason, description, json.dumps(meta or {}))
    )
    return new_balance


def check_and_increment_limit(cur, user_id: int, reason: str) -> Tuple[bool, int]:
    """Анти-абуз. Возвращает (можно_ещё, текущая_награда)."""
    if reason not in DAILY_LIMITS:
        return True, 0
    max_count, per_reward = DAILY_LIMITS[reason]
    today = date.today()
    cur.execute(
        "INSERT INTO znaika_daily_limits (user_id, reason, day, count) "
        "VALUES (%s, %s, %s, 1) "
        "ON CONFLICT (user_id, reason, day) "
        "DO UPDATE SET count = znaika_daily_limits.count + 1 "
        "RETURNING count",
        (user_id, reason, today)
    )
    cnt = cur.fetchone()[0]
    if cnt > max_count:
        # откатываем инкремент
        cur.execute(
            "UPDATE znaika_daily_limits SET count = count - 1 "
            "WHERE user_id=%s AND reason=%s AND day=%s",
            (user_id, reason, today)
        )
        return False, per_reward
    return True, per_reward


def grant_achievement(cur, user_id: int, code: str) -> Optional[dict]:
    """Выдаёт ачивку (если не выдана) + начисляет её reward. Возвращает данные или None."""
    cur.execute(
        "SELECT title, reward, icon, tier FROM znaika_achievements WHERE code=%s",
        (code,)
    )
    a = cur.fetchone()
    if not a:
        return None
    title, reward, icon, tier = a
    cur.execute(
        "INSERT INTO znaika_user_achievements (user_id, achievement_code) "
        "VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING earned_at",
        (user_id, code)
    )
    row = cur.fetchone()
    if not row:
        return None  # уже была
    if reward > 0:
        credit(cur, user_id, reward, 'achievement',
               description=f'Достижение: {title}', meta={'code': code})
    return {'code': code, 'title': title, 'reward': reward, 'icon': icon, 'tier': tier}


def fetch_state(cur, user_id: int) -> dict:
    bal = ensure_balance(cur, user_id)
    # Транзакции
    cur.execute(
        "SELECT amount, kind, reason, description, created_at "
        "FROM znaika_transactions WHERE user_id=%s "
        "ORDER BY created_at DESC LIMIT 30",
        (user_id,)
    )
    transactions = [
        {'amount': r[0], 'kind': r[1], 'reason': r[2],
         'description': r[3], 'created_at': r[4]}
        for r in cur.fetchall()
    ]
    # Ачивки (полученные + все доступные)
    cur.execute(
        "SELECT a.code, a.title, a.description, a.icon, a.reward, a.tier, "
        "       ua.earned_at "
        "FROM znaika_achievements a "
        "LEFT JOIN znaika_user_achievements ua "
        "  ON ua.achievement_code = a.code AND ua.user_id = %s "
        "ORDER BY a.sort_order",
        (user_id,)
    )
    achievements = [
        {'code': r[0], 'title': r[1], 'description': r[2],
         'icon': r[3], 'reward': r[4], 'tier': r[5],
         'earned': r[6] is not None, 'earned_at': r[6]}
        for r in cur.fetchall()
    ]
    # Прогресс к следующему уровню
    cur_level = bal['level']
    next_threshold = (LEVEL_THRESHOLDS[cur_level]
                      if cur_level < len(LEVEL_THRESHOLDS) else None)
    return {
        **bal,
        'next_level_at': next_threshold,
        'discount_percent': DISCOUNT_PERCENT,
        'transactions': transactions,
        'achievements': achievements,
    }


def handle_checkin(cur, user_id: int) -> dict:
    bal = ensure_balance(cur, user_id)
    today = date.today()
    last = bal['last_check_in']
    if last == today:
        return {'ok': False, 'already': True, 'message': 'Сегодня уже отмечались',
                'state': fetch_state(cur, user_id)}
    # Считаем стрик
    if last == today - timedelta(days=1):
        new_streak = bal['current_streak'] + 1
    else:
        new_streak = 1
    longest = max(bal['longest_streak'], new_streak)
    cur.execute(
        "UPDATE znaika_balances "
        "SET current_streak=%s, longest_streak=%s, last_check_in=%s, updated_at=now() "
        "WHERE user_id=%s",
        (new_streak, longest, today, user_id)
    )
    awarded = []
    credit(cur, user_id, DAILY_CHECKIN, 'daily_checkin',
           description=f'Ежедневный вход (день {new_streak})',
           meta={'streak': new_streak})
    awarded.append({'amount': DAILY_CHECKIN, 'reason': 'daily_checkin'})

    # Бонусы за стрики
    if new_streak == 7:
        credit(cur, user_id, WEEKLY_BONUS, 'streak_bonus',
               description='Стрик 7 дней!', meta={'streak': 7})
        awarded.append({'amount': WEEKLY_BONUS, 'reason': 'streak_7'})
    if new_streak == 30:
        credit(cur, user_id, MONTHLY_BONUS, 'streak_bonus',
               description='Стрик 30 дней!', meta={'streak': 30})
        awarded.append({'amount': MONTHLY_BONUS, 'reason': 'streak_30'})

    # Ачивки
    new_achievements = []
    if new_streak >= 7:
        a = grant_achievement(cur, user_id, 'streak_7')
        if a: new_achievements.append(a)
    if new_streak >= 30:
        a = grant_achievement(cur, user_id, 'streak_30')
        if a: new_achievements.append(a)
    if new_streak >= 100:
        a = grant_achievement(cur, user_id, 'streak_100')
        if a: new_achievements.append(a)
    # Ачивка "первые шаги"
    a = grant_achievement(cur, user_id, 'first_steps')
    if a: new_achievements.append(a)

    return {
        'ok': True,
        'streak': new_streak,
        'awarded': awarded,
        'new_achievements': new_achievements,
        'state': fetch_state(cur, user_id),
    }


def handle_earn(cur, user_id: int, body: dict) -> dict:
    reason = (body.get('reason') or '').strip()
    if not reason:
        return err('reason обязателен')
    description = body.get('description') or ''
    meta = body.get('meta') or {}

    # Если reason — лимитированный, берём награду из конфига и проверяем лимит
    if reason in DAILY_LIMITS:
        allowed, reward = check_and_increment_limit(cur, user_id, reason)
        if not allowed:
            return ok({'ok': False, 'limit_reached': True,
                       'state': fetch_state(cur, user_id)})
        amount = reward
    else:
        # Произвольное начисление (purchase_cashback, referral и т.п.)
        amount = int(body.get('amount') or 0)
        if amount <= 0:
            return err('Не указана сумма amount')

    credit(cur, user_id, amount, reason, description, meta)

    # Триггерим ачивки по reason
    new_achievements = []
    if reason == 'lesson_completed':
        cur.execute(
            "SELECT COUNT(*) FROM znaika_transactions "
            "WHERE user_id=%s AND reason='lesson_completed'",
            (user_id,)
        )
        n = cur.fetchone()[0]
        for code, threshold in [('first_lesson', 1), ('lessons_10', 10),
                                ('lessons_50', 50), ('lessons_100', 100)]:
            if n >= threshold:
                a = grant_achievement(cur, user_id, code)
                if a: new_achievements.append(a)
    elif reason == 'review_posted':
        a = grant_achievement(cur, user_id, 'review_1')
        if a: new_achievements.append(a)
    elif reason == 'referral':
        cur.execute(
            "SELECT COUNT(*) FROM znaika_transactions "
            "WHERE user_id=%s AND reason='referral'",
            (user_id,)
        )
        n = cur.fetchone()[0]
        if n >= 1:
            a = grant_achievement(cur, user_id, 'referral_1')
            if a: new_achievements.append(a)
        if n >= 5:
            a = grant_achievement(cur, user_id, 'referral_5')
            if a: new_achievements.append(a)
    elif reason == 'purchase_cashback':
        a = grant_achievement(cur, user_id, 'first_purchase')
        if a: new_achievements.append(a)

    return ok({'ok': True, 'amount': amount,
               'new_achievements': new_achievements,
               'state': fetch_state(cur, user_id)})


def handle_spend(cur, user_id: int, body: dict) -> dict:
    amount = int(body.get('amount') or 0)
    reason = (body.get('reason') or '').strip()
    if amount <= 0 or not reason:
        return err('amount и reason обязательны')
    try:
        new_bal = debit(cur, user_id, amount, reason,
                        body.get('description') or '',
                        body.get('meta') or {})
    except ValueError as e:
        return err(str(e), 402)
    return ok({'ok': True, 'new_balance': new_bal,
               'state': fetch_state(cur, user_id)})


def handle_quote(cur, user_id: int, body: dict) -> dict:
    price = int(body.get('price') or 0)
    if price <= 0:
        return err('price обязателен')
    bal = ensure_balance(cur, user_id)
    max_by_percent = (price * DISCOUNT_PERCENT) // 100
    max_by_balance = bal['balance']
    max_discount = min(max_by_percent, max_by_balance)
    return ok({
        'price': price,
        'discount_percent_limit': DISCOUNT_PERCENT,
        'max_discount': max_discount,
        'balance': bal['balance'],
        'final_price': price - max_discount,
    })


def gen_coupon_code() -> str:
    """Генерирует читаемый код купона: ZN-XXXX-XXXX."""
    import secrets
    alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    part = lambda: ''.join(secrets.choice(alphabet) for _ in range(4))
    return f'ZN-{part()}-{part()}'


def fetch_shop(cur, user_id: int) -> dict:
    """Каталог товаров + активный инвентарь пользователя."""
    cur.execute(
        "SELECT code, title, description, icon, kind, price, payload, tier "
        "FROM znaika_shop_items WHERE active = TRUE ORDER BY sort_order"
    )
    items = [
        {'code': r[0], 'title': r[1], 'description': r[2], 'icon': r[3],
         'kind': r[4], 'price': r[5], 'payload': r[6], 'tier': r[7]}
        for r in cur.fetchall()
    ]
    cur.execute(
        "SELECT item_code, kind, coupon_code, payload, status, created_at "
        "FROM znaika_redemptions WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
        (user_id,)
    )
    inventory = [
        {'item_code': r[0], 'kind': r[1], 'coupon_code': r[2],
         'payload': r[3], 'status': r[4], 'created_at': r[5]}
        for r in cur.fetchall()
    ]
    bal = ensure_balance(cur, user_id)
    return {'items': items, 'inventory': inventory, 'balance': bal['balance']}


def handle_shop(cur, user_id: int) -> dict:
    return ok(fetch_shop(cur, user_id))


def handle_redeem(cur, user_id: int, body: dict) -> dict:
    """Покупка товара в магазине ЗНАЕК за баллы."""
    item_code = (body.get('item_code') or '').strip()
    if not item_code:
        return err('item_code обязателен')
    cur.execute(
        "SELECT title, kind, price, payload FROM znaika_shop_items "
        "WHERE code = %s AND active = TRUE",
        (item_code,)
    )
    row = cur.fetchone()
    if not row:
        return err('Товар не найден', 404)
    title, kind, price, payload = row

    # Косметику нельзя купить дважды
    if kind == 'cosmetic':
        cur.execute(
            "SELECT 1 FROM znaika_redemptions WHERE user_id=%s AND item_code=%s LIMIT 1",
            (user_id, item_code)
        )
        if cur.fetchone():
            return err('Этот товар уже куплен', 409)

    # Списываем баллы
    try:
        debit(cur, user_id, price, 'shop_purchase',
              description=f'Магазин: {title}', meta={'item_code': item_code})
    except ValueError as e:
        return err(str(e), 402)

    coupon_code = gen_coupon_code() if kind in ('discount_coupon', 'bonus_days') else None
    cur.execute(
        "INSERT INTO znaika_redemptions (user_id, item_code, kind, price, coupon_code, payload) "
        "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
        (user_id, item_code, kind, price, coupon_code, json.dumps(payload or {}))
    )
    redemption_id = cur.fetchone()[0]

    return ok({
        'ok': True,
        'redemption_id': redemption_id,
        'item_code': item_code,
        'kind': kind,
        'coupon_code': coupon_code,
        'payload': payload,
        'state': fetch_state(cur, user_id),
    })


def handler(event: dict, context) -> dict:
    """Маршрутизация запросов к системе ЗНАЕК."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'state')

    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()

    try:
        body_raw = event.get('body') or ''
        body = json.loads(body_raw) if body_raw else {}
    except (ValueError, TypeError):
        return err('Невалидный JSON в теле запроса')

    conn = get_db()
    try:
        cur = conn.cursor()
        user_id = resolve_user(cur, token)
        if not user_id:
            return err('Требуется авторизация', 401)

        if action == 'state' and method == 'GET':
            return ok(fetch_state(cur, user_id))
        if action == 'checkin' and method == 'POST':
            result = handle_checkin(cur, user_id)
            conn.commit()
            return ok(result)
        if action == 'earn' and method == 'POST':
            result = handle_earn(cur, user_id, body)
            conn.commit()
            return result
        if action == 'spend' and method == 'POST':
            result = handle_spend(cur, user_id, body)
            conn.commit()
            return result
        if action == 'quote_discount' and method == 'POST':
            return handle_quote(cur, user_id, body)
        if action == 'shop' and method == 'GET':
            return handle_shop(cur, user_id)
        if action == 'redeem' and method == 'POST':
            result = handle_redeem(cur, user_id, body)
            conn.commit()
            return result

        return err('Неизвестный action или метод', 404)
    finally:
        conn.close()