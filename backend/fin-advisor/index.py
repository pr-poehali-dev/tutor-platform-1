"""
Business: «Финансовый консультант» — ИИ-финансист анализирует бизнес по реальным цифрам.
Собственник вводит финпоказатели → ИИ даёт честную непредвзятую оценку устойчивости бизнеса,
находит скрытые возможности, предупреждает о рисках, предлагает реальные пути финансирования
(инвестиции, гранты, кредиты, оптимизация) → показываем бесплатно → заявка на сопровождение (от 10 000 ₽).
+ живой ИИ-финансист в дневнике (после оплаты).

Действия (query ?action= или body.action):
- generate_plan (POST): по введённым цифрам считает метрики и генерирует финансовый анализ (ИИ)
- submit (POST): сохраняет заявку + анализ в БД, уведомляет владельца в MAX
- leads_list (GET, X-Admin-Pin): список заявок для менеджера
- save_plan (POST, X-Auth-Token): сохранить анализ в личном кабинете
- get_plan (GET, X-Auth-Token): загрузить сохранённый анализ + прогресс + доступ к финансисту
- toggle_checkpoint (POST, X-Auth-Token): отметить/снять выполненный шаг плана оздоровления
- coach_access (GET, X-Auth-Token): проверить, оплачен ли доступ к финансисту
- journal_list (GET, X-Auth-Token): история дневника-финансиста
- journal_post (POST, X-Auth-Token): вопрос финансисту и его ответ (гейт по оплате)

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
COACH_COURSE_ID = 9202  # виртуальный продукт «Финансовый консультант PRO» (доступ к дневнику-финансисту)
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
    """True, если пользователь оплатил доступ к финансисту-дневнику."""
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


def rate_limited(bucket_key, limit, window_sec):
    """Простой rate-limiting по ключу (IP). True — лимит превышен.
    Не роняет запрос при ошибке БД (fail-open)."""
    conn = get_db()
    if conn is None:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM ai_rate_limit WHERE ts < now() - (%s || ' seconds')::interval",
                (str(window_sec),))
            cur.execute(
                "SELECT count(*) FROM ai_rate_limit WHERE bucket_key = %s "
                "AND ts > now() - (%s || ' seconds')::interval",
                (bucket_key[:120], str(window_sec)))
            cnt = cur.fetchone()[0]
            if cnt >= limit:
                conn.commit()
                return True
            cur.execute("INSERT INTO ai_rate_limit (bucket_key) VALUES (%s)", (bucket_key[:120],))
            conn.commit()
            return False
    except Exception as e:
        print(f"[fin-advisor] rate_limit error: {type(e).__name__}")
        return False
    finally:
        conn.close()


def notify_max(text):
    token = os.environ.get('MAX_BOT_TOKEN', '')
    ident = os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return
    if not _max_post(token, 'chat_id', ident, text):
        _max_post(token, 'user_id', ident, text)


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.5, max_tokens=5000, deadline=26):
    """Один вызов ИИ с жёстким deadline (Cloud Function убивается на 30с).
    Для финанализа temperature ниже — нужны точность и трезвость, а не креатив."""
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


# ── Числовые метрики считаем на сервере (детерминированно), а не отдаём на откуп ИИ ──

def _num(v):
    """Аккуратно достаёт число из строки/числа ('1 200 000 ₽' -> 1200000.0)."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).replace('\xa0', ' ')
    s = re.sub(r'[^\d,.\-]', '', s.replace(' ', ''))
    s = s.replace(',', '.')
    if s in ('', '.', '-', '-.'):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def compute_metrics(a):
    """Рассчитывает ключевые финансовые метрики из введённых показателей.
    Все суммы трактуем как «в месяц», если не указано иное."""
    revenue = _num(a.get('revenue'))            # выручка/мес
    cogs = _num(a.get('cogs'))                  # себестоимость/переменные расходы/мес
    fixed = _num(a.get('fixed'))                # постоянные расходы/мес
    debt = _num(a.get('debt'))                  # общий долг (кредиты, займы)
    debt_payment = _num(a.get('debt_payment'))  # платёж по долгам/мес
    cash = _num(a.get('cash'))                  # свободные деньги / подушка
    receivables = _num(a.get('receivables'))    # дебиторка (должны нам)

    m = {}
    total_costs = None
    if cogs is not None or fixed is not None:
        total_costs = (cogs or 0) + (fixed or 0)
        if debt_payment:
            total_costs += debt_payment

    if revenue is not None:
        m['revenue'] = round(revenue)
        if total_costs is not None:
            profit = revenue - total_costs
            m['profit'] = round(profit)
            if revenue > 0:
                m['profit_margin_pct'] = round(profit / revenue * 100, 1)
        # Валовая маржа
        if cogs is not None and revenue > 0:
            m['gross_margin_pct'] = round((revenue - cogs) / revenue * 100, 1)

    # Запас прочности по кэшу: на сколько месяцев хватит подушки при текущих расходах
    monthly_burn = None
    if total_costs is not None and revenue is not None:
        monthly_burn = total_costs - revenue  # если >0 — бизнес «горит»
    if cash is not None and monthly_burn is not None and monthly_burn > 0:
        m['cash_runway_months'] = round(cash / monthly_burn, 1)
    elif cash is not None and total_costs:
        # Сколько месяцев проживёт на подушке, если выручка вдруг обнулится
        m['cash_cushion_months'] = round(cash / total_costs, 1)

    # Долговая нагрузка
    if debt is not None and revenue:
        m['debt_to_revenue'] = round(debt / revenue, 1)  # долг в месячных выручках
    if debt_payment is not None and revenue and revenue > 0:
        m['debt_load_pct'] = round(debt_payment / revenue * 100, 1)

    # Точка безубыточности (нужна выручка, чтобы покрыть расходы) при текущей марже
    if fixed is not None and cogs is not None and revenue and revenue > 0:
        var_ratio = cogs / revenue
        if var_ratio < 1:
            fixed_total = fixed + (debt_payment or 0)
            m['breakeven_revenue'] = round(fixed_total / (1 - var_ratio))

    if receivables is not None:
        m['receivables'] = round(receivables)

    return m


SYSTEM_PROMPT = (
    "Ты — практикующий финансовый директор и инвестиционный аналитик уровня Big4 на платформе УЧИСЬПРО. "
    "Твоя задача — дать собственнику бизнеса ЧЕСТНЫЙ, НЕПРЕДВЗЯТЫЙ финансовый анализ на основе его цифр. "
    "Никакой воды и лести. Если бизнес в опасной зоне — скажи прямо. Если есть скрытые возможности — раскрой их конкретно. "
    "Ты одновременно ищешь максимальную выгоду для собственника И оберегаешь его от типичных ошибок и рисков.\n"
    "Тебе передадут введённые показатели и уже РАССЧИТАННЫЕ метрики (маржа, прибыль, запас кэша, долговая нагрузка, "
    "точка безубыточности). Опирайся на эти числа, интерпретируй их и делай выводы. Если данных мало — честно отметь это "
    "и дай анализ по тому, что есть, указав, какие цифры стоит уточнить.\n"
    "Пиши по-русски, конкретно, языком владельца бизнеса (без академизма). Обращайся на «вы». Соблюдай законы РФ. "
    "НЕ гарантируй конкретную прибыль или одобрение финансирования, не давай указаний нарушать закон и не заменяй "
    "аудитора/юриста — при необходимости рекомендуй проверку у специалиста.\n"
    "Верни СТРОГО JSON такого вида: {"
    "\"report_title\": строка (ёмкий заголовок анализа под этот бизнес), "
    "\"verdict\": {\"score\": число 0-100 (интегральная оценка финансовой устойчивости), "
    "\"level\": строка (одно из: «Критическая зона», «Зона риска», «Пограничная устойчивость», «Устойчивый бизнес», «Сильная позиция»), "
    "\"summary\": строка (2-4 предложения — честный вывод об устойчивости именно этого бизнеса по цифрам)}, "
    "\"metrics_read\": [{\"name\": строка (название метрики), \"value\": строка (значение с единицей), "
    "\"status\": строка (одно из: «good», «warning», «bad»), \"comment\": строка (что это значит для бизнеса простыми словами)} "
    "— 4-7 ключевых метрик с трактовкой], "
    "\"strengths\": [строки — 2-4 сильные стороны финмодели, если есть], "
    "\"risks\": [{\"title\": строка (риск), \"severity\": строка («high»/«medium»/«low»), "
    "\"why\": строка (чем грозит и на каких цифрах виден), \"fix\": строка (что сделать)} — 2-5 главных рисков, честно], "
    "\"hidden_opportunities\": [{\"title\": строка (скрытая возможность роста прибыли/эффективности), "
    "\"impact\": строка (оценка эффекта, например «+10-15% к прибыли»), \"how\": строка (как реализовать конкретно)} — 2-4 возможности], "
    "\"financing_options\": [{\"type\": строка (одно из: «Гранты и субсидии», «Банковский кредит», «Частные инвестиции», "
    "«Лизинг/факторинг», «Реинвест прибыли», «Оптимизация расходов»), \"fit\": строка («high»/«medium»/«low» — насколько подходит ЭТОМУ бизнесу), "
    "\"detail\": строка (конкретно: что подойдёт, на что обратить внимание, реалистичные условия под РФ), "
    "\"caution\": строка (предостережение — когда НЕ стоит этим пользоваться)} — 3-5 вариантов, ранжируй по применимости], "
    "\"action_plan\": [{\"priority\": число (1..N, 1 — самое срочное), \"action\": строка (конкретный финансовый шаг), "
    "\"result\": строка (что улучшится в цифрах)} — 4-6 приоритетных шагов оздоровления], "
    "\"honest_take\": строка (личный честный вывод финдиректора на 3-5 предложений: главная правда об этом бизнесе, "
    "на что смотреть в первую очередь, и трезвая оценка перспектив — без розовых очков и без запугивания)"
    "}"
)


def build_user_message(answers, metrics, goal):
    parts = []
    if goal:
        parts.append(f"Запрос собственника: {goal}")
    labels = {
        'business_type': 'Тип бизнеса / ниша',
        'stage': 'Стадия бизнеса',
        'revenue': 'Выручка в месяц, ₽',
        'cogs': 'Себестоимость / переменные расходы в месяц, ₽',
        'fixed': 'Постоянные расходы в месяц (аренда, зарплаты, и т.д.), ₽',
        'debt': 'Общий долг (кредиты, займы), ₽',
        'debt_payment': 'Платёж по долгам в месяц, ₽',
        'cash': 'Свободные деньги / финансовая подушка, ₽',
        'receivables': 'Дебиторка (сколько должны вам), ₽',
        'employees': 'Сотрудников',
        'trend': 'Динамика за последние месяцы',
        'main_pain': 'Главная финансовая боль',
    }
    parts.append("ВВЕДЁННЫЕ ПОКАЗАТЕЛИ:")
    for key, label in labels.items():
        val = answers.get(key)
        if isinstance(val, list):
            val = ', '.join(str(v) for v in val if v)
        if val not in (None, '', []):
            parts.append(f"- {label}: {str(val)[:300]}")

    if metrics:
        parts.append("\nРАССЧИТАННЫЕ МЕТРИКИ (используй их как основу):")
        readable = {
            'revenue': 'Выручка/мес, ₽', 'profit': 'Прибыль/мес, ₽',
            'profit_margin_pct': 'Чистая маржа, %', 'gross_margin_pct': 'Валовая маржа, %',
            'cash_runway_months': 'Хватит подушки при убытке, мес',
            'cash_cushion_months': 'Запас подушки при 0 выручки, мес',
            'debt_to_revenue': 'Долг в месячных выручках',
            'debt_load_pct': 'Доля дохода на обслуживание долга, %',
            'breakeven_revenue': 'Точка безубыточности (выручка), ₽',
            'receivables': 'Дебиторка, ₽',
        }
        for k, label in readable.items():
            if k in metrics:
                parts.append(f"- {label}: {metrics[k]}")

    parts.append(
        "\nКак финдиректор: дай честный анализ устойчивости, раскрой скрытые возможности, "
        "предупреди о рисках и предложи реальные пути финансирования под РФ. Верни строго JSON."
    )
    return '\n'.join(parts)


FALLBACK_PLAN = {
    'report_title': 'Экспресс-оценка финансового состояния бизнеса',
    'verdict': {
        'score': 55,
        'level': 'Пограничная устойчивость',
        'summary': 'По части данных бизнес держится, но для точного вывода нужно уточнить ключевые цифры. '
                   'Оставьте заявку — разберём вашу ситуацию детально с живым специалистом.',
    },
    'metrics_read': [
        {'name': 'Данные', 'value': 'частично', 'status': 'warning',
         'comment': 'Для точного анализа не хватает части показателей — уточним на консультации.'},
    ],
    'strengths': ['Вы уже считаете свои цифры — это половина успеха в финансах.'],
    'risks': [
        {'title': 'Нет полной картины по деньгам', 'severity': 'medium',
         'why': 'Без учёта всех расходов и долгов легко переоценить прибыль.',
         'fix': 'Соберите P&L и движение денег за 3 месяца.'},
    ],
    'hidden_opportunities': [
        {'title': 'Наведение порядка в учёте', 'impact': 'ясность и +к прибыли',
         'how': 'Разделите переменные и постоянные расходы, посчитайте маржу по каждому направлению.'},
    ],
    'financing_options': [
        {'type': 'Оптимизация расходов', 'fit': 'high',
         'detail': 'Самый быстрый и безрисковый способ высвободить деньги — до привлечения внешних средств.',
         'caution': 'Не режьте расходы, которые приносят выручку (маркетинг, ключевые люди).'},
        {'type': 'Гранты и субсидии', 'fit': 'medium',
         'detail': 'Для МСП в РФ есть программы поддержки — подберём подходящие под вашу нишу.',
         'caution': 'Гранты требуют отчётности и целевого использования — оцените свои силы.'},
    ],
    'action_plan': [
        {'priority': 1, 'action': 'Соберите полный список доходов и расходов за 3 месяца',
         'result': 'Появится реальная картина прибыли'},
        {'priority': 2, 'action': 'Посчитайте маржу и точку безубыточности',
         'result': 'Поймёте запас прочности'},
        {'priority': 3, 'action': 'Оставьте заявку на детальный разбор',
         'result': 'Персональный план финансового оздоровления'},
    ],
    'honest_take': 'Честно: по имеющимся данным сложно дать окончательный вердикт — не хватает части цифр. '
                   'Но сам факт, что вы решили посмотреть на бизнес через финансы, уже правильный шаг. '
                   'Соберите полные показатели, и картина станет ясной. Мы поможем разобраться без розовых очков.',
    'is_fallback': True,
}


def _clip(v, n):
    return str(v or '')[:n]


def _norm_list_of_dicts(raw, fields, limit):
    out = []
    for item in (raw or [])[:limit]:
        if not isinstance(item, dict):
            continue
        obj = {}
        for f, ln in fields.items():
            obj[f] = _clip(item.get(f), ln)
        out.append(obj)
    return out


def clean_plan(plan, metrics):
    """Валидация и нормализация финансового анализа от ИИ."""
    if not isinstance(plan, dict):
        return {**FALLBACK_PLAN, 'metrics': metrics}
    try:
        v = plan.get('verdict') if isinstance(plan.get('verdict'), dict) else {}
        try:
            score = int(v.get('score'))
            score = max(0, min(100, score))
        except (TypeError, ValueError):
            score = 55
        verdict = {
            'score': score,
            'level': _clip(v.get('level') or 'Пограничная устойчивость', 60),
            'summary': _clip(v.get('summary'), 800),
        }
        out = {
            'report_title': _clip(plan.get('report_title') or FALLBACK_PLAN['report_title'], 200),
            'verdict': verdict,
            'metrics_read': _norm_list_of_dicts(
                plan.get('metrics_read'),
                {'name': 120, 'value': 60, 'status': 12, 'comment': 300}, 8),
            'strengths': [_clip(s, 220) for s in (plan.get('strengths') or [])][:5],
            'risks': _norm_list_of_dicts(
                plan.get('risks'),
                {'title': 160, 'severity': 12, 'why': 400, 'fix': 400}, 6),
            'hidden_opportunities': _norm_list_of_dicts(
                plan.get('hidden_opportunities'),
                {'title': 160, 'impact': 120, 'how': 400}, 5),
            'financing_options': _norm_list_of_dicts(
                plan.get('financing_options'),
                {'type': 60, 'fit': 12, 'detail': 500, 'caution': 400}, 6),
            'honest_take': _clip(plan.get('honest_take'), 1000),
            'metrics': metrics,
            'is_fallback': False,
        }
        # action_plan с числовым priority
        steps = []
        for i, s in enumerate((plan.get('action_plan') or [])[:6]):
            if not isinstance(s, dict):
                continue
            try:
                pr = int(s.get('priority') or (i + 1))
            except (TypeError, ValueError):
                pr = i + 1
            steps.append({'priority': pr, 'action': _clip(s.get('action'), 300),
                          'result': _clip(s.get('result'), 300)})
        out['action_plan'] = [s for s in steps if s['action']] or FALLBACK_PLAN['action_plan']
        if not out['metrics_read']:
            return {**FALLBACK_PLAN, 'metrics': metrics}
        return out
    except Exception:
        return {**FALLBACK_PLAN, 'metrics': metrics}


def suggest_price(plan):
    """Цена сопровождения (от 10 000 ₽) по объёму найденных рисков/возможностей."""
    risks = len(plan.get('risks') or [])
    opps = len(plan.get('financing_options') or [])
    price = MIN_PRICE + max(0, risks - 2) * 1000 + max(0, opps - 3) * 1000
    return int(round(price / 500) * 500)


def handle_generate(body, client_ip=''):
    answers = body.get('answers') if isinstance(body.get('answers'), dict) else {}
    goal = (body.get('goal') or answers.get('goal') or '').strip()[:500]
    if not answers:
        return err('Заполните финансовые показатели', 400)

    # Защита от абуза: не более 8 анализов за 10 минут с одного IP.
    if client_ip and rate_limited(f'fin-advisor:generate:{client_ip}', 8, 600):
        return err('Слишком много запросов. Попробуйте через несколько минут.', 429)

    metrics = compute_metrics(answers)
    messages = [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': build_user_message(answers, metrics, goal)},
    ]
    plan, error = call_polza(messages)
    if plan is None:
        print(f"[fin-advisor] generate fallback: {error}")
        plan = {**FALLBACK_PLAN, 'metrics': metrics}
    else:
        plan = clean_plan(plan, metrics)

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

    plan_title = (plan.get('report_title') if plan else '') or ''
    verdict = (plan.get('verdict') if plan else {}) or {}
    price = None
    if isinstance(body.get('price'), (int, float)):
        price = int(body['price'])

    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO fin_advisor_leads "
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

    lines = [f"💰 Заявка «Финансовый консультант» #{lid}", ""]
    lines.append(f"👤 Имя: {name}")
    contacts = [c for c in (email, phone) if c]
    if contacts:
        lines.append("📞 " + " · ".join(contacts))
    if goal:
        lines.append(f"🎯 Запрос: {goal}")
    if verdict.get('level'):
        lines.append(f"📊 Устойчивость: {verdict.get('level')} ({verdict.get('score', '?')}/100)")
    if plan_title:
        lines.append(f"📘 Анализ: {plan_title}")
    if price:
        lines.append(f"💵 Цена: {price:,} ₽".replace(',', ' '))
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
                "FROM fin_advisor_leads ORDER BY created_at DESC LIMIT 500")
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
# ЛИЧНЫЙ КАБИНЕТ: финансовый анализ (бесплатно) и дневник-финансист (после оплаты)
# ═══════════════════════════════════════════════════════════════════════════

def handle_save_plan(headers, body):
    """Сохраняет финансовый анализ в личном кабинете авторизованного пользователя."""
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
                return err('Нет анализа для сохранения', 400)
            goal = (body.get('goal') or '')[:500]
            verdict = plan.get('verdict') if isinstance(plan.get('verdict'), dict) else {}
            direction = (verdict.get('level') or '')[:300]
            cur.execute("SELECT id FROM fin_advisor_reports WHERE user_id = %s ORDER BY id DESC LIMIT 1",
                        (user_id,))
            row = cur.fetchone()
            if row:
                cur.execute(
                    "UPDATE fin_advisor_reports SET goal=%s, direction=%s, plan=%s, updated_at=now() WHERE id=%s",
                    (goal or None, direction or None, json.dumps(plan, ensure_ascii=False), row[0]))
                plan_id = row[0]
            else:
                cur.execute(
                    "INSERT INTO fin_advisor_reports (user_id, goal, direction, plan) "
                    "VALUES (%s,%s,%s,%s) RETURNING id",
                    (user_id, goal or None, direction or None, json.dumps(plan, ensure_ascii=False)))
                plan_id = cur.fetchone()[0]
            conn.commit()
            return ok({'ok': True, 'plan_id': plan_id})
    finally:
        conn.close()


def handle_get_plan(headers):
    """Загружает сохранённый анализ + прогресс + признак доступа к финансисту."""
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            cur.execute(
                "SELECT id, goal, direction, plan, progress FROM fin_advisor_reports "
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
    """Отмечает/снимает выполненный шаг плана оздоровления."""
    key = (body.get('key') or '').strip()[:80]
    done = bool(body.get('done'))
    if not key:
        return err('Не указан шаг', 400)
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            cur.execute("SELECT id, progress FROM fin_advisor_reports WHERE user_id = %s ORDER BY id DESC LIMIT 1",
                        (user_id,))
            row = cur.fetchone()
            if not row:
                return err('Сначала сохраните анализ', 404)
            progress = row[1] or {}
            if done:
                progress[key] = {'done': True, 'updated_at': datetime.now(timezone.utc).isoformat()}
            else:
                progress.pop(key, None)
            cur.execute("UPDATE fin_advisor_reports SET progress=%s, updated_at=now() WHERE id=%s",
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
    "Ты — личный финансовый директор и инвестиционный советник УЧИСЬПРО по имени Анна. "
    "Ты сопровождаешь собственника бизнеса по его финансовому плану и помогаешь принимать сильные, "
    "трезвые решения по деньгам. Твой стиль — ЧЕСТНЫЙ, НЕПРЕДВЗЯТЫЙ и требовательный, но всегда на стороне собственника. "
    "Ты не льстишь и не запугиваешь: говоришь правду по цифрам.\n"
    "ПРИНЦИПЫ:\n"
    "1. Всегда думай цифрами: маржа, денежный поток, окупаемость, риски, точка безубыточности.\n"
    "2. Ищешь для собственника максимальную выгоду И одновременно оберегаешь от ошибок (кассовый разрыв, "
    "неподъёмный кредит, кабальные инвесторы, слив денег в неработающие каналы).\n"
    "3. Если человек хочет рискованное решение — честно покажи цену вопроса и альтернативу, а не просто запрети.\n"
    "4. По финансированию (кредиты, гранты, инвестиции, лизинг) давай реалистичную картину под РФ, с плюсами и подводными камнями.\n"
    "5. Давай один конкретный следующий шаг с ожидаемым эффектом в деньгах.\n"
    "Соблюдай законы РФ. Не гарантируй одобрение финансирования и конкретную прибыль. Ты НЕ заменяешь аудитора, "
    "налогового консультанта и юриста — при серьёзных решениях рекомендуй проверку у профильного специалиста.\n"
    "ФОРМАТ: живой деловой текст на «вы», 3-6 предложений, без лишних списков, будто пишешь собственнику в рабочий чат. "
    "В конце — один ясный шаг или уточняющий вопрос по цифрам."
)


def call_coach(messages, deadline=24):
    """Диалоговый вызов ИИ-финансиста (обычный текст, не JSON)."""
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    try:
        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
            'messages': messages,
            'temperature': 0.6,
            'max_tokens': 750,
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
                "SELECT id, role, content, created_at FROM fin_advisor_journal "
                "WHERE user_id = %s ORDER BY created_at ASC, id ASC LIMIT 200", (user_id,))
            items = [{'id': r[0], 'role': r[1], 'content': r[2],
                      'created_at': r[3].isoformat() if r[3] else None} for r in cur.fetchall()]
            return ok({'coach_access': coach, 'items': items})
    finally:
        conn.close()


def handle_journal_post(headers, body):
    """Записывает вопрос в дневник и возвращает ответ финансиста-консультанта.
    Доступно только пользователям, оплатившим доступ."""
    text = (body.get('content') or '').strip()[:4000]
    if not text:
        return err('Напишите вопрос финансисту', 400)
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            if not has_coach_access(cur, user_id):
                return err('Доступ к финансисту откроется после оплаты', 402)

            cur.execute("SELECT goal, direction, plan FROM fin_advisor_reports "
                        "WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user_id,))
            prow = cur.fetchone()
            plan_context = ''
            if prow:
                goal, direction, plan = prow
                verdict = (plan or {}).get('verdict', {}) if isinstance(plan, dict) else {}
                metrics = (plan or {}).get('metrics', {}) if isinstance(plan, dict) else {}
                summary = verdict.get('summary', '') if isinstance(verdict, dict) else ''
                plan_context = (f"Запрос собственника: {goal or '—'}. Оценка устойчивости: {direction or '—'}. "
                                f"Вывод по анализу: {summary or '—'}. Метрики: {json.dumps(metrics, ensure_ascii=False)[:500]}.")

            cur.execute("SELECT role, content FROM fin_advisor_journal "
                        "WHERE user_id = %s ORDER BY created_at DESC, id DESC LIMIT 10", (user_id,))
            history = list(reversed(cur.fetchall()))

            messages = [{'role': 'system', 'content': COACH_PROMPT}]
            if plan_context:
                messages.append({'role': 'system', 'content': plan_context})
            for role, content in history:
                messages.append({'role': 'assistant' if role == 'coach' else 'user', 'content': content})
            messages.append({'role': 'user', 'content': text})

            cur.execute("INSERT INTO fin_advisor_journal (user_id, role, content) VALUES (%s,'user',%s)",
                        (user_id, text))
            conn.commit()

            reply, error = call_coach(messages)
            if not reply:
                reply = ('Давайте по цифрам. Чтобы дать точный ответ, мне нужно опереться на ваши показатели: '
                         'выручку, расходы, маржу и остаток денег. Напишите ключевые цифры по вашему вопросу — '
                         'и я разложу решение с оценкой эффекта и рисков.')

            cur.execute("INSERT INTO fin_advisor_journal (user_id, role, content) VALUES (%s,'coach',%s) RETURNING id, created_at",
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
    client_ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')

    if action == 'generate_plan' and method == 'POST':
        return handle_generate(body, client_ip)
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