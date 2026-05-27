"""
Модуль «Лента» — новости науки/культуры/образования/роботов/ИИ + UGC.

Публичные:
GET  /?action=list[&category=&page=]          — лента опубликованных статей
GET  /?action=item&slug=...                   — детальная статья
POST /?action=submit  (X-Auth-Token)          — пользователь публикует статью → status=pending

Админские (X-Admin-Key):
GET  /?action=pending                         — все статьи на модерации
POST /?action=moderate  body:{id,decision}    — approve/reject + reason
POST /?action=create_manual                   — админ создаёт публикацию вручную
"""
import json
import os
import re
from datetime import datetime, timezone
import psycopg2


ADMIN_KEY = os.environ.get('ADMIN_KEY', '')
ALLOWED_CATEGORIES = {'science', 'culture', 'education', 'robots', 'ai'}


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT s.user_id, s.expires_at, s.revoked_at "
        "FROM auth_sessions s WHERE s.token = %s LIMIT 1",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    user_id, expires_at, revoked_at = row
    if revoked_at is not None:
        return None
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    return user_id


def slugify(text: str) -> str:
    """Простой транслит ru→en и slug."""
    rus = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
    eng = ['a','b','v','g','d','e','yo','zh','z','i','y','k','l','m','n','o',
           'p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya']
    out = []
    for ch in text.lower():
        if ch in rus:
            out.append(eng[rus.index(ch)])
        elif ch.isalnum() or ch == ' ':
            out.append(ch)
        else:
            out.append(' ')
    s = ''.join(out)
    s = re.sub(r'\s+', '-', s.strip())
    s = re.sub(r'-+', '-', s)
    return s[:140] or 'article'


def unique_slug(cur, base: str) -> str:
    s = base
    i = 2
    while True:
        cur.execute("SELECT 1 FROM feed_articles WHERE slug = %s LIMIT 1", (s,))
        if not cur.fetchone():
            return s
        s = f"{base}-{i}"
        i += 1


def serialize_article(row, detail: bool = False) -> dict:
    """row: (id, slug, title, summary, content, category, cover_url, source_kind,
            source_name, source_url, author_display_name, status,
            tags, reading_time_min, views, likes, published_at, created_at)"""
    data = {
        'id': row[0],
        'slug': row[1],
        'title': row[2],
        'summary': row[3] or '',
        'category': row[5],
        'cover_url': row[6],
        'source_kind': row[7],
        'source_name': row[8],
        'source_url': row[9],
        'author_display_name': row[10],
        'status': row[11],
        'tags': row[12] or [],
        'reading_time_min': row[13] or 3,
        'views': row[14] or 0,
        'likes': row[15] or 0,
        'published_at': row[16].isoformat() if row[16] else None,
        'created_at': row[17].isoformat() if row[17] else None,
    }
    if detail:
        data['content'] = row[4] or ''
    return data


ARTICLE_COLS = (
    "id, slug, title, summary, content, category, cover_url, source_kind, "
    "source_name, source_url, author_display_name, status, tags, "
    "reading_time_min, views, likes, published_at, created_at"
)


def handle_list(qs: dict) -> dict:
    category = (qs.get('category') or '').strip()
    page = max(1, int(qs.get('page') or 1))
    per_page = 12
    offset = (page - 1) * per_page

    conn = get_db()
    try:
        with conn.cursor() as cur:
            where = "status = 'published'"
            params = []
            if category and category in ALLOWED_CATEGORIES:
                where += " AND category = %s"
                params.append(category)

            cur.execute(
                f"SELECT {ARTICLE_COLS} FROM feed_articles WHERE {where} "
                f"ORDER BY published_at DESC NULLS LAST, created_at DESC "
                f"LIMIT {per_page} OFFSET {offset}",
                tuple(params)
            )
            items = [serialize_article(r) for r in cur.fetchall()]

            cur.execute(f"SELECT COUNT(*) FROM feed_articles WHERE {where}", tuple(params))
            total = cur.fetchone()[0]

            # Категории со счётчиками
            cur.execute(
                "SELECT category, COUNT(*) FROM feed_articles "
                "WHERE status = 'published' GROUP BY category"
            )
            counts = {r[0]: r[1] for r in cur.fetchall()}

            return ok({
                'items': items,
                'page': page,
                'per_page': per_page,
                'total': total,
                'has_more': offset + per_page < total,
                'category_counts': counts,
            })
    finally:
        conn.close()


def handle_item(qs: dict) -> dict:
    slug = (qs.get('slug') or '').strip()
    if not slug:
        return err('slug обязателен', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {ARTICLE_COLS} FROM feed_articles "
                f"WHERE slug = %s AND status = 'published' LIMIT 1",
                (slug,)
            )
            row = cur.fetchone()
            if not row:
                return err('Статья не найдена', 404)
            # Инкремент просмотров
            cur.execute("UPDATE feed_articles SET views = views + 1 WHERE id = %s", (row[0],))
            conn.commit()
            return ok({'item': serialize_article(row, detail=True)})
    finally:
        conn.close()


def handle_submit(token: str, body: dict) -> dict:
    # Сначала проверяем авторизацию — анонимам сразу 401
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
    finally:
        conn.close()
    if not user_id:
        return err('Требуется вход', 401)

    title = (body.get('title') or '').strip()[:400]
    summary = (body.get('summary') or '').strip()[:1000]
    content = (body.get('content') or '').strip()[:30000]
    category = (body.get('category') or '').strip()
    cover_url = (body.get('cover_url') or '').strip()[:800] or None
    source_url = (body.get('source_url') or '').strip()[:800] or None
    display_name = (body.get('author_display_name') or '').strip()[:160] or None

    if not title or len(title) < 8:
        return err('Заголовок должен быть от 8 символов', 400)
    if not content or len(content) < 300:
        return err('Текст статьи — минимум 300 символов', 400)
    if category not in ALLOWED_CATEGORIES:
        return err('Неверная категория', 400)

    # Простой подсчёт минут чтения (200 слов/мин)
    words = len(content.split())
    reading_time = max(2, min(40, round(words / 200)))

    conn = get_db()
    try:
        with conn.cursor() as cur:
            base = slugify(title)
            slug = unique_slug(cur, base)

            cur.execute(
                "INSERT INTO feed_articles "
                "(slug, title, summary, content, category, cover_url, "
                "source_kind, source_url, author_user_id, author_display_name, "
                "status, reading_time_min) "
                "VALUES (%s,%s,%s,%s,%s,%s,'user',%s,%s,%s,'pending',%s) "
                "RETURNING id, created_at",
                (slug, title, summary, content, category, cover_url,
                 source_url, user_id, display_name, reading_time)
            )
            row = cur.fetchone()
            conn.commit()
            return ok({
                'submitted': True,
                'id': row[0],
                'slug': slug,
                'status': 'pending',
                'message': 'Статья отправлена на модерацию. Решение придёт в течение 24 часов.',
            })
    finally:
        conn.close()


def is_admin(headers: dict) -> bool:
    key = (headers.get('X-Admin-Key') or headers.get('x-admin-key') or '').strip()
    return bool(ADMIN_KEY) and key == ADMIN_KEY


def handle_pending(headers: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {ARTICLE_COLS} FROM feed_articles "
                f"WHERE status = 'pending' ORDER BY created_at DESC LIMIT 100"
            )
            items = [serialize_article(r, detail=True) for r in cur.fetchall()]
            return ok({'items': items, 'total': len(items)})
    finally:
        conn.close()


def handle_moderate(headers: dict, body: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    article_id = body.get('id')
    decision = (body.get('decision') or '').strip()
    reason = (body.get('reason') or '').strip()[:500] or None
    by = (body.get('moderator') or 'admin').strip()[:80]

    if decision not in ('approve', 'reject'):
        return err('decision должен быть approve|reject', 400)
    try:
        article_id = int(article_id)
    except (TypeError, ValueError):
        return err('Неверный id', 400)

    new_status = 'published' if decision == 'approve' else 'rejected'

    conn = get_db()
    try:
        with conn.cursor() as cur:
            if decision == 'approve':
                cur.execute(
                    "UPDATE feed_articles SET status = %s, "
                    "published_at = COALESCE(published_at, NOW()), "
                    "moderated_at = NOW(), moderated_by = %s, "
                    "rejected_reason = NULL, updated_at = NOW() WHERE id = %s",
                    (new_status, by, article_id)
                )
            else:
                cur.execute(
                    "UPDATE feed_articles SET status = %s, rejected_reason = %s, "
                    "moderated_at = NOW(), moderated_by = %s, updated_at = NOW() "
                    "WHERE id = %s",
                    (new_status, reason, by, article_id)
                )
            conn.commit()
            return ok({'ok': True, 'id': article_id, 'status': new_status})
    finally:
        conn.close()


def handle_create_manual(headers: dict, body: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    title = (body.get('title') or '').strip()[:400]
    content = (body.get('content') or '').strip()[:30000]
    summary = (body.get('summary') or '').strip()[:1000]
    category = (body.get('category') or '').strip()
    cover_url = (body.get('cover_url') or '').strip()[:800] or None
    source_url = (body.get('source_url') or '').strip()[:800] or None
    source_name = (body.get('source_name') or '').strip()[:160] or None
    tags = body.get('tags') or []
    if not isinstance(tags, list):
        tags = []
    tags = [str(t)[:40] for t in tags][:8]
    autoslug = (body.get('slug') or slugify(title))[:140]

    if not title or category not in ALLOWED_CATEGORIES:
        return err('Нужны title и валидная category', 400)

    words = len(content.split())
    reading_time = max(2, min(40, round(words / 200))) if words else 3

    conn = get_db()
    try:
        with conn.cursor() as cur:
            slug = unique_slug(cur, slugify(autoslug))
            cur.execute(
                "INSERT INTO feed_articles "
                "(slug, title, summary, content, category, cover_url, source_kind, "
                "source_name, source_url, status, tags, reading_time_min, published_at) "
                "VALUES (%s,%s,%s,%s,%s,%s,'manual',%s,%s,'published',%s,%s,NOW()) "
                "RETURNING id",
                (slug, title, summary, content, category, cover_url,
                 source_name, source_url, json.dumps(tags), reading_time)
            )
            article_id = cur.fetchone()[0]
            conn.commit()
            return ok({'created': True, 'id': article_id, 'slug': slug})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Лента: список / деталь / публикация / модерация."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'list').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()

    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except (json.JSONDecodeError, TypeError):
        body = {}

    if action == 'list':
        return handle_list(qs)
    if action == 'item':
        return handle_item(qs)
    if action == 'submit' and method == 'POST':
        return handle_submit(token, body)
    if action == 'pending':
        return handle_pending(headers)
    if action == 'moderate' and method == 'POST':
        return handle_moderate(headers, body)
    if action == 'create_manual' and method == 'POST':
        return handle_create_manual(headers, body)

    return err('Неизвестное действие', 404)