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
"""
import json
import os
import re
from datetime import datetime, timezone
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')


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
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
        if not uid:
            return err('Требуется вход в аккаунт', 401)

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
