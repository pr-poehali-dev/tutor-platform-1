"""
Отзывы и обратная связь.

REVIEWS:
GET  /?action=reviews_list                   -> опубликованные отзывы
POST /?action=review_submit  X-Auth-Token    body: {author_name, author_role, rating, text}

FEEDBACK:
POST /?action=feedback_submit                body: {contact_name, contact_email|phone, subject, message}

B2B КОНСТРУКТОР ШКОЛ:
POST /?action=partner_lead                   body: {contact_name, contact_email|phone, company, audience_type, topic, students_est, plan_interest, message, utm}
"""
import json
import os
import re
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone
import psycopg2

MAX_API_BASE = "https://botapi.max.ru"


def _max_post(token: str, param: str, ident, text: str) -> tuple:
    url = f"{MAX_API_BASE}/messages?{param}={ident}"
    payload = json.dumps({'text': text}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, method='POST',
                                 headers={'Content-Type': 'application/json',
                                          'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return True, resp.read().decode('utf-8', 'ignore')[:300]
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code}: {e.read().decode("utf-8", "ignore")[:300]}'
    except Exception as e:
        return False, str(e)[:300]


def notify_max(text: str) -> None:
    """Отправляет уведомление владельцу в MAX. Тихо игнорирует ошибки."""
    token = os.environ.get('MAX_BOT_TOKEN', '')
    ident = os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return
    ok1, _ = _max_post(token, 'chat_id', ident, text)
    if ok1:
        return
    _max_post(token, 'user_id', ident, text)

ALLOWED_ROLES = {'student', 'parent', 'teacher'}
ALLOWED_SUBJECTS = {'general', 'payment', 'tech', 'idea', 'cooperation', 'press'}


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Pin',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def check_admin(headers: dict) -> bool:
    pin_env = os.environ.get('ADMIN_PIN', '')
    if not pin_env:
        return False
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return pin == pin_env


LEAD_STATUSES = {'new', 'in_progress', 'won', 'lost'}


def handle_leads_list() -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, contact_name, contact_email, contact_phone, company, "
                "audience_type, topic, students_est, plan_interest, message, source, "
                "status, note, created_at, updated_at "
                "FROM partner_leads ORDER BY created_at DESC LIMIT 500"
            )
            rows = cur.fetchall()
            items = [{
                'id': r[0], 'contact_name': r[1], 'contact_email': r[2],
                'contact_phone': r[3], 'company': r[4], 'audience_type': r[5],
                'topic': r[6], 'students_est': r[7], 'plan_interest': r[8],
                'message': r[9], 'source': r[10], 'status': r[11], 'note': r[12],
                'created_at': r[13].isoformat() if r[13] else None,
                'updated_at': r[14].isoformat() if r[14] else None,
            } for r in rows]
            counts = {s: 0 for s in LEAD_STATUSES}
            for it in items:
                counts[it['status']] = counts.get(it['status'], 0) + 1
            return ok({'items': items, 'total': len(items), 'counts': counts})
    finally:
        conn.close()


def handle_lead_update(body: dict) -> dict:
    try:
        lead_id = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    status = (body.get('status') or '').strip()
    note = body.get('note')
    if status and status not in LEAD_STATUSES:
        return err('Недопустимый статус', 400)
    if note is not None:
        note = str(note).strip()[:2000] or None

    sets, args = [], []
    if status:
        sets.append('status=%s')
        args.append(status)
    if 'note' in body:
        sets.append('note=%s')
        args.append(note)
    if not sets:
        return err('Нечего обновлять', 400)
    sets.append('updated_at=now()')
    args.append(lead_id)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE partner_leads SET " + ', '.join(sets) + " WHERE id=%s",
                tuple(args)
            )
            if cur.rowcount == 0:
                conn.rollback()
                return err('Заявка не найдена', 404)
            conn.commit()
            return ok({'ok': True, 'id': lead_id})
    finally:
        conn.close()


def ok(d: dict, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(),
            'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token=%s LIMIT 1",
        (token,)
    )
    r = cur.fetchone()
    if not r:
        return None
    uid, exp, rev = r
    if rev is not None:
        return None
    if exp and exp < datetime.now(timezone.utc):
        return None
    return uid


def handle_reviews_list() -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, author_name, author_role, rating, text, avatar_url, created_at "
                "FROM reviews WHERE status='published' ORDER BY created_at DESC LIMIT 30"
            )
            items = [
                {
                    'id': r[0], 'author_name': r[1], 'author_role': r[2],
                    'rating': r[3], 'text': r[4], 'avatar_url': r[5],
                    'created_at': r[6].isoformat() if r[6] else None,
                }
                for r in cur.fetchall()
            ]
            avg = round(sum(i['rating'] for i in items) / len(items), 2) if items else 0
            return ok({'items': items, 'total': len(items), 'avg_rating': avg})
    finally:
        conn.close()


def handle_review_submit(token: str, body: dict) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Чтобы оставить отзыв, войди в кабинет', 401)
            name = (body.get('author_name') or '').strip()[:160]
            role = (body.get('author_role') or 'student').strip()
            text = (body.get('text') or '').strip()[:2000]
            try:
                rating = int(body.get('rating') or 5)
            except (TypeError, ValueError):
                return err('rating обязателен', 400)
            if rating < 1 or rating > 5:
                return err('rating от 1 до 5', 400)
            if role not in ALLOWED_ROLES:
                return err('role: student|parent|teacher', 400)
            if not name or len(name) < 2:
                return err('Укажи имя', 400)
            if len(text) < 30:
                return err('Текст отзыва — минимум 30 символов', 400)
            cur.execute(
                "INSERT INTO reviews (user_id, author_name, author_role, rating, text, status) "
                "VALUES (%s,%s,%s,%s,%s,'pending') RETURNING id",
                (uid, name, role, rating, text)
            )
            rid = cur.fetchone()[0]
            conn.commit()
            return ok({
                'ok': True, 'id': rid,
                'message': 'Спасибо! Отзыв опубликуем после проверки (обычно за сутки).',
            })
    finally:
        conn.close()


EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_RE = re.compile(r'^[\d\s\+\-\(\)]{7,20}$')


def handle_feedback_submit(token: str, body: dict, source_ip: str) -> dict:
    name = (body.get('contact_name') or '').strip()[:160]
    email = (body.get('contact_email') or '').strip().lower()[:200]
    phone = (body.get('contact_phone') or '').strip()[:40]
    subject = (body.get('subject') or 'general').strip()
    message = (body.get('message') or '').strip()[:5000]

    if subject not in ALLOWED_SUBJECTS:
        subject = 'general'
    if not name or len(name) < 2:
        return err('Укажи имя', 400)
    if not message or len(message) < 10:
        return err('Сообщение слишком короткое', 400)
    if email and not EMAIL_RE.match(email):
        return err('Email указан некорректно', 400)
    if phone and not PHONE_RE.match(phone):
        return err('Телефон указан некорректно', 400)
    if not email and not phone:
        return err('Укажи email или телефон для связи', 400)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            cur.execute(
                "INSERT INTO feedback_requests "
                "(user_id, contact_name, contact_email, contact_phone, subject, message) "
                "VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                (uid, name, email or None, phone or None, subject, message)
            )
            fid = cur.fetchone()[0]
            conn.commit()
            return ok({
                'ok': True, 'id': fid,
                'message': 'Спасибо за обращение! Ответим в течение 24 часов.',
            })
    finally:
        conn.close()


ALLOWED_AUDIENCE = {'author', 'school', 'business', 'edu'}
ALLOWED_PLAN = {'start', 'pro', 'scale'}


def handle_partner_lead(token: str, body: dict) -> dict:
    name = (body.get('contact_name') or '').strip()[:160]
    email = (body.get('contact_email') or '').strip().lower()[:200]
    phone = (body.get('contact_phone') or '').strip()[:40]
    company = (body.get('company') or '').strip()[:200]
    audience = (body.get('audience_type') or '').strip()
    topic = (body.get('topic') or '').strip()[:500]
    students = (body.get('students_est') or '').strip()[:40]
    plan = (body.get('plan_interest') or '').strip()
    message = (body.get('message') or '').strip()[:5000]
    utm = body.get('utm') if isinstance(body.get('utm'), dict) else None

    if not name or len(name) < 2:
        return err('Укажите имя', 400)
    if email and not EMAIL_RE.match(email):
        return err('Email указан некорректно', 400)
    if phone and not PHONE_RE.match(phone):
        return err('Телефон указан некорректно', 400)
    if not email and not phone:
        return err('Оставьте email или телефон для связи', 400)
    if audience and audience not in ALLOWED_AUDIENCE:
        audience = None
    if plan and plan not in ALLOWED_PLAN:
        plan = None

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO partner_leads "
                "(contact_name, contact_email, contact_phone, company, audience_type, "
                "topic, students_est, plan_interest, message, utm) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (name, email or None, phone or None, company or None, audience or None,
                 topic or None, students or None, plan or None, message or None,
                 json.dumps(utm, ensure_ascii=False) if utm else None)
            )
            lid = cur.fetchone()[0]
            conn.commit()

            aud_labels = {'author': 'Автор/эксперт', 'school': 'Онлайн-школа',
                          'business': 'Компания', 'edu': 'Учебное заведение'}
            plan_labels = {'start': 'Старт (8%)', 'pro': 'Про (5%)', 'scale': 'Масштаб (3%)'}
            lines = [f"🚀 Новая заявка на конструктор школ #{lid}", ""]
            lines.append(f"👤 Имя: {name}")
            if company:
                lines.append(f"🏢 Компания: {company}")
            contacts = []
            if email:
                contacts.append(email)
            if phone:
                contacts.append(phone)
            if contacts:
                lines.append(f"📞 Контакт: {', '.join(contacts)}")
            if audience:
                lines.append(f"🎯 Кто: {aud_labels.get(audience, audience)}")
            if students:
                lines.append(f"👥 Учеников: {students}")
            if plan:
                lines.append(f"💳 Тариф: {plan_labels.get(plan, plan)}")
            if topic:
                lines.append(f"📚 Тема курсов: {topic}")
            if message:
                lines.append(f"✍️ Сообщение: {message}")
            if utm:
                lines.append(f"🔗 UTM: {json.dumps(utm, ensure_ascii=False)}")
            notify_max("\n".join(lines))

            return ok({
                'ok': True, 'id': lid,
                'message': 'Спасибо! Мы свяжемся с вами в течение рабочего дня и покажем платформу.',
            })
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Отзывы, обратная связь и B2B-заявки на конструктор онлайн-школ."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'reviews_list').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}
    rc = (event.get('requestContext') or {})
    ip = ((rc.get('identity') or {}).get('sourceIp')) or ''

    if action == 'reviews_list':
        return handle_reviews_list()
    if action == 'review_submit' and method == 'POST':
        return handle_review_submit(token, body)
    if action == 'feedback_submit' and method == 'POST':
        return handle_feedback_submit(token, body, ip)
    if action == 'partner_lead' and method == 'POST':
        return handle_partner_lead(token, body)

    if action in ('leads_list', 'lead_update'):
        if not check_admin(headers):
            return err('Доступ запрещён', 403)
        if action == 'leads_list':
            return handle_leads_list()
        if action == 'lead_update' and method == 'POST':
            return handle_lead_update(body)

    return err('Неизвестное действие', 404)