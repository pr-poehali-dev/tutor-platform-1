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

Бренд и ученики (Этапы 4 и 2):
POST /?action=upload_logo     body: {image_base64, content_type}  -> логотип школы в S3
GET  /?action=students                  -> ученики школы (кто купил/приглашён)
POST /?action=invite_student  body: {course_id, email}  -> выдать доступ вручную
POST /?action=remove_student  body: {id}  -> убрать ученика

Домен (Этап 5):
POST /?action=set_domain      body: {domain}  -> привязать домен + вернуть DNS-инструкцию
POST /?action=verify_domain             -> проверить TXT-запись и подтвердить домен
POST /?action=remove_domain             -> отвязать домен

Доступ по приглашению:
GET  /?action=access_status             -> {has_access}
POST /?action=accept_invite   body: {token}  -> активация персонального приглашения
"""
import json
import os
import re
import uuid
import base64
from urllib.request import Request, urlopen
from urllib.parse import quote as urllib_quote
from datetime import datetime, timezone
import psycopg2
import boto3

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments"


def upload_logo(school_id: int, base64_data: str, content_type: str) -> str:
    """Загружает логотип школы в S3 и возвращает CDN-URL."""
    if ',' in base64_data:
        base64_data = base64_data.split(',', 1)[1]
    raw = base64.b64decode(base64_data)
    ext = 'png'
    if 'jpeg' in content_type or 'jpg' in content_type:
        ext = 'jpg'
    elif 'webp' in content_type:
        ext = 'webp'
    elif 'svg' in content_type:
        ext = 'svg'
    key = f"schools/{school_id}/logo-{uuid.uuid4().hex[:8]}.{ext}"
    s3 = boto3.client(
        's3', endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=content_type or 'image/png')
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


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
        'domain_verify_token': row[14] if len(row) > 14 else None,
    }


SCHOOL_COLS = ("id, name, slug, description, brand_logo_url, brand_color, "
               "custom_domain, domain_verified, payments_enabled, platform_fee_percent, "
               "ai_teacher_enabled, ai_teacher_persona, status, created_at, domain_verify_token")


class AccessDenied(Exception):
    """У пользователя нет подтверждённого доступа к конструктору школ."""


def user_email(cur, uid: int):
    cur.execute("SELECT lower(email) FROM " + t('auth_users') + " WHERE id=%s", (uid,))
    r = cur.fetchone()
    return r[0] if r and r[0] else None


def has_builder_access(cur, uid: int) -> bool:
    """Доступ есть, если у пользователя уже есть школа с доступом
    или существует принятый/ожидающий инвайт под его email."""
    cur.execute("SELECT builder_access FROM " + t('schools') +
                " WHERE owner_user_id=%s LIMIT 1", (uid,))
    r = cur.fetchone()
    if r and r[0]:
        return True
    email = user_email(cur, uid)
    if not email:
        return False
    cur.execute(
        "SELECT 1 FROM " + t('school_builder_invites') +
        " WHERE lower(email)=%s AND status IN ('pending','accepted') LIMIT 1", (email,))
    return cur.fetchone() is not None


def create_school_for(cur, uid: int) -> dict:
    slug = slugify('moya-shkola', uid)
    cur.execute(
        "INSERT INTO " + t('schools') + " (owner_user_id, name, slug, builder_access) "
        "VALUES (%s, %s, %s, true) RETURNING " + SCHOOL_COLS,
        (uid, 'Моя школа', slug)
    )
    return school_dict(cur.fetchone())


def get_or_create_school(cur, uid: int) -> dict:
    cur.execute("SELECT " + SCHOOL_COLS + " FROM " + t('schools') +
                " WHERE owner_user_id=%s LIMIT 1", (uid,))
    row = cur.fetchone()
    if row:
        return school_dict(row)
    if not has_builder_access(cur, uid):
        raise AccessDenied()
    return create_school_for(cur, uid)


def get_school_id(cur, uid: int):
    cur.execute("SELECT id FROM " + t('schools') + " WHERE owner_user_id=%s LIMIT 1", (uid,))
    r = cur.fetchone()
    return r[0] if r else None


def handle_my_school(conn, uid: int) -> dict:
    with conn.cursor() as cur:
        # Есть ли уже школа
        cur.execute("SELECT " + SCHOOL_COLS + " FROM " + t('schools') +
                    " WHERE owner_user_id=%s LIMIT 1", (uid,))
        row = cur.fetchone()
        if not row:
            if not has_builder_access(cur, uid):
                return ok({'school': None, 'has_access': False})
            school = create_school_for(cur, uid)
            conn.commit()
        else:
            school = school_dict(row)
        cur.execute("SELECT COUNT(*) FROM " + t('school_courses') + " WHERE school_id=%s",
                    (school['id'],))
        school['courses_count'] = cur.fetchone()[0]
        return ok({'school': school, 'has_access': True})


def handle_access_status(conn, uid: int) -> dict:
    """Проверка доступа к конструктору без создания школы."""
    with conn.cursor() as cur:
        return ok({'has_access': has_builder_access(cur, uid)})


def handle_accept_invite(conn, uid: int, body: dict) -> dict:
    """Активация персонального приглашения по токену. Работает только
    если вошедший пользователь совпадает по email с приглашением."""
    token = (body.get('token') or '').strip()[:80]
    if not token:
        return err('Нет токена приглашения', 400)
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, lower(email), status FROM " + t('school_builder_invites') +
            " WHERE token=%s LIMIT 1", (token,))
        inv = cur.fetchone()
        if not inv:
            return err('Приглашение не найдено', 404)
        inv_id, inv_email, status = inv
        if status == 'revoked':
            return err('Приглашение отозвано', 403)
        email = user_email(cur, uid)
        if not email:
            return err('В вашем аккаунте не указан email. Добавьте email, чтобы принять приглашение.', 400)
        if email != inv_email:
            return err('Это приглашение оформлено на другой email. Войдите под ' + inv_email, 403)
        # Отмечаем принятым (если ещё не)
        if status != 'accepted':
            cur.execute(
                "UPDATE " + t('school_builder_invites') +
                " SET status='accepted', accepted_user_id=%s, accepted_at=now() WHERE id=%s",
                (uid, inv_id))
        # Создаём школу, если её ещё нет
        cur.execute("SELECT " + SCHOOL_COLS + " FROM " + t('schools') +
                    " WHERE owner_user_id=%s LIMIT 1", (uid,))
        row = cur.fetchone()
        if row:
            school = school_dict(row)
            cur.execute("UPDATE " + t('schools') + " SET builder_access=true WHERE owner_user_id=%s",
                        (uid,))
        else:
            school = create_school_for(cur, uid)
        conn.commit()
        return ok({'ok': True, 'school': school})


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
        if 'ai_teacher_enabled' in body:
            sets.append('ai_teacher_enabled=%s'); args.append(bool(body.get('ai_teacher_enabled')))
        if 'ai_teacher_persona' in body:
            persona = (body.get('ai_teacher_persona') or '').strip()[:2000]
            sets.append('ai_teacher_persona=%s'); args.append(persona or None)
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


def claim_enrollments_by_email(cur, uid: int) -> None:
    """Привязывает к пользователю доступы, выданные ранее на его email
    (например, приглашение до регистрации). Делает идемпотентно."""
    email = get_user_email(cur, uid)
    if not email:
        return
    # Берём «висящие» записи по email, которых ещё нет у пользователя на этом курсе
    cur.execute(
        "UPDATE " + t('school_enrollments') + " e "
        "SET student_user_id=%s "
        "WHERE e.student_user_id IS NULL AND lower(e.student_email)=lower(%s) "
        "AND NOT EXISTS (SELECT 1 FROM " + t('school_enrollments') + " e2 "
        "  WHERE e2.school_course_id=e.school_course_id AND e2.student_user_id=%s)",
        (uid, email, uid))


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
        claim_enrollments_by_email(cur, uid)
        if has_access(cur, cid, uid):
            conn.commit()
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
        claim_enrollments_by_email(cur, uid)
        conn.commit()
        cur.execute(
            "SELECT sc.id, sc.title, sc.lessons_count, sc.modules_count, s.name "
            "FROM " + t('school_enrollments') + " e "
            "JOIN " + t('school_courses') + " sc ON sc.id = e.school_course_id "
            "JOIN " + t('schools') + " s ON s.id = e.school_id "
            "WHERE e.student_user_id=%s AND e.status='active' ORDER BY e.created_at DESC", (uid,))
        items = [{'id': r[0], 'title': r[1], 'lessons_count': r[2],
                  'modules_count': r[3], 'school_name': r[4]} for r in cur.fetchall()]
        return ok({'items': items, 'total': len(items)})


# ---------- Этап 4: бренд школы ----------

def handle_upload_logo(conn, uid: int, body: dict) -> dict:
    data = body.get('image_base64') or ''
    content_type = (body.get('content_type') or 'image/png').strip()
    if not data:
        return err('Нет изображения', 400)
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            get_or_create_school(cur, uid)
            conn.commit()
            sid = get_school_id(cur, uid)
    try:
        url = upload_logo(sid, data, content_type)
    except Exception as e:
        return err(f'Ошибка загрузки: {str(e)[:150]}', 502)
    with conn.cursor() as cur:
        cur.execute("UPDATE " + t('schools') + " SET brand_logo_url=%s, updated_at=now() WHERE id=%s",
                    (url, sid))
        conn.commit()
    return ok({'ok': True, 'brand_logo_url': url})


# ---------- Этап 2: ученики школы ----------

def handle_students(conn, uid: int) -> dict:
    """Список учеников школы (кто купил/приглашён), с курсом."""
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return ok({'items': [], 'total': 0})
        cur.execute(
            "SELECT e.id, e.student_email, e.source, e.status, e.created_at, "
            "sc.title, u.name "
            "FROM " + t('school_enrollments') + " e "
            "JOIN " + t('school_courses') + " sc ON sc.id = e.school_course_id "
            "LEFT JOIN " + t('auth_users') + " u ON u.id = e.student_user_id "
            "WHERE e.school_id=%s ORDER BY e.created_at DESC LIMIT 500", (sid,))
        items = [{
            'id': r[0], 'email': r[1], 'source': r[2], 'status': r[3],
            'created_at': r[4].isoformat() if r[4] else None,
            'course_title': r[5], 'name': r[6],
        } for r in cur.fetchall()]
        return ok({'items': items, 'total': len(items)})


EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


def handle_invite_student(conn, uid: int, body: dict) -> dict:
    """Ручное приглашение ученика на курс по email (доступ выдаётся сразу)."""
    email = (body.get('email') or '').strip().lower()[:200]
    try:
        cid = int(body.get('course_id'))
    except (TypeError, ValueError):
        return err('Некорректный курс', 400)
    if not EMAIL_RE.match(email):
        return err('Некорректный email', 400)
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return err('Школа не найдена', 404)
        cur.execute("SELECT 1 FROM " + t('school_courses') + " WHERE id=%s AND school_id=%s",
                    (cid, sid))
        if not cur.fetchone():
            return err('Курс не найден', 404)
        # Привязываем к пользователю, если он уже зарегистрирован по этому email
        cur.execute("SELECT id FROM " + t('auth_users') + " WHERE lower(email)=%s LIMIT 1", (email,))
        urow = cur.fetchone()
        student_uid = urow[0] if urow else None
        if student_uid:
            cur.execute(
                "SELECT 1 FROM " + t('school_enrollments') +
                " WHERE school_course_id=%s AND student_user_id=%s", (cid, student_uid))
            if cur.fetchone():
                return err('Ученик уже добавлен на этот курс', 400)
        # Защита от дублей по email (в т.ч. для ещё не зарегистрированных учеников)
        cur.execute(
            "SELECT 1 FROM " + t('school_enrollments') +
            " WHERE school_course_id=%s AND lower(student_email)=%s LIMIT 1", (cid, email))
        if cur.fetchone():
            return err('Ученик с этим email уже добавлен на курс', 400)
        cur.execute(
            "INSERT INTO " + t('school_enrollments') +
            " (school_course_id, school_id, student_user_id, student_email, source) "
            "VALUES (%s,%s,%s,%s,'invite') RETURNING id",
            (cid, sid, student_uid, email))
        eid = cur.fetchone()[0]
        conn.commit()
        return ok({'ok': True, 'id': eid})


def handle_remove_student(conn, uid: int, body: dict) -> dict:
    try:
        eid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return err('Не найдено', 404)
        cur.execute("DELETE FROM " + t('school_enrollments') + " WHERE id=%s AND school_id=%s",
                    (eid, sid))
        if cur.rowcount == 0:
            conn.rollback()
            return err('Не найдено', 404)
        conn.commit()
        return ok({'ok': True})


# ---------- Этап 5: свой домен школы ----------

DOMAIN_RE = re.compile(r'^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$')
CNAME_TARGET = 'schools.xn--h1agdcde2c.xn--p1ai'


def normalize_domain(raw: str) -> str:
    d = (raw or '').strip().lower()
    d = re.sub(r'^https?://', '', d)
    d = d.split('/')[0].strip().rstrip('.')
    if d.startswith('www.'):
        d = d[4:]
    return d


def handle_set_domain(conn, uid: int, body: dict) -> dict:
    domain = normalize_domain(body.get('domain') or '')
    if not domain or not DOMAIN_RE.match(domain) or len(domain) > 200:
        return err('Введите корректный домен, например school.ru', 400)
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            get_or_create_school(cur, uid)
            conn.commit()
            sid = get_school_id(cur, uid)
        # Домен не должен быть занят другой школой
        cur.execute(
            "SELECT id FROM " + t('schools') + " WHERE lower(custom_domain)=%s AND id<>%s LIMIT 1",
            (domain, sid))
        if cur.fetchone():
            return err('Этот домен уже привязан к другой школе', 400)
        verify_token = 'uchisipro-verify-' + uuid.uuid4().hex[:24]
        cur.execute(
            "UPDATE " + t('schools') + " SET custom_domain=%s, domain_verified=false, "
            "domain_verify_token=%s, domain_added_at=now(), updated_at=now() WHERE id=%s "
            "RETURNING " + SCHOOL_COLS,
            (domain, verify_token, sid))
        row = cur.fetchone()
        conn.commit()
    return ok({
        'ok': True,
        'school': school_dict(row),
        'dns': {
            'txt_name': f'_uchisipro.{domain}',
            'txt_value': verify_token,
            'cname_name': domain,
            'cname_value': CNAME_TARGET,
        },
    })


def dns_txt_lookup(name: str) -> list:
    """Запрос TXT-записей через DNS-over-HTTPS (Google). Возвращает список строк."""
    url = 'https://dns.google/resolve?name=' + urllib_quote(name) + '&type=TXT'
    req = Request(url, headers={'Accept': 'application/dns-json'}, method='GET')
    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
    except Exception:
        return []
    out = []
    for ans in (data.get('Answer') or []):
        val = (ans.get('data') or '').strip().strip('"')
        if val:
            out.append(val)
    return out


def handle_verify_domain(conn, uid: int) -> dict:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, custom_domain, domain_verify_token FROM " + t('schools') +
            " WHERE owner_user_id=%s LIMIT 1", (uid,))
        r = cur.fetchone()
        if not r or not r[1]:
            return err('Сначала привяжите домен', 400)
        sid, domain, token = r
    txt_records = dns_txt_lookup(f'_uchisipro.{domain}')
    verified = token in txt_records
    if verified:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE " + t('schools') + " SET domain_verified=true, updated_at=now() WHERE id=%s "
                "RETURNING " + SCHOOL_COLS, (sid,))
            row = cur.fetchone()
            conn.commit()
        return ok({'ok': True, 'verified': True, 'school': school_dict(row)})
    return ok({
        'ok': True, 'verified': False,
        'message': 'TXT-запись пока не найдена. DNS может обновляться до 24 часов — попробуйте позже.',
        'found': txt_records,
    })


def handle_remove_domain(conn, uid: int) -> dict:
    with conn.cursor() as cur:
        sid = get_school_id(cur, uid)
        if not sid:
            return err('Не найдено', 404)
        cur.execute(
            "UPDATE " + t('schools') + " SET custom_domain=NULL, domain_verified=false, "
            "domain_verify_token=NULL, domain_added_at=NULL, updated_at=now() WHERE id=%s "
            "RETURNING " + SCHOOL_COLS, (sid,))
        row = cur.fetchone()
        conn.commit()
    return ok({'ok': True, 'school': school_dict(row)})


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

        # Оплата и доступ ученика (не требуют доступа в конструктор)
        if action == 'buy_course' and method == 'POST':
            return handle_buy_course(conn, uid, body)
        if action == 'sync_payment' and method == 'POST':
            return handle_sync_school_payment(conn, uid)
        if action == 'my_enrollments':
            return handle_my_enrollments(conn, uid)

        # Доступ в конструктор по приглашению
        if action == 'access_status':
            return handle_access_status(conn, uid)
        if action == 'accept_invite' and method == 'POST':
            return handle_accept_invite(conn, uid, body)

        try:
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
            if action == 'upload_logo' and method == 'POST':
                return handle_upload_logo(conn, uid, body)
            if action == 'students':
                return handle_students(conn, uid)
            if action == 'invite_student' and method == 'POST':
                return handle_invite_student(conn, uid, body)
            if action == 'remove_student' and method == 'POST':
                return handle_remove_student(conn, uid, body)
            if action == 'set_domain' and method == 'POST':
                return handle_set_domain(conn, uid, body)
            if action == 'verify_domain' and method == 'POST':
                return handle_verify_domain(conn, uid)
            if action == 'remove_domain' and method == 'POST':
                return handle_remove_domain(conn, uid)
        except AccessDenied:
            return err('Доступ в конструктор школ выдаётся по приглашению', 403)

        return err('Неизвестное действие', 404)
    finally:
        conn.close()