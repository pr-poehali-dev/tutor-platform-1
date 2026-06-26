"""
Модуль интенсива «AI-ассистент / контент-менеджер».
Заявки на интенсив, ИИ-тренажёр (отработка навыка на AI-клиенте с фидбэком),
ИИ-проверка домашних заданий по критериям.

POST /?action=lead            body:{name, contact, comment?, track?, source?} — заявка (БД + MAX)
POST /?action=trainer         body:{session_id, scenario_key, message, history?} — ход ИИ-тренажёра
POST /?action=check_homework  body:{session_id, lesson_key, submission} — ИИ-оценка ДЗ
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
    'brief': {
        'title': 'Снятие брифа у заказчика',
        'persona': (
            'Ты играешь роль занятого владельца малого бизнеса (кофейня), которому нужен '
            'контент для соцсетей, но он сам плохо понимает, чего хочет. Отвечай как реальный '
            'занятой человек: коротко, иногда расплывчато, можешь уходить от темы. '
            'Твоя задача — проверить, умеет ли студент (контент-менеджер) задавать правильные '
            'уточняющие вопросы и снять чёткий бриф. Не помогай ему сам — пусть вытягивает.'
        ),
    },
    'prompt': {
        'title': 'Постановка задачи нейросети',
        'persona': (
            'Ты играешь роль придирчивого редактора, который оценивает, насколько чётко студент '
            'формулирует промпт для нейросети. Реагируй на промпт студента как ИИ: если промпт '
            'размытый — выдай слабый, общий результат и укажи, чего не хватило (контекст, формат, '
            'тон, аудитория). Если промпт хороший — похвали конкретику.'
        ),
    },
    'edit': {
        'title': 'Вычитка и правка текста',
        'persona': (
            'Ты играешь роль автора текста, который защищает свой черновик. Студент должен '
            'вежливо, но твёрдо указать на ошибки (вода, канцелярит, отсутствие структуры) '
            'и предложить улучшения. Слегка сопротивляйся, чтобы проверить аргументацию студента.'
        ),
    },
}

TRAINER_FEEDBACK_RULES = (
    'После основной реплики-роли ВСЕГДА добавляй с новой строки блок обратной связи в формате:\n'
    '---\n'
    '📊 Фидбэк: оцени последний ход студента по критериям — структура, тон, конкретика. '
    'Одно-два предложения: что хорошо и что улучшить. Будь доброжелательным, но честным. '
    'В самом конце добавь "Оценка хода: N/10" (N — целое число).'
)

# Критерии проверки ДЗ для каждого урока модуля.
HOMEWORK_CRITERIA = {
    'lesson1': 'Студент должен составить бриф из 5+ уточняющих вопросов к заказчику. '
               'Оцени полноту, конкретность вопросов и логику.',
    'lesson2': 'Студент должен написать промпт для нейросети с указанием роли, контекста, '
               'формата, тона и аудитории. Оцени наличие всех компонентов.',
    'lesson3': 'Студент должен отредактировать текст: убрать воду и канцелярит, добавить '
               'структуру. Оцени качество правок.',
    'project': 'Финальный мини-проект: контент-план или пост. Оцени применимость на практике, '
               'структуру и профессионализм.',
}


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
    track = (body.get('track') or 'ai-assistant').strip()[:60]
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
            f"🔥 Новая заявка на интенсив!\n\n"
            f"Имя: {name}\n"
            f"Контакт: {contact}\n"
            f"Трек: {track}\n"
            f"{'Комментарий: ' + comment if comment else ''}\n"
            f"#заявка #интенсив")
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
    scenario_key = (body.get('scenario_key') or 'brief').strip()
    message = (body.get('message') or '').strip()[:2000]
    history = body.get('history') or []

    if scenario_key not in TRAINER_SCENARIOS:
        scenario_key = 'brief'
    if not message:
        return err('Напиши свой ход', 400)

    scenario = TRAINER_SCENARIOS[scenario_key]
    system = (
        f"Ты — ИИ-тренажёр платформы УЧИСЬПРО для будущих AI-ассистентов и контент-менеджеров. "
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
        "Ты — строгий, но доброжелательный куратор интенсива для AI-ассистентов и "
        "контент-менеджеров. Проверяешь домашнее задание по критериям. "
        "Никогда не выдумывай — оценивай только то, что прислал студент.\n"
        "Верни строго JSON без markdown: "
        '{"score": число 0-100, "feedback": "конкретный разбор: что хорошо, что улучшить, '
        '1-2 совета", "verdict": "одно предложение-итог"}'
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
    if action == 'leads' and method == 'GET':
        return handle_leads(headers)

    return err('Неизвестное действие', 404)
