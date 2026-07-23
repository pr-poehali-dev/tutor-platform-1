"""
Business: «Профориентация PRO» — индивидуальный ИИ-курс под конкретного человека.
Человек проходит чек-лист (цель + желаемые навыки) → ИИ генерирует персональный
план курса → показываем бесплатно → человек оставляет заявку на оплату (от 10 000 ₽).

Действия (query ?action= или body.action):
- generate_plan (POST): по ответам чек-листа генерирует индивидуальный план курса (ИИ)
- submit (POST): сохраняет заявку + план в БД, уведомляет владельца в MAX
- leads_list (GET, X-Admin-Pin): список заявок для менеджера

Args: event (httpMethod, body, queryStringParameters, headers), context
Returns: JSON с планом / статусом заявки
"""
import json
import os
import re
import urllib.request
import urllib.error
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin',
    'Access-Control-Max-Age': '86400',
}

MIN_PRICE = 10000
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_RE = re.compile(r'^[+\d][\d\s()\-]{5,}$')
MAX_API_BASE = "https://botapi.max.ru"


def ok(payload, status=200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(payload, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return ok({'error': msg}, status)


def get_db():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    return psycopg2.connect(dsn)


def _max_post(token, param, ident, text):
    url = f"{MAX_API_BASE}/messages?{param}={ident}"
    data = json.dumps({'text': text}).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST',
                                 headers={'Content-Type': 'application/json', 'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return True
    except Exception:
        return False


def notify_max(text):
    token = os.environ.get('MAX_BOT_TOKEN', '')
    ident = os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return
    if not _max_post(token, 'chat_id', ident, text):
        _max_post(token, 'user_id', ident, text)


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.7, max_tokens=3500, deadline=24):
    """Один вызов ИИ с жёстким deadline (Cloud Function убивается на 30с)."""
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    try:
        payload = json.dumps({
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'response_format': {'type': 'json_object'},
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions',
            data=payload,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=deadline) as r:
            data = json.loads(r.read().decode('utf-8'))
            raw = data['choices'][0]['message']['content'].strip()
            raw = re.sub(r'^```json\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            return json.loads(raw), None
    except urllib.error.HTTPError as e:
        return None, f'polza HTTP {e.code}'
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


SYSTEM_PROMPT = (
    "Ты — эксперт по профориентации и методист онлайн-обучения на платформе УЧИСЬПРО. "
    "На основе ответов взрослого человека собери ПЕРСОНАЛЬНЫЙ план курса — только под него, "
    "исходя из его цели, текущего уровня, желаемых навыков, времени и формата. "
    "Пиши по-русски, конкретно и мотивирующе, без воды. Соблюдай законы РФ, никакого запрещённого "
    "контента. Не давай индивидуальных финансовых/медицинских/юридических рекомендаций. "
    "Верни СТРОГО JSON такого вида: {"
    "\"course_title\": строка (яркое название индивидуального курса), "
    "\"summary\": строка (2-3 предложения, чем курс полезен именно этому человеку), "
    "\"target_role\": строка (кем человек станет / какой результат), "
    "\"duration_weeks\": число (реалистичный срок в неделях), "
    "\"hours_per_week\": число (часов в неделю), "
    "\"level\": строка (с нуля / средний / продвинутый), "
    "\"skills\": [строки — 5-8 ключевых навыков, которые освоит], "
    "\"modules\": [{\"title\": строка, \"goal\": строка (что даст модуль), "
    "\"lessons\": [строки — 3-5 конкретных тем уроков]} — ровно 5-7 модулей], "
    "\"final_project\": строка (итоговый практический проект/портфолио), "
    "\"why_personal\": [строки — 3 пункта, почему этот план подходит именно ему]"
    "}"
)


def build_user_message(answers, goal):
    parts = [f"Цель человека: {goal}" if goal else "Цель: не указана явно."]
    labels = {
        'level': 'Текущий уровень',
        'time': 'Сколько времени готов уделять',
        'format': 'Предпочтительный формат',
        'skills': 'Навыки, которые хочет освоить',
        'motivation': 'Зачем это нужно (мотивация)',
        'field': 'Сфера/направление',
        'experience': 'Прошлый опыт',
        'obstacles': 'Что мешало раньше',
    }
    for key, label in labels.items():
        val = answers.get(key)
        if isinstance(val, list):
            val = ', '.join(str(v) for v in val if v)
        if val:
            parts.append(f"{label}: {str(val)[:400]}")
    parts.append("Собери индивидуальный план курса строго в формате JSON.")
    return '\n'.join(parts)


FALLBACK_PLAN = {
    'course_title': 'Ваш индивидуальный маршрут развития',
    'summary': 'Персональная программа под вашу цель. Мы уточним детали и соберём курс именно под вас.',
    'target_role': 'Уверенный специалист в выбранном направлении',
    'duration_weeks': 8,
    'hours_per_week': 5,
    'level': 'с нуля',
    'skills': ['Базовые основы направления', 'Практические инструменты', 'Работа над проектом',
               'Самоорганизация обучения', 'Портфолио'],
    'modules': [
        {'title': 'Диагностика и цель', 'goal': 'Определить точку А и точку Б',
         'lessons': ['Оценка текущих навыков', 'Постановка измеримой цели', 'План на 8 недель']},
        {'title': 'Фундамент', 'goal': 'Освоить базу направления',
         'lessons': ['Ключевые понятия', 'Основные инструменты', 'Первая практика']},
        {'title': 'Практика', 'goal': 'Отработать навыки на задачах',
         'lessons': ['Разбор кейсов', 'Самостоятельные задания', 'Обратная связь']},
        {'title': 'Проект', 'goal': 'Собрать результат в портфолио',
         'lessons': ['Выбор проекта', 'Реализация', 'Презентация результата']},
        {'title': 'Следующие шаги', 'goal': 'Наметить развитие и карьеру',
         'lessons': ['Точки роста', 'Резюме и позиционирование', 'План на будущее']},
    ],
    'final_project': 'Личный проект, который можно показать работодателю или клиенту.',
    'why_personal': ['Программа под вашу цель', 'Реалистичный темп под ваше время',
                     'Фокус только на нужных навыках'],
    'is_fallback': True,
}


def clean_plan(plan):
    """Минимальная валидация структуры плана от ИИ."""
    if not isinstance(plan, dict):
        return FALLBACK_PLAN
    try:
        plan['course_title'] = str(plan.get('course_title') or FALLBACK_PLAN['course_title'])[:200]
        plan['summary'] = str(plan.get('summary') or '')[:800]
        plan['target_role'] = str(plan.get('target_role') or '')[:200]
        plan['duration_weeks'] = int(plan.get('duration_weeks') or 8)
        plan['hours_per_week'] = int(plan.get('hours_per_week') or 5)
        plan['level'] = str(plan.get('level') or 'с нуля')[:60]
        if not isinstance(plan.get('skills'), list) or not plan['skills']:
            return FALLBACK_PLAN
        if not isinstance(plan.get('modules'), list) or len(plan['modules']) < 3:
            return FALLBACK_PLAN
        plan['skills'] = [str(s)[:120] for s in plan['skills']][:8]
        plan['why_personal'] = [str(s)[:200] for s in (plan.get('why_personal') or [])][:4]
        plan['final_project'] = str(plan.get('final_project') or '')[:400]
        norm_modules = []
        for m in plan['modules'][:7]:
            if not isinstance(m, dict):
                continue
            norm_modules.append({
                'title': str(m.get('title') or 'Модуль')[:160],
                'goal': str(m.get('goal') or '')[:300],
                'lessons': [str(l)[:200] for l in (m.get('lessons') or [])][:6],
            })
        plan['modules'] = norm_modules
        plan['is_fallback'] = False
        return plan
    except Exception:
        return FALLBACK_PLAN


def suggest_price(plan):
    """Простая оценка цены (от 10 000 ₽) по объёму программы."""
    modules = len(plan.get('modules') or [])
    weeks = plan.get('duration_weeks') or 8
    price = MIN_PRICE + max(0, modules - 5) * 1500 + max(0, weeks - 8) * 500
    return int(round(price / 500) * 500)


def handle_generate(body):
    answers = body.get('answers') if isinstance(body.get('answers'), dict) else {}
    goal = (body.get('goal') or answers.get('goal') or '').strip()[:500]
    if not goal and not answers:
        return err('Заполните чек-лист', 400)

    messages = [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': build_user_message(answers, goal)},
    ]
    plan, error = call_polza(messages)
    if plan is None:
        plan = dict(FALLBACK_PLAN)
    else:
        plan = clean_plan(plan)

    price = suggest_price(plan)
    return ok({'plan': plan, 'price': price, 'min_price': MIN_PRICE})


def handle_submit(body):
    name = (body.get('contact_name') or '').strip()[:160]
    email = (body.get('contact_email') or '').strip().lower()[:200]
    phone = (body.get('contact_phone') or '').strip()[:40]
    goal = (body.get('goal') or '').strip()[:500]
    message = (body.get('message') or '').strip()[:3000]
    answers = body.get('answers') if isinstance(body.get('answers'), dict) else None
    plan = body.get('plan') if isinstance(body.get('plan'), dict) else None
    utm = body.get('utm') if isinstance(body.get('utm'), dict) else None

    if not name or len(name) < 2:
        return err('Укажите имя', 400)
    if email and not EMAIL_RE.match(email):
        return err('Email указан некорректно', 400)
    if phone and not PHONE_RE.match(phone):
        return err('Телефон указан некорректно', 400)
    if not email and not phone:
        return err('Оставьте email или телефон для связи', 400)

    plan_title = (plan.get('course_title') if plan else '') or ''
    price = None
    if isinstance(body.get('price'), (int, float)):
        price = int(body['price'])

    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO career_pro_leads "
                "(contact_name, contact_email, contact_phone, goal, answers, plan, "
                "plan_title, price, message, utm) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (name, email or None, phone or None, goal or None,
                 json.dumps(answers, ensure_ascii=False) if answers else None,
                 json.dumps(plan, ensure_ascii=False) if plan else None,
                 plan_title[:300] or None, price, message or None,
                 json.dumps(utm, ensure_ascii=False) if utm else None))
            lid = cur.fetchone()[0]
            conn.commit()
    finally:
        conn.close()

    lines = [f"🎯 Заявка «Профориентация PRO» #{lid}", ""]
    lines.append(f"👤 Имя: {name}")
    contacts = [c for c in (email, phone) if c]
    if contacts:
        lines.append("📞 " + " · ".join(contacts))
    if goal:
        lines.append(f"🎓 Цель: {goal}")
    if plan_title:
        lines.append(f"📘 Курс: {plan_title}")
    if price:
        lines.append(f"💰 Цена: {price:,} ₽".replace(',', ' '))
    if message:
        lines.append(f"💬 {message}")
    notify_max('\n'.join(lines))

    return ok({'ok': True, 'id': lid})


def handle_leads_list(headers):
    pin_env = os.environ.get('ADMIN_PIN', '')
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    if not pin_env or pin != pin_env:
        return err('Доступ запрещён', 403)
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, contact_name, contact_email, contact_phone, goal, plan_title, "
                "price, message, status, note, created_at "
                "FROM career_pro_leads ORDER BY created_at DESC LIMIT 500")
            rows = cur.fetchall()
            items = [{
                'id': r[0], 'contact_name': r[1], 'contact_email': r[2], 'contact_phone': r[3],
                'goal': r[4], 'plan_title': r[5], 'price': r[6], 'message': r[7],
                'status': r[8], 'note': r[9],
                'created_at': r[10].isoformat() if r[10] else None,
            } for r in rows]
            return ok({'items': items, 'total': len(items)})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        body = {}
    action = (params.get('action') or body.get('action') or '').strip()

    if action == 'generate_plan' and method == 'POST':
        return handle_generate(body)
    if action == 'submit' and method == 'POST':
        return handle_submit(body)
    if action == 'leads_list' and method == 'GET':
        return handle_leads_list(headers)

    return err('Неизвестное действие', 404)
