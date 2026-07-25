"""
Business: «Оркестратор» — конструктор онбординга и координации удалённых команд.
Руководитель вводит роль исполнителя и специфику проекта → ИИ собирает персональный трек адаптации:
матрица навыков и артефактов, план онбординга 3-5 дней, микрозадачи с критериями «готово»,
входной контроль (тест+кейс), карта рисков и метрик. Трек показываем бесплатно.
PRO-доступ (course_id 9203) открывает рабочий дашборд: проекты, исполнители, задачи со статусами,
карточки качества и сводные метрики/риски по каждому исполнителю.

Действия (query ?action= или body.action):
Публичные:
- generate_track (POST): по роли+проекту генерирует трек онбординга (ИИ), rate-limit по IP
- submit (POST): заявка на пилот + трек в БД, уведомление в MAX
- leads_list (GET, X-Admin-Pin): заявки для менеджера
PRO (X-Auth-Token + оплата 9203):
- pro_access (GET): проверить доступ
- projects_list (GET): проекты пользователя
- project_create (POST): создать проект (можно из сгенерированного трека)
- project_delete (POST): удалить проект и связанные записи
- performer_add (POST): добавить исполнителя
- performer_update (POST): скрининг/данные исполнителя
- task_add (POST): добавить микрозадачу
- task_update (POST): статус/правки задачи
- feedback_add (POST): карточка качества → пересчёт метрик исполнителя
- dashboard (GET, ?project_id=): полный срез проекта (исполнители, задачи, метрики, риски)

Args: event (httpMethod, body, queryStringParameters, headers), context
Returns: JSON
"""
import json
import os
import re
import urllib.request
from datetime import datetime, timezone
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

PRO_COURSE_ID = 9203  # «Оркестратор PRO» — рабочий дашборд
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_RE = re.compile(r'^[+\d][\d\s()\-]{5,}$')
MAX_API_BASE = "https://botapi.max.ru"

TASK_STATUSES = ('todo', 'in_progress', 'review', 'revision', 'done')
SCREEN_STATUSES = ('pending', 'ok', 'train', 'reject')


def get_db():
    dsn = os.environ.get('DATABASE_URL', '')
    return psycopg2.connect(dsn) if dsn else None


def resolve_user(cur, token):
    if not token:
        return None
    cur.execute(
        "SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token = %s LIMIT 1",
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


def has_pro_access(cur, user_id):
    cur.execute(
        "SELECT 1 FROM course_purchases WHERE user_id = %s AND course_id = %s AND status = 'paid' LIMIT 1",
        (user_id, PRO_COURSE_ID))
    return cur.fetchone() is not None


def get_token(headers):
    return (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()


def ok(payload, status=200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(payload, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return ok({'error': msg}, status)


def _clip(v, n):
    return str(v or '')[:n]


def rate_limited(bucket_key, limit, window_sec):
    conn = get_db()
    if conn is None:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM ai_rate_limit WHERE ts < now() - (%s || ' seconds')::interval",
                        (str(window_sec),))
            cur.execute("SELECT count(*) FROM ai_rate_limit WHERE bucket_key = %s "
                        "AND ts > now() - (%s || ' seconds')::interval",
                        (bucket_key[:120], str(window_sec)))
            if cur.fetchone()[0] >= limit:
                conn.commit()
                return True
            cur.execute("INSERT INTO ai_rate_limit (bucket_key) VALUES (%s)", (bucket_key[:120],))
            conn.commit()
            return False
    except Exception as e:
        print(f"[orchestrator] rate_limit error: {type(e).__name__}")
        return False
    finally:
        conn.close()


def notify_max(text):
    token = os.environ.get('MAX_BOT_TOKEN', '')
    ident = os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return
    for param in ('chat_id', 'user_id'):
        try:
            url = f"{MAX_API_BASE}/messages?{param}={ident}"
            data = json.dumps({'text': text}).encode('utf-8')
            req = urllib.request.Request(url, data=data, method='POST',
                                         headers={'Content-Type': 'application/json', 'Authorization': token})
            with urllib.request.urlopen(req, timeout=10):
                return
        except Exception:
            continue


def call_polza(messages, deadline=26):
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    try:
        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
            'messages': messages,
            'temperature': 0.55,
            'max_tokens': 5000,
            'response_format': {'type': 'json_object'},
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions', data=payload,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            method='POST')
        with urllib.request.urlopen(req, timeout=deadline) as r:
            data = json.loads(r.read().decode('utf-8'))
            raw = data['choices'][0]['message']['content'].strip()
            raw = re.sub(r'^```json\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            return json.loads(raw), None
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


# ═══════════════════════════ ИИ-ГЕНЕРАТОР ТРЕКА ═══════════════════════════

SYSTEM_PROMPT = (
    "Ты — сеньор-руководитель проектов и HR-эксперт по удалённым командам на платформе УЧИСЬПРО. "
    "Твоя задача — по роли исполнителя и специфике проекта собрать чёткий, практичный трек адаптации и "
    "координации фрилансера/удалёнщика. Никакой воды: только то, что реально помогает быстро ввести человека "
    "в проект и держать качество под контролем. Учитывай специфику проекта в каждом блоке.\n"
    "Пиши по-русски, конкретно, языком руководителя. Обращайся на «вы». Соблюдай законы РФ.\n"
    "Верни СТРОГО JSON такого вида: {"
    "\"track_title\": строка (ёмкое название трека под эту роль и проект), "
    "\"summary\": строка (2-3 предложения — суть трека и что он даёт руководителю), "
    "\"skill_matrix\": [{\"skill\": строка (компетенция), \"level\": строка (нужный уровень: базовый/уверенный/эксперт), "
    "\"why\": строка (зачем в этом проекте)} — 5-8 ключевых компетенций роли], "
    "\"artifacts\": [строки — 3-5 артефактов для проверки на входе: портфолио, тестовое, сертификаты, доступы], "
    "\"screening\": {\"test_questions\": [строки — 3-5 вопросов теста на уровень], "
    "\"mini_case\": строка (короткий практический кейс-задание для проверки в контексте проекта), "
    "\"pass_criteria\": строка (как понять, что кандидат прошёл)}, "
    "\"onboarding\": [{\"day\": строка (например «День 1»), \"goal\": строка (цель дня), "
    "\"steps\": [строки — 2-4 конкретных шага: доступы, регламенты, SLA, знакомство], "
    "\"checkpoint\": строка (контрольная точка дня — что должно быть готово)} — 3-5 дней], "
    "\"tasks\": [{\"title\": строка (микрозадача первых дней), \"done_criteria\": строка (чёткое «как поймём, что готово»), "
    "\"deliverable\": строка (формат сдачи: ссылка/файл/демо)} — 4-6 стартовых задач], "
    "\"risks\": [{\"risk\": строка (типовой риск с таким исполнителем/ролью), \"signal\": строка (по какому сигналу заметить рано), "
    "\"action\": строка (что сделать руководителю)} — 3-5 рисков], "
    "\"metrics\": [строки — 4-6 метрик, за которыми руководителю следить: скорость, число правок, "
    "соблюдение сроков, качество сдачи, коммуникация]"
    "}"
)


def build_user_message(role_title, brief):
    parts = [f"Роль исполнителя: {role_title}"]
    if brief:
        parts.append(f"Специфика проекта: {brief}")
    parts.append("Собери трек адаптации и координации под эту роль и проект. Верни строго JSON.")
    return '\n'.join(parts)


FALLBACK_TRACK = {
    'track_title': 'Быстрый ввод исполнителя в проект',
    'summary': 'Базовый трек адаптации: проверка на входе, онбординг по дням и первые задачи с чёткими критериями. '
               'Оставьте заявку — соберём детальный трек под вашу роль и проект.',
    'skill_matrix': [
        {'skill': 'Ключевые навыки роли', 'level': 'уверенный', 'why': 'Основа качества в вашем проекте'},
        {'skill': 'Коммуникация и самоорганизация', 'level': 'уверенный', 'why': 'Критично для удалённой работы'},
    ],
    'artifacts': ['Портфолио с релевантными работами', 'Тестовое задание', 'Доступы и NDA'],
    'screening': {
        'test_questions': ['Опыт в похожих проектах?', 'Как организуете работу удалённо?', 'Как принимаете правки?'],
        'mini_case': 'Небольшое практическое задание в контексте проекта на 30-60 минут.',
        'pass_criteria': 'Задание выполнено в срок и соответствует базовым требованиям.',
    },
    'onboarding': [
        {'day': 'День 1', 'goal': 'Доступы и контекст', 'steps': ['Выдать доступы', 'Показать регламенты', 'Объяснить SLA'],
         'checkpoint': 'Исполнитель имеет всё для старта'},
        {'day': 'День 2-3', 'goal': 'Первая задача', 'steps': ['Дать пилотную задачу', 'Сверить понимание критериев'],
         'checkpoint': 'Первая задача сдана и принята'},
    ],
    'tasks': [
        {'title': 'Пилотная задача', 'done_criteria': 'Соответствует критериям, сдана в срок', 'deliverable': 'Ссылка/файл'},
    ],
    'risks': [
        {'risk': 'Затягивание сроков', 'signal': 'Нет промежуточных результатов', 'action': 'Ввести ежедневный статус'},
    ],
    'metrics': ['Скорость сдачи', 'Число правок', 'Соблюдение сроков', 'Качество'],
    'is_fallback': True,
}


def clean_track(t):
    if not isinstance(t, dict):
        return FALLBACK_TRACK
    try:
        def norm_dicts(raw, fields, limit):
            out = []
            for item in (raw or [])[:limit]:
                if isinstance(item, dict):
                    out.append({f: _clip(item.get(f), ln) for f, ln in fields.items()})
            return out

        scr = t.get('screening') if isinstance(t.get('screening'), dict) else {}
        onboarding = []
        for d in (t.get('onboarding') or [])[:6]:
            if not isinstance(d, dict):
                continue
            onboarding.append({
                'day': _clip(d.get('day'), 30),
                'goal': _clip(d.get('goal'), 200),
                'steps': [_clip(s, 220) for s in (d.get('steps') or [])][:5],
                'checkpoint': _clip(d.get('checkpoint'), 250),
            })

        out = {
            'track_title': _clip(t.get('track_title') or FALLBACK_TRACK['track_title'], 200),
            'summary': _clip(t.get('summary'), 700),
            'skill_matrix': norm_dicts(t.get('skill_matrix'), {'skill': 120, 'level': 40, 'why': 250}, 10),
            'artifacts': [_clip(a, 200) for a in (t.get('artifacts') or [])][:6],
            'screening': {
                'test_questions': [_clip(q, 250) for q in (scr.get('test_questions') or [])][:6],
                'mini_case': _clip(scr.get('mini_case'), 500),
                'pass_criteria': _clip(scr.get('pass_criteria'), 300),
            },
            'onboarding': onboarding,
            'tasks': norm_dicts(t.get('tasks'), {'title': 300, 'done_criteria': 500, 'deliverable': 200}, 8),
            'risks': norm_dicts(t.get('risks'), {'risk': 200, 'signal': 250, 'action': 250}, 6),
            'metrics': [_clip(m, 120) for m in (t.get('metrics') or [])][:8],
            'is_fallback': False,
        }
        if not out['skill_matrix'] or not out['onboarding']:
            return FALLBACK_TRACK
        return out
    except Exception:
        return FALLBACK_TRACK


def handle_generate(body, client_ip=''):
    role_title = (body.get('role_title') or '').strip()[:200]
    brief = (body.get('brief') or body.get('project_brief') or '').strip()[:1000]
    if not role_title:
        return err('Укажите роль исполнителя', 400)
    if client_ip and rate_limited(f'orchestrator:generate:{client_ip}', 8, 600):
        return err('Слишком много запросов. Попробуйте через несколько минут.', 429)

    messages = [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': build_user_message(role_title, brief)},
    ]
    track, error = call_polza(messages)
    if track is None:
        print(f"[orchestrator] generate fallback: {error}")
        track = FALLBACK_TRACK
    else:
        track = clean_track(track)
    return ok({'track': track})


# ═══════════════════ ПЛАНИРОВЩИК РЕСУРСОВ (сами / ИИ / внешний) ═══════════════════

RESOURCE_PROMPT = (
    "Ты — операционный директор и ресурс-менеджер на платформе УЧИСЬПРО. Тебе дают список задач проекта. "
    "Твоя задача — честно распределить каждую задачу по способу выполнения, чтобы закрыть проект быстрее, "
    "дешевле и надёжнее. Реши по каждой задаче ОДИН из вариантов:\n"
    "- «self» — команда справится своими силами / силами младшего сотрудника (простая рутина, внутренние операции);\n"
    "- «ai» — реально автоматизировать нейросетью/скриптом (черновики текстов, типовой контент, рутина, разбор данных);\n"
    "- «external» — нужен живой внешний специалист с опытом и экспертизой, которого не заменить своими силами или ИИ.\n"
    "Решай по факторам: может ли это качественно сделать ИИ; это ли рутина для своих; нужна ли редкая экспертиза; "
    "что дешевле и быстрее — сделать самим или отдать. Не отправляй на внешний подряд то, что закрывается ИИ или своими силами. "
    "Для КАЖДОЙ задачи с вердиктом «external» дай полный пакет для подбора исполнителя.\n"
    "Пиши по-русски, конкретно, реалистично под рынок РФ. Соблюдай законы РФ, не гарантируй конкретную цену — давай вилку.\n"
    "Верни СТРОГО JSON: {"
    "\"summary\": строка (2-3 предложения: сколько задач закроем сами/ИИ, для скольких нужен внешний спец, и главный вывод по экономии), "
    "\"self_count\": число, \"ai_count\": число, \"external_count\": число, "
    "\"items\": [{"
    "\"task\": строка (формулировка задачи), "
    "\"mode\": строка (одно из: «self», «ai», «external»), "
    "\"reason\": строка (1-2 предложения почему именно так — с опорой на факторы), "
    "\"ai_hint\": строка (если mode=ai: чем конкретно и как автоматизировать; иначе пустая строка), "
    "\"hiring\": (ТОЛЬКО если mode=external, иначе null) {"
    "\"profile\": строка (профиль исполнителя: навыки, уровень, опыт — что должен уметь), "
    "\"vacancy\": строка (готовый текст мини-вакансии/брифа для размещения и ТЗ фрилансеру), "
    "\"budget\": строка (реалистичная вилка цены под РФ), \"eta\": строка (ориентировочный срок), "
    "\"where\": [строки — 2-4 площадки, где искать такого исполнителя], "
    "\"interview\": [строки — 2-4 проверочных вопроса или мини-тест для отбора]}"
    "} — по одному объекту на каждую задачу]"
    "}"
)


def build_resource_message(role_title, brief, tasks):
    parts = []
    if role_title:
        parts.append(f"Роль/направление: {role_title}")
    if brief:
        parts.append(f"Специфика проекта: {brief}")
    parts.append("Задачи проекта:")
    for i, t in enumerate(tasks, 1):
        parts.append(f"{i}. {t}")
    parts.append("Распредели каждую задачу (self/ai/external) и для внешних дай пакет подбора. Верни строго JSON.")
    return '\n'.join(parts)


def clean_resource_plan(p, tasks):
    if not isinstance(p, dict):
        return None
    try:
        items = []
        for it in (p.get('items') or [])[:20]:
            if not isinstance(it, dict):
                continue
            mode = it.get('mode') if it.get('mode') in ('self', 'ai', 'external') else 'self'
            obj = {
                'task': _clip(it.get('task'), 400),
                'mode': mode,
                'reason': _clip(it.get('reason'), 400),
                'ai_hint': _clip(it.get('ai_hint'), 400) if mode == 'ai' else '',
                'hiring': None,
            }
            if mode == 'external' and isinstance(it.get('hiring'), dict):
                h = it['hiring']
                obj['hiring'] = {
                    'profile': _clip(h.get('profile'), 600),
                    'vacancy': _clip(h.get('vacancy'), 1500),
                    'budget': _clip(h.get('budget'), 120),
                    'eta': _clip(h.get('eta'), 120),
                    'where': [_clip(w, 120) for w in (h.get('where') or [])][:5],
                    'interview': [_clip(q, 300) for q in (h.get('interview') or [])][:5],
                }
            if obj['task']:
                items.append(obj)
        if not items:
            return None
        counts = {'self': 0, 'ai': 0, 'external': 0}
        for it in items:
            counts[it['mode']] += 1
        return {
            'summary': _clip(p.get('summary'), 700),
            'self_count': counts['self'],
            'ai_count': counts['ai'],
            'external_count': counts['external'],
            'items': items,
        }
    except Exception:
        return None


def handle_resource_plan(body, client_ip=''):
    role_title = (body.get('role_title') or '').strip()[:200]
    brief = (body.get('brief') or body.get('project_brief') or '').strip()[:1000]
    raw_tasks = body.get('tasks')
    tasks = []
    if isinstance(raw_tasks, list):
        for t in raw_tasks[:20]:
            s = str(t).strip()[:400]
            if s:
                tasks.append(s)
    if not tasks:
        return err('Добавьте хотя бы одну задачу', 400)
    if client_ip and rate_limited(f'orchestrator:resource:{client_ip}', 8, 600):
        return err('Слишком много запросов. Попробуйте через несколько минут.', 429)

    messages = [
        {'role': 'system', 'content': RESOURCE_PROMPT},
        {'role': 'user', 'content': build_resource_message(role_title, brief, tasks)},
    ]
    raw, error = call_polza(messages)
    plan = clean_resource_plan(raw, tasks) if raw is not None else None
    if plan is None:
        print(f"[orchestrator] resource_plan fallback: {error}")
        # Безопасный дефолт: помечаем всё как «решить вручную» через self
        plan = {
            'summary': 'Не удалось собрать раскладку автоматически. Пройдитесь по задачам вручную: '
                       'что закроете сами, что — с помощью ИИ, а для чего нужен внешний специалист.',
            'self_count': len(tasks), 'ai_count': 0, 'external_count': 0,
            'items': [{'task': t, 'mode': 'self', 'reason': 'Требует ручной оценки.',
                       'ai_hint': '', 'hiring': None} for t in tasks],
            'is_fallback': True,
        }
    return ok({'plan': plan})


def handle_submit(body):
    name = (body.get('contact_name') or '').strip()[:160]
    email = (body.get('contact_email') or '').strip().lower()[:200]
    phone = (body.get('contact_phone') or '').strip()[:40]
    company = (body.get('company') or '').strip()[:200]
    role_title = (body.get('role_title') or '').strip()[:200]
    brief = (body.get('project_brief') or body.get('brief') or '').strip()[:1000]
    message = (body.get('message') or '').strip()[:3000]
    track = body.get('track') if isinstance(body.get('track'), dict) else None
    utm = body.get('utm') if isinstance(body.get('utm'), dict) else None

    if not name or len(name) < 2:
        return err('Укажите имя', 400)
    if email and not EMAIL_RE.match(email):
        return err('Email указан некорректно', 400)
    if phone and not PHONE_RE.match(phone):
        return err('Телефон указан некорректно', 400)
    if not email and not phone:
        return err('Оставьте email или телефон для связи', 400)

    track_title = (track.get('track_title') if track else '') or ''
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO orch_leads (contact_name, contact_email, contact_phone, company, "
                "role_title, project_brief, track, track_title, message, utm) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (name, email or None, phone or None, company or None, role_title or None,
                 brief or None, json.dumps(track, ensure_ascii=False) if track else None,
                 track_title[:300] or None, message or None,
                 json.dumps(utm, ensure_ascii=False) if utm else None))
            lid = cur.fetchone()[0]
            conn.commit()
    finally:
        conn.close()

    lines = [f"🎼 Заявка «Оркестратор» #{lid}", "", f"👤 {name}"]
    contacts = [c for c in (email, phone) if c]
    if contacts:
        lines.append("📞 " + " · ".join(contacts))
    if company:
        lines.append(f"🏢 {company}")
    if role_title:
        lines.append(f"🎯 Роль: {role_title}")
    if track_title:
        lines.append(f"📘 Трек: {track_title}")
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
                "SELECT id, contact_name, contact_email, contact_phone, company, role_title, "
                "track_title, message, status, note, created_at FROM orch_leads "
                "ORDER BY created_at DESC LIMIT 500")
            items = [{
                'id': r[0], 'contact_name': r[1], 'contact_email': r[2], 'contact_phone': r[3],
                'company': r[4], 'role_title': r[5], 'track_title': r[6], 'message': r[7],
                'status': r[8], 'note': r[9], 'created_at': r[10].isoformat() if r[10] else None,
            } for r in cur.fetchall()]
            return ok({'items': items, 'total': len(items)})
    finally:
        conn.close()


# ═══════════════════════════ PRO: РАБОЧИЙ ДАШБОРД ═══════════════════════════

def _require_pro(cur, headers):
    """Возвращает (user_id, None) при доступе или (None, error_response)."""
    user_id = resolve_user(cur, get_token(headers))
    if not user_id:
        return None, err('Требуется вход', 401)
    if not has_pro_access(cur, user_id):
        return None, err('Доступ к дашборду откроется после оплаты', 402)
    return user_id, None


def _owns_project(cur, user_id, project_id):
    cur.execute("SELECT 1 FROM orch_projects WHERE id = %s AND user_id = %s", (int(project_id), user_id))
    return cur.fetchone() is not None


def handle_pro_access(headers):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, get_token(headers))
            if not user_id:
                return err('Требуется вход', 401)
            return ok({'pro_access': has_pro_access(cur, user_id), 'price': 15000, 'course_id': PRO_COURSE_ID})
    finally:
        conn.close()


def handle_projects_list(headers):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            cur.execute(
                "SELECT p.id, p.name, p.role_title, p.brief, p.created_at, "
                "(SELECT count(*) FROM orch_performers pf WHERE pf.project_id = p.id), "
                "(SELECT count(*) FROM orch_tasks t WHERE t.project_id = p.id), "
                "(SELECT count(*) FROM orch_tasks t WHERE t.project_id = p.id AND t.status = 'done') "
                "FROM orch_projects p WHERE p.user_id = %s ORDER BY p.id DESC", (user_id,))
            items = [{
                'id': r[0], 'name': r[1], 'role_title': r[2], 'brief': r[3],
                'created_at': r[4].isoformat() if r[4] else None,
                'performers': r[5], 'tasks_total': r[6], 'tasks_done': r[7],
            } for r in cur.fetchall()]
            return ok({'items': items})
    finally:
        conn.close()


def handle_project_create(headers, body):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            name = (body.get('name') or '').strip()[:300]
            if not name:
                return err('Укажите название проекта', 400)
            role_title = (body.get('role_title') or '').strip()[:200]
            brief = (body.get('brief') or '').strip()[:1000]
            track = body.get('track') if isinstance(body.get('track'), dict) else None
            cur.execute(
                "INSERT INTO orch_projects (user_id, name, role_title, brief, track) "
                "VALUES (%s,%s,%s,%s,%s) RETURNING id",
                (user_id, name, role_title or None, brief or None,
                 json.dumps(track, ensure_ascii=False) if track else None))
            pid = cur.fetchone()[0]
            # Автосоздание стартовых задач из трека
            if track and isinstance(track.get('tasks'), list):
                for tk in track['tasks'][:8]:
                    if isinstance(tk, dict) and tk.get('title'):
                        cur.execute(
                            "INSERT INTO orch_tasks (project_id, user_id, title, done_criteria, deliverable) "
                            "VALUES (%s,%s,%s,%s,%s)",
                            (pid, user_id, _clip(tk.get('title'), 400),
                             _clip(tk.get('done_criteria'), 1000), _clip(tk.get('deliverable'), 300)))
            conn.commit()
            return ok({'ok': True, 'project_id': pid})
    finally:
        conn.close()


def handle_project_delete(headers, body):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            pid = int(body.get('project_id') or 0)
            if not _owns_project(cur, user_id, pid):
                return err('Проект не найден', 404)
            # Чистим связанные записи (нет ON DELETE CASCADE)
            cur.execute("DELETE FROM orch_feedback WHERE user_id = %s AND performer_id IN "
                        "(SELECT id FROM orch_performers WHERE project_id = %s)", (user_id, pid))
            cur.execute("DELETE FROM orch_tasks WHERE project_id = %s AND user_id = %s", (pid, user_id))
            cur.execute("DELETE FROM orch_performers WHERE project_id = %s AND user_id = %s", (pid, user_id))
            cur.execute("DELETE FROM orch_projects WHERE id = %s AND user_id = %s", (pid, user_id))
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def handle_performer_add(headers, body):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            pid = int(body.get('project_id') or 0)
            if not _owns_project(cur, user_id, pid):
                return err('Проект не найден', 404)
            name = (body.get('name') or '').strip()[:200]
            if not name:
                return err('Укажите имя исполнителя', 400)
            contact = (body.get('contact') or '').strip()[:200]
            cur.execute(
                "INSERT INTO orch_performers (project_id, user_id, name, contact) "
                "VALUES (%s,%s,%s,%s) RETURNING id", (pid, user_id, name, contact or None))
            conn.commit()
            return ok({'ok': True, 'performer_id': cur.fetchone()[0]})
    finally:
        conn.close()


def handle_performer_update(headers, body):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            perf_id = int(body.get('performer_id') or 0)
            cur.execute("SELECT 1 FROM orch_performers WHERE id = %s AND user_id = %s", (perf_id, user_id))
            if not cur.fetchone():
                return err('Исполнитель не найден', 404)
            sets, vals = [], []
            if 'screening' in body:
                sc = body['screening']
                if sc not in SCREEN_STATUSES:
                    return err('Неверный статус скрининга', 400)
                sets.append("screening = %s")
                vals.append(sc)
            if 'name' in body:
                sets.append("name = %s")
                vals.append(_clip(body['name'], 200))
            if 'contact' in body:
                sets.append("contact = %s")
                vals.append(_clip(body['contact'], 200))
            if not sets:
                return err('Нечего обновлять', 400)
            sets.append("updated_at = now()")
            vals += [perf_id, user_id]
            cur.execute(f"UPDATE orch_performers SET {', '.join(sets)} WHERE id = %s AND user_id = %s", tuple(vals))
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def handle_task_add(headers, body):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            pid = int(body.get('project_id') or 0)
            if not _owns_project(cur, user_id, pid):
                return err('Проект не найден', 404)
            title = (body.get('title') or '').strip()[:400]
            if not title:
                return err('Укажите название задачи', 400)
            perf_id = body.get('performer_id')
            perf_id = int(perf_id) if perf_id else None
            due = (body.get('due_date') or '').strip()[:10] or None
            cur.execute(
                "INSERT INTO orch_tasks (project_id, performer_id, user_id, title, done_criteria, deliverable, due_date) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (pid, perf_id, user_id, title, _clip(body.get('done_criteria'), 1000),
                 _clip(body.get('deliverable'), 300), due))
            conn.commit()
            return ok({'ok': True, 'task_id': cur.fetchone()[0]})
    finally:
        conn.close()


def handle_task_update(headers, body):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            tid = int(body.get('task_id') or 0)
            cur.execute("SELECT status FROM orch_tasks WHERE id = %s AND user_id = %s", (tid, user_id))
            row = cur.fetchone()
            if not row:
                return err('Задача не найдена', 404)
            sets, vals = [], []
            if 'status' in body:
                st = body['status']
                if st not in TASK_STATUSES:
                    return err('Неверный статус', 400)
                sets.append("status = %s")
                vals.append(st)
                # Переход в revision увеличивает счётчик правок
                if st == 'revision':
                    sets.append("revisions = revisions + 1")
            if 'performer_id' in body:
                pf = body.get('performer_id')
                sets.append("performer_id = %s")
                vals.append(int(pf) if pf else None)
            if 'title' in body:
                sets.append("title = %s")
                vals.append(_clip(body['title'], 400))
            if 'done_criteria' in body:
                sets.append("done_criteria = %s")
                vals.append(_clip(body['done_criteria'], 1000))
            if 'due_date' in body:
                sets.append("due_date = %s")
                vals.append((body.get('due_date') or '')[:10] or None)
            if not sets:
                return err('Нечего обновлять', 400)
            sets.append("updated_at = now()")
            vals += [tid, user_id]
            cur.execute(f"UPDATE orch_tasks SET {', '.join(sets)} WHERE id = %s AND user_id = %s", tuple(vals))
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def _recalc_performer(cur, user_id, perf_id):
    """Пересчитывает средние метрики и уровень риска исполнителя по карточкам качества и задачам."""
    cur.execute(
        "SELECT avg(quality), avg(speed), avg(communication), avg(deadline) "
        "FROM orch_feedback WHERE performer_id = %s AND user_id = %s", (perf_id, user_id))
    q, sp, cm, dl = cur.fetchone()
    # Риск: низкое качество/сроки или много правок в задачах
    cur.execute("SELECT coalesce(sum(revisions),0), count(*) FROM orch_tasks WHERE performer_id = %s AND user_id = %s",
                (perf_id, user_id))
    revs, tcount = cur.fetchone()
    risk = 'low'
    weak = [x for x in (q, dl) if x is not None and float(x) < 3]
    rev_ratio = (float(revs) / tcount) if tcount else 0
    if (q is not None and float(q) < 2.5) or (dl is not None and float(dl) < 2.5) or rev_ratio >= 1.5:
        risk = 'high'
    elif weak or rev_ratio >= 0.8:
        risk = 'medium'

    def r1(v):
        return round(float(v), 1) if v is not None else None

    cur.execute(
        "UPDATE orch_performers SET quality_avg=%s, speed_avg=%s, comm_avg=%s, deadline_avg=%s, "
        "risk_level=%s, updated_at=now() WHERE id=%s AND user_id=%s",
        (r1(q), r1(sp), r1(cm), r1(dl), risk, perf_id, user_id))


def handle_feedback_add(headers, body):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            perf_id = int(body.get('performer_id') or 0)
            cur.execute("SELECT 1 FROM orch_performers WHERE id = %s AND user_id = %s", (perf_id, user_id))
            if not cur.fetchone():
                return err('Исполнитель не найден', 404)

            def score(k):
                v = body.get(k)
                try:
                    return max(1, min(5, int(v))) if v is not None else None
                except (TypeError, ValueError):
                    return None

            task_id = body.get('task_id')
            task_id = int(task_id) if task_id else None
            cur.execute(
                "INSERT INTO orch_feedback (performer_id, task_id, user_id, quality, speed, communication, deadline, comment) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                (perf_id, task_id, user_id, score('quality'), score('speed'),
                 score('communication'), score('deadline'), _clip(body.get('comment'), 4000) or None))
            _recalc_performer(cur, user_id, perf_id)
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def handle_dashboard(headers, params):
    conn = get_db()
    if conn is None:
        return err('База данных недоступна', 500)
    try:
        with conn.cursor() as cur:
            user_id, e = _require_pro(cur, headers)
            if e:
                return e
            pid = int(params.get('project_id') or 0)
            cur.execute("SELECT id, name, role_title, brief, track FROM orch_projects WHERE id = %s AND user_id = %s",
                        (pid, user_id))
            prow = cur.fetchone()
            if not prow:
                return err('Проект не найден', 404)
            project = {'id': prow[0], 'name': prow[1], 'role_title': prow[2], 'brief': prow[3], 'track': prow[4]}

            cur.execute(
                "SELECT id, name, contact, screening, quality_avg, speed_avg, comm_avg, deadline_avg, risk_level "
                "FROM orch_performers WHERE project_id = %s AND user_id = %s ORDER BY id", (pid, user_id))
            performers = [{
                'id': r[0], 'name': r[1], 'contact': r[2], 'screening': r[3],
                'quality_avg': float(r[4]) if r[4] is not None else None,
                'speed_avg': float(r[5]) if r[5] is not None else None,
                'comm_avg': float(r[6]) if r[6] is not None else None,
                'deadline_avg': float(r[7]) if r[7] is not None else None,
                'risk_level': r[8],
            } for r in cur.fetchall()]

            cur.execute(
                "SELECT id, performer_id, title, done_criteria, deliverable, due_date, status, revisions "
                "FROM orch_tasks WHERE project_id = %s AND user_id = %s ORDER BY id", (pid, user_id))
            tasks = [{
                'id': r[0], 'performer_id': r[1], 'title': r[2], 'done_criteria': r[3],
                'deliverable': r[4], 'due_date': r[5].isoformat() if r[5] else None,
                'status': r[6], 'revisions': r[7],
            } for r in cur.fetchall()]

            total = len(tasks)
            done = sum(1 for t in tasks if t['status'] == 'done')
            revisions = sum(t['revisions'] for t in tasks)
            in_progress = sum(1 for t in tasks if t['status'] in ('in_progress', 'review', 'revision'))
            high_risk = [p['name'] for p in performers if p['risk_level'] == 'high']
            metrics = {
                'tasks_total': total,
                'tasks_done': done,
                'tasks_in_progress': in_progress,
                'completion_pct': round(done / total * 100) if total else 0,
                'revisions_total': revisions,
                'performers_total': len(performers),
                'high_risk_performers': high_risk,
            }
            return ok({'project': project, 'performers': performers, 'tasks': tasks, 'metrics': metrics})
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

    # Публичные
    if action == 'generate_track' and method == 'POST':
        return handle_generate(body, client_ip)
    if action == 'resource_plan' and method == 'POST':
        return handle_resource_plan(body, client_ip)
    if action == 'submit' and method == 'POST':
        return handle_submit(body)
    if action == 'leads_list' and method == 'GET':
        return handle_leads_list(headers)
    # PRO
    if action == 'pro_access' and method == 'GET':
        return handle_pro_access(headers)
    if action == 'projects_list' and method == 'GET':
        return handle_projects_list(headers)
    if action == 'project_create' and method == 'POST':
        return handle_project_create(headers, body)
    if action == 'project_delete' and method == 'POST':
        return handle_project_delete(headers, body)
    if action == 'performer_add' and method == 'POST':
        return handle_performer_add(headers, body)
    if action == 'performer_update' and method == 'POST':
        return handle_performer_update(headers, body)
    if action == 'task_add' and method == 'POST':
        return handle_task_add(headers, body)
    if action == 'task_update' and method == 'POST':
        return handle_task_update(headers, body)
    if action == 'feedback_add' and method == 'POST':
        return handle_feedback_add(headers, body)
    if action == 'dashboard' and method == 'GET':
        return handle_dashboard(headers, params)

    return err('Неизвестное действие', 404)