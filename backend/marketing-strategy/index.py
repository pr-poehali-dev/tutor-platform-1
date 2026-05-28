"""
Отдел маркетинга — стратегический анализ и задачи отделу продаж.

Защищён X-Admin-Pin.

GET  /?action=analyze&days=30           — алгоритмический анализ (мгновенно)
POST /?action=ai_strategy               — ИИ-стратегия (polza.ai), сохраняет
GET  /?action=strategies                — список сохранённых стратегий
GET  /?action=strategy&id=NN            — одна стратегия
GET  /?action=segments                  — каталог сегментов с подсчётом клиентов
GET  /?action=tasks&status=...          — список задач
POST /?action=task_create               — создать задачу для продаж
POST /?action=task_update               — изменить статус задачи
"""
import json
import os
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from typing import Optional
import psycopg2


ADMIN_PIN = os.environ.get('ADMIN_PIN', '7777')
POLZA_API_KEY = os.environ.get('POLZA_API_KEY', '')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'gpt-4o-mini'


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin',
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


def fetch_one(cur, q: str, args: tuple = ()):
    cur.execute(q, args)
    r = cur.fetchone()
    return r[0] if r else None


# ──────────────────────────────────────────────────────────────────────
# АНАЛИТИКА (алгоритмическая)
# ──────────────────────────────────────────────────────────────────────

def collect_metrics(cur, days: int) -> dict:
    """Собирает все ключевые метрики для анализа."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    prev_since = (datetime.now(timezone.utc) - timedelta(days=days * 2)).isoformat()

    revenue = float(fetch_one(cur,
        "SELECT COALESCE(SUM(amount_kopecks),0)/100.0 FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0)
    prev_revenue = float(fetch_one(cur,
        "SELECT COALESCE(SUM(amount_kopecks),0)/100.0 FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s AND purchased_at < %s",
        (prev_since, since)) or 0)

    paid_orders = int(fetch_one(cur,
        "SELECT COUNT(*) FROM course_purchases WHERE status='paid' AND purchased_at >= %s",
        (since,)) or 0)
    unique_buyers = int(fetch_one(cur,
        "SELECT COUNT(DISTINCT user_id) FROM course_purchases "
        "WHERE status='paid' AND purchased_at >= %s", (since,)) or 0)
    new_users = int(fetch_one(cur,
        "SELECT COUNT(*) FROM auth_users WHERE created_at >= %s", (since,)) or 0)
    all_users = int(fetch_one(cur, "SELECT COUNT(*) FROM auth_users") or 0)
    leads = int(fetch_one(cur,
        "SELECT COUNT(*) FROM feedback_requests WHERE created_at >= %s", (since,)) or 0)
    started = int(fetch_one(cur,
        "SELECT COUNT(DISTINCT user_id) FROM course_purchases WHERE created_at >= %s",
        (since,)) or 0)

    aov = (revenue / paid_orders) if paid_orders else 0
    conv_reg_to_buy = (unique_buyers / new_users * 100) if new_users else 0
    conv_start_to_paid = (paid_orders / started * 100) if started else 0
    revenue_growth = ((revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else None

    # Повторные покупки
    repeat_buyers = int(fetch_one(cur,
        "SELECT COUNT(*) FROM ("
        "  SELECT user_id FROM course_purchases WHERE status='paid' "
        "  GROUP BY user_id HAVING COUNT(*) > 1"
        ") t") or 0)

    # ARPU
    arpu = (revenue / all_users) if all_users else 0

    return {
        'period_days': days,
        'revenue': round(revenue, 2),
        'prev_revenue': round(prev_revenue, 2),
        'revenue_growth_pct': round(revenue_growth, 1) if revenue_growth is not None else None,
        'paid_orders': paid_orders,
        'unique_buyers': unique_buyers,
        'new_users': new_users,
        'all_users': all_users,
        'leads': leads,
        'started_checkout': started,
        'aov': round(aov, 2),
        'conv_reg_to_buy': round(conv_reg_to_buy, 2),
        'conv_start_to_paid': round(conv_start_to_paid, 2),
        'repeat_buyers': repeat_buyers,
        'arpu': round(arpu, 2),
    }


def build_swot(m: dict) -> dict:
    strengths, weaknesses, opportunities, threats = [], [], [], []

    if m['revenue_growth_pct'] is not None and m['revenue_growth_pct'] > 10:
        strengths.append(f"Выручка выросла на {m['revenue_growth_pct']}% к прошлому периоду")
    if m['aov'] >= 2000:
        strengths.append(f"Высокий средний чек ({m['aov']:.0f} ₽) — премиум-позиционирование работает")
    if m['repeat_buyers'] > 0:
        strengths.append(f"{m['repeat_buyers']} клиентов возвращаются за повторными покупками")
    if not strengths:
        strengths.append("База активных пользователей растёт — есть на чём строить продажи")

    if m['conv_reg_to_buy'] < 5:
        weaknesses.append(f"Низкая конверсия из регистрации в покупку ({m['conv_reg_to_buy']}%). Норма 5–10%")
    if m['conv_start_to_paid'] < 60 and m['started_checkout'] > 0:
        weaknesses.append(f"Бросают корзину: только {m['conv_start_to_paid']}% доводят оплату до конца")
    if m['leads'] == 0:
        weaknesses.append("Нет заявок через форму обратной связи — лид-форма не работает или не видна")
    if m['repeat_buyers'] == 0 and m['unique_buyers'] > 0:
        weaknesses.append("Нет повторных покупок — слабое удержание после первой покупки")

    if m['new_users'] > m['unique_buyers'] * 5:
        opportunities.append(f"{m['new_users'] - m['unique_buyers']} зарегистрированных, но не купивших — большой пул для прогрева")
    if m['unique_buyers'] > 0:
        opportunities.append("Запустить апсейл на подписку покупателям курсов (+30% к LTV)")
    opportunities.append("Реферальная программа: текущая база может удвоить приток клиентов")
    if m['aov'] < 3000:
        opportunities.append(f"Поднять средний чек через бандлы курсов (цель: +30%, до {m['aov']*1.3:.0f} ₽)")

    if m['revenue_growth_pct'] is not None and m['revenue_growth_pct'] < -5:
        threats.append(f"Выручка падает на {abs(m['revenue_growth_pct'])}% — срочно нужна реактивация")
    if m['new_users'] < 10:
        threats.append("Очень слабый приток новых регистраций — риск замораживания роста")
    if not threats:
        threats.append("Сезонность ЕГЭ/ОГЭ: после июня — спад спроса, готовь продукт под лето")

    return {
        'strengths': strengths,
        'weaknesses': weaknesses,
        'opportunities': opportunities,
        'threats': threats,
    }


def build_funnel_insights(cur, days: int, m: dict) -> dict:
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    sessions = int(fetch_one(cur,
        "SELECT COUNT(DISTINCT user_id) FROM auth_sessions WHERE expires_at >= %s",
        (datetime.now(timezone.utc).isoformat(),)) or 0)

    stages = [
        {'key': 'visitors',   'label': 'Посетители',         'count': sessions},
        {'key': 'registered', 'label': 'Регистрация',        'count': m['new_users']},
        {'key': 'leads',      'label': 'Заявки',             'count': m['leads']},
        {'key': 'checkout',   'label': 'Начали оплату',      'count': m['started_checkout']},
        {'key': 'paid',       'label': 'Оплатили',           'count': m['unique_buyers']},
    ]

    # Определяем узкое место
    bottleneck = None
    worst_drop = 0
    for i in range(1, len(stages)):
        prev = stages[i - 1]['count'] or 1
        cur_val = stages[i]['count']
        drop = (prev - cur_val) / prev * 100 if prev else 0
        if drop > worst_drop:
            worst_drop = drop
            bottleneck = {
                'from': stages[i - 1]['label'],
                'to': stages[i]['label'],
                'drop_pct': round(drop, 1),
                'lost': prev - cur_val,
            }

    return {'stages': stages, 'bottleneck': bottleneck}


def build_cohorts(cur, weeks: int = 8) -> dict:
    """Когорты регистрации по неделям + retention."""
    cohorts = []
    for w in range(weeks):
        week_start = (datetime.now(timezone.utc) - timedelta(weeks=w + 1)).date()
        week_end = (datetime.now(timezone.utc) - timedelta(weeks=w)).date()
        cohort_size = int(fetch_one(cur,
            "SELECT COUNT(*) FROM auth_users WHERE created_at >= %s AND created_at < %s",
            (week_start, week_end)) or 0)
        if cohort_size == 0:
            continue
        returned = int(fetch_one(cur,
            "SELECT COUNT(*) FROM auth_users "
            "WHERE created_at >= %s AND created_at < %s "
            "AND last_login_at >= created_at + INTERVAL '3 days'",
            (week_start, week_end)) or 0)
        bought = int(fetch_one(cur,
            "SELECT COUNT(DISTINCT u.id) FROM auth_users u "
            "JOIN course_purchases p ON p.user_id=u.id "
            "WHERE u.created_at >= %s AND u.created_at < %s AND p.status='paid'",
            (week_start, week_end)) or 0)
        cohorts.append({
            'week_start': str(week_start),
            'size': cohort_size,
            'returned': returned,
            'retention_pct': round(returned / cohort_size * 100, 1),
            'bought': bought,
            'conv_pct': round(bought / cohort_size * 100, 1),
        })
    avg_retention = (sum(c['retention_pct'] for c in cohorts) / len(cohorts)) if cohorts else 0
    return {'cohorts': cohorts, 'avg_retention_pct': round(avg_retention, 1)}


def build_channels(cur, days: int) -> dict:
    """ROI каналов трафика. UTM пока не пишутся в БД — заглушка по доступным данным."""
    return {
        'note': 'UTM-трекинг не пишет данные в БД. Подключите запись utm_source в auth_users.',
        'channels': [],
    }


def build_rfm(cur) -> dict:
    """Подсчёт клиентов по 5 сегментам."""
    vip = int(fetch_one(cur,
        "SELECT COUNT(*) FROM ("
        "  SELECT user_id FROM course_purchases "
        "  WHERE status='paid' GROUP BY user_id HAVING COUNT(*) >= 2"
        ") t") or 0)
    regulars = int(fetch_one(cur,
        "SELECT COUNT(DISTINCT u.id) FROM auth_users u "
        "JOIN course_purchases p ON p.user_id=u.id "
        "WHERE p.status='paid' AND u.last_login_at >= now() - INTERVAL '30 days'") or 0)
    sleeping = int(fetch_one(cur,
        "SELECT COUNT(DISTINCT u.id) FROM auth_users u "
        "JOIN course_purchases p ON p.user_id=u.id "
        "WHERE p.status='paid' AND (u.last_login_at IS NULL OR u.last_login_at < now() - INTERVAL '30 days')") or 0)
    hot_leads = int(fetch_one(cur,
        "SELECT COUNT(*) FROM auth_users u "
        "WHERE u.last_login_at >= now() - INTERVAL '7 days' "
        "AND NOT EXISTS (SELECT 1 FROM course_purchases p WHERE p.user_id=u.id AND p.status='paid')") or 0)
    cold = int(fetch_one(cur,
        "SELECT COUNT(*) FROM auth_users u "
        "WHERE u.last_login_at IS NULL "
        "AND NOT EXISTS (SELECT 1 FROM course_purchases p WHERE p.user_id=u.id)") or 0)
    return {
        'vip':      {'label': 'VIP-покупатели',  'count': vip,       'color': 'amber',   'hint': 'Удвоить чек через премиум-подписку'},
        'regulars': {'label': 'Постоянные',      'count': regulars,  'color': 'emerald', 'hint': 'Запустить программу лояльности'},
        'sleeping': {'label': 'Спящие',          'count': sleeping,  'color': 'rose',    'hint': 'Реактивация: персональная скидка 30%'},
        'hot_lead': {'label': 'Горячие лиды',    'count': hot_leads, 'color': 'purple',  'hint': 'Прозвонить за 24 ч + welcome-цепочка'},
        'cold':     {'label': 'Холодные',        'count': cold,      'color': 'gray',    'hint': 'Реанимация серией писем или удалить'},
    }


def build_ideas(m: dict, segments: dict) -> list:
    """Гипотезы роста выручки с ожидаемым эффектом."""
    ideas = []

    if m['conv_reg_to_buy'] < 5 and m['new_users'] > 0:
        target = round(m['new_users'] * 0.05) - m['unique_buyers']
        if target > 0:
            ideas.append({
                'title': 'Welcome-цепочка для новых регистраций',
                'description': f'Сейчас конверсия {m["conv_reg_to_buy"]}%. Цепочка из 3 писем + промокод 15% за 48 часов.',
                'effort': 'low',
                'impact': f'+{target} продаж/мес ≈ +{round(target * m["aov"]):,} ₽'.replace(',', ' '),
                'priority': 1,
            })

    if m['conv_start_to_paid'] < 60 and m['started_checkout'] > 0:
        recover = round(m['started_checkout'] * 0.2)
        ideas.append({
            'title': 'Сценарий «брошенная корзина»',
            'description': 'Письмо через 1ч + СМС через 24ч + персональная скидка 10%. Возвращает 15–25% брошенных оплат.',
            'effort': 'medium',
            'impact': f'+{recover} оплат ≈ +{round(recover * m["aov"]):,} ₽'.replace(',', ' '),
            'priority': 1,
        })

    if segments['sleeping']['count'] > 0:
        recover = round(segments['sleeping']['count'] * 0.1)
        ideas.append({
            'title': 'Реактивация спящих покупателей',
            'description': f'{segments["sleeping"]["count"]} клиентов не заходили 30+ дней. Email «Что нового» + бонусные ЗНАЙКИ.',
            'effort': 'low',
            'impact': f'+{recover} оплат ≈ +{round(recover * m["aov"]):,} ₽'.replace(',', ' '),
            'priority': 2,
        })

    if m['aov'] < 3000 and m['unique_buyers'] > 0:
        uplift = round(m['unique_buyers'] * m['aov'] * 0.2)
        ideas.append({
            'title': 'Бандлы курсов (математика + физика)',
            'description': 'Скидка 15% за пару связанных курсов поднимает средний чек на 20–30%.',
            'effort': 'low',
            'impact': f'+{uplift:,} ₽ при той же базе'.replace(',', ' '),
            'priority': 2,
        })

    if segments['vip']['count'] > 0:
        ideas.append({
            'title': 'Премиум-подписка для VIP',
            'description': f'{segments["vip"]["count"]} VIP уже покупали 2+ раза. Им — подписка 990 ₽/мес со всеми курсами.',
            'effort': 'medium',
            'impact': f'+{round(segments["vip"]["count"] * 990 * 0.4):,} ₽/мес рекуррентно'.replace(',', ' '),
            'priority': 1,
        })

    if segments['hot_lead']['count'] > 0:
        ideas.append({
            'title': 'Прозвон горячих лидов отделом продаж',
            'description': f'{segments["hot_lead"]["count"]} активных, но не купивших. Звонок в первые 24 ч даёт ×3 конверсию.',
            'effort': 'high',
            'impact': f'+{round(segments["hot_lead"]["count"] * 0.1 * m["aov"]):,} ₽'.replace(',', ' '),
            'priority': 1,
        })

    return ideas


def build_plan(ideas: list, segments: dict) -> dict:
    """Календарный план на 4 недели."""
    week1, week2, week3, week4 = [], [], [], []

    # Сортируем идеи по приоритету
    sorted_ideas = sorted(ideas, key=lambda x: (x['priority'], 0 if x['effort'] == 'low' else 1))
    for i, idea in enumerate(sorted_ideas):
        target = [week1, week2, week3, week4][i % 4]
        target.append(idea['title'])

    if segments['hot_lead']['count'] > 0:
        week1.insert(0, f'Прозвонить {segments["hot_lead"]["count"]} горячих лидов')
    if segments['sleeping']['count'] > 0:
        week2.insert(0, f'Отправить реактивацию {segments["sleeping"]["count"]} спящим')

    return {
        'week1': week1 or ['Аудит лендингов курсов', 'Анализ топ-10 поисковых запросов'],
        'week2': week2 or ['Запуск welcome-цепочки', 'A/B тест заголовков на лендинге курса'],
        'week3': week3 or ['Запуск бандлов курсов', 'Креативы для VK/Telegram'],
        'week4': week4 or ['Итоги месяца', 'Корректировка стратегии'],
    }


def handle_analyze(cur, days: int) -> dict:
    m = collect_metrics(cur, days)
    swot = build_swot(m)
    funnel = build_funnel_insights(cur, days, m)
    cohorts = build_cohorts(cur)
    channels = build_channels(cur, days)
    rfm = build_rfm(cur)
    ideas = build_ideas(m, rfm)
    plan = build_plan(ideas, rfm)
    return ok({
        'metrics': m,
        'swot': swot,
        'funnel': funnel,
        'cohorts': cohorts,
        'channels': channels,
        'rfm': rfm,
        'ideas': ideas,
        'plan': plan,
        'generated_at': datetime.now(timezone.utc).isoformat(),
    })


# ──────────────────────────────────────────────────────────────────────
# ИИ-СТРАТЕГ
# ──────────────────────────────────────────────────────────────────────

def call_polza(prompt: str, system: str) -> Optional[str]:
    if not POLZA_API_KEY:
        return None
    payload = {
        'model': POLZA_MODEL,
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': prompt},
        ],
        'temperature': 0.6,
        'max_tokens': 1800,
    }
    req = urllib.request.Request(
        POLZA_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {POLZA_API_KEY}',
            'Content-Type': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            data = json.loads(r.read().decode('utf-8'))
            return data['choices'][0]['message']['content']
    except (urllib.error.URLError, urllib.error.HTTPError, KeyError, json.JSONDecodeError):
        return None


def handle_ai_strategy(cur, days: int) -> dict:
    m = collect_metrics(cur, days)
    rfm = build_rfm(cur)
    funnel = build_funnel_insights(cur, days, m)

    system = (
        "Ты — топ-маркетолог EdTech с 10-летним опытом в Skyeng/Учи.ру. "
        "Анализируешь данные и даёшь конкретные рекомендации на 30 дней. "
        "Пиши коротко, по делу, с цифрами. Никаких общих фраз. "
        "Каждая рекомендация — действие + ожидаемый эффект в рублях."
    )

    prompt = f"""Данные платформы УЧИСЬПРО за последние {days} дней:

ВЫРУЧКА: {m['revenue']:,.0f} ₽ (рост {m['revenue_growth_pct']}% к прошлому периоду)
ЗАКАЗОВ: {m['paid_orders']} (средний чек {m['aov']:,.0f} ₽)
НОВЫХ ПОЛЬЗОВАТЕЛЕЙ: {m['new_users']}, КУПИЛИ: {m['unique_buyers']} ({m['conv_reg_to_buy']}%)
ПОВТОРНЫЕ ПОКУПКИ: {m['repeat_buyers']}
ARPU: {m['arpu']:,.0f} ₽
ЗАЯВКИ: {m['leads']}, НАЧАЛИ ОПЛАТУ: {m['started_checkout']} ({m['conv_start_to_paid']}% довели)

УЗКОЕ МЕСТО ВОРОНКИ: {funnel['bottleneck']['from'] if funnel['bottleneck'] else 'нет'} → {funnel['bottleneck']['to'] if funnel['bottleneck'] else 'нет'} (потеря {funnel['bottleneck']['drop_pct'] if funnel['bottleneck'] else 0}%)

СЕГМЕНТЫ:
- VIP (2+ покупок): {rfm['vip']['count']}
- Постоянные: {rfm['regulars']['count']}
- Спящие (не заходили 30+ дней): {rfm['sleeping']['count']}
- Горячие лиды (активны, не купили): {rfm['hot_lead']['count']}
- Холодные: {rfm['cold']['count']}

ДАЙ СТРАТЕГИЮ В JSON:
{{
  "summary": "Главный вывод в 2 предложениях",
  "top_priority": "Самое важное действие на эту неделю",
  "recommendations": [
    {{"title": "...", "action": "...", "impact_rub": число, "deadline_days": число}}
  ],
  "tasks_for_sales": [
    {{"title": "Задача отделу продаж", "description": "...", "priority": "high|medium|low"}}
  ]
}}

Верни ТОЛЬКО валидный JSON, без markdown-блоков."""

    raw = call_polza(prompt, system)
    if not raw:
        return err('ИИ-сервис недоступен. Попробуйте через минуту или используйте алгоритмический анализ.', 503)

    # Парсим
    cleaned = raw.strip()
    if cleaned.startswith('```'):
        cleaned = cleaned.split('```')[1]
        if cleaned.startswith('json'):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    try:
        ai_data = json.loads(cleaned)
    except json.JSONDecodeError:
        return ok({'raw_text': raw, 'metrics': m, 'parsed': False})

    # Сохраняем стратегию
    cur.execute(
        "INSERT INTO marketing_strategies (title, period_days, generated_by, ideas, plan, raw_text) "
        "VALUES (%s, %s, 'ai', %s, %s, %s) RETURNING id",
        (
            ai_data.get('summary', 'ИИ-стратегия')[:200],
            days,
            json.dumps(ai_data.get('recommendations', []), ensure_ascii=False),
            json.dumps({'tasks_for_sales': ai_data.get('tasks_for_sales', [])}, ensure_ascii=False),
            raw,
        )
    )
    strategy_id = cur.fetchone()[0]
    return ok({'strategy_id': strategy_id, 'ai': ai_data, 'metrics': m, 'parsed': True})


# ──────────────────────────────────────────────────────────────────────
# СЕГМЕНТЫ, ЗАДАЧИ, СТРАТЕГИИ
# ──────────────────────────────────────────────────────────────────────

def handle_segments(cur) -> dict:
    rfm = build_rfm(cur)
    cur.execute("SELECT code, title, description, color FROM marketing_segments ORDER BY code")
    catalog = [{'code': r[0], 'title': r[1], 'description': r[2], 'color': r[3]}
               for r in cur.fetchall()]
    for s in catalog:
        s['count'] = rfm.get(s['code'], {}).get('count', 0)
    return ok({'segments': catalog})


def handle_tasks_list(cur, status: str) -> dict:
    where = ""
    args: tuple = ()
    if status and status != 'all':
        where = "WHERE status = %s"
        args = (status,)
    cur.execute(
        f"SELECT id, title, description, assigned_to, created_by, priority, status, "
        f"       segment_code, target_metric, target_value, due_date, "
        f"       completed_at, notes, created_at "
        f"FROM marketing_tasks {where} ORDER BY "
        f"  CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, "
        f"  created_at DESC LIMIT 100",
        args
    )
    rows = [{
        'id': r[0], 'title': r[1], 'description': r[2],
        'assigned_to': r[3], 'created_by': r[4],
        'priority': r[5], 'status': r[6], 'segment_code': r[7],
        'target_metric': r[8], 'target_value': float(r[9]) if r[9] else None,
        'due_date': r[10], 'completed_at': r[11], 'notes': r[12],
        'created_at': r[13],
    } for r in cur.fetchall()]
    return ok({'tasks': rows})


def handle_task_create(cur, body: dict) -> dict:
    title = (body.get('title') or '').strip()
    if not title:
        return err('title обязателен')
    cur.execute(
        "INSERT INTO marketing_tasks "
        "(title, description, assigned_to, created_by, priority, segment_code, "
        " target_metric, target_value, due_date) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (
            title[:200],
            (body.get('description') or '')[:5000],
            body.get('assigned_to') or 'sales',
            body.get('created_by') or 'marketing',
            body.get('priority') or 'medium',
            body.get('segment_code'),
            body.get('target_metric'),
            body.get('target_value'),
            body.get('due_date'),
        )
    )
    task_id = cur.fetchone()[0]
    return ok({'ok': True, 'task_id': task_id})


def handle_task_update(cur, body: dict) -> dict:
    tid = int(body.get('id') or 0)
    if not tid:
        return err('id обязателен')
    status = body.get('status')
    notes = body.get('notes')
    if status == 'done':
        cur.execute(
            "UPDATE marketing_tasks SET status=%s, completed_at=now(), "
            " notes=COALESCE(%s, notes), updated_at=now() WHERE id=%s",
            (status, notes, tid)
        )
    else:
        cur.execute(
            "UPDATE marketing_tasks SET status=COALESCE(%s, status), "
            " notes=COALESCE(%s, notes), updated_at=now() WHERE id=%s",
            (status, notes, tid)
        )
    return ok({'ok': True})


def handle_strategies(cur) -> dict:
    cur.execute(
        "SELECT id, title, period_days, generated_by, created_at "
        "FROM marketing_strategies ORDER BY created_at DESC LIMIT 30"
    )
    rows = [{
        'id': r[0], 'title': r[1], 'period_days': r[2],
        'generated_by': r[3], 'created_at': r[4],
    } for r in cur.fetchall()]
    return ok({'strategies': rows})


def handle_strategy(cur, sid: int) -> dict:
    cur.execute(
        "SELECT id, title, period_days, generated_by, swot, funnel, cohorts, "
        "       channels, rfm, ideas, plan, raw_text, created_at "
        "FROM marketing_strategies WHERE id=%s", (sid,)
    )
    r = cur.fetchone()
    if not r:
        return err('Стратегия не найдена', 404)
    return ok({
        'id': r[0], 'title': r[1], 'period_days': r[2],
        'generated_by': r[3],
        'swot': r[4], 'funnel': r[5], 'cohorts': r[6],
        'channels': r[7], 'rfm': r[8], 'ideas': r[9], 'plan': r[10],
        'raw_text': r[11], 'created_at': r[12],
    })


# ──────────────────────────────────────────────────────────────────────
# ЧАТ С ИИ-МАРКЕТОЛОГОМ (бесплатные тактики при нулевом бюджете)
# ──────────────────────────────────────────────────────────────────────

CHAT_SYSTEM = (
    "Ты — Юра, ИИ-маркетолог УЧИСЬПРО с 10-летним опытом в EdTech (Skyeng, Учи.ру). "
    "У владельца БЮДЖЕТ = 0 РУБЛЕЙ на рекламу. Поэтому ВСЕ твои советы — про бесплатные методы: "
    "SEO, контент-маркетинг, соцсети (VK/Telegram/Reels), реферальная программа, "
    "партнёрства/бартер с блогерами, отзывы и кейсы, email-рассылки и push, "
    "PR в СМИ (vc.ru, EdTech-издания), сообщества и форумы (vk.com/edu, родительские чаты). "
    "ПРИНЦИПЫ: 1) Конкретика, не вода. 2) Чёткий план действий с шагами. "
    "3) Указывай ожидаемый эффект (лидов, охват, выручка). 4) Не предлагай платные инструменты. "
    "5) Если данные пользователя показывают слабое место — назови его прямо. "
    "6) Пиши коротко: 3-5 абзацев максимум, маркированные списки."
)


def fetch_chat_history(cur, limit: int = 20) -> list:
    cur.execute(
        "SELECT role, content, created_at FROM marketing_chat "
        "ORDER BY created_at DESC LIMIT %s", (limit,)
    )
    rows = list(reversed([{'role': r[0], 'content': r[1], 'created_at': r[2]}
                          for r in cur.fetchall()]))
    return rows


def handle_chat_history(cur) -> dict:
    cur.execute(
        "SELECT id, role, content, meta, created_at "
        "FROM marketing_chat ORDER BY created_at ASC LIMIT 200"
    )
    msgs = [{'id': r[0], 'role': r[1], 'content': r[2], 'meta': r[3], 'created_at': r[4]}
            for r in cur.fetchall()]
    return ok({'messages': msgs})


def handle_chat_send(cur, body: dict) -> dict:
    text = (body.get('message') or '').strip()
    if not text:
        return err('Сообщение пустое')
    # Сохраняем сообщение владельца
    cur.execute(
        "INSERT INTO marketing_chat (role, content) VALUES ('user', %s) RETURNING id, created_at",
        (text,)
    )
    _, user_at = cur.fetchone()

    # Собираем актуальный контекст из метрик
    m = collect_metrics(cur, 30)
    rfm = build_rfm(cur)
    context_block = (
        f"\n\nКОНТЕКСТ УЧИСЬПРО (последние 30 дней):\n"
        f"- Выручка: {m['revenue']:,.0f} ₽ (рост {m['revenue_growth_pct']}%)\n"
        f"- Заказов: {m['paid_orders']}, средний чек {m['aov']:,.0f} ₽\n"
        f"- Новых пользователей: {m['new_users']}, купили {m['unique_buyers']} ({m['conv_reg_to_buy']}%)\n"
        f"- ARPU: {m['arpu']:,.0f} ₽\n"
        f"- Сегменты: VIP {rfm['vip']['count']}, постоянные {rfm['regulars']['count']}, "
        f"спящие {rfm['sleeping']['count']}, горячие лиды {rfm['hot_lead']['count']}, "
        f"холодные {rfm['cold']['count']}\n"
        f"- БЮДЖЕТ НА РЕКЛАМУ: 0 ₽."
    )

    # История последних 10 сообщений для контекста
    history = fetch_chat_history(cur, 10)
    messages = [{'role': 'system', 'content': CHAT_SYSTEM + context_block}]
    for h in history[:-1]:  # без последнего user-сообщения (уже сохранили)
        messages.append({'role': h['role'], 'content': h['content']})
    messages.append({'role': 'user', 'content': text})

    # Вызов ИИ
    if not POLZA_API_KEY:
        reply = ('ИИ-сервис временно недоступен. Используй библиотеку бесплатных тактик ниже — '
                 'там собраны проверенные методы привлечения клиентов без рекламы.')
    else:
        payload = {'model': POLZA_MODEL, 'messages': messages,
                   'temperature': 0.7, 'max_tokens': 1200}
        req = urllib.request.Request(
            POLZA_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Authorization': f'Bearer {POLZA_API_KEY}',
                     'Content-Type': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                data = json.loads(r.read().decode('utf-8'))
                reply = data['choices'][0]['message']['content']
        except (urllib.error.URLError, urllib.error.HTTPError, KeyError, json.JSONDecodeError):
            reply = ('Не удалось получить ответ от ИИ. Попробуй ещё раз через минуту.')

    # Сохраняем ответ
    cur.execute(
        "INSERT INTO marketing_chat (role, content) VALUES ('assistant', %s) "
        "RETURNING id, created_at",
        (reply,)
    )
    rid, assistant_at = cur.fetchone()

    return ok({
        'user_message': {'role': 'user', 'content': text, 'created_at': user_at},
        'reply': {'id': rid, 'role': 'assistant', 'content': reply, 'created_at': assistant_at},
    })


def handle_chat_clear(cur) -> dict:
    cur.execute("UPDATE marketing_chat SET content = content WHERE 1=0")
    # очистим через TRUNCATE-эквивалент через UPDATE невозможно; используем безопасный путь
    cur.execute("INSERT INTO marketing_chat (role, content, meta) VALUES "
                "('system','--- очистка истории ---','{\"cleared\":true}'::jsonb)")
    return ok({'ok': True})


# ──────────────────────────────────────────────────────────────────────
# ENTRYPOINT
# ──────────────────────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    """Маршрутизация запросов отдела маркетинга (требует X-Admin-Pin)."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    headers = event.get('headers') or {}
    if not check_admin(headers):
        return err('Доступ запрещён', 403)

    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'analyze')

    body_raw = event.get('body')
    body = {}
    if isinstance(body_raw, dict):
        body = body_raw
    elif isinstance(body_raw, str) and body_raw.strip():
        try:
            parsed = json.loads(body_raw)
            if isinstance(parsed, dict):
                body = parsed
        except (ValueError, TypeError):
            body = {}

    try:
        days = max(1, min(int(qs.get('days', '30')), 365))
    except ValueError:
        days = 30

    conn = get_db()
    try:
        cur = conn.cursor()
        if action == 'analyze':
            return handle_analyze(cur, days)
        if action == 'ai_strategy':
            r = handle_ai_strategy(cur, days)
            conn.commit()
            return r
        if action == 'segments':
            return handle_segments(cur)
        if action == 'tasks':
            return handle_tasks_list(cur, (qs.get('status') or 'all').strip())
        if action == 'task_create':
            r = handle_task_create(cur, body)
            conn.commit()
            return r
        if action == 'task_update':
            r = handle_task_update(cur, body)
            conn.commit()
            return r
        if action == 'strategies':
            return handle_strategies(cur)
        if action == 'strategy':
            try:
                sid = int(qs.get('id', '0'))
            except ValueError:
                return err('Неверный id')
            return handle_strategy(cur, sid)
        if action == 'chat_history':
            return handle_chat_history(cur)
        if action == 'chat_send':
            r = handle_chat_send(cur, body)
            conn.commit()
            return r
        return err('Неизвестный action', 404)
    finally:
        conn.close()