"""
Модуль интенсива «Твой первый автопилот» (автоматизация для микробизнеса).
Заявки, ИИ-тренажёр (отработка навыка на клиенте-предпринимателе с фидбэком),
ИИ-проверка ДЗ по критериям, ИИ-аудит бизнеса.

POST /?action=lead            body:{name, contact, comment?, track?, source?} — заявка (БД + MAX)
POST /?action=trainer         body:{session_id, scenario_key, message, history?} — ход ИИ-тренажёра
POST /?action=check_homework  body:{session_id, lesson_key, submission} — ИИ-оценка ДЗ
POST /?action=audit           body:{description} — ИИ-аудит бизнеса (источники, потери, связка)
POST /?action=check_access    body:{email} — проверка оплаченного доступа после оплаты
GET  /?action=leads           (X-Admin-Key) — список заявок для админки
GET  /?action=ping            — health-check
"""
import json
import os
import re
import time
import urllib.request
import urllib.parse
import urllib.error
import psycopg2

ADMIN_KEY = os.environ.get('ADMIN_KEY', '')
POLZA_API_KEY = os.environ.get('POLZA_API_KEY', '')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'gpt-4o-mini'
MAX_API_BASE = 'https://botapi.max.ru'
MAX_BOT_TOKEN = os.environ.get('MAX_BOT_TOKEN', '')
MAX_CHANNEL_ID = os.environ.get('MAX_CHANNEL_ID', '')

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_RE = re.compile(r'^[\d\s\+\-\(\)]{7,20}$')

# Сценарии ИИ-тренажёра: AI играет роль «клиента/заказчика», студент отрабатывает навык.
TRAINER_SCENARIOS = {
    'leaks': {
        'title': 'Аудит: где теряются лиды',
        'persona': (
            'Ты играешь роль владельца микробизнеса (например, мебель на заказ или услуги), '
            'у которого хаос в обработке заявок: лиды приходят из разных мест, менеджеры '
            'забывают перезвонить, нет CRM. Отвечай как реальный занятой предприниматель: '
            'коротко, без терминов, иногда не понимаешь зачем что-то нужно. '
            'Задача студента (специалиста по автоматизации) — задавая вопросы, найти, ГДЕ именно '
            'теряются заявки и деньги. Не подсказывай сам — пусть выявляет потери.'
        ),
    },
    'connection': {
        'title': 'Защита связки «Заявка → CRM → Задача»',
        'persona': (
            'Ты играешь роль скептичного предпринимателя, который боится, что автоматизация — '
            'это «сложно и дорого». Студент предлагает связку: заявка с сайта автоматически '
            'попадает в CRM и ставит задачу менеджеру. Задавай возражения: «а если интернет '
            'отвалится?», «это надо программиста?», «сколько стоит?». Проверь, умеет ли студент '
            'объяснять простыми словами и снимать страхи. Если объяснил чётко — соглашайся.'
        ),
    },
    'metrics': {
        'title': 'Объяснение метрик клиенту',
        'persona': (
            'Ты играешь роль предпринимателя, который смотрит только на «сколько денег пришло» '
            'и не понимает, зачем считать конверсию и источники лидов. Студент должен объяснить, '
            'почему 3 простые метрики (лиды, конверсия, средний чек) помогут зарабатывать больше. '
            'Сопротивляйся «мне некогда в этом разбираться» — пусть студент покажет пользу на пальцах.'
        ),
    },
}

TRAINER_FEEDBACK_RULES = (
    'После основной реплики-роли ВСЕГДА добавляй с новой строки блок обратной связи в формате:\n'
    '---\n'
    '📊 Фидбэк: оцени последний ход студента по критериям — ясность объяснения, выявление '
    'проблемы, практичность решения. Одно-два предложения: что хорошо и что улучшить. '
    'Будь доброжелательным, но честным. В конце добавь "Оценка хода: N/10" (N — целое число).'
)

# Критерии проверки ДЗ для каждого дня интенсива.
HOMEWORK_CRITERIA = {
    'day1': 'Студент должен составить карту процессов своего (или вымышленного) бизнеса: откуда '
            'приходят заявки, кто их обрабатывает, где теряются. Оцени полноту и выявление узких мест.',
    'day2': 'Студент должен описать связку «Заявка → CRM → Задача менеджеру»: какие поля у карточки '
            'лида, какой триггер ставит задачу. Оцени логичность и применимость без программирования.',
    'day3': 'Студент должен описать автосценарий письма-напоминания: условие отправки (если/то), '
            'текст письма, правило эскалации. Оцени логику автоматизации.',
    'day4': 'Студент должен описать дашборд из 3 метрик (лиды, конверсия, средний чек): откуда берутся '
            'данные и какая формула воронки. Оцени корректность метрик.',
    'project': 'Финальный «Паспорт автоматизации»: карта процессов + 3 связки + план внедрения на 30 дней. '
               'Оцени целостность, реалистичность и готовность к внедрению.',
}

# Системный промпт ИИ-помощника аудита бизнеса (по методологии автора).
AUDIT_SYSTEM = (
    "Ты — помощник по автоматизации для микробизнеса платформы УЧИСЬПРО. "
    "Пользователь присылает описание своей работы (1-3 предложения). "
    "Отвечай кратко, по пунктам, без воды, только на русском. Не выдумывай факты о бизнесе — "
    "опирайся на то, что прислал пользователь, и на типовые паттерны микробизнеса.\n"
    "Верни строго JSON без markdown: "
    '{"sources": ["3 главных источника лидов"], '
    '"leaks": ["3 точки, где чаще всего теряются заявки"], '
    '"connection": "1 простая связка автоматизации без программирования (система А -> система Б -> действие)", '
    '"lead_fields": ["3 поля для карточки лида, которые обязательно добавить"], '
    '"email": {"subject": "тема письма-напоминания до 120 символов", "body": "тело письма 8-10 коротких строк"}}'
)


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d: dict, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(), 'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def is_admin(headers: dict) -> bool:
    key = (headers.get('X-Admin-Key') or headers.get('x-admin-key') or '').strip()
    return bool(ADMIN_KEY) and key == ADMIN_KEY


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def rate_limited(bucket: str, limit: int, window_sec: int) -> bool:
    """Простой rate-limit на таблице rate_limit_counter.
    Возвращает True, если лимит превышен (запрос нужно отклонить).
    Не валит основную логику при ошибке БД (fail-open для доступности)."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO rate_limit_counter (bucket_key, hits, window_start) "
                "VALUES (%s, 1, now()) "
                "ON CONFLICT (bucket_key) DO UPDATE SET "
                "hits = CASE WHEN rate_limit_counter.window_start < now() - (%s || ' seconds')::interval "
                "THEN 1 ELSE rate_limit_counter.hits + 1 END, "
                "window_start = CASE WHEN rate_limit_counter.window_start < now() - (%s || ' seconds')::interval "
                "THEN now() ELSE rate_limit_counter.window_start END "
                "RETURNING hits",
                (bucket, str(window_sec), str(window_sec)))
            hits = cur.fetchone()[0]
            conn.commit()
            return hits > limit
    except Exception:
        return False
    finally:
        conn.close()


def client_ip(event: dict) -> str:
    rc = event.get('requestContext') or {}
    ip = ((rc.get('identity') or {}).get('sourceIp')) or ''
    if not ip:
        h = event.get('headers') or {}
        ip = (h.get('X-Forwarded-For') or h.get('x-forwarded-for') or '').split(',')[0].strip()
    return ip or 'unknown'


def detect_contact_kind(contact: str) -> str:
    c = contact.strip()
    if EMAIL_RE.match(c):
        return 'email'
    if c.startswith('@') or 't.me/' in c or 'max.ru/' in c:
        return 'messenger'
    if PHONE_RE.match(c):
        return 'phone'
    return 'unknown'


def max_notify(text: str) -> bool:
    """Отправляет уведомление о заявке в наш канал MAX. Тихо игнорирует сбои."""
    if not MAX_BOT_TOKEN or not MAX_CHANNEL_ID:
        return False
    url = (f"{MAX_API_BASE}/messages?access_token={urllib.parse.quote(MAX_BOT_TOKEN, safe='')}"
           f"&chat_id={MAX_CHANNEL_ID}")
    payload = json.dumps({'text': text}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, method='POST',
                                 headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
        return True
    except (urllib.error.HTTPError, urllib.error.URLError, OSError):
        return False


def call_polza(system: str, messages: list, max_tokens: int = 700,
               temperature: float = 0.7, retries: int = 1):
    """Вызов polza.ai с ретраем на временные сбои (5xx)."""
    if not POLZA_API_KEY:
        return None
    payload = {
        'model': POLZA_MODEL,
        'messages': [{'role': 'system', 'content': system}] + messages,
        'temperature': temperature,
        'max_tokens': max_tokens,
    }
    body = json.dumps(payload).encode('utf-8')
    for attempt in range(retries + 1):
        req = urllib.request.Request(
            POLZA_URL, data=body,
            headers={'Authorization': f'Bearer {POLZA_API_KEY}', 'Content-Type': 'application/json'},
            method='POST')
        try:
            with urllib.request.urlopen(req, timeout=22) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                choices = data.get('choices') or []
                if choices:
                    content = (choices[0].get('message') or {}).get('content', '').strip()
                    if content:
                        return content
        except urllib.error.HTTPError as e:
            if e.code < 500:
                return None
        except (urllib.error.URLError, json.JSONDecodeError, OSError):
            pass
        if attempt < retries:
            time.sleep(1.2)
    return None


def handle_lead(body: dict) -> dict:
    name = (body.get('name') or '').strip()[:160]
    contact = (body.get('contact') or '').strip()[:200]
    comment = (body.get('comment') or '').strip()[:1000]
    track = (body.get('track') or 'automation').strip()[:60]
    source = (body.get('source') or 'landing').strip()[:80]

    if not name or len(name) < 2:
        return err('Укажи имя', 400)
    if not contact or len(contact) < 3:
        return err('Укажи контакт для связи (телефон, email или мессенджер)', 400)

    kind = detect_contact_kind(contact)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO intensive_leads (track, name, contact, contact_kind, comment, source) "
                "VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                (track, name, contact, kind, comment, source))
            lead_id = cur.fetchone()[0]
            conn.commit()

        # Уведомление в MAX (не критично для успеха заявки)
        notified = max_notify(
            f"🔥 Новая заявка на интенсив «Твой первый автопилот»!\n\n"
            f"Имя: {name}\n"
            f"Контакт: {contact}\n"
            f"Трек: {track}\n"
            f"{'Комментарий: ' + comment if comment else ''}\n"
            f"#заявка #автоматизация")
        if notified:
            with conn.cursor() as cur:
                cur.execute("UPDATE intensive_leads SET notified=TRUE WHERE id=%s", (lead_id,))
                conn.commit()

        return ok({'ok': True, 'id': lead_id,
                   'message': 'Заявка принята! Свяжемся с тобой в течение дня.'})
    finally:
        conn.close()


def handle_trainer(body: dict) -> dict:
    session_id = (body.get('session_id') or '').strip()[:80]
    scenario_key = (body.get('scenario_key') or 'leaks').strip()
    message = (body.get('message') or '').strip()[:2000]
    history = body.get('history') or []

    if scenario_key not in TRAINER_SCENARIOS:
        scenario_key = 'leaks'
    if not message:
        return err('Напиши свой ход', 400)

    scenario = TRAINER_SCENARIOS[scenario_key]
    system = (
        f"Ты — ИИ-тренажёр платформы УЧИСЬПРО для будущих специалистов по автоматизации микробизнеса. "
        f"Сценарий: «{scenario['title']}».\n{scenario['persona']}\n\n{TRAINER_FEEDBACK_RULES}\n\n"
        f"Отвечай только на русском. Будь реалистичным, но не грубым."
    )
    msgs = []
    for h in history[-8:]:
        role = 'user' if h.get('from') == 'user' else 'assistant'
        msgs.append({'role': role, 'content': str(h.get('text') or '')[:1500]})
    msgs.append({'role': 'user', 'content': message})

    reply = call_polza(system, msgs, max_tokens=700, temperature=0.8)
    if not reply:
        return err('ИИ-тренажёр сейчас недоступен, попробуй через минуту', 503)

    # Извлекаем оценку хода, если есть
    score = None
    m = re.search(r'Оценка хода:\s*(\d{1,2})', reply)
    if m:
        try:
            score = max(0, min(10, int(m.group(1))))
        except ValueError:
            score = None

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO intensive_trainer_attempts "
                "(session_id, scenario_key, user_input, ai_reply, score) VALUES (%s,%s,%s,%s,%s)",
                (session_id, scenario_key, message, reply, score))
            conn.commit()
    finally:
        conn.close()

    return ok({'ok': True, 'reply': reply, 'score': score})


def handle_check_homework(body: dict) -> dict:
    session_id = (body.get('session_id') or '').strip()[:80]
    lesson_key = (body.get('lesson_key') or '').strip()
    submission = (body.get('submission') or '').strip()[:5000]

    if not submission or len(submission) < 10:
        return err('Слишком короткий ответ — напиши подробнее', 400)
    criteria = HOMEWORK_CRITERIA.get(lesson_key, 'Оцени работу студента по полноте и качеству.')

    system = (
        "Ты — строгий, но доброжелательный куратор интенсива по автоматизации микробизнеса. "
        "Проверяешь домашнее задание по критериям, опираясь на практику внедрения CRM, "
        "связок и автосценариев без программирования. "
        "Никогда не выдумывай — оценивай только то, что прислал студент.\n"
        "Верни строго JSON без markdown: "
        '{"score": число 0-100, "feedback": "конкретный разбор: что хорошо, что улучшить, '
        '1-2 совета по внедрению", "verdict": "одно предложение-итог"}'
    )
    prompt = (f"Критерии оценки: {criteria}\n\nРабота студента:\n{submission}\n\n"
              f"Оцени по критериям и верни JSON.")
    raw = call_polza(system, [{'role': 'user', 'content': prompt}],
                     max_tokens=700, temperature=0.4)
    if not raw:
        return err('Проверка сейчас недоступна, попробуй через минуту', 503)

    raw = re.sub(r'^```(?:json)?\s*', '', raw.strip())
    raw = re.sub(r'\s*```$', '', raw)
    score, feedback, verdict = None, raw[:2000], ''
    try:
        parsed = json.loads(raw)
        score = int(parsed.get('score')) if parsed.get('score') is not None else None
        if score is not None:
            score = max(0, min(100, score))
        feedback = str(parsed.get('feedback') or '')[:2000]
        verdict = str(parsed.get('verdict') or '')[:300]
    except (json.JSONDecodeError, ValueError, TypeError):
        m = re.search(r'\{.*\}', raw, flags=re.DOTALL)
        if m:
            try:
                parsed = json.loads(m.group(0))
                score = int(parsed.get('score')) if parsed.get('score') is not None else None
                if score is not None:
                    score = max(0, min(100, score))
                feedback = str(parsed.get('feedback') or feedback)[:2000]
                verdict = str(parsed.get('verdict') or '')[:300]
            except (json.JSONDecodeError, ValueError, TypeError):
                pass

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO intensive_homework "
                "(session_id, lesson_key, submission, ai_score, ai_feedback, status) "
                "VALUES (%s,%s,%s,%s,%s,'checked') RETURNING id",
                (session_id, lesson_key, submission, score, feedback))
            hid = cur.fetchone()[0]
            conn.commit()
    finally:
        conn.close()

    return ok({'ok': True, 'id': hid, 'score': score, 'feedback': feedback, 'verdict': verdict})


def handle_audit(body: dict) -> dict:
    """ИИ-помощник аудита: по описанию бизнеса находит источники лидов, точки потерь
    и предлагает первую связку автоматизации."""
    description = (body.get('description') or '').strip()[:1000]
    if len(description) < 10:
        return err('Опиши свой бизнес чуть подробнее (1-3 предложения)', 400)

    raw = call_polza(AUDIT_SYSTEM, [{'role': 'user', 'content': description}],
                     max_tokens=800, temperature=0.5)
    if not raw:
        return err('ИИ-аудит сейчас недоступен, попробуй через минуту', 503)

    raw = re.sub(r'^```(?:json)?\s*', '', raw.strip())
    raw = re.sub(r'\s*```$', '', raw)
    parsed = None
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r'\{.*\}', raw, flags=re.DOTALL)
        if m:
            try:
                parsed = json.loads(m.group(0))
            except json.JSONDecodeError:
                parsed = None
    if not parsed:
        return err('Не удалось разобрать ответ ИИ, попробуй переформулировать описание', 502)

    return ok({
        'ok': True,
        'sources': [str(s)[:160] for s in (parsed.get('sources') or [])][:5],
        'leaks': [str(s)[:200] for s in (parsed.get('leaks') or [])][:5],
        'connection': str(parsed.get('connection') or '')[:500],
        'lead_fields': [str(s)[:120] for s in (parsed.get('lead_fields') or [])][:6],
        'email': {
            'subject': str((parsed.get('email') or {}).get('subject') or '')[:200],
            'body': str((parsed.get('email') or {}).get('body') or '')[:1500],
        },
    })


def handle_check_access(body: dict, ip: str = 'unknown') -> dict:
    """Проверка оплаченного доступа по email (после оплаты).
    Возвращает {access: True, token} если есть оплаченная запись.
    Если передан track — проверяем доступ именно к этому продукту
    (чтобы оплата одного курса не открывала другой).
    Rate-limit по IP защищает от перебора email."""
    # Не более 30 проверок за 10 минут с одного IP (защита от перебора чужих email).
    if rate_limited(f"chk_access:{ip}", 30, 600):
        return err('Слишком много запросов. Попробуй через несколько минут.', 429)
    email = (body.get('email') or '').strip().lower()[:200]
    track = (body.get('track') or '').strip()[:60]
    if not email or not EMAIL_RE.match(email):
        return err('Укажи email, на который оформлял оплату', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            if track:
                cur.execute(
                    "SELECT access_token, name, activated_at FROM intensive_access "
                    "WHERE lower(email) = %s AND status = 'paid' AND track = %s "
                    "ORDER BY activated_at DESC NULLS LAST LIMIT 1",
                    (email, track))
            else:
                cur.execute(
                    "SELECT access_token, name, activated_at FROM intensive_access "
                    "WHERE lower(email) = %s AND status = 'paid' "
                    "ORDER BY activated_at DESC NULLS LAST LIMIT 1",
                    (email,))
            r = cur.fetchone()
            if not r:
                return ok({'access': False,
                           'message': 'Оплата не найдена. Если ты только что оплатил — '
                                      'подожди минуту и обнови страницу.'})
            return ok({'access': True, 'token': r[0], 'name': r[1] or '',
                       'activated_at': r[2]})
    finally:
        conn.close()


def handle_leads(headers: dict) -> dict:
    if not is_admin(headers):
        return err('unauthorized', 401)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, track, name, contact, contact_kind, comment, status, source, "
                "notified, created_at FROM intensive_leads ORDER BY created_at DESC LIMIT 200")
            items = [{
                'id': r[0], 'track': r[1], 'name': r[2], 'contact': r[3], 'contact_kind': r[4],
                'comment': r[5], 'status': r[6], 'source': r[7], 'notified': r[8], 'created_at': r[9],
            } for r in cur.fetchall()]
            return ok({'items': items, 'total': len(items)})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Модуль интенсива: заявки, ИИ-тренажёр, проверка ДЗ."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'ping').strip()
    headers = event.get('headers') or {}
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}

    if action == 'ping':
        return ok({'ok': True, 'service': 'intensive'})
    if action == 'lead' and method == 'POST':
        return handle_lead(body)
    if action == 'trainer' and method == 'POST':
        return handle_trainer(body)
    if action == 'check_homework' and method == 'POST':
        return handle_check_homework(body)
    if action == 'audit' and method == 'POST':
        return handle_audit(body)
    if action == 'check_access' and method == 'POST':
        return handle_check_access(body, client_ip(event))
    if action == 'leads' and method == 'GET':
        return handle_leads(headers)

    return err('Неизвестное действие', 404)