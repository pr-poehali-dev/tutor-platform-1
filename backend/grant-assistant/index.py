"""
ИИ-помощник по грантам и конкурсам (grant-assistant).

Пользователь описывает грант/конкурс и свой проект — ИИ готовит профессиональную
заявку. Бесплатно доступен черновик (preview): актуальность, цели, оценка шансов.
Полный пакет (готовый текст заявки, смета/бюджет, календарный план, проверка по
критериям, риски) открывается после оплаты за конкретную заявку.

POST /?action=generate  X-Auth-Token  body: {grant_name, project_idea, organization?, project_title?, grant_amount?, region?, deadline?, extra?, contact_email?}
   -> {id, preview, price_kopecks, is_paid}
GET  /?action=get&id=NN  X-Auth-Token   -> заявка (full_data только если оплачена)
GET  /?action=list       X-Auth-Token   -> список своих заявок
POST /?action=pay        X-Auth-Token  body: {id, return_url}   -> {confirmation_url}
POST /?action=sync       X-Auth-Token   -> опрос ЮKassa по незавершённым платежам
GET  /?action=admin_list X-Admin-Pin    -> все заявки (админ)
"""
import json
import os
import re
import time
import uuid
import base64
import urllib.request
import urllib.error
from datetime import datetime, timezone
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'openai/gpt-4o-mini'
POLZA_API_KEY = os.environ.get('POLZA_API_KEY', '')
YOOKASSA_API_URL = 'https://api.yookassa.ru/v3/payments'

# Цена подготовки одной заявки (в копейках). Рынок: от 150 000 ₽ — мы даём доступно.
GRANT_PRICE_KOPECKS = int(os.environ.get('GRANT_PRICE_KOPECKS', '490000'))

SYS_PROMPT = (
    "Ты — эксперт по грантам и конкурсам с 15-летним опытом, который подготовил "
    "сотни выигравших заявок для НКО, стартапов, учёных и бизнеса. Ты знаешь "
    "критерии оценки ведущих фондов (Фонд президентских грантов, ФСИ, Росмолодёжь, "
    "Фонд культурных инициатив, региональные субсидии) и умеешь писать сильные, "
    "конкретные, убедительные формулировки на языке экспертов. Пиши по-русски, "
    "без воды, с цифрами и обоснованиями. Работаешь с ЛЮБЫМ грантом или конкурсом."
)


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Pin',
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


def t(name: str) -> str:
    return f'{SCHEMA}.{name}'


def check_admin(headers: dict) -> bool:
    pin_env = os.environ.get('ADMIN_PIN', '')
    if not pin_env:
        return False
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return pin == pin_env


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id FROM " + t('auth_sessions') +
        " WHERE token=%s AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1",
        (token,))
    r = cur.fetchone()
    return r[0] if r else None


def get_user_email(cur, uid: int):
    cur.execute("SELECT email FROM " + t('auth_users') + " WHERE id=%s LIMIT 1", (uid,))
    r = cur.fetchone()
    return r[0] if r and r[0] else None


# ---------- LLM ----------

def call_polza(prompt: str, system: str, max_tokens: int = 3200,
               temperature: float = 0.6, retries: int = 2):
    if not POLZA_API_KEY:
        return None, 'нет POLZA_API_KEY'
    payload = {
        'model': POLZA_MODEL,
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': prompt},
        ],
        'temperature': temperature,
        'max_tokens': max_tokens,
    }
    body_bytes = json.dumps(payload).encode('utf-8')
    last_err = None
    for attempt in range(retries + 1):
        req = urllib.request.Request(
            POLZA_URL, data=body_bytes,
            headers={'Authorization': f'Bearer {POLZA_API_KEY}',
                     'Content-Type': 'application/json'},
            method='POST')
        try:
            with urllib.request.urlopen(req, timeout=55) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                choices = data.get('choices') or []
                if choices:
                    content = (choices[0].get('message') or {}).get('content', '').strip()
                    if content:
                        return content, None
                    last_err = 'пустой ответ ИИ'
                else:
                    last_err = f'нет choices: {str(data)[:150]}'
        except urllib.error.HTTPError as e:
            body = ''
            try:
                body = e.read().decode('utf-8')[:150]
            except Exception:
                pass
            last_err = f'HTTP {e.code}: {body}'
            if e.code < 500:
                return None, last_err
        except urllib.error.URLError as e:
            last_err = f'URLError: {str(e.reason)[:120]}'
        except (json.JSONDecodeError, OSError) as e:
            last_err = f'{type(e).__name__}: {str(e)[:120]}'
        if attempt < retries:
            time.sleep(1.5)
    return None, last_err


def parse_json(text: str):
    if not text:
        return None
    cleaned = text.strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find('{')
        end = cleaned.rfind('}')
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except json.JSONDecodeError:
                return None
    return None


def build_prompt(app: dict) -> str:
    return f"""Подготовь ПРОФЕССИОНАЛЬНУЮ грантовую заявку на основе данных заявителя.

ГРАНТ/КОНКУРС: «{app.get('grant_name')}»
ЗАЯВИТЕЛЬ: {app.get('organization') or 'не указан'}
НАЗВАНИЕ ПРОЕКТА: {app.get('project_title') or 'предложи сильное название'}
СУТЬ ПРОЕКТА: {app.get('project_idea')}
ЗАПРАШИВАЕМАЯ СУММА: {app.get('grant_amount') or 'предложи обоснованную сумму'}
РЕГИОН: {app.get('region') or 'не указан'}
СРОК/ДЕДЛАЙН: {app.get('deadline') or 'не указан'}
ДОП. ТРЕБОВАНИЯ ПЛОЩАДКИ: {app.get('extra') or 'нет'}

Действуй как эксперт грантового фонда. Формулировки — конкретные, измеримые,
с цифрами. Избегай общих слов. Все разделы должны соответствовать типичным
критериям оценки (актуальность, реалистичность, социальный эффект, бюджет).

ВЕРНИ СТРОГО ОДИН JSON без пояснений:
{{
  "project_title": "сильное название проекта",
  "annotation": "краткая аннотация проекта, 3-4 предложения",
  "relevance": "обоснование актуальности и проблемы, которую решает проект (развёрнуто, с фактами)",
  "goal": "главная цель проекта одной ёмкой формулировкой",
  "tasks": ["конкретная задача 1", "задача 2", "задача 3", "задача 4"],
  "target_audience": "целевая аудитория и её количественная оценка (охват)",
  "social_effect": "социальный/экономический эффект с измеримыми показателями",
  "team": [
    {{"role": "роль в проекте", "responsibility": "зона ответственности"}}
  ],
  "calendar_plan": [
    {{"stage": "название этапа", "period": "сроки", "result": "измеримый результат этапа"}}
  ],
  "budget": [
    {{"item": "статья расходов", "amount": "сумма в рублях", "justification": "обоснование одной фразой"}}
  ],
  "budget_total": "итоговая сумma в рублях",
  "risks": [
    {{"risk": "возможный риск", "mitigation": "как минимизируем"}}
  ],
  "kpi": ["измеримый показатель результата 1", "показатель 2", "показатель 3"],
  "expert_review": {{
    "score": число от 0 до 100 — оценка шансов заявки,
    "strengths": ["сильная сторона 1", "сильная сторона 2"],
    "weaknesses": ["что усилить перед подачей 1", "рекомендация 2"],
    "verdict": "вывод эксперта одной фразой"
  }},
  "cover_letter": "короткое сопроводительное письмо для подачи (5-7 предложений)"
}}"""


def split_preview_full(data: dict) -> tuple:
    """Делит результат ИИ на бесплатный превью и полный (платный) пакет."""
    review = data.get('expert_review') or {}
    preview = {
        'project_title': data.get('project_title'),
        'annotation': data.get('annotation'),
        'goal': data.get('goal'),
        'relevance_teaser': (data.get('relevance') or '')[:400],
        'tasks_preview': (data.get('tasks') or [])[:2],
        'expert_score': review.get('score'),
        'expert_verdict': review.get('verdict'),
        'is_fallback': bool(data.get('_fallback')),
        'sections_locked': [
            'Полное обоснование актуальности',
            'Задачи и целевая аудитория',
            'Социальный эффект и KPI',
            'Команда проекта',
            'Календарный план',
            'Смета и бюджет с обоснованием',
            'Риски и их минимизация',
            'Разбор экспертом: сильные/слабые места',
            'Сопроводительное письмо',
        ],
    }
    return preview, data


def fallback_data(app: dict) -> dict:
    idea = app.get('project_idea') or 'проект'
    return {
        "project_title": app.get('project_title') or f"Проект: {idea[:60]}",
        "annotation": "Черновик аннотации будет доработан. Опишите проект подробнее для лучшего результата.",
        "relevance": "Обоснование актуальности проекта.",
        "goal": "Достичь заявленных результатов проекта.",
        "tasks": ["Подготовка", "Реализация", "Оценка результатов", "Отчётность"],
        "target_audience": "Целевая аудитория проекта.",
        "social_effect": "Ожидаемый социальный эффект.",
        "team": [{"role": "Руководитель проекта", "responsibility": "Общее управление"}],
        "calendar_plan": [{"stage": "Подготовка", "period": "1 месяц", "result": "План готов"}],
        "budget": [{"item": "Реализация проекта", "amount": app.get('grant_amount') or "по смете",
                    "justification": "Основные расходы"}],
        "budget_total": app.get('grant_amount') or "по смете",
        "risks": [{"risk": "Сдвиг сроков", "mitigation": "Резерв времени в плане"}],
        "kpi": ["Количество участников", "Охват", "Достигнутые результаты"],
        "expert_review": {"score": 50, "strengths": ["Идея проекта"],
                          "weaknesses": ["Добавьте деталей и цифр"], "verdict": "Требуется доработка деталей."},
        "cover_letter": "Сопроводительное письмо к заявке.",
        "_fallback": True,
    }


# ---------- Хендлеры ----------

def app_row_public(r, include_full=False) -> dict:
    d = {
        'id': r[0], 'grant_name': r[1], 'project_title': r[2],
        'is_paid': r[3], 'price_kopecks': r[4], 'status': r[5],
        'created_at': r[6].isoformat() if r[6] else None,
        'preview': r[7] or {},
        'organization': r[9],
        'contact_email': r[10],
    }
    if include_full and r[3]:  # full только если оплачено
        d['full'] = r[8]
    return d


APP_COLS = ("id, grant_name, project_title, is_paid, price_kopecks, status, "
            "created_at, preview_data, full_data, organization, contact_email")


def handle_generate(conn, uid: int, body: dict) -> dict:
    grant_name = (body.get('grant_name') or '').strip()[:400]
    project_idea = (body.get('project_idea') or '').strip()
    if len(grant_name) < 2:
        return err('Укажите название гранта или конкурса', 400)
    if len(project_idea) < 20:
        return err('Опишите проект подробнее (хотя бы пару предложений)', 400)

    # Защита от спама: не более 8 бесплатных генераций в сутки на пользователя.
    # Каждая генерация расходует токены ИИ, поэтому лимитируем.
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COUNT(*) FROM " + t('grant_applications') +
            " WHERE user_id=%s AND created_at > NOW() - INTERVAL '24 hours'", (uid,))
        recent = cur.fetchone()[0]
    if recent >= 8:
        return err('Вы подготовили слишком много заявок за сегодня. '
                   'Попробуйте завтра или откройте одну из готовых заявок.', 429)

    app = {
        'grant_name': grant_name,
        'organization': (body.get('organization') or '').strip()[:400] or None,
        'project_title': (body.get('project_title') or '').strip()[:400] or None,
        'project_idea': project_idea[:5000],
        'grant_amount': (body.get('grant_amount') or '').strip()[:80] or None,
        'region': (body.get('region') or '').strip()[:200] or None,
        'deadline': (body.get('deadline') or '').strip()[:120] or None,
        'extra': (body.get('extra') or '').strip()[:3000] or None,
    }

    text, ai_err = call_polza(build_prompt(app), SYS_PROMPT)
    data = parse_json(text) if text else None
    if not data:
        data = fallback_data(app)
    preview, full = split_preview_full(data)

    with conn.cursor() as cur:
        email = get_user_email(cur, uid) or (body.get('contact_email') or '').strip()[:200] or None
        cur.execute(
            "INSERT INTO " + t('grant_applications') +
            " (user_id, contact_email, grant_name, organization, project_title, project_idea, "
            "grant_amount, region, deadline, extra, preview_data, full_data, price_kopecks, "
            "status, ai_error) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
            "RETURNING " + APP_COLS,
            (uid, email, app['grant_name'], app['organization'], data.get('project_title'),
             app['project_idea'], app['grant_amount'], app['region'], app['deadline'],
             app['extra'], json.dumps(preview, ensure_ascii=False),
             json.dumps(full, ensure_ascii=False), GRANT_PRICE_KOPECKS,
             'generated', ai_err))
        row = cur.fetchone()
        conn.commit()
        return ok(app_row_public(row, include_full=False))


def handle_get(conn, uid: int, app_id: str) -> dict:
    try:
        aid = int(app_id)
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    with conn.cursor() as cur:
        cur.execute("SELECT " + APP_COLS + " FROM " + t('grant_applications') +
                    " WHERE id=%s AND user_id=%s", (aid, uid))
        row = cur.fetchone()
        if not row:
            return err('Заявка не найдена', 404)
        return ok(app_row_public(row, include_full=True))


def handle_list(conn, uid: int) -> dict:
    with conn.cursor() as cur:
        cur.execute("SELECT " + APP_COLS + " FROM " + t('grant_applications') +
                    " WHERE user_id=%s ORDER BY created_at DESC LIMIT 100", (uid,))
        items = [app_row_public(r, include_full=False) for r in cur.fetchall()]
        return ok({'items': items, 'total': len(items)})


# ---------- Оплата ЮKassa ----------

def create_yookassa_payment(amount_rub: float, description: str, return_url: str,
                            email: str, metadata: dict) -> dict:
    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
    auth = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    payload = {
        "amount": {"value": f"{amount_rub:.2f}", "currency": "RUB"},
        "capture": True,
        "confirmation": {"type": "redirect", "return_url": return_url},
        "description": description[:128],
        "metadata": metadata,
        "receipt": {
            "customer": {"email": email},
            "items": [{
                "description": description[:128],
                "quantity": "1.000",
                "amount": {"value": f"{amount_rub:.2f}", "currency": "RUB"},
                "vat_code": 1,
                "payment_subject": "service",
                "payment_mode": "full_payment",
            }],
        },
    }
    req = urllib.request.Request(
        YOOKASSA_API_URL, data=json.dumps(payload).encode('utf-8'),
        headers={'Authorization': f'Basic {auth}',
                 'Idempotence-Key': str(uuid.uuid4()),
                 'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def get_yookassa_payment(payment_id: str):
    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
    if not payment_id or not shop_id or not secret_key:
        return None
    auth = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    req = urllib.request.Request(
        f"{YOOKASSA_API_URL}/{payment_id}",
        headers={'Authorization': f'Basic {auth}', 'Content-Type': 'application/json'},
        method='GET')
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return None


def handle_pay(conn, uid: int, body: dict) -> dict:
    try:
        aid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Некорректная заявка', 400)
    return_url = (body.get('return_url') or '').strip()[:500]
    if not return_url.startswith('http'):
        return err('Некорректный return_url', 400)
    if not os.environ.get('YOOKASSA_SHOP_ID') or not os.environ.get('YOOKASSA_SECRET_KEY'):
        return err('Приём оплат ещё не настроен', 503)

    with conn.cursor() as cur:
        cur.execute("SELECT grant_name, price_kopecks, is_paid, preview_data FROM " +
                    t('grant_applications') + " WHERE id=%s AND user_id=%s", (aid, uid))
        r = cur.fetchone()
        if not r:
            return err('Заявка не найдена', 404)
        grant_name, price_kopecks, is_paid, preview = r
        if is_paid:
            return ok({'already_paid': True})
        # Не даём оплачивать аварийный (fallback) черновик — там нет полноценной заявки.
        if isinstance(preview, dict) and preview.get('is_fallback'):
            return err('Эта заявка сгенерирована в упрощённом режиме. '
                       'Сформируйте её заново с более подробным описанием проекта.', 409)
        email = get_user_email(cur, uid) or 'noreply@example.com'
        # Идемпотентность: если уже есть незавершённый платёж со ссылкой — вернём его,
        # чтобы двойной клик не создавал два платежа в ЮKassa.
        cur.execute(
            "SELECT id, payment_id FROM " + t('grant_payments') +
            " WHERE application_id=%s AND user_id=%s AND status='pending' "
            "AND payment_id IS NOT NULL AND created_at > NOW() - INTERVAL '1 hour' "
            "ORDER BY id DESC LIMIT 1", (aid, uid))
        existing = cur.fetchone()
        if existing and existing[1]:
            pay = get_yookassa_payment(existing[1])
            if pay and pay.get('status') == 'pending':
                url = (pay.get('confirmation') or {}).get('confirmation_url')
                if url:
                    return ok({'ok': True, 'confirmation_url': url})
        cur.execute(
            "INSERT INTO " + t('grant_payments') +
            " (application_id, user_id, amount_kopecks, status) VALUES (%s,%s,%s,'pending') "
            "RETURNING id", (aid, uid, price_kopecks))
        pay_id_local = cur.fetchone()[0]
        conn.commit()

    try:
        pay = create_yookassa_payment(
            price_kopecks / 100.0, f'Подготовка заявки: {grant_name}', return_url, email,
            {'kind': 'grant_application', 'payment_id': str(pay_id_local),
             'application_id': str(aid), 'user_id': str(uid)})
    except Exception as e:
        return err(f'Ошибка оплаты: {str(e)[:150]}', 502)

    payment_id = pay.get('id')
    confirmation_url = (pay.get('confirmation') or {}).get('confirmation_url')
    with conn.cursor() as cur:
        cur.execute("UPDATE " + t('grant_payments') +
                    " SET payment_id=%s, updated_at=now() WHERE id=%s", (payment_id, pay_id_local))
        conn.commit()
    return ok({'ok': True, 'confirmation_url': confirmation_url})


def handle_sync(conn, uid: int) -> dict:
    activated = []
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, application_id, payment_id FROM " + t('grant_payments') +
            " WHERE user_id=%s AND status IN ('pending','canceled') AND payment_id IS NOT NULL "
            "AND created_at > NOW() - INTERVAL '7 days' ORDER BY id DESC LIMIT 10", (uid,))
        rows = cur.fetchall()
        for pay_local_id, app_id, payment_id in rows:
            pay = get_yookassa_payment(payment_id)
            if not pay:
                continue
            status = pay.get('status', '')
            if status == 'succeeded':
                cur.execute("UPDATE " + t('grant_payments') +
                            " SET status='paid', paid_at=NOW(), updated_at=NOW() "
                            "WHERE id=%s AND status<>'paid'", (pay_local_id,))
                cur.execute("UPDATE " + t('grant_applications') +
                            " SET is_paid=true, status='paid', updated_at=NOW() "
                            "WHERE id=%s AND user_id=%s", (app_id, uid))
                conn.commit()
                activated.append(app_id)
            elif status == 'canceled':
                cur.execute("UPDATE " + t('grant_payments') +
                            " SET status='canceled', updated_at=NOW() WHERE id=%s AND status='pending'",
                            (pay_local_id,))
                conn.commit()
    return ok({'synced': True, 'activated': activated})


def handle_admin_list(conn) -> dict:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, grant_name, organization, project_title, contact_email, is_paid, "
            "price_kopecks, status, created_at FROM " + t('grant_applications') +
            " ORDER BY created_at DESC LIMIT 500")
        items = [{
            'id': r[0], 'grant_name': r[1], 'organization': r[2], 'project_title': r[3],
            'contact_email': r[4], 'is_paid': r[5], 'price_kopecks': r[6], 'status': r[7],
            'created_at': r[8].isoformat() if r[8] else None,
        } for r in cur.fetchall()]
        paid = sum(1 for i in items if i['is_paid'])
        revenue = sum(i['price_kopecks'] for i in items if i['is_paid'])
        return ok({'items': items, 'total': len(items), 'paid': paid, 'revenue_kopecks': revenue})


def handler(event: dict, context) -> dict:
    """ИИ-помощник по грантам: генерация заявки (превью бесплатно) + оплата полного пакета."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or '').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}

    conn = get_db()
    try:
        # Публичная цена (для лендинга)
        if action == 'price':
            return ok({'price_kopecks': GRANT_PRICE_KOPECKS})

        if action == 'admin_list':
            if not check_admin(headers):
                return err('Доступ запрещён', 403)
            return handle_admin_list(conn)

        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
        if not uid:
            return err('Требуется вход в аккаунт', 401)

        if action == 'generate' and method == 'POST':
            return handle_generate(conn, uid, body)
        if action == 'get':
            return handle_get(conn, uid, qs.get('id'))
        if action == 'list':
            return handle_list(conn, uid)
        if action == 'pay' and method == 'POST':
            return handle_pay(conn, uid, body)
        if action == 'sync' and method == 'POST':
            return handle_sync(conn, uid)
        return err('Неизвестное действие', 404)
    finally:
        conn.close()