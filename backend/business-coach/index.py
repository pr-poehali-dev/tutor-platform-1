"""
Business: «Бизнес-тренер и коуч» — индивидуальная ИИ-программа развития предпринимателя/руководителя.
Человек проходит чек-лист (бизнес-цель + точки роста) → ИИ генерирует персональную
программу развития + 5-летнюю стратегию роста → показываем бесплатно → заявка на оплату (от 10 000 ₽).

Действия (query ?action= или body.action):
- generate_plan (POST): по ответам чек-листа генерирует программу развития + 5-летнюю стратегию роста (ИИ)
- submit (POST): сохраняет заявку + план в БД, уведомляет владельца в MAX
- leads_list (GET, X-Admin-Pin): список заявок для менеджера
- save_plan (POST, X-Auth-Token): сохранить стратегию в личном кабинете
- get_plan (GET, X-Auth-Token): загрузить сохранённый план + прогресс + доступ к коучу
- toggle_checkpoint (POST, X-Auth-Token): отметить/снять контрольную точку
- coach_access (GET, X-Auth-Token): проверить, оплачен ли доступ к бизнес-наставнику
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
from datetime import datetime, timezone
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

MIN_PRICE = 10000
COACH_COURSE_ID = 9201  # виртуальный продукт «Бизнес-коуч PRO» (доступ к дневнику-наставнику)
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
    """True, если пользователь оплатил доступ к бизнес-наставнику-дневнику."""
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
    "Ты — личный бизнес-тренер и коуч на платформе УЧИСЬПРО. "
    "Твоя аудитория — предприниматели, самозанятые, эксперты и руководители: от тех, кто только "
    "запускает своё дело, до владельцев действующего бизнеса, которые застряли в росте, выгорели "
    "или хотят выйти на новый уровень дохода и системности. Подбирай программу под стадию бизнеса "
    "и роль человека. Твоя задача — не просто собрать курс, а дать ясную стратегию роста, "
    "конкретный план действий и мотивирующий «волшебный пинок», чтобы человек начал прямо сегодня.\n"
    "ЕСЛИ человек не определился с целью (clarity=lost или doubting) — по его ситуации, сильным "
    "сторонам и ресурсам САМ подбери 1 наиболее перспективное направление роста и объясни выбор. "
    "ЕСЛИ цель уже ясна (clarity=decided) — работай в рамках его цели.\n"
    "Пиши по-русски, тепло, конкретно и без воды. Обращайся на «вы». Соблюдай законы РФ, "
    "никакого запрещённого контента. Не давай индивидуальных финансовых/юридических "
    "рекомендаций и не гарантируй конкретную прибыль.\n"
    "Верни СТРОГО JSON такого вида: {"
    "\"recommended_direction\": строка (рекомендованное направление роста бизнеса; если цель ясна — повтори её), "
    "\"direction_reason\": строка (1-2 предложения, почему это подходит именно ему — с опорой на его ситуацию и сильные стороны), "
    "\"course_title\": строка (яркое название индивидуальной программы развития), "
    "\"summary\": строка (2-3 предложения, чем программа полезна именно этому предпринимателю), "
    "\"target_role\": строка (какой результат в бизнесе получит — например «системный владелец, а не оператор»), "
    "\"duration_weeks\": число (реалистичный срок в неделях), "
    "\"hours_per_week\": число (часов в неделю), "
    "\"level\": строка (старт / действующий бизнес / масштабирование), "
    "\"skills\": [строки — 5-8 ключевых компетенций, которые прокачает: стратегия, финансы, продажи, найм, делегирование и т.п.], "
    "\"modules\": [{\"title\": строка, \"goal\": строка (что даст модуль для бизнеса), "
    "\"lessons\": [строки — 3-5 конкретных тем]} — ровно 5-7 модулей], "
    "\"final_project\": строка (итоговый практический результат — например «финмодель и план роста на год»), "
    "\"why_personal\": [строки — 3 пункта, почему эта программа подходит именно ему и его бизнесу], "
    "\"action_plan\": [{\"when\": строка (например «Сегодня», «На этой неделе», «1-й месяц», «2-3 месяц»), "
    "\"action\": строка (конкретный шаг), \"result\": строка (что человек получит для бизнеса)} — 4-6 шагов от «прямо сейчас» до результата], "
    "\"pep_talk\": строка (тёплый мотивирующий «волшебный пинок» на 3-4 предложения — обратись лично, "
    "признай его сомнения и опыт как силу, и подтолкни сделать первый шаг сегодня), "
    "\"five_year_plan\": {\"vision\": строка (образ бизнеса и жизни предпринимателя через 5 лет — вдохновляюще и реалистично), "
    "\"years\": [{\"year\": число (1..5), \"title\": строка (название этапа года, например «Фундамент и система», «Стабильная прибыль», «Масштаб»), "
    "\"focus\": строка (главный фокус года для бизнеса), "
    "\"milestones\": [строки — 3-4 конкретные контрольные точки года с измеримым результатом], "
    "\"metric\": строка (главная измеримая бизнес-метрика года — например «выручка 500 тыс/мес», «маржа 30%», «команда 3 человека», «5 постоянных клиентов»)} "
    "— РОВНО 5 объектов, по одному на каждый год], "
    "\"review_system\": [строки — 3-4 правила системы самооценки прогресса: как и с какой периодичностью предприниматель "
    "проверяет, идёт ли он по стратегии (например «каждую неделю: сверка ключевых цифр», «раз в месяц: разбор P&L», «раз в квартал: пересмотр стратегии»)]}"
    "}"
)


def build_user_message(answers, goal):
    parts = [f"Бизнес-цель человека: {goal}" if goal else "Цель: человек пока НЕ определился с целью роста."]
    labels = {
        'clarity': 'Определённость с целью',
        'age': 'Возраст',
        'stage': 'Стадия бизнеса',
        'role': 'Роль в деле',
        'niche': 'Ниша / сфера',
        'revenue': 'Текущий доход бизнеса',
        'strengths': 'Сильные стороны',
        'values': 'Что важнее всего в деле',
        'painpoints': 'Главные проблемы и узкие места',
        'skills': 'Компетенции, которые хочет прокачать',
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
        "Как бизнес-тренер: подбери направление роста (если не определился), собери индивидуальную "
        "программу развития, пошаговый план действий, 5-летнюю стратегию и мотивирующий «пинок». "
        "Верни строго в формате JSON."
    )
    return '\n'.join(parts)


FALLBACK_PLAN = {
    'recommended_direction': 'Направление роста под ваш бизнес',
    'direction_reason': 'Мы подберём точку роста под вашу ситуацию и ресурсы на личной консультации.',
    'course_title': 'Ваша индивидуальная программа роста в бизнесе',
    'summary': 'Персональная программа под вашу бизнес-цель. Мы уточним детали и соберём её именно под вас.',
    'target_role': 'Системный владелец бизнеса, а не оператор в текучке',
    'duration_weeks': 10,
    'hours_per_week': 5,
    'level': 'действующий бизнес',
    'skills': ['Стратегия и цели', 'Финансы и юнит-экономика', 'Продажи и маркетинг',
               'Делегирование и команда', 'Системность процессов'],
    'modules': [
        {'title': 'Диагностика бизнеса', 'goal': 'Понять точку А и главные узкие места',
         'lessons': ['Оценка текущих цифр', 'Постановка измеримой цели', 'Карта роста']},
        {'title': 'Финансовый фундамент', 'goal': 'Навести порядок в деньгах',
         'lessons': ['P&L и денежный поток', 'Юнит-экономика', 'Точка безубыточности']},
        {'title': 'Продажи и маркетинг', 'goal': 'Стабильно привлекать клиентов',
         'lessons': ['Воронка продаж', 'Каналы привлечения', 'Повышение среднего чека']},
        {'title': 'Команда и делегирование', 'goal': 'Выйти из операционки',
         'lessons': ['Что делегировать первым', 'Найм и адаптация', 'Регламенты и контроль']},
        {'title': 'Система и масштаб', 'goal': 'Сделать рост управляемым',
         'lessons': ['Ключевые метрики', 'Планирование', 'Стратегия на год']},
    ],
    'final_project': 'Финансовая модель и план роста вашего бизнеса на год.',
    'why_personal': ['Программа под вашу бизнес-цель', 'Реалистичный темп под вашу загрузку',
                     'Фокус на ваших узких местах'],
    'action_plan': [
        {'when': 'Сегодня', 'action': 'Оставьте заявку и зафиксируйте решение расти системно',
         'result': 'Первый шаг сделан — вы уже в движении'},
        {'when': 'На этой неделе', 'action': 'Согласуем цель и разберём главные узкие места',
         'result': 'Ясность, с чего начать рост'},
        {'when': '1-й месяц', 'action': 'Наводите порядок в цифрах и продажах',
         'result': 'Понятная картина бизнеса и первые улучшения'},
        {'when': '2-3 месяц', 'action': 'Выстраиваете систему и выходите из операционки',
         'result': 'Управляемый рост и больше свободного времени'},
    ],
    'pep_talk': 'Вы не «слишком поздно» и точно не одиноки в своих сомнениях — то, что вы уже в деле, '
                'это огромное преимущество. Самое сложное — перестать тушить пожары и начать строить систему, '
                'и вы способны на это. Сделайте первый шаг сегодня, а остальное мы пройдём вместе.',
    'five_year_plan': {
        'vision': 'Через 5 лет у вас — системный бизнес, который растёт без вашего постоянного участия: '
                  'стабильная прибыль, команда, свобода выбирать проекты и время на жизнь.',
        'years': [
            {'year': 1, 'title': 'Фундамент и система', 'focus': 'Навести порядок в цифрах и процессах',
             'milestones': ['Прозрачный P&L и учёт', 'Стабильный поток клиентов', 'Первые регламенты'],
             'metric': 'Понятная прибыль и контроль над деньгами'},
            {'year': 2, 'title': 'Стабильная прибыль', 'focus': 'Выйти на устойчивый доход',
             'milestones': ['Рост выручки', 'Повторные продажи', 'Первые сотрудники'],
             'metric': 'Стабильная прибыль каждый месяц'},
            {'year': 3, 'title': 'Команда и делегирование', 'focus': 'Выйти из операционки',
             'milestones': ['Команда закрывает рутину', 'Работающие процессы', 'Рост маржи'],
             'metric': 'Бизнес работает без вас в текучке'},
            {'year': 4, 'title': 'Масштаб', 'focus': 'Кратно вырасти',
             'milestones': ['Новые продукты или рынки', 'Управление по цифрам', 'Сильный бренд'],
             'metric': 'Кратный рост выручки к старту'},
            {'year': 5, 'title': 'Свобода', 'focus': 'Системный бизнес и выбор',
             'milestones': ['Бизнес управляется командой', 'Пассивные/масштабируемые доходы', 'Новые проекты'],
             'metric': 'Финансовая свобода и управляемый актив'},
        ],
        'review_system': [
            'Каждую неделю: сверка ключевых цифр (выручка, лиды, деньги на счету).',
            'Раз в месяц: разбор P&L и метрики текущего года — идёте ли по стратегии.',
            'Раз в квартал: честный разбор с наставником — что скорректировать в стратегии.',
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
        plan['duration_weeks'] = int(plan.get('duration_weeks') or 10)
        plan['hours_per_week'] = int(plan.get('hours_per_week') or 5)
        plan['level'] = str(plan.get('level') or 'действующий бизнес')[:60]
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
    weeks = plan.get('duration_weeks') or 10
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
        print(f"[business-coach] generate fallback: {error}")
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
                "INSERT INTO business_coach_leads "
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

    lines = [f"💼 Заявка «Бизнес-тренер и коуч» #{lid}", ""]
    lines.append(f"👤 Имя: {name}")
    contacts = [c for c in (email, phone) if c]
    if contacts:
        lines.append("📞 " + " · ".join(contacts))
    if goal:
        lines.append(f"🎯 Цель: {goal}")
    if plan_title:
        lines.append(f"📘 Программа: {plan_title}")
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
                "FROM business_coach_leads ORDER BY created_at DESC LIMIT 500")
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
# ЛИЧНЫЙ КАБИНЕТ: стратегия роста (бесплатно) и дневник-коуч (после оплаты)
# ═══════════════════════════════════════════════════════════════════════════

def handle_save_plan(headers, body):
    """Сохраняет стратегию в личном кабинете авторизованного пользователя."""
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
            cur.execute("SELECT id FROM business_coach_plans WHERE user_id = %s ORDER BY id DESC LIMIT 1",
                        (user_id,))
            row = cur.fetchone()
            if row:
                cur.execute(
                    "UPDATE business_coach_plans SET goal=%s, direction=%s, plan=%s, updated_at=now() WHERE id=%s",
                    (goal or None, direction or None, json.dumps(plan, ensure_ascii=False), row[0]))
                plan_id = row[0]
            else:
                cur.execute(
                    "INSERT INTO business_coach_plans (user_id, goal, direction, plan) "
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
                "SELECT id, goal, direction, plan, progress FROM business_coach_plans "
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
    """Отмечает/снимает контрольную точку 5-летней стратегии."""
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
            cur.execute("SELECT id, progress FROM business_coach_plans WHERE user_id = %s ORDER BY id DESC LIMIT 1",
                        (user_id,))
            row = cur.fetchone()
            if not row:
                return err('Сначала сохраните план', 404)
            progress = row[1] or {}
            if done:
                progress[key] = {'done': True, 'updated_at': datetime.now(timezone.utc).isoformat()}
            else:
                progress.pop(key, None)
            cur.execute("UPDATE business_coach_plans SET progress=%s, updated_at=now() WHERE id=%s",
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
    "Ты — личный бизнес-наставник и коуч УЧИСЬПРО по имени Марк. "
    "Ты ведёшь предпринимателя по его 5-летней стратегии роста и помогаешь НЕ бросить и НЕ утонуть в текучке. "
    "Твой стиль — ЖЁСТКИЙ, НО СПРАВЕДЛИВЫЙ: ты честен, не заискиваешь, не сюсюкаешь, "
    "но всегда на стороне человека. Ты как живой дневник-собеседник: слушаешь, что человек "
    "написал (застрял, нет продаж, выгорел, всё на мне, страшно нанимать, кассовый разрыв), и помогаешь "
    "РАЗОБРАТЬСЯ В ИСТИННОЙ ПРИЧИНЕ, а не просто утешаешь.\n"
    "ПРИНЦИПЫ:\n"
    "1. Сначала признай состояние человека одной фразой (без ваты), потом — по делу.\n"
    "2. Найди КОРЕНЬ проблемы бизнеса (нет системы, размытая стратегия, страх делегировать, "
    "работа за деньги а не за прибыль, отсутствие цифр, не тот продукт/клиент). Задай 1 точный вопрос или назови причину прямо.\n"
    "3. Дай ОДИН конкретный шаг на ближайшие 24-48 часов — выполнимый даже в загруженный день.\n"
    "4. Будь честным: если человек прячется за отговорками или тушит пожары вместо стратегии — прямо назови это. Уважение через правду.\n"
    "5. Возвращай к цели и к его же 5-летней стратегии. Напоминай, ради чего он начал бизнес.\n"
    "6. Мысли как предприниматель: цифры, приоритеты, деньги, время. Никакой вины и стыда — жёсткость про требовательность, не про унижение.\n"
    "Соблюдай законы РФ. Не давай индивидуальных юридических/налоговых/финансовых гарантий. Ты НЕ врач: "
    "при признаках сильного выгорания, депрессии или кризиса — по-человечески порекомендуй обратиться к "
    "специалисту, дай телефон доверия 8-800-2000-122, и не заменяй собой терапию.\n"
    "ФОРМАТ: живой человеческий текст на «ты» или «вы» (как обращается человек), 3-6 предложений, "
    "без списков и заголовков, будто пишешь партнёру в дневник. В конце — один ясный шаг или вопрос."
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
                "SELECT id, role, content, created_at FROM business_coach_journal "
                "WHERE user_id = %s ORDER BY created_at ASC, id ASC LIMIT 200", (user_id,))
            items = [{'id': r[0], 'role': r[1], 'content': r[2],
                      'created_at': r[3].isoformat() if r[3] else None} for r in cur.fetchall()]
            return ok({'coach_access': coach, 'items': items})
    finally:
        conn.close()


def handle_journal_post(headers, body):
    """Записывает сообщение в дневник и возвращает ответ бизнес-наставника-коуча.
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

            cur.execute("SELECT goal, direction, plan FROM business_coach_plans "
                        "WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user_id,))
            prow = cur.fetchone()
            plan_context = ''
            if prow:
                goal, direction, plan = prow
                fy = (plan or {}).get('five_year_plan', {}) if isinstance(plan, dict) else {}
                vision = fy.get('vision', '') if isinstance(fy, dict) else ''
                plan_context = (f"Бизнес-цель человека: {goal or '—'}. Направление роста: {direction or '—'}. "
                                f"Его образ бизнеса через 5 лет: {vision or '—'}.")

            cur.execute("SELECT role, content FROM business_coach_journal "
                        "WHERE user_id = %s ORDER BY created_at DESC, id DESC LIMIT 10", (user_id,))
            history = list(reversed(cur.fetchall()))

            messages = [{'role': 'system', 'content': COACH_PROMPT}]
            if plan_context:
                messages.append({'role': 'system', 'content': plan_context})
            for role, content in history:
                messages.append({'role': 'assistant' if role == 'coach' else 'user', 'content': content})
            messages.append({'role': 'user', 'content': text})

            cur.execute("INSERT INTO business_coach_journal (user_id, role, content) VALUES (%s,'user',%s)",
                        (user_id, text))
            conn.commit()

            reply, error = call_coach(messages)
            if not reply:
                reply = ('Я рядом. Похоже, сейчас много всего навалилось — и это нормально для любого дела. '
                         'Давай не хвататься за всё сразу: назови один шаг, который реально сдвинет бизнес '
                         'в ближайшие сутки, даже если день загружен. С него и начнём.')

            cur.execute("INSERT INTO business_coach_journal (user_id, role, content) VALUES (%s,'coach',%s) RETURNING id, created_at",
                        (user_id, reply))
            cid, cts = cur.fetchone()
            conn.commit()
            return ok({'reply': reply, 'id': cid, 'created_at': cts.isoformat() if cts else None})
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

    return err('Неизвестное действие', 404)
