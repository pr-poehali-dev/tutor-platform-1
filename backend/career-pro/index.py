"""
Business: «Профориентация PRO» — индивидуальный ИИ-курс под конкретного человека.
Человек проходит чек-лист (цель + желаемые навыки) → ИИ генерирует персональный
план курса → показываем бесплатно → человек оставляет заявку на оплату (от 10 000 ₽).

Действия (query ?action= или body.action):
- generate_plan (POST): по ответам чек-листа генерирует индивидуальный план курса + 5-летний план успеха (ИИ)
- submit (POST): сохраняет заявку + план в БД, уведомляет владельца в MAX
- leads_list (GET, X-Admin-Pin): список заявок для менеджера
- save_plan (POST, X-Auth-Token): сохранить 5-летний план в личном кабинете
- get_plan (GET, X-Auth-Token): загрузить сохранённый план + прогресс + доступ к коучу
- toggle_checkpoint (POST, X-Auth-Token): отметить/снять контрольную точку
- coach_access (GET, X-Auth-Token): проверить, оплачен ли доступ к наставнику-дневнику
- journal_list (GET, X-Auth-Token): история дневника-коуча
- journal_post (POST, X-Auth-Token): записать в дневник и получить ответ наставника (гейт по оплате)

Args: event (httpMethod, body, queryStringParameters, headers), context
Returns: JSON
"""
import json
import os
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone, date, timedelta
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

MIN_PRICE = 10000
COACH_COURSE_ID = 9200  # виртуальный продукт «Наставник PRO» (доступ к дневнику-коучу)
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_RE = re.compile(r'^[+\d][\d\s()\-]{5,}$')
MAX_API_BASE = "https://botapi.max.ru"


def resolve_user(cur, token):
    """Валидирует токен и возвращает user_id активной сессии, иначе None."""
    if not token:
        return None
    cur.execute(
        "SELECT s.user_id, s.expires_at, s.revoked_at "
        "FROM auth_sessions s WHERE s.token = %s LIMIT 1",
        (token,))
    row = cur.fetchone()
    if not row:
        return None
    user_id, expires_at, revoked_at = row
    if revoked_at is not None:
        return None
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    return user_id


def has_coach_access(cur, user_id):
    """True, если пользователь оплатил доступ к наставнику-дневнику."""
    cur.execute(
        "SELECT 1 FROM course_purchases "
        "WHERE user_id = %s AND course_id = %s AND status = 'paid' LIMIT 1",
        (user_id, COACH_COURSE_ID))
    return cur.fetchone() is not None


def get_token(headers):
    return (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()


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


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.7, max_tokens=4500, deadline=26):
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
    "Ты — личный наставник по профориентации и карьере на платформе УЧИСЬПРО. "
    "Твоя аудитория — люди от 17 до 45 лет: от выпускников школ и студентов, которые "
    "выбирают профессию, до взрослых, которые не могут определиться, выгорели или хотят "
    "сменить профессию. Подбирай путь под возраст и ситуацию. Твоя задача — не просто "
    "собрать курс, а по-человечески поддержать, дать ясность и конкретный план действий, "
    "а также мотивирующий «волшебный пинок», чтобы человек начал прямо сегодня.\n"
    "ЕСЛИ человек не определился (clarity=lost или doubting) — по его интересам, сильным "
    "сторонам и ценностям САМ подбери 1 наиболее подходящее направление/профессию и объясни выбор. "
    "ЕСЛИ цель уже ясна (clarity=decided) — работай в рамках его цели.\n"
    "Пиши по-русски, тепло, конкретно и без воды. Обращайся на «вы». Соблюдай законы РФ, "
    "никакого запрещённого контента. Не давай индивидуальных финансовых/медицинских/юридических "
    "рекомендаций и не гарантируй конкретный доход.\n"
    "Верни СТРОГО JSON такого вида: {"
    "\"recommended_direction\": строка (рекомендованное направление/профессия; если цель ясна — повтори её), "
    "\"direction_reason\": строка (1-2 предложения, почему это подходит именно ему — с опорой на его сильные стороны и интересы), "
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
    "\"why_personal\": [строки — 3 пункта, почему этот план подходит именно ему], "
    "\"action_plan\": [{\"when\": строка (например «Сегодня», «На этой неделе», «1-й месяц», «2-3 месяц»), "
    "\"action\": строка (конкретный шаг), \"result\": строка (что человек получит)} — 4-6 шагов от «прямо сейчас» до результата], "
    "\"pep_talk\": строка (тёплый мотивирующий «волшебный пинок» на 3-4 предложения — обратись лично, "
    "признай его сомнения/возраст как силу, а не помеху, и подтолкни сделать первый шаг сегодня), "
    "\"five_year_plan\": {\"vision\": строка (образ жизни и результата человека через 5 лет — вдохновляюще и реалистично), "
    "\"years\": [{\"year\": число (1..5), \"title\": строка (название этапа года, например «Фундамент», «Первые деньги», «Экспертность»), "
    "\"focus\": строка (главный фокус года), "
    "\"milestones\": [строки — 3-4 конкретные контрольные точки года с измеримым результатом], "
    "\"metric\": строка (главная измеримая метрика года — например «доход 60-80 тыс/мес», «5 проектов в портфолио», «первые 3 клиента»)} "
    "— РОВНО 5 объектов, по одному на каждый год], "
    "\"review_system\": [строки — 3-4 правила системы самооценки прогресса: как и с какой периодичностью человек "
    "проверяет, идёт ли он по плану (например «каждую неделю: 1 фраза в дневник — что сделал», «раз в месяц: сверка с метрикой года»)]}"
    "}"
)


def build_user_message(answers, goal):
    parts = [f"Цель человека: {goal}" if goal else "Цель: человек пока НЕ определился с целью."]
    labels = {
        'clarity': 'Определённость с целью',
        'age': 'Возраст',
        'situation': 'Жизненная ситуация',
        'field': 'Сфера/направление',
        'interests': 'Что искренне интересно',
        'strengths': 'Сильные стороны',
        'values': 'Что важнее всего в работе',
        'level': 'Текущий уровень',
        'skills': 'Навыки, которые хочет прокачать',
        'time': 'Сколько времени готов уделять',
        'deadline': 'Желаемый срок результата',
        'motivation': 'Что мотивирует',
        'obstacles': 'Что мешало раньше',
    }
    for key, label in labels.items():
        val = answers.get(key)
        if isinstance(val, list):
            val = ', '.join(str(v) for v in val if v)
        if val:
            parts.append(f"{label}: {str(val)[:400]}")
    parts.append(
        "Как наставник: подбери направление (если не определился), собери индивидуальный курс, "
        "пошаговый план действий и мотивирующий «пинок». Верни строго в формате JSON."
    )
    return '\n'.join(parts)


FALLBACK_PLAN = {
    'recommended_direction': 'Направление под ваши сильные стороны',
    'direction_reason': 'Мы подберём направление под ваши интересы и сильные стороны на личной консультации.',
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
    'action_plan': [
        {'when': 'Сегодня', 'action': 'Оставьте заявку и зафиксируйте своё решение начать',
         'result': 'Первый шаг сделан — вы уже в движении'},
        {'when': 'На этой неделе', 'action': 'Согласуем план и определим первое направление',
         'result': 'Ясность, с чего начать'},
        {'when': '1-й месяц', 'action': 'Осваиваете базу и делаете первую практику',
         'result': 'Первые навыки и уверенность'},
        {'when': '2-3 месяц', 'action': 'Собираете проект в портфолио',
         'result': 'Готовый результат, который можно показать'},
    ],
    'pep_talk': 'Вы не опоздали и точно не «слишком взрослый» — ваш жизненный опыт это преимущество, '
                'а не помеха. Самое сложное — сделать первый шаг, и вы его уже делаете. Начните сегодня, '
                'а остальное мы пройдём вместе, шаг за шагом.',
    'five_year_plan': {
        'vision': 'Через 5 лет вы — уверенный специалист в выбранном деле: с портфолио, стабильным '
                  'доходом и свободой выбирать проекты. Работа приносит и деньги, и удовольствие.',
        'years': [
            {'year': 1, 'title': 'Фундамент', 'focus': 'Освоить базу и сделать первые работы',
             'milestones': ['Пройти базовый курс', 'Собрать 2-3 учебных проекта', 'Найти первого клиента или стажировку'],
             'metric': 'Первые 3 работы в портфолио'},
            {'year': 2, 'title': 'Первые деньги', 'focus': 'Выйти на регулярный доход',
             'milestones': ['Стабильные заказы/работа', 'Углубить ключевой навык', 'Собрать отзывы'],
             'metric': 'Регулярный доход от профессии'},
            {'year': 3, 'title': 'Рост', 'focus': 'Повысить уровень и ставку',
             'milestones': ['Сложные проекты', 'Специализация в нише', 'Наставник/команда'],
             'metric': 'Доход выше среднего по нише'},
            {'year': 4, 'title': 'Экспертность', 'focus': 'Стать заметным специалистом',
             'milestones': ['Личный бренд', 'Крупные клиенты', 'Публичные результаты'],
             'metric': 'Очередь из клиентов или сильная позиция'},
            {'year': 5, 'title': 'Свобода', 'focus': 'Выбирать проекты и масштабировать',
             'milestones': ['Своё дело или топ-позиция', 'Пассивные/масштабируемые доходы', 'Наставничество'],
             'metric': 'Финансовая устойчивость и свобода выбора'},
        ],
        'review_system': [
            'Каждую неделю: 1 запись в дневник — что сделал и что мешало.',
            'Раз в месяц: сверка с метрикой текущего года — иду ли по плану.',
            'Раз в квартал: честный разбор с наставником — что скорректировать.',
        ],
    },
    'is_fallback': True,
}


def _norm_five_year(raw):
    if not isinstance(raw, dict):
        return FALLBACK_PLAN['five_year_plan']
    years = []
    for y in (raw.get('years') or [])[:5]:
        if not isinstance(y, dict):
            continue
        try:
            yr = int(y.get('year') or (len(years) + 1))
        except (TypeError, ValueError):
            yr = len(years) + 1
        years.append({
            'year': yr,
            'title': str(y.get('title') or f'Год {yr}')[:120],
            'focus': str(y.get('focus') or '')[:300],
            'milestones': [str(m)[:220] for m in (y.get('milestones') or [])][:5],
            'metric': str(y.get('metric') or '')[:200],
        })
    if len(years) < 3:
        return FALLBACK_PLAN['five_year_plan']
    return {
        'vision': str(raw.get('vision') or FALLBACK_PLAN['five_year_plan']['vision'])[:600],
        'years': years,
        'review_system': [str(r)[:250] for r in (raw.get('review_system') or [])][:5]
                         or FALLBACK_PLAN['five_year_plan']['review_system'],
    }


def _norm_action_plan(raw):
    steps = []
    for s in (raw or [])[:6]:
        if not isinstance(s, dict):
            continue
        steps.append({
            'when': str(s.get('when') or '')[:60],
            'action': str(s.get('action') or '')[:300],
            'result': str(s.get('result') or '')[:300],
        })
    return [s for s in steps if s['action']]


def clean_plan(plan):
    """Минимальная валидация структуры плана от ИИ."""
    if not isinstance(plan, dict):
        return FALLBACK_PLAN
    try:
        plan['recommended_direction'] = str(
            plan.get('recommended_direction') or FALLBACK_PLAN['recommended_direction'])[:200]
        plan['direction_reason'] = str(plan.get('direction_reason') or '')[:500]
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
        action_plan = _norm_action_plan(plan.get('action_plan'))
        plan['action_plan'] = action_plan or FALLBACK_PLAN['action_plan']
        plan['pep_talk'] = str(plan.get('pep_talk') or FALLBACK_PLAN['pep_talk'])[:700]
        plan['five_year_plan'] = _norm_five_year(plan.get('five_year_plan'))
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
        print(f"[career-pro] generate fallback: {error}")
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


# ═══════════════════════════════════════════════════════════════════════════
# ЛИЧНЫЙ КАБИНЕТ: 5-летний план (бесплатно) и дневник-коуч (после оплаты)
# ═══════════════════════════════════════════════════════════════════════════

def handle_save_plan(headers, body):
    """Сохраняет 5-летний план в личном кабинете авторизованного пользователя."""
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            plan = body.get('plan') if isinstance(body.get('plan'), dict) else None
            if not plan:
                return err('Нет плана для сохранения', 400)
            goal = (body.get('goal') or '')[:500]
            direction = (plan.get('recommended_direction') or '')[:300]
            # Один активный план на пользователя: обновляем или создаём.
            cur.execute("SELECT id FROM career_pro_plans WHERE user_id = %s ORDER BY id DESC LIMIT 1",
                        (user_id,))
            row = cur.fetchone()
            if row:
                cur.execute(
                    "UPDATE career_pro_plans SET goal=%s, direction=%s, plan=%s, updated_at=now() WHERE id=%s",
                    (goal or None, direction or None, json.dumps(plan, ensure_ascii=False), row[0]))
                plan_id = row[0]
            else:
                cur.execute(
                    "INSERT INTO career_pro_plans (user_id, goal, direction, plan) "
                    "VALUES (%s,%s,%s,%s) RETURNING id",
                    (user_id, goal or None, direction or None, json.dumps(plan, ensure_ascii=False)))
                plan_id = cur.fetchone()[0]
            conn.commit()
            return ok({'ok': True, 'plan_id': plan_id})
    finally:
        conn.close()


def handle_get_plan(headers):
    """Загружает сохранённый план + прогресс + признак доступа к коучу."""
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            cur.execute(
                "SELECT id, goal, direction, plan, progress FROM career_pro_plans "
                "WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user_id,))
            row = cur.fetchone()
            coach = has_coach_access(cur, user_id)
            if not row:
                return ok({'has_plan': False, 'coach_access': coach})
            return ok({
                'has_plan': True,
                'plan_id': row[0],
                'goal': row[1],
                'direction': row[2],
                'plan': row[3],
                'progress': row[4] or {},
                'coach_access': coach,
            })
    finally:
        conn.close()


def handle_toggle_checkpoint(headers, body):
    """Отмечает/снимает контрольную точку 5-летнего плана."""
    key = (body.get('key') or '').strip()[:80]
    done = bool(body.get('done'))
    if not key:
        return err('Не указана контрольная точка', 400)
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            cur.execute("SELECT id, progress FROM career_pro_plans WHERE user_id = %s ORDER BY id DESC LIMIT 1",
                        (user_id,))
            row = cur.fetchone()
            if not row:
                return err('Сначала сохраните план', 404)
            progress = row[1] or {}
            if done:
                progress[key] = {'done': True, 'updated_at': datetime.now(timezone.utc).isoformat()}
            else:
                progress.pop(key, None)
            cur.execute("UPDATE career_pro_plans SET progress=%s, updated_at=now() WHERE id=%s",
                        (json.dumps(progress, ensure_ascii=False), row[0]))
            conn.commit()
            done_count = sum(1 for v in progress.values() if isinstance(v, dict) and v.get('done'))
            return ok({'ok': True, 'progress': progress, 'done_count': done_count})
    finally:
        conn.close()


def handle_coach_access(headers):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            return ok({'coach_access': has_coach_access(cur, user_id), 'price': MIN_PRICE,
                       'course_id': COACH_COURSE_ID})
    finally:
        conn.close()


COACH_PROMPT = (
    "Ты — личный наставник-коуч и практический психолог УЧИСЬПРО по имени Марк. "
    "Ты ведёшь человека по его 5-летнему плану успеха и помогаешь НЕ бросить. "
    "Твой стиль — ЖЁСТКИЙ, НО СПРАВЕДЛИВЫЙ: ты честен, не заискиваешь, не сюсюкаешь, "
    "но всегда на стороне человека. Ты как живой дневник-собеседник: слушаешь, что человек "
    "написал (забросил, нет сил, не получается, лень, страх), и помогаешь РАЗОБРАТЬСЯ В ПРИЧИНЕ, "
    "а не просто утешаешь.\n"
    "ПРИНЦИПЫ:\n"
    "1. Сначала признай чувство человека одной фразой (без ваты), потом — по делу.\n"
    "2. Найди ИСТИННУЮ причину, почему не получается (перегруз, размытая цель, страх провала, "
    "перфекционизм, нет системы, окружение). Задай 1 точный вопрос или назови причину прямо.\n"
    "3. Дай ОДИН конкретный маленький шаг на ближайшие 24-48 часов — выполнимый даже в плохой день.\n"
    "4. Будь честным: если человек оправдывается — мягко, но прямо назови это. Уважение через правду.\n"
    "5. Возвращай к цели и к его же 5-летнему плану. Напоминай, ради чего он начал.\n"
    "6. Никакой вины и стыда. Жёсткость — это про требовательность и честность, а не про унижение.\n"
    "Соблюдай законы РФ. Ты НЕ врач: при признаках депрессии, суицидальных мыслей или серьёзного "
    "кризиса — по-человечески порекомендуй обратиться к живому психологу/специалисту, дай телефон "
    "доверия 8-800-2000-122, и не заменяй собой терапию.\n"
    "ФОРМАТ: живой человеческий текст на «ты» или «вы» (как обращается человек), 3-6 предложений, "
    "без списков и заголовков, будто пишешь другу в дневник. В конце — один ясный шаг или вопрос."
)


def call_coach(messages, deadline=24):
    """Диалоговый вызов ИИ-коуча (обычный текст, не JSON)."""
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    try:
        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
            'messages': messages,
            'temperature': 0.8,
            'max_tokens': 700,
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions',
            data=payload,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            method='POST')
        with urllib.request.urlopen(req, timeout=deadline) as r:
            data = json.loads(r.read().decode('utf-8'))
            return data['choices'][0]['message']['content'].strip(), None
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


def handle_journal_list(headers):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            coach = has_coach_access(cur, user_id)
            cur.execute(
                "SELECT id, role, content, created_at FROM career_pro_journal "
                "WHERE user_id = %s ORDER BY created_at ASC, id ASC LIMIT 200", (user_id,))
            items = [{'id': r[0], 'role': r[1], 'content': r[2],
                      'created_at': r[3].isoformat() if r[3] else None} for r in cur.fetchall()]
            return ok({'coach_access': coach, 'items': items})
    finally:
        conn.close()


def handle_journal_post(headers, body):
    """Записывает сообщение в дневник и возвращает ответ наставника-коуча.
    Доступно только пользователям, оплатившим доступ к наставнику."""
    text = (body.get('content') or '').strip()[:4000]
    if not text:
        return err('Напишите что-нибудь наставнику', 400)
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            if not has_coach_access(cur, user_id):
                return err('Доступ к наставнику откроется после оплаты', 402)

            # Контекст: сохранённый план + последние сообщения дневника.
            cur.execute("SELECT goal, direction, plan FROM career_pro_plans "
                        "WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user_id,))
            prow = cur.fetchone()
            plan_context = ''
            if prow:
                goal, direction, plan = prow
                fy = (plan or {}).get('five_year_plan', {}) if isinstance(plan, dict) else {}
                vision = fy.get('vision', '') if isinstance(fy, dict) else ''
                plan_context = (f"Цель человека: {goal or '—'}. Направление: {direction or '—'}. "
                                f"Его образ через 5 лет: {vision or '—'}.")

            cur.execute("SELECT role, content FROM career_pro_journal "
                        "WHERE user_id = %s ORDER BY created_at DESC, id DESC LIMIT 10", (user_id,))
            history = list(reversed(cur.fetchall()))

            messages = [{'role': 'system', 'content': COACH_PROMPT}]
            if plan_context:
                messages.append({'role': 'system', 'content': plan_context})
            for role, content in history:
                messages.append({'role': 'assistant' if role == 'coach' else 'user', 'content': content})
            messages.append({'role': 'user', 'content': text})

            # Сохраняем запись человека сразу.
            cur.execute("INSERT INTO career_pro_journal (user_id, role, content) VALUES (%s,'user',%s)",
                        (user_id, text))
            conn.commit()

            reply, error = call_coach(messages)
            if not reply:
                reply = ('Я рядом. Похоже, сейчас непросто — и это нормально. Давай не грузить себя '
                         'всем сразу: назови один маленький шаг, который ты можешь сделать в ближайшие '
                         'сутки, даже если день так себе. С него и начнём.')

            cur.execute("INSERT INTO career_pro_journal (user_id, role, content) VALUES (%s,'coach',%s) RETURNING id, created_at",
                        (user_id, reply))
            cid, cts = cur.fetchone()
            conn.commit()
            return ok({'reply': reply, 'id': cid, 'created_at': cts.isoformat() if cts else None})
    finally:
        conn.close()


# ─────────── ЕЖЕДНЕВНЫЙ ТРЕКЕР ПЛАНА НА 5 ЛЕТ ───────────
# День открывается строго в свою дату (вперёд не заглянуть).
# Месяц и год видны заранее. Вечерняя рефлексия скрыто анализируется и формирует следующий день.

DAY_PROMPT = (
    "Ты — наставник Марк, ведёшь человека по его 5-летнему плану. "
    "Твоя задача — составить план на ОДИН конкретный день так, чтобы он двигал к цели года и месяца.\n"
    "ПРАВИЛА:\n"
    "1. Ровно 3-4 задачи на день. Каждая — конкретное действие, выполнимое за указанное время.\n"
    "2. Суммарно задачи должны укладываться в доступное время человека в день.\n"
    "3. Задачи должны логично продолжать вчерашний день: если вчера не получилось — упрости и помоги вернуться, "
    "если вчера всё сделано — усложни на шаг.\n"
    "4. Никакой воды: не «изучить основы», а «пройти урок X и написать N строк кода / сделать конспект».\n"
    "5. focus — одна короткая фраза, главный смысл дня (до 90 символов).\n"
    "ФОРМАТ ОТВЕТА — строго JSON: "
    '{"focus": "строка", "tasks": [{"title": "строка", "minutes": число, "why": "зачем это, 1 фраза"}]}'
)

MONTH_PROMPT = (
    "Ты — наставник Марк. Составь план на ОДИН месяц внутри 5-летнего плана человека.\n"
    "ПРАВИЛА: 3-4 измеримые цели месяца, которые реально закрыть за 4 недели при указанной загрузке. "
    "Цели должны вести к метрике года. Конкретика вместо общих слов.\n"
    "ФОРМАТ — строго JSON: "
    '{"title": "название месяца-этапа", "focus": "главный фокус месяца", '
    '"goals": ["цель 1", "цель 2", "цель 3"], "metric": "измеримый результат месяца"}'
)

REFLECT_PROMPT = (
    "Ты — наставник Марк, ведёшь личный дневник человека по его 5-летнему плану. "
    "Человек написал, как прошёл день. Ответь коротко и по-человечески: "
    "признай факт одной фразой, назови главную причину (если не получилось) и дай ОДИН вывод на завтра. "
    "Без списков и заголовков, 2-4 предложения, тепло но честно. Пиши на «ты», если человек пишет на «ты». "
    "Ты не врач: при признаках серьёзного кризиса мягко порекомендуй живого специалиста и телефон 8-800-2000-122."
)


def _plan_row(cur, user_id):
    """Активный план пользователя: (plan_id, goal, direction, plan_json)."""
    cur.execute("SELECT id, goal, direction, plan FROM career_pro_plans "
                "WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user_id,))
    return cur.fetchone()


def _period_for(start_date, today):
    """Считает номер дня/месяца/года плана от даты старта."""
    day_index = (today - start_date).days + 1
    if day_index < 1:
        day_index = 1
    month_total = (day_index - 1) // 30 + 1
    year_index = min((month_total - 1) // 12 + 1, 5)
    month_index = (month_total - 1) % 12 + 1
    return day_index, year_index, month_index


def _plan_start(cur, user_id):
    """Дата старта трекера — первый созданный день, иначе сегодня."""
    cur.execute("SELECT MIN(day_date) FROM career_pro_days WHERE user_id = %s", (user_id,))
    row = cur.fetchone()
    if row and row[0]:
        return row[0]
    return date.today()


def _year_block(plan_json, year_index):
    """Данные нужного года из five_year_plan."""
    try:
        years = (plan_json or {}).get('five_year_plan', {}).get('years', [])
        for y in years:
            if int(y.get('year', 0)) == year_index:
                return y
        return years[year_index - 1] if len(years) >= year_index else {}
    except Exception:
        return {}


def _ensure_month(cur, user_id, plan_id, plan_json, goal, direction, year_index, month_index):
    """Возвращает план месяца, генерируя его при первом обращении."""
    period_key = f'y{year_index}_m{month_index}'
    cur.execute("SELECT title, focus, goals, metric FROM career_pro_months "
                "WHERE user_id = %s AND period_key = %s LIMIT 1", (user_id, period_key))
    row = cur.fetchone()
    if row:
        return {'title': row[0], 'focus': row[1], 'goals': row[2] or [], 'metric': row[3],
                'year': year_index, 'month': month_index}

    yb = _year_block(plan_json, year_index)
    msg = (f"Цель человека: {goal or direction or 'рост в профессии'}\n"
           f"Направление: {direction or '—'}\n"
           f"Год {year_index} из 5 — «{yb.get('title', '')}», фокус: {yb.get('focus', '')}\n"
           f"Метрика года: {yb.get('metric', '')}\n"
           f"Контрольные точки года: {'; '.join(yb.get('milestones', [])[:4])}\n"
           f"Сейчас месяц {month_index} этого года. Составь план именно на этот месяц.")
    data, _e = call_polza(
        [{'role': 'system', 'content': MONTH_PROMPT}, {'role': 'user', 'content': msg}],
        temperature=0.6, max_tokens=800, deadline=20)

    if not isinstance(data, dict):
        data = {'title': f'Месяц {month_index}', 'focus': yb.get('focus', 'Двигаемся к цели года'),
                'goals': yb.get('milestones', [])[:3] or ['Составить список шагов', 'Начать практику'],
                'metric': yb.get('metric', '')}

    title = str(data.get('title', ''))[:200]
    focus = str(data.get('focus', ''))[:400]
    goals = [str(g)[:300] for g in (data.get('goals') or [])][:4]
    metric = str(data.get('metric', ''))[:300]

    cur.execute(
        "INSERT INTO career_pro_months (user_id, plan_id, year_index, month_index, period_key, "
        "title, focus, goals, metric) VALUES (%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%s) "
        "ON CONFLICT (user_id, period_key) DO NOTHING",
        (user_id, plan_id, year_index, month_index, period_key, title, focus,
         json.dumps(goals, ensure_ascii=False), metric))
    return {'title': title, 'focus': focus, 'goals': goals, 'metric': metric,
            'year': year_index, 'month': month_index}


def _prev_day(cur, user_id, today):
    """Вчерашний день с рефлексией — контекст для генерации сегодняшнего."""
    cur.execute("SELECT day_date, focus, tasks, done_tasks, reflection, status "
                "FROM career_pro_days WHERE user_id = %s AND day_date < %s "
                "ORDER BY day_date DESC LIMIT 1", (user_id, today))
    return cur.fetchone()


def _ensure_day(cur, user_id, plan_id, plan_json, goal, direction, today, month_plan,
                day_index, year_index, month_index, hours_per_week):
    """Возвращает сегодняшний день, генерируя его с учётом вчерашней рефлексии."""
    cur.execute("SELECT id, focus, tasks, done_tasks, status, reflection, coach_note "
                "FROM career_pro_days WHERE user_id = %s AND day_date = %s LIMIT 1", (user_id, today))
    row = cur.fetchone()
    if row:
        return {'id': row[0], 'focus': row[1], 'tasks': row[2] or [], 'done': row[3] or [],
                'status': row[4], 'reflection': row[5], 'coach_note': row[6]}

    minutes_per_day = max(20, min(240, int((hours_per_week or 5) * 60 / 7)))
    prev = _prev_day(cur, user_id, today)
    prev_txt = 'Это первый день — начни мягко, но конкретно.'
    if prev:
        p_tasks = [t.get('title', '') if isinstance(t, dict) else str(t) for t in (prev[2] or [])]
        p_done = prev[3] or []
        prev_txt = (f"Вчера ({prev[0]}): фокус «{prev[1]}». Задачи: {'; '.join(p_tasks[:4])}. "
                    f"Выполнено {len(p_done)} из {len(p_tasks)}. "
                    f"Что человек написал о дне: {(prev[4] or 'ничего не написал')[:500]}")

    msg = (f"Цель: {goal or direction or 'рост в профессии'}\n"
           f"Направление: {direction or '—'}\n"
           f"Год {year_index}, месяц {month_index}, день плана №{day_index}.\n"
           f"Фокус месяца: {month_plan.get('focus', '')}\n"
           f"Цели месяца: {'; '.join(month_plan.get('goals', [])[:4])}\n"
           f"Доступно времени в день: примерно {minutes_per_day} минут.\n"
           f"{prev_txt}\n"
           f"Составь план на сегодня.")

    data, _e = call_polza(
        [{'role': 'system', 'content': DAY_PROMPT}, {'role': 'user', 'content': msg}],
        temperature=0.6, max_tokens=700, deadline=20)

    if not isinstance(data, dict) or not data.get('tasks'):
        data = {'focus': month_plan.get('focus', 'Небольшой шаг к цели'),
                'tasks': [{'title': 'Сделать один маленький шаг по цели месяца',
                           'minutes': minutes_per_day, 'why': 'Главное — не терять ритм'}]}

    focus = str(data.get('focus', ''))[:300]
    tasks = []
    for t in (data.get('tasks') or [])[:4]:
        if isinstance(t, dict):
            tasks.append({'title': str(t.get('title', ''))[:300],
                          'minutes': max(5, min(240, int(t.get('minutes') or 30))),
                          'why': str(t.get('why', ''))[:200]})
    if not tasks:
        tasks = [{'title': 'Сделать один шаг по цели месяца', 'minutes': minutes_per_day, 'why': ''}]

    cur.execute(
        "INSERT INTO career_pro_days (user_id, plan_id, day_date, day_index, year_index, month_index, "
        "focus, tasks) VALUES (%s,%s,%s,%s,%s,%s,%s,%s::jsonb) "
        "ON CONFLICT (user_id, day_date) DO NOTHING RETURNING id",
        (user_id, plan_id, today, day_index, year_index, month_index, focus,
         json.dumps(tasks, ensure_ascii=False)))
    r = cur.fetchone()
    day_id = r[0] if r else None
    return {'id': day_id, 'focus': focus, 'tasks': tasks, 'done': [],
            'status': 'open', 'reflection': '', 'coach_note': ''}


def _streak(cur, user_id):
    """Серия дней подряд с заполненной рефлексией."""
    cur.execute("SELECT day_date FROM career_pro_days WHERE user_id = %s AND status = 'closed' "
                "ORDER BY day_date DESC LIMIT 400", (user_id,))
    rows = [r[0] for r in cur.fetchall()]
    if not rows:
        return 0
    streak = 0
    cursor_day = date.today()
    if rows[0] < cursor_day - timedelta(days=1):
        return 0
    if rows[0] == cursor_day - timedelta(days=1):
        cursor_day = rows[0]
    for d in rows:
        if d == cursor_day:
            streak += 1
            cursor_day -= timedelta(days=1)
        elif d < cursor_day:
            break
    return streak


def handle_today(headers):
    """Сегодняшний день плана: задачи дня, план месяца и года, прогресс."""
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        conn.autocommit = False
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            row = _plan_row(cur, user_id)
            if not row:
                return ok({'has_plan': False})
            plan_id, goal, direction, plan_json = row

            today = date.today()
            start = _plan_start(cur, user_id)
            day_index, year_index, month_index = _period_for(start, today)

            month_plan = _ensure_month(cur, user_id, plan_id, plan_json, goal, direction,
                                       year_index, month_index)
            hpw = 5
            try:
                hpw = int((plan_json or {}).get('hours_per_week') or 5)
            except Exception:
                pass
            day = _ensure_day(cur, user_id, plan_id, plan_json, goal, direction, today,
                              month_plan, day_index, year_index, month_index, hpw)
            conn.commit()

            cur.execute("SELECT COUNT(*) FROM career_pro_days WHERE user_id = %s AND status='closed'",
                        (user_id,))
            closed = cur.fetchone()[0] or 0

            return ok({
                'has_plan': True,
                'today': today.isoformat(),
                'day_index': day_index,
                'year_index': year_index,
                'month_index': month_index,
                'day': day,
                'month_plan': month_plan,
                'year_plan': _year_block(plan_json, year_index),
                'vision': (plan_json or {}).get('five_year_plan', {}).get('vision', ''),
                'days_closed': closed,
                'streak': _streak(cur, user_id),
            })
    except Exception as e:
        conn.rollback()
        return err(f'Не удалось собрать день: {str(e)[:120]}', 500)
    finally:
        conn.close()


def handle_day_task(headers, body):
    """Отметить задачу дня выполненной/невыполненной."""
    idx = body.get('index')
    done = bool(body.get('done'))
    if idx is None:
        return err('Не указана задача')
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            today = date.today()
            cur.execute("SELECT id, done_tasks FROM career_pro_days "
                        "WHERE user_id = %s AND day_date = %s LIMIT 1", (user_id, today))
            row = cur.fetchone()
            if not row:
                return err('День ещё не создан', 404)
            day_id, done_list = row
            done_list = list(done_list or [])
            i = int(idx)
            if done and i not in done_list:
                done_list.append(i)
            if not done and i in done_list:
                done_list = [x for x in done_list if x != i]
            cur.execute("UPDATE career_pro_days SET done_tasks = %s::jsonb, updated_at = now() "
                        "WHERE id = %s", (json.dumps(done_list), day_id))
            conn.commit()
            return ok({'done': done_list})
    finally:
        conn.close()


def handle_reflect(headers, body):
    """Вечерняя рефлексия: сохраняем «как прошёл день» и получаем ответ наставника."""
    text = (body.get('text') or '').strip()[:3000]
    mood = (body.get('mood') or '').strip()[:16]
    if not text:
        return err('Напиши пару слов о дне')
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            today = date.today()
            cur.execute("SELECT id, focus, tasks, done_tasks FROM career_pro_days "
                        "WHERE user_id = %s AND day_date = %s LIMIT 1", (user_id, today))
            row = cur.fetchone()
            if not row:
                return err('День ещё не создан', 404)
            day_id, focus, tasks, done_list = row
            tasks = tasks or []
            done_list = done_list or []

            prow = _plan_row(cur, user_id)
            goal = prow[1] if prow else ''
            titles = [t.get('title', '') if isinstance(t, dict) else str(t) for t in tasks]
            msg = (f"Цель человека: {goal or '—'}\n"
                   f"Фокус дня: {focus}\n"
                   f"Задачи дня: {'; '.join(titles)}\n"
                   f"Выполнено: {len(done_list)} из {len(titles)}\n"
                   f"Настроение: {mood or 'не указано'}\n"
                   f"Как прошёл день (его словами): {text}")
            reply, _e = call_coach(
                [{'role': 'system', 'content': REFLECT_PROMPT}, {'role': 'user', 'content': msg}],
                deadline=20)
            if not reply:
                reply = ('Записал. Главное — ты не бросил и подвёл итог дня. '
                         'Завтра сделай хотя бы один шаг из плана, даже маленький.')

            score = int(round(len(done_list) * 100 / max(1, len(titles))))
            cur.execute(
                "UPDATE career_pro_days SET reflection=%s, coach_note=%s, mood=%s, score=%s, "
                "status='closed', updated_at=now() WHERE id=%s",
                (text, reply, mood, score, day_id))
            cur.execute("INSERT INTO career_pro_journal (user_id, role, content) VALUES (%s,'user',%s)",
                        (user_id, f'[Итог дня] {text}'))
            cur.execute("INSERT INTO career_pro_journal (user_id, role, content) VALUES (%s,'coach',%s)",
                        (user_id, reply))
            conn.commit()
            return ok({'ok': True, 'coach_note': reply, 'score': score,
                       'streak': _streak(cur, user_id)})
    finally:
        conn.close()


def handle_history(headers):
    """История дней: что было сделано и что человек писал о днях."""
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            cur.execute(
                "SELECT day_date, day_index, focus, tasks, done_tasks, reflection, coach_note, "
                "mood, score, status FROM career_pro_days WHERE user_id = %s "
                "ORDER BY day_date DESC LIMIT 60", (user_id,))
            items = []
            for r in cur.fetchall():
                items.append({
                    'date': r[0].isoformat(), 'day_index': r[1], 'focus': r[2],
                    'tasks': r[3] or [], 'done': r[4] or [], 'reflection': r[5],
                    'coach_note': r[6], 'mood': r[7], 'score': r[8], 'status': r[9],
                })
            cur.execute("SELECT COUNT(*), COALESCE(AVG(score),0) FROM career_pro_days "
                        "WHERE user_id = %s AND status='closed'", (user_id,))
            cnt, avg = cur.fetchone()
            return ok({'items': items, 'days_closed': cnt or 0,
                       'avg_score': int(avg or 0), 'streak': _streak(cur, user_id)})
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
    if action == 'save_plan' and method == 'POST':
        return handle_save_plan(headers, body)
    if action == 'get_plan' and method == 'GET':
        return handle_get_plan(headers)
    if action == 'toggle_checkpoint' and method == 'POST':
        return handle_toggle_checkpoint(headers, body)
    if action == 'coach_access' and method == 'GET':
        return handle_coach_access(headers)
    if action == 'journal_list' and method == 'GET':
        return handle_journal_list(headers)
    if action == 'journal_post' and method == 'POST':
        return handle_journal_post(headers, body)
    if action == 'today' and method == 'GET':
        return handle_today(headers)
    if action == 'day_task' and method == 'POST':
        return handle_day_task(headers, body)
    if action == 'reflect' and method == 'POST':
        return handle_reflect(headers, body)
    if action == 'history' and method == 'GET':
        return handle_history(headers)

    return err('Неизвестное действие', 404)