"""
ИИ-менеджер проекта УЧИСЬПРО.
Анализирует метрики, ставит задачи отделам, контролирует выполнение и даёт сводку.

GET  /?action=status                 X-Admin-Pin   — последняя сводка + здоровье проекта + горящие задачи
GET  /?action=runs                   X-Admin-Pin   — история запусков менеджера
POST /?action=analyze                X-Admin-Pin   — запустить полный цикл (анализ + постановка задач)
POST /?action=cron                   Bearer CRON_SECRET — автозапуск по расписанию (раз в день)
"""
import json
import os
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

ADMIN_PIN = os.environ.get('ADMIN_PIN', '7777')
CRON_SECRET = os.environ.get('CRON_SECRET', '')
POLZA_API_KEY = os.environ.get('POLZA_API_KEY', '')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'openai/gpt-4o-mini'


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, Authorization, X-Authorization',
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
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return pin == ADMIN_PIN


def check_cron(headers: dict) -> bool:
    if not CRON_SECRET:
        return False
    auth = (headers.get('Authorization') or headers.get('authorization')
            or headers.get('X-Authorization') or headers.get('x-authorization') or '')
    token = auth.replace('Bearer ', '').strip()
    return token == CRON_SECRET


def fetch_one(cur, q: str, args: tuple = ()):
    cur.execute(q, args)
    r = cur.fetchone()
    return r[0] if r else None


# ──────────────────────────────────────────────────────────────────────
# СБОР МЕТРИК ПРОЕКТА
# ──────────────────────────────────────────────────────────────────────

def collect_metrics(cur, days: int = 30) -> dict:
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    prev_since = (datetime.now(timezone.utc) - timedelta(days=days * 2)).isoformat()

    def safe(q, args=()):
        try:
            return fetch_one(cur, q, args)
        except Exception:
            return None

    revenue = float(safe(
        "SELECT COALESCE(SUM(amount_kopecks),0)/100.0 FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0)
    prev_revenue = float(safe(
        "SELECT COALESCE(SUM(amount_kopecks),0)/100.0 FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s AND purchased_at < %s",
        (prev_since, since)) or 0)
    paid_orders = int(safe(
        "SELECT COUNT(*) FROM course_purchases WHERE status='paid' AND purchased_at >= %s",
        (since,)) or 0)
    unique_buyers = int(safe(
        "SELECT COUNT(DISTINCT user_id) FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0)
    new_users = int(safe("SELECT COUNT(*) FROM auth_users WHERE created_at >= %s", (since,)) or 0)
    all_users = int(safe("SELECT COUNT(*) FROM auth_users") or 0)

    # Реферальная и промо-активность
    ref_invites = int(safe(
        "SELECT COUNT(*) FROM referral_invites WHERE created_at >= %s", (since,)) or 0)
    promo_visits = int(safe(
        "SELECT COUNT(*) FROM promo_shares WHERE event='visit' AND created_at >= %s",
        (since,)) or 0)
    promo_shares = int(safe(
        "SELECT COUNT(*) FROM promo_shares WHERE event='share' AND created_at >= %s",
        (since,)) or 0)

    aov = (revenue / paid_orders) if paid_orders else 0
    conv = (unique_buyers / new_users * 100) if new_users else 0
    growth = ((revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else None
    arpu = (revenue / all_users) if all_users else 0

    return {
        'period_days': days,
        'revenue': round(revenue, 2),
        'prev_revenue': round(prev_revenue, 2),
        'revenue_growth_pct': round(growth, 1) if growth is not None else None,
        'mrr_goal': 1000000,
        'goal_progress_pct': round(revenue / 1000000 * 100, 1),
        'paid_orders': paid_orders,
        'unique_buyers': unique_buyers,
        'new_users': new_users,
        'all_users': all_users,
        'aov': round(aov, 2),
        'conv_reg_to_buy': round(conv, 2),
        'arpu': round(arpu, 2),
        'ref_invites': ref_invites,
        'promo_visits': promo_visits,
        'promo_shares': promo_shares,
    }


def open_tasks_snapshot(cur) -> dict:
    try:
        cur.execute(
            "SELECT status, COUNT(*) FROM marketing_tasks "
            "WHERE status IN ('todo','in_progress') GROUP BY status")
        rows = cur.fetchall()
        counts = {r[0]: r[1] for r in rows}
        cur.execute(
            "SELECT COUNT(*) FROM marketing_tasks "
            "WHERE status IN ('todo','in_progress') AND due_date < CURRENT_DATE")
        overdue = cur.fetchone()[0]
        cur.execute(
            "SELECT title, status, priority FROM marketing_tasks "
            "WHERE status IN ('todo','in_progress') ORDER BY "
            "CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, created_at DESC LIMIT 8")
        items = [{'title': r[0], 'status': r[1], 'priority': r[2]} for r in cur.fetchall()]
        return {
            'todo': counts.get('todo', 0),
            'in_progress': counts.get('in_progress', 0),
            'overdue': overdue,
            'items': items,
        }
    except Exception:
        return {'todo': 0, 'in_progress': 0, 'overdue': 0, 'items': []}


# ──────────────────────────────────────────────────────────────────────
# ИИ-МЕНЕДЖЕР
# ──────────────────────────────────────────────────────────────────────

PM_SYSTEM = (
    "Ты — Алекс, ИИ-менеджер проекта образовательной платформы УЧИСЬПРО. "
    "Сайт молодой (запущен недавно), БЮДЖЕТ НА РЕКЛАМУ = 0 ₽. "
    "Цель: вывести проект на 1 000 000 ₽ выручки в месяц. "
    "Главные ставки роста: КОНТЕНТ и SEO (бесплатный поток из соцсетей, Telegram, поиска) "
    "и АПСЕЛЛ/УДЕРЖАНИЕ (продавать больше текущим: подписки, доп.курсы, продление, бандлы). "
    "Также используй реферальную программу, ЗНАЙКИ-механики и акцию ДОБРО.\n"
    "Ты координируешь два отдела: marketing (создаёт контент, привлекает) и sales (закрывает сделки, апселл).\n"
    "Твоя работа: проанализировать метрики, определить здоровье проекта и ГЛАВНЫЙ фокус, "
    "затем выдать конкретные ЗАДАЧИ отделам — что именно сделать руками сегодня/на неделе.\n"
    "ПРИНЦИПЫ: конкретика без воды; каждая задача — измеримая и выполнимая без бюджета; "
    "указывай ожидаемый эффект. Не предлагай платную рекламу.\n"
    "Верни СТРОГО валидный JSON такого вида:\n"
    "{\n"
    '  "health_score": <число 0-100, общее здоровье проекта>,\n'
    '  "focus": "<главный фокус одной фразой>",\n'
    '  "summary": "<сводка для владельца, 3-5 предложений: где мы и что делаем>",\n'
    '  "tasks": [\n'
    '    {"title":"<кратко>","description":"<что сделать пошагово>",'
    '"assigned_to":"marketing|sales","priority":"high|medium|low",'
    '"target_metric":"<метрика>","due_days":<через сколько дней дедлайн>}\n'
    "  ]\n"
    "}\n"
    "Дай от 3 до 6 задач, приоритезируй по влиянию на выручку."
)


def call_pm_ai(metrics: dict, tasks: dict):
    if not POLZA_API_KEY:
        return None, 'POLZA_API_KEY не настроен'
    context = (
        f"МЕТРИКИ ПРОЕКТА (последние {metrics['period_days']} дней):\n"
        f"- Выручка: {metrics['revenue']:,.0f} ₽ / цель 1 000 000 ₽ "
        f"(прогресс {metrics['goal_progress_pct']}%, рост {metrics['revenue_growth_pct']}%)\n"
        f"- Оплаченных заказов: {metrics['paid_orders']}, средний чек {metrics['aov']:,.0f} ₽\n"
        f"- Новых пользователей: {metrics['new_users']}, купили {metrics['unique_buyers']} "
        f"(конверсия {metrics['conv_reg_to_buy']}%)\n"
        f"- Всего пользователей: {metrics['all_users']}, ARPU {metrics['arpu']:,.0f} ₽\n"
        f"- Рефералов за период: {metrics['ref_invites']}, репостов акции: {metrics['promo_shares']}, "
        f"переходов по акции: {metrics['promo_visits']}\n\n"
        f"ОТКРЫТЫЕ ЗАДАЧИ: в работе {tasks['in_progress']}, ожидают {tasks['todo']}, "
        f"просрочено {tasks['overdue']}.\n"
        f"Учитывай: сайт молодой, низкие абсолютные числа — это нормально, фокус на построении системы роста."
    )
    payload = json.dumps({
        'model': POLZA_MODEL,
        'messages': [
            {'role': 'system', 'content': PM_SYSTEM},
            {'role': 'user', 'content': context},
        ],
        'temperature': 0.5,
        'max_tokens': 2000,
        'response_format': {'type': 'json_object'},
    }).encode('utf-8')
    try:
        req = urllib.request.Request(
            POLZA_URL, data=payload,
            headers={'Authorization': f'Bearer {POLZA_API_KEY}', 'Content-Type': 'application/json'},
            method='POST')
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode('utf-8'))
            raw = data['choices'][0]['message']['content'].strip()
            if raw.startswith('```'):
                raw = raw.strip('`')
                raw = raw[4:] if raw.lower().startswith('json') else raw
            return json.loads(raw), None
    except (urllib.error.URLError, urllib.error.HTTPError) as e:
        return None, f'polza: {e}'
    except (KeyError, json.JSONDecodeError) as e:
        return None, f'parse: {e}'


def create_tasks(cur, ai_tasks: list) -> int:
    created = 0
    for t in ai_tasks[:6]:
        title = (t.get('title') or '').strip()[:200]
        if not title:
            continue
        desc = (t.get('description') or '').strip() or None
        assigned = t.get('assigned_to') if t.get('assigned_to') in ('marketing', 'sales') else 'sales'
        priority = t.get('priority') if t.get('priority') in ('high', 'medium', 'low') else 'medium'
        metric = (t.get('target_metric') or '')[:50] or None
        try:
            due_days = int(t.get('due_days') or 7)
        except (TypeError, ValueError):
            due_days = 7
        due_date = (datetime.now(timezone.utc) + timedelta(days=max(1, min(60, due_days)))).date()
        # Защита от дублей: не создаём задачу с таким же заголовком, если она ещё открыта
        cur.execute(
            "SELECT 1 FROM marketing_tasks WHERE title=%s AND status IN ('todo','in_progress') LIMIT 1",
            (title,))
        if cur.fetchone():
            continue
        cur.execute(
            "INSERT INTO marketing_tasks "
            "(title, description, assigned_to, created_by, priority, status, target_metric, due_date) "
            "VALUES (%s,%s,%s,'ai_pm',%s,'todo',%s,%s)",
            (title, desc, assigned, priority, metric, due_date))
        created += 1
    return created


def run_cycle(run_type: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            metrics = collect_metrics(cur, 30)
            tasks = open_tasks_snapshot(cur)
            ai, ai_err = call_pm_ai(metrics, tasks)
            if not ai:
                return err(f'ИИ-менеджер недоступен: {ai_err}', 503)
            created = create_tasks(cur, ai.get('tasks') or [])
            health = int(ai.get('health_score') or 0)
            focus = (ai.get('focus') or '')[:200]
            summary = ai.get('summary') or ''
            cur.execute(
                "INSERT INTO pm_runs "
                "(run_type, summary, health_score, focus, tasks_created, metrics, actions) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id, created_at",
                (run_type, summary, health, focus, created,
                 json.dumps(metrics, ensure_ascii=False),
                 json.dumps(ai.get('tasks') or [], ensure_ascii=False)))
            rid, created_at = cur.fetchone()
            conn.commit()
            return ok({
                'ok': True,
                'run_id': rid,
                'run_type': run_type,
                'health_score': health,
                'focus': focus,
                'summary': summary,
                'tasks_created': created,
                'tasks_proposed': ai.get('tasks') or [],
                'metrics': metrics,
                'open_tasks': tasks,
                'created_at': created_at,
            })
    finally:
        conn.close()


def handle_status() -> dict:
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            metrics = collect_metrics(cur, 30)
            tasks = open_tasks_snapshot(cur)
            cur.execute(
                "SELECT id, run_type, summary, health_score, focus, tasks_created, created_at "
                "FROM pm_runs ORDER BY created_at DESC LIMIT 1")
            last = cur.fetchone()
            return ok({
                'metrics': metrics,
                'open_tasks': tasks,
                'last_run': dict(last) if last else None,
            })
    finally:
        conn.close()


def handle_runs() -> dict:
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, run_type, summary, health_score, focus, tasks_created, created_at "
                "FROM pm_runs ORDER BY created_at DESC LIMIT 20")
            return ok({'runs': [dict(r) for r in cur.fetchall()]})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """ИИ-менеджер проекта: анализ, постановка задач, контроль, сводка."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'status').strip()
    headers = event.get('headers') or {}

    # cron — по секрету, остальное — по админ-пину
    if action == 'cron' and method == 'POST':
        if not check_cron(headers):
            return err('Неверный cron-токен', 401)
        return run_cycle('cron')

    if not check_admin(headers):
        return err('Требуется админ-доступ', 401)

    if action == 'status':
        return handle_status()
    if action == 'runs':
        return handle_runs()
    if action == 'analyze' and method == 'POST':
        return run_cycle('manual')

    return err('Неизвестное действие', 404)
