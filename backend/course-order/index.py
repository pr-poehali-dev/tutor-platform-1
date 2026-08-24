"""
Business: «Заказ курса» — человек описывает, чему хочет научиться, когда готового
курса нет. ИИ подбирает ближайший курс из каталога и дополняет тем, чего в нём не хватает,
затем человек оставляет заявку на индивидуальный курс (от 10 000 ₽).

Действия (query ?action= или body.action):
- match (POST): по описанию запроса подбирает близкий курс из каталога + план дополнения (ИИ)
- submit (POST): сохраняет заявку в БД, уведомляет владельца в MAX
- orders_list (GET, X-Admin-Pin): список заявок для менеджера

Args: event (httpMethod, body, queryStringParameters, headers), context
Returns: JSON
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
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Auth-Token',
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
        with urllib.request.urlopen(req, timeout=10):
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


def call_polza(messages, temperature=0.6, max_tokens=2200, deadline=24):
    """Один вызов ИИ с жёстким deadline (Cloud Function ограничена по времени)."""
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    try:
        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
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
    "Ты — методист платформы УЧИСЬПРО. К тебе приходит человек, который не нашёл "
    "готовый курс под свой запрос. Твоя задача — из списка существующих курсов выбрать "
    "САМЫЙ БЛИЗКИЙ по смыслу и честно объяснить, что в нём уже есть, а чего не хватает "
    "именно под этот запрос. Затем предложить, чем дополнить курс, чтобы закрыть запрос целиком.\n"
    "Пиши по-русски, тепло, конкретно, без воды и без маркетинговых обещаний. Обращайся на «вы». "
    "Не обещай трудоустройство и конкретный доход. Соблюдай законы РФ.\n"
    "ВАЖНО: если ни один курс не близок — так и напиши в match_reason, а matched_course_id верни null. "
    "Не выдумывай курсы, которых нет в списке.\n"
    "Верни СТРОГО JSON: {"
    "\"matched_course_id\": число или null (id курса из списка), "
    "\"matched_course_title\": строка или null (точное название из списка), "
    "\"match_percent\": число 0-100 (насколько курс закрывает запрос), "
    "\"match_reason\": строка (1-2 предложения: почему этот курс ближе всего и что в нём уже есть), "
    "\"covered\": массив из 2-4 строк (что из запроса закрывает готовый курс), "
    "\"missing\": массив из 3-5 строк (чего в готовом курсе нет под этот запрос), "
    "\"course_title\": строка (название индивидуального курса под запрос), "
    "\"summary\": строка (2-3 предложения, что человек получит), "
    "\"modules\": массив из 4-6 объектов {\"title\": строка, \"goal\": строка, "
    "\"lessons\": массив из 3-5 строк}, "
    "\"extras\": массив из 3-5 строк (дополнительные материалы: шаблоны, разборы, чек-листы), "
    "\"duration_weeks\": число, \"hours_per_week\": число, "
    "\"final_project\": строка (итоговая работа)}"
)


def build_catalog_text(catalog):
    """Компактный список курсов для промпта: экономим токены и время."""
    lines = []
    for c in catalog[:120]:
        cid = c.get('id')
        title = str(c.get('title') or '')[:120]
        subject = str(c.get('subject') or '')[:40]
        if cid and title:
            lines.append(f"{cid}. {title} [{subject}]")
    return '\n'.join(lines)


def fallback_plan(topic, goal, catalog_hint):
    """План на случай, когда ИИ недоступен: без выдуманного подбора."""
    t = topic or 'вашей теме'
    return {
        'matched_course_id': None,
        'matched_course_title': catalog_hint,
        'match_percent': 0,
        'match_reason': 'Подбор близкого курса выполнит методист вручную — '
                        'мы разберём ваш запрос и предложим ближайшую программу.',
        'covered': [],
        'missing': [],
        'course_title': f'Индивидуальный курс: {t}',
        'summary': 'Мы собрали заявку. Методист изучит запрос, подберёт ближайший курс '
                   'из каталога и дополнит его под вашу задачу.',
        'modules': [
            {'title': 'Разбор запроса', 'goal': 'Понять цель и текущий уровень',
             'lessons': ['Установочная встреча', 'Точка А и точка Б', 'План работы']},
            {'title': 'База по теме', 'goal': f'Освоить основы по теме «{t}»',
             'lessons': ['Ключевые понятия', 'Разбор на примерах', 'Практика']},
            {'title': 'Практика под задачу', 'goal': 'Применить знания к своей ситуации',
             'lessons': ['Ваш случай', 'Работа с ошибками', 'Обратная связь']},
            {'title': 'Итог', 'goal': 'Закрепить результат',
             'lessons': ['Итоговая работа', 'Разбор', 'Что дальше']},
        ],
        'extras': ['Материалы и шаблоны по теме', 'Разбор вашей ситуации', 'Обратная связь наставника'],
        'duration_weeks': 6,
        'hours_per_week': 4,
        'final_project': 'Итоговая работа по вашей задаче с разбором наставника',
        'is_fallback': True,
    }


def handle_match(body):
    topic = (body.get('topic') or '').strip()[:300]
    goal = (body.get('goal') or '').strip()[:1500]
    level = (body.get('level') or '').strip()[:40]
    time_per_week = (body.get('time_per_week') or '').strip()[:40]
    format_pref = (body.get('format_pref') or '').strip()[:40]
    details = (body.get('details') or '').strip()[:2000]
    catalog = body.get('catalog') if isinstance(body.get('catalog'), list) else []

    if len(topic) < 3:
        return err('Опишите, чему хотите научиться', 400)

    catalog_text = build_catalog_text(catalog)
    hint = catalog[0].get('title') if catalog else None

    user_parts = [f"Чему хочет научиться: {topic}"]
    if goal:
        user_parts.append(f"Зачем это нужно / какой результат: {goal}")
    if level:
        user_parts.append(f"Текущий уровень: {level}")
    if time_per_week:
        user_parts.append(f"Готов уделять: {time_per_week}")
    if format_pref:
        user_parts.append(f"Предпочтительный формат: {format_pref}")
    if details:
        user_parts.append(f"Дополнительно: {details}")
    user_parts.append("\nСписок существующих курсов платформы (id. название [предмет]):")
    user_parts.append(catalog_text or 'каталог не передан')

    plan, error = call_polza([
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': '\n'.join(user_parts)},
    ])

    if plan is None:
        return ok({'plan': fallback_plan(topic, goal, hint), 'ai_error': error})

    plan.setdefault('course_title', f'Индивидуальный курс: {topic}')
    plan.setdefault('modules', [])
    plan.setdefault('extras', [])
    plan.setdefault('covered', [])
    plan.setdefault('missing', [])
    return ok({'plan': plan})


def handle_submit(body):
    name = (body.get('contact_name') or '').strip()[:160]
    email = (body.get('contact_email') or '').strip().lower()[:200]
    phone = (body.get('contact_phone') or '').strip()[:40]
    topic = (body.get('topic') or '').strip()[:300]
    goal = (body.get('goal') or '').strip()[:2000]
    level = (body.get('level') or '').strip()[:40]
    format_pref = (body.get('format_pref') or '').strip()[:40]
    time_per_week = (body.get('time_per_week') or '').strip()[:40]
    deadline_pref = (body.get('deadline_pref') or '').strip()[:60]
    details = (body.get('details') or '').strip()[:3000]
    matched = body.get('matched') if isinstance(body.get('matched'), dict) else None
    utm = body.get('utm') if isinstance(body.get('utm'), dict) else None

    if not name or len(name) < 2:
        return err('Укажите имя', 400)
    if email and not EMAIL_RE.match(email):
        return err('Email указан некорректно', 400)
    if phone and not PHONE_RE.match(phone):
        return err('Телефон указан некорректно', 400)
    if not email and not phone:
        return err('Оставьте email или телефон для связи', 400)
    if len(topic) < 3:
        return err('Опишите, чему хотите научиться', 400)

    price = MIN_PRICE
    if isinstance(body.get('price'), (int, float)):
        price = max(MIN_PRICE, int(body['price']))

    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO custom_course_orders "
                "(contact_name, contact_email, contact_phone, topic, goal, level, "
                "format_pref, time_per_week, deadline_pref, details, matched, price, utm) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (name, email or None, phone or None, topic, goal or None, level or None,
                 format_pref or None, time_per_week or None, deadline_pref or None,
                 details or None,
                 json.dumps(matched, ensure_ascii=False) if matched else None,
                 price,
                 json.dumps(utm, ensure_ascii=False) if utm else None))
            oid = cur.fetchone()[0]
            conn.commit()
    finally:
        conn.close()

    lines = [f"🎓 Заказ индивидуального курса #{oid}", ""]
    lines.append(f"👤 Имя: {name}")
    contacts = [c for c in (email, phone) if c]
    if contacts:
        lines.append("📞 " + " · ".join(contacts))
    lines.append(f"📚 Тема: {topic}")
    if goal:
        lines.append(f"🎯 Цель: {goal[:300]}")
    if level:
        lines.append(f"📊 Уровень: {level}")
    if time_per_week:
        lines.append(f"⏱ Время: {time_per_week}")
    if deadline_pref:
        lines.append(f"📅 Сроки: {deadline_pref}")
    if matched and matched.get('matched_course_title'):
        lines.append(f"🔎 Близкий курс: {matched['matched_course_title']} "
                     f"({matched.get('match_percent', '?')}%)")
    if details:
        lines.append(f"💬 {details[:400]}")
    lines.append(f"💵 От {price:,} ₽".replace(',', ' '))
    notify_max('\n'.join(lines))

    return ok({'ok': True, 'id': oid})


def handle_orders_list(headers):
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    real = os.environ.get('ADMIN_PIN', '')
    if not real or pin != real:
        return err('Доступ запрещён', 403)
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, contact_name, contact_email, contact_phone, topic, goal, "
                "level, time_per_week, deadline_pref, details, price, status, created_at "
                "FROM custom_course_orders ORDER BY created_at DESC LIMIT 200")
            rows = cur.fetchall()
            cols = ['id', 'contact_name', 'contact_email', 'contact_phone', 'topic', 'goal',
                    'level', 'time_per_week', 'deadline_pref', 'details', 'price',
                    'status', 'created_at']
            items = [dict(zip(cols, r)) for r in rows]
    finally:
        conn.close()
    return ok({'items': items})


def handler(event: dict, context) -> dict:
    """Приём и обработка заказов на индивидуальный курс."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    action = (params.get('action') or body.get('action') or '').strip()

    if action == 'match' and method == 'POST':
        return handle_match(body)
    if action == 'submit' and method == 'POST':
        return handle_submit(body)
    if action == 'orders_list' and method == 'GET':
        return handle_orders_list(headers)

    return err('Неизвестное действие', 404)
