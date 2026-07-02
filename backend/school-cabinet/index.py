"""
Кабинет онлайн-школы (Этап 1 конструктора школ).

Автор входит по своему аккаунту, у него есть школа и её курсы.
Задел под этапы 2-6 (бренд, домен, оплаты, ИИ-препод) заложен в таблице schools.

Все запросы требуют X-Auth-Token (сессия пользователя).

GET  /?action=my_school                 -> школа пользователя (+создаёт при первом входе)
POST /?action=update_school   body: {name, description, brand_color, brand_logo_url}
GET  /?action=courses                   -> курсы школы
POST /?action=save_course     body: {builder_course_id?, course:{...}}  -> сохранить курс из конструктора
GET  /?action=course&id=NN              -> один курс школы
POST /?action=update_course   body: {id, title?, price_kopecks?, is_published?, data?}
POST /?action=delete_course   body: {id}

Публичные / для учеников (Этап 3 — оплата):
GET  /?action=public_course&id=NN       -> витрина опубликованного курса (без авторизации)
POST /?action=buy_course      body: {course_id, return_url}  -> платёж ЮKassa (нужен вход ученика)
POST /?action=sync_payment              -> подстраховка активации после оплаты
GET  /?action=my_enrollments            -> курсы, купленные учеником
"""
import json
import os
import re
import uuid
import base64
from urllib.request import Request, urlopen
from datetime import datetime, timezone
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments"


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id FROM " + t('auth_sessions') +
        " WHERE token=%s AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1",
        (token,)
    )
    r = cur.fetchone()
    return r[0] if r else None


def slugify(name: str, uid: int) -> str:
    base = re.sub(r'[^a-z0-9]+', '-', (name or '').lower()).strip('-')[:50]
    if not base:
        base = 'school'
    return f'{base}-{uid}'


def school_dict(row) -> dict:
    return {
        'id': row[0], 'name': row[1], 'slug': row[2], 'description': row[3],
        'brand_logo_url': row[4], 'brand_color': row[5],
        'custom_domain': row[6], 'domain_verified': row[7],
        'payments_enabled': row[8], 'platform_fee_percent': float(row[9]),
        'ai_teacher_enabled': row[10], 'ai_teacher_persona': row[11],
        'status': row[12],
        'created_at': row[13].isoformat() if row[13] else None,
    }


SCHOOL_COLS = ("id, name, slug, description, brand_logo_url, brand_color, "
               "custom_domain, domain_verified, payments_enabled, platform_fee_percent, "
               "ai_teacher_enabled, ai_teacher_persona, status, created_at")


def get_or_create_school(cur, uid: int) -> dict:
    cur.execute("SELECT " + SCHOOL_COLS + " FROM " + t('schools') +
                " WHERE owner_user_id=%s LIMIT 1", (uid,))
    row = cur.fetchone()
    if row:
        return school_dict(row)
    slug = slugify('moya-shkola', uid)
    cur.execute(
        "INSERT INTO " + t('schools') + " (owner_user_id, name, slug) "
        "VALUES (%s, %s, %s) RETURNING " + SCHOOL_COLS,
        (uid, 'Моя школа', slug)
    )
    row = cur.fetchone()
    return school_dict(row)


def get_school_id(cur, uid: int):
    cur.execute("SELECT id FROM " + t('schools') + " WHERE owner_user_id=%s LIMIT 1", (uid,))
    r = cur.fetchone()
    return r[0] if r else None


def handle_my_school(conn, uid: int) -> dict:
    with conn.cursor() as cur:
        school = get_or_create_school(cur, uid)
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM " + t('school_courses') + " WHERE school_id=%s",
                    (school['id'],))
        school['courses_count'] = cur.fetchone()[0]
        return ok({'school': school})


def handle_update_school(conn, uid: int, body: dict) -> dict:
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            get_or_create_school(cur, uid)
            conn.commit()
            sid = get_school_id(cur, uid)
        sets, args = [], []
        if 'name' in body:
            sets.append('name=%s'); args.append((body.get('name') or 'Моя школа').strip()[:200])
        if 'description' in body:
            desc = (body.get('description') or '').strip()[:2000]
            sets.append('description=%s'); args.append(desc or None)
        if 'brand_color' in body:
            sets.append('brand_color=%s'); args.append((body.get('brand_color') or '').strip()[:20] or None)
        if 'brand_logo_url' in body:
            sets.append('brand_logo_url=%s'); args.append((body.get('brand_logo_url') or '').strip()[:1000] or None)
        if not sets:
            return err('Нечего обновлять', 400)
        sets.append('updated_at=now()')
        args.append(sid)
        cur.execute("UPDATE " + t('schools') + " SET " + ', '.join(sets) + " WHERE id=%s", tuple(args))
        conn.commit()
        cur.execute("SELECT " + SCHOOL_COLS + " FROM " + t('schools') + " WHERE id=%s", (sid,))
        return ok({'ok': True, 'school': school_dict(cur.fetchone())})


def count_course(course: dict) -> tuple:
    modules = course.get('modules') or []
    lessons = sum(len(m.get('lessons') or []) for m in modules)
    return lessons, len(modules)


def handle_save_course(conn, uid: int, body: dict) -> dict:
    course = body.get('course')
    if not isinstance(course, dict) or not course.get('modules'):
        return err('Нет данных курса', 400)
    builder_id = body.get('builder_course_id')
    try:
        builder_id = int(builder_id) if builder_id is not None else None
    except (TypeError, ValueError):
        builder_id = None

    title = (course.get('course_title') or 'Новый курс').strip()[:300]
    topic = (course.get('topic') or course.get('tagline') or '').strip()[:300] or None
    lessons, modules = count_course(course)

    with conn.cursor() as cur:
        school = get_or_create_school(cur, uid)
        conn.commit()
        sid = school['id']
        cur.execute(
            "INSERT INTO " + t('school_courses') +
            " (school_id, builder_course_id, title, topic, lessons_count, modules_count, data, status) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,'draft') RETURNING id",
            (sid, builder_id, title, topic, lessons, modules,
             json.dumps(course, ensure_ascii=False))
        )
        cid = cur.fetchone()[0]
        if builder_id:
            cur.execute("UPDATE " + t('builder_courses') + " SET school_id=%s WHERE id=%s",
                        (sid, builder_id))
        conn.commit()
        return ok({'ok': True, 'id': cid, 'school_id': sid})


def course_row_dict(r) -> dict:
    return {
        'id': r[0], 'title': r[1], 'topic': r[2],
        'lessons_count': r[3], 'modules_count': r[4],
        'price_kopecks': r[5], 'is_published': r[6], 'status': r[7],
        'created_at': r[8].isoformat() if r[8] else None,
    }


def handle_courses(conn, uid: int) -> dict:
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return ok({'items': [], 'total': 0})
        cur.execute(
            "SELECT id, title, topic, lessons_count, modules_count, price_kopecks, "
            "is_published, status, created_at FROM " + t('school_courses') +
            " WHERE school_id=%s ORDER BY created_at DESC LIMIT 200", (sid,))
        items = [course_row_dict(r) for r in cur.fetchall()]
        return ok({'items': items, 'total': len(items)})


def handle_course(conn, uid: int, course_id: str) -> dict:
    try:
        cid = int(course_id)
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return err('Курс не найден', 404)
        cur.execute(
            "SELECT id, title, topic, lessons_count, modules_count, price_kopecks, "
            "is_published, status, created_at, data FROM " + t('school_courses') +
            " WHERE id=%s AND school_id=%s", (cid, sid))
        r = cur.fetchone()
        if not r:
            return err('Курс не найден', 404)
        d = course_row_dict(r)
        d['data'] = r[9]
        return ok({'course': d})


def handle_update_course(conn, uid: int, body: dict) -> dict:
    try:
        cid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return err('Курс не найден', 404)
        sets, args = [], []
        if 'title' in body:
            sets.append('title=%s'); args.append((body.get('title') or 'Курс').strip()[:300])
        if 'price_kopecks' in body:
            try:
                sets.append('price_kopecks=%s'); args.append(max(0, int(body.get('price_kopecks'))))
            except (TypeError, ValueError):
                return err('Некорректная цена', 400)
        if 'is_published' in body:
            sets.append('is_published=%s'); args.append(bool(body.get('is_published')))
        if 'data' in body and isinstance(body.get('data'), dict):
            sets.append('data=%s'); args.append(json.dumps(body['data'], ensure_ascii=False))
        if not sets:
            return err('Нечего обновлять', 400)
        sets.append('updated_at=now()')
        args.extend([cid, sid])
        cur.execute("UPDATE " + t('school_courses') + " SET " + ', '.join(sets) +
                    " WHERE id=%s AND school_id=%s", tuple(args))
        if cur.rowcount == 0:
            conn.rollback()
            return err('Курс не найден', 404)
        conn.commit()
        return ok({'ok': True, 'id': cid})


def handle_delete_course(conn, uid: int, body: dict) -> dict:
    try:
        cid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return err('Курс не найден', 404)
        cur.execute("DELETE FROM " + t('school_courses') + " WHERE id=%s AND school_id=%s",
                    (cid, sid))
        if cur.rowcount == 0:
            conn.rollback()
            return err('Курс не найден', 404)
        conn.commit()
        return ok({'ok': True})


# ---------- Публичная страница курса и оплата (Этап 3) ----------

def handle_public_course(conn, course_id: str) -> dict:
    """Публичные данные опубликованного курса школы (для витрины/покупки)."""
    try:
        cid = int(course_id)
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    with conn.cursor() as cur:
        cur.execute(
            "SELECT sc.id, sc.title, sc.topic, sc.lessons_count, sc.modules_count, "
            "sc.price_kopecks, sc.is_published, sc.data, s.id, s.name, s.brand_color, s.brand_logo_url "
            "FROM " + t('school_courses') + " sc "
            "JOIN " + t('schools') + " s ON s.id = sc.school_id "
            "WHERE sc.id=%s", (cid,))
        r = cur.fetchone()
        if not r or not r[6]:
            return err('Курс не найден или не опубликован', 404)
        data = r[7] or {}
        # На витрине не раскрываем полностью задания/квизы — только программу.
        preview_modules = []
        for m in (data.get('modules') or []):
            preview_modules.append({
                'title': m.get('title'),
                'lessons': [{'title': l.get('title'), 'type': l.get('type')}
                            for l in (m.get('lessons') or [])],
            })
        return ok({'course': {
            'id': r[0], 'title': r[1], 'topic': r[2],
            'lessons_count': r[3], 'modules_count': r[4],
            'price_kopecks': r[5],
            'description': data.get('description'),
            'tagline': data.get('tagline'),
            'outcomes': data.get('outcomes') or [],
            'target_audience': data.get('target_audience'),
            'estimated_hours': data.get('estimated_hours'),
            'modules': preview_modules,
            'school': {'id': r[8], 'name': r[9], 'brand_color': r[10], 'brand_logo_url': r[11]},
        }})


def get_user_email(cur, uid: int):
    cur.execute("SELECT email FROM " + t('auth_users') + " WHERE id=%s LIMIT 1", (uid,))
    r = cur.fetchone()
    return r[0] if r else None


def has_access(cur, cid: int, uid: int) -> bool:
    cur.execute(
        "SELECT 1 FROM " + t('school_enrollments') +
        " WHERE school_course_id=%s AND student_user_id=%s AND status='active' LIMIT 1",
        (cid, uid))
    return cur.fetchone() is not None


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
    req = Request(YOOKASSA_API_URL, data=json.dumps(payload).encode('utf-8'),
                  headers={'Authorization': f'Basic {auth}',
                           'Idempotence-Key': str(uuid.uuid4()),
                           'Content-Type': 'application/json'}, method='POST')
    with urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def get_yookassa_payment(payment_id: str) -> dict:
    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
    if not payment_id or not shop_id or not secret_key:
        return None
    auth = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    req = Request(f"{YOOKASSA_API_URL}/{payment_id}",
                  headers={'Authorization': f'Basic {auth}',
                           'Content-Type': 'application/json'}, method='GET')
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return None


def handle_buy_course(conn, uid: int, body: dict) -> dict:
    """Создаёт платёж ЮKassa за курс школы. Деньги идут на счёт платформы."""
    try:
        cid = int(body.get('course_id'))
    except (TypeError, ValueError):
        return err('Некорректный курс', 400)
    return_url = (body.get('return_url') or '').strip()[:500]
    if not return_url.startswith('http'):
        return err('Некорректный return_url', 400)

    shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')
    if not shop_id or not secret_key:
        return err('Приём оплат ещё не настроен', 503)

    with conn.cursor() as cur:
        cur.execute(
            "SELECT sc.title, sc.price_kopecks, sc.is_published, sc.school_id, s.platform_fee_percent "
            "FROM " + t('school_courses') + " sc "
            "JOIN " + t('schools') + " s ON s.id = sc.school_id WHERE sc.id=%s", (cid,))
        r = cur.fetchone()
        if not r or not r[2]:
            return err('Курс не найден или не опубликован', 404)
        title, price_kopecks, _, school_id, fee_pct = r
        if price_kopecks <= 0:
            return err('У курса не задана цена', 400)
        if has_access(cur, cid, uid):
            return ok({'already_owned': True})

        email = get_user_email(cur, uid) or 'noreply@example.com'
        fee_kopecks = int(round(price_kopecks * float(fee_pct) / 100.0))
        cur.execute(
            "INSERT INTO " + t('school_course_purchases') +
            " (school_course_id, school_id, buyer_user_id, buyer_email, amount_kopecks, "
            "platform_fee_kopecks, status) VALUES (%s,%s,%s,%s,%s,%s,'pending') RETURNING id",
            (cid, school_id, uid, email, price_kopecks, fee_kopecks))
        purchase_id = cur.fetchone()[0]
        conn.commit()

    try:
        pay = create_yookassa_payment(
            price_kopecks / 100.0, f'Курс: {title}', return_url, email,
            {'kind': 'school_course', 'purchase_id': str(purchase_id),
             'school_course_id': str(cid), 'user_id': str(uid)})
    except Exception as e:
        return err(f'Ошибка оплаты: {str(e)[:150]}', 502)

    payment_id = pay.get('id')
    confirmation_url = (pay.get('confirmation') or {}).get('confirmation_url')
    with conn.cursor() as cur:
        cur.execute("UPDATE " + t('school_course_purchases') +
                    " SET payment_id=%s, updated_at=now() WHERE id=%s", (payment_id, purchase_id))
        conn.commit()
    return ok({'ok': True, 'purchase_id': purchase_id, 'confirmation_url': confirmation_url})


def grant_access(cur, purchase_id: int):
    """Выдаёт доступ к курсу после успешной оплаты (идемпотентно)."""
    cur.execute(
        "SELECT school_course_id, school_id, buyer_user_id, buyer_email "
        "FROM " + t('school_course_purchases') + " WHERE id=%s", (purchase_id,))
    r = cur.fetchone()
    if not r:
        return
    scid, sid, buyer_uid, buyer_email = r
    cur.execute(
        "INSERT INTO " + t('school_enrollments') +
        " (school_course_id, school_id, student_user_id, student_email, source) "
        "VALUES (%s,%s,%s,%s,'purchase') "
        "ON CONFLICT (school_course_id, student_user_id) WHERE student_user_id IS NOT NULL "
        "DO NOTHING",
        (scid, sid, buyer_uid, buyer_email))


def handle_sync_school_payment(conn, uid: int) -> dict:
    """Подстраховка: опрашивает ЮKassa по незавершённым покупкам ученика."""
    activated = []
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, payment_id FROM " + t('school_course_purchases') +
            " WHERE buyer_user_id=%s AND status IN ('pending','canceled') "
            "AND payment_id IS NOT NULL AND created_at > NOW() - INTERVAL '7 days' "
            "ORDER BY id DESC LIMIT 10", (uid,))
        rows = cur.fetchall()
        for purchase_id, payment_id in rows:
            pay = get_yookassa_payment(payment_id)
            if not pay:
                continue
            status = pay.get('status', '')
            if status == 'succeeded':
                cur.execute(
                    "UPDATE " + t('school_course_purchases') +
                    " SET status='paid', paid_at=NOW(), updated_at=NOW() "
                    "WHERE id=%s AND status<>'paid'", (purchase_id,))
                grant_access(cur, purchase_id)
                conn.commit()
                activated.append(purchase_id)
            elif status == 'canceled':
                cur.execute(
                    "UPDATE " + t('school_course_purchases') +
                    " SET status='canceled', updated_at=NOW() WHERE id=%s AND status='pending'",
                    (purchase_id,))
                conn.commit()
    return ok({'synced': True, 'activated': activated})


def handle_my_enrollments(conn, uid: int) -> dict:
    """Курсы, к которым у ученика есть доступ."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT sc.id, sc.title, sc.lessons_count, sc.modules_count, s.name "
            "FROM " + t('school_enrollments') + " e "
            "JOIN " + t('school_courses') + " sc ON sc.id = e.school_course_id "
            "JOIN " + t('schools') + " s ON s.id = e.school_id "
            "WHERE e.student_user_id=%s AND e.status='active' ORDER BY e.created_at DESC", (uid,))
        items = [{'id': r[0], 'title': r[1], 'lessons_count': r[2],
                  'modules_count': r[3], 'school_name': r[4]} for r in cur.fetchall()]
        return ok({'items': items, 'total': len(items)})


def handler(event: dict, context) -> dict:
    """Кабинет онлайн-школы: школа автора и её курсы."""
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
        # Публичный экшен — витрина курса, без авторизации
        if action == 'public_course':
            return handle_public_course(conn, qs.get('id'))

        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
        if not uid:
            return err('Требуется вход в аккаунт', 401)

        # Оплата и доступ ученика
        if action == 'buy_course' and method == 'POST':
            return handle_buy_course(conn, uid, body)
        if action == 'sync_payment' and method == 'POST':
            return handle_sync_school_payment(conn, uid)
        if action == 'my_enrollments':
            return handle_my_enrollments(conn, uid)

        if action == 'my_school':
            return handle_my_school(conn, uid)
        if action == 'update_school' and method == 'POST':
            return handle_update_school(conn, uid, body)
        if action == 'courses':
            return handle_courses(conn, uid)
        if action == 'save_course' and method == 'POST':
            return handle_save_course(conn, uid, body)
        if action == 'course':
            return handle_course(conn, uid, qs.get('id'))
        if action == 'update_course' and method == 'POST':
            return handle_update_course(conn, uid, body)
        if action == 'delete_course' and method == 'POST':
            return handle_delete_course(conn, uid, body)

        return err('Неизвестное действие', 404)
    finally:
        conn.close()