"""
Дашборд отдела продаж.

Защищён PIN-кодом (заголовок X-Admin-Pin).

GET /?action=overview&days=30   — KPI и динамика выручки
GET /?action=funnel&days=30     — воронка продаж
GET /?action=customers&q=...    — клиентская база (поиск, пагинация)
GET /?action=customer&id=NN     — карточка одного клиента
"""
import json
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import psycopg2


# PIN берётся ТОЛЬКО из окружения. Если не задан — доступ к дашборду закрыт
# (никаких небезопасных значений по умолчанию).
ADMIN_PIN = os.environ.get('ADMIN_PIN', '')


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(),
            'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def check_admin(headers: dict) -> bool:
    # Без заданного в окружении PIN доступ невозможен.
    if not ADMIN_PIN:
        return False
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return pin == ADMIN_PIN


def fetch_one(cur, q: str, args: tuple = ()):
    cur.execute(q, args)
    r = cur.fetchone()
    return r[0] if r else None


def handle_overview(cur, days: int) -> dict:
    """KPI: выручка, заказы, AOV, конверсия. + динамика по дням."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    prev_since = (datetime.now(timezone.utc) - timedelta(days=days * 2)).isoformat()

    # --- KPI текущий период ---
    revenue = fetch_one(cur,
        "SELECT COALESCE(SUM(amount_kopecks),0)/100.0 FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0
    orders = fetch_one(cur,
        "SELECT COUNT(*) FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0
    unique_buyers = fetch_one(cur,
        "SELECT COUNT(DISTINCT user_id) FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0
    new_users = fetch_one(cur,
        "SELECT COUNT(*) FROM auth_users WHERE created_at >= %s", (since,)) or 0

    # Подписки
    sub_revenue = fetch_one(cur,
        "SELECT COALESCE(SUM(amount_kopecks),0)/100.0 FROM subscriptions "
        "WHERE status IN ('active','paid') AND created_at >= %s", (since,)) or 0
    sub_orders = fetch_one(cur,
        "SELECT COUNT(*) FROM subscriptions "
        "WHERE status IN ('active','paid') AND created_at >= %s", (since,)) or 0

    # --- KPI прошлый период (для дельт) ---
    prev_revenue = fetch_one(cur,
        "SELECT COALESCE(SUM(amount_kopecks),0)/100.0 FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s AND purchased_at < %s",
        (prev_since, since)) or 0
    prev_orders = fetch_one(cur,
        "SELECT COUNT(*) FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s AND purchased_at < %s",
        (prev_since, since)) or 0
    prev_new_users = fetch_one(cur,
        "SELECT COUNT(*) FROM auth_users "
        "WHERE created_at >= %s AND created_at < %s",
        (prev_since, since)) or 0

    total_revenue = float(revenue) + float(sub_revenue)
    total_orders = int(orders) + int(sub_orders)
    aov = (total_revenue / total_orders) if total_orders else 0
    conv = (unique_buyers / new_users * 100.0) if new_users else 0

    # --- Динамика по дням ---
    cur.execute(
        "SELECT DATE(purchased_at) AS d, "
        "       COALESCE(SUM(amount_kopecks),0)/100.0 AS rev, "
        "       COUNT(*) AS cnt "
        "FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s "
        "GROUP BY DATE(purchased_at) ORDER BY d ASC",
        (since,)
    )
    by_day = [{'date': str(r[0]), 'revenue': float(r[1]), 'orders': int(r[2])}
              for r in cur.fetchall()]

    # --- Топ курсов по выручке ---
    cur.execute(
        "SELECT course_id, "
        "       COALESCE(SUM(amount_kopecks),0)/100.0 AS rev, "
        "       COUNT(*) AS cnt "
        "FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s "
        "GROUP BY course_id ORDER BY rev DESC LIMIT 10",
        (since,)
    )
    top_courses = [{'course_id': r[0], 'revenue': float(r[1]), 'orders': int(r[2])}
                   for r in cur.fetchall()]

    return ok({
        'period_days': days,
        'kpi': {
            'revenue': round(total_revenue, 2),
            'orders': total_orders,
            'unique_buyers': int(unique_buyers),
            'new_users': int(new_users),
            'aov': round(aov, 2),
            'conversion': round(conv, 2),
            'course_revenue': round(float(revenue), 2),
            'sub_revenue': round(float(sub_revenue), 2),
        },
        'delta': {
            'revenue_pct':  pct_delta(total_revenue, float(prev_revenue)),
            'orders_pct':   pct_delta(total_orders, int(prev_orders)),
            'new_users_pct': pct_delta(int(new_users), int(prev_new_users)),
        },
        'by_day': by_day,
        'top_courses': top_courses,
    })


def pct_delta(now_val, prev_val) -> Optional[float]:
    if not prev_val:
        return None
    return round((float(now_val) - float(prev_val)) / float(prev_val) * 100.0, 1)


def handle_funnel(cur, days: int) -> dict:
    """Воронка: посетители → регистрация → заявка → попытка оплаты → оплата."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    # Зарегистрировались
    registered = fetch_one(cur,
        "SELECT COUNT(*) FROM auth_users WHERE created_at >= %s", (since,)) or 0

    # Заявки на обратный звонок
    feedback = fetch_one(cur,
        "SELECT COUNT(*) FROM feedback_requests WHERE created_at >= %s", (since,)) or 0

    # Начали покупку (включая pending)
    started_checkout = fetch_one(cur,
        "SELECT COUNT(DISTINCT user_id) FROM course_purchases "
        "WHERE created_at >= %s", (since,)) or 0

    # Оплатили
    paid = fetch_one(cur,
        "SELECT COUNT(DISTINCT user_id) FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0

    # Заходили на сайт (косвенный признак — есть auth_session за период)
    sessions = fetch_one(cur,
        "SELECT COUNT(DISTINCT user_id) FROM auth_sessions WHERE expires_at >= %s",
        (datetime.now(timezone.utc).isoformat(),)) or 0

    stages = [
        {'key': 'visitors',  'label': 'Посетители (активные сессии)', 'count': int(sessions)},
        {'key': 'registered','label': 'Зарегистрировались',           'count': int(registered)},
        {'key': 'leads',     'label': 'Оставили заявку',              'count': int(feedback)},
        {'key': 'checkout',  'label': 'Начали оплату',                'count': int(started_checkout)},
        {'key': 'paid',      'label': 'Оплатили',                     'count': int(paid)},
    ]
    # Конверсии между этапами
    base = stages[0]['count'] or 1
    for s in stages:
        s['conv_from_top'] = round(s['count'] / base * 100.0, 1) if base else 0
    for i in range(1, len(stages)):
        prev = stages[i - 1]['count'] or 1
        stages[i]['conv_step'] = round(stages[i]['count'] / prev * 100.0, 1)
    stages[0]['conv_step'] = 100.0

    return ok({'period_days': days, 'stages': stages})


def handle_customers(cur, q: str, status: str, limit: int, offset: int) -> dict:
    """Клиентская база с агрегатами: оплаты, сумма, последняя активность."""
    # Параметры поиска
    where = []
    args = []
    if q:
        where.append("(LOWER(u.email) LIKE %s OR LOWER(COALESCE(u.name,'')) LIKE %s OR u.phone LIKE %s)")
        like = f"%{q.lower()}%"
        args += [like, like, f"%{q}%"]

    if status == 'paying':
        where.append("EXISTS (SELECT 1 FROM course_purchases p WHERE p.user_id=u.id AND p.status='paid')")
    elif status == 'lead':
        where.append("EXISTS (SELECT 1 FROM course_purchases p WHERE p.user_id=u.id AND p.status!='paid')"
                     " AND NOT EXISTS (SELECT 1 FROM course_purchases p2 WHERE p2.user_id=u.id AND p2.status='paid')")
    elif status == 'cold':
        where.append("NOT EXISTS (SELECT 1 FROM course_purchases p WHERE p.user_id=u.id)")

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""

    # Общее количество
    cur.execute(f"SELECT COUNT(*) FROM auth_users u {where_sql}", tuple(args))
    total = cur.fetchone()[0]

    # Список с агрегатами
    cur.execute(
        f"""
        SELECT u.id, u.name, u.email, u.phone, u.created_at, u.last_login_at,
               COALESCE(s.orders, 0)        AS orders,
               COALESCE(s.spent_kopecks, 0) AS spent_kopecks,
               s.last_purchase_at
        FROM auth_users u
        LEFT JOIN (
            SELECT user_id,
                   COUNT(*) FILTER (WHERE status='paid') AS orders,
                   SUM(amount_kopecks) FILTER (WHERE status='paid') AS spent_kopecks,
                   MAX(purchased_at) FILTER (WHERE status='paid')   AS last_purchase_at
            FROM course_purchases GROUP BY user_id
        ) s ON s.user_id = u.id
        {where_sql}
        ORDER BY u.created_at DESC
        LIMIT %s OFFSET %s
        """,
        tuple(args) + (limit, offset)
    )
    rows = []
    for r in cur.fetchall():
        orders = int(r[6] or 0)
        spent = float(r[7] or 0) / 100.0
        if orders > 0:
            seg = 'paying'
        elif r[5]:  # был логин — но не покупал
            seg = 'lead'
        else:
            seg = 'cold'
        rows.append({
            'id': r[0], 'name': r[1], 'email': r[2], 'phone': r[3],
            'created_at': r[4], 'last_login_at': r[5],
            'orders': orders, 'spent': round(spent, 2),
            'last_purchase_at': r[8],
            'segment': seg,
        })
    return ok({'total': int(total), 'rows': rows, 'limit': limit, 'offset': offset})


def handle_customer_card(cur, user_id: int) -> dict:
    cur.execute(
        "SELECT id, name, email, phone, created_at, last_login_at "
        "FROM auth_users WHERE id=%s", (user_id,)
    )
    u = cur.fetchone()
    if not u:
        return err('Клиент не найден', 404)

    cur.execute(
        "SELECT id, course_id, amount_kopecks, status, payment_provider, "
        "       purchased_at, created_at "
        "FROM course_purchases WHERE user_id=%s ORDER BY created_at DESC",
        (user_id,)
    )
    purchases = [{
        'id': r[0], 'course_id': r[1],
        'amount': round(float(r[2] or 0) / 100.0, 2),
        'status': r[3], 'provider': r[4],
        'purchased_at': r[5], 'created_at': r[6],
    } for r in cur.fetchall()]

    cur.execute(
        "SELECT plan_id, status, amount_kopecks, started_at, expires_at, created_at "
        "FROM subscriptions WHERE user_id=%s ORDER BY created_at DESC",
        (user_id,)
    )
    subs = [{
        'plan_id': r[0], 'status': r[1],
        'amount': round(float(r[2] or 0) / 100.0, 2),
        'started_at': r[3], 'expires_at': r[4], 'created_at': r[5],
    } for r in cur.fetchall()]

    # Баланс ЗНАЕК
    cur.execute(
        "SELECT balance, total_earned, total_spent, current_streak, level "
        "FROM znaika_balances WHERE user_id=%s", (user_id,)
    )
    zr = cur.fetchone()
    znaika = ({
        'balance': zr[0], 'total_earned': zr[1], 'total_spent': zr[2],
        'streak': zr[3], 'level': zr[4],
    } if zr else None)

    total_spent = sum(p['amount'] for p in purchases if p['status'] == 'paid')
    return ok({
        'user': {
            'id': u[0], 'name': u[1], 'email': u[2], 'phone': u[3],
            'created_at': u[4], 'last_login_at': u[5],
        },
        'lifetime_value': round(total_spent, 2),
        'paid_orders': sum(1 for p in purchases if p['status'] == 'paid'),
        'purchases': purchases,
        'subscriptions': subs,
        'znaika': znaika,
    })


def handler(event: dict, context) -> dict:
    """Маршрутизация запросов дашборда продаж (требует X-Admin-Pin)."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    headers = event.get('headers') or {}
    if not check_admin(headers):
        return err('Доступ запрещён', 403)

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'overview')

    try:
        days = max(1, min(int(qs.get('days', '30')), 365))
    except ValueError:
        days = 30

    conn = get_db()
    try:
        cur = conn.cursor()
        if action == 'overview':
            return handle_overview(cur, days)
        if action == 'funnel':
            return handle_funnel(cur, days)
        if action == 'customers':
            q = (qs.get('q') or '').strip()
            status = (qs.get('status') or 'all').strip()
            try:
                limit = max(1, min(int(qs.get('limit', '50')), 200))
            except ValueError:
                limit = 50
            try:
                offset = max(0, int(qs.get('offset', '0')))
            except ValueError:
                offset = 0
            return handle_customers(cur, q, status, limit, offset)
        if action == 'customer':
            try:
                uid = int(qs.get('id', '0'))
            except ValueError:
                return err('Неверный id')
            return handle_customer_card(cur, uid)
        return err('Неизвестный action', 404)
    finally:
        conn.close()