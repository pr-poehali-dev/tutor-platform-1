"""
Business: Библиотека готовых обучающих роликов видео-студии.
Сохраняет собранный MP4 в S3, хранит карточку ролика и раскадровку в БД,
отдаёт список и отдельный ролик, позволяет удалять. Доступ к сохранению —
по токену (X-Auth-Token); публичный список опубликованных роликов — без токена.
Действия:
  POST /?action=save    body: {title, topic, subject, age_group, style, voice_id,
                               duration_sec, scenes_count, cover_url, storyboard,
                               video_base64?, status?}  -> {id, video_url}
  GET  /?action=list[&mine=1]                          -> {items: [...]}
  GET  /?action=get&id=N                               -> {item}
  POST /?action=delete  body: {id}                     -> {deleted: true}
Args: event (httpMethod, headers, queryStringParameters, body); context (request_id)
Returns: HTTP-ответ с JSON
"""
import json
import os
import time
import base64
from datetime import datetime, timezone

import psycopg2
from psycopg2.extras import RealDictCursor
import boto3


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token = %s LIMIT 1",
        (token,),
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


def upload_mp4_to_s3(video_bytes: bytes, slug: str) -> str:
    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    key = f"video-library/{slug}-{int(time.time())}.mp4"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )
    s3.put_object(
        Bucket='files', Key=key, Body=video_bytes,
        ContentType='video/mp4',
        CacheControl='public, max-age=31536000',
    )
    return f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"


def slugify(text: str) -> str:
    safe = ''.join(c if c.isalnum() else '-' for c in (text or 'video').lower())
    safe = '-'.join(p for p in safe.split('-') if p)
    return (safe or 'video')[:40]


def handle_save(token: str, body: dict) -> dict:
    title = (body.get('title') or '').strip()
    if not title:
        return err('Нужно название ролика')

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход в аккаунт', 401)

            # Если прислали сам MP4 (base64) — грузим в S3
            video_url = body.get('video_url') or None
            video_b64 = body.get('video_base64')
            if video_b64:
                raw = video_b64.split(',', 1)[1] if ',' in video_b64 and video_b64.startswith('data:') else video_b64
                try:
                    video_bytes = base64.b64decode(raw)
                except Exception:
                    return err('Некорректный видеофайл')
                if len(video_bytes) > 80 * 1024 * 1024:
                    return err('Видео слишком большое (макс. 80 МБ)')
                try:
                    video_url = upload_mp4_to_s3(video_bytes, slugify(title))
                except Exception as e:
                    return err(f'Не удалось загрузить видео в хранилище: {str(e)[:120]}', 502)

            storyboard = body.get('storyboard') or []
            status = body.get('status') if body.get('status') in ('draft', 'published') else 'draft'

            cur.execute(
                "INSERT INTO video_library "
                "(user_id, title, topic, subject, age_group, style, voice_id, duration_sec, "
                " scenes_count, cover_url, video_url, storyboard, status) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (
                    user_id, title[:300], (body.get('topic') or '')[:300],
                    (body.get('subject') or '')[:60], (body.get('age_group') or '')[:60],
                    (body.get('style') or '')[:40], (body.get('voice_id') or '')[:40],
                    int(body.get('duration_sec') or 0), int(body.get('scenes_count') or 0),
                    body.get('cover_url'), video_url,
                    json.dumps(storyboard, ensure_ascii=False), status,
                ),
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return ok({'id': new_id, 'video_url': video_url, 'status': status})
    finally:
        conn.close()


def handle_list(token: str, mine: bool) -> dict:
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            user_id = resolve_user(cur, token)
            if mine:
                if not user_id:
                    return err('Требуется вход в аккаунт', 401)
                cur.execute(
                    "SELECT id, title, topic, subject, age_group, style, voice_id, duration_sec, "
                    "scenes_count, cover_url, video_url, status, views, created_at "
                    "FROM video_library WHERE user_id = %s ORDER BY created_at DESC LIMIT 60",
                    (user_id,),
                )
            else:
                cur.execute(
                    "SELECT id, title, topic, subject, age_group, style, duration_sec, "
                    "scenes_count, cover_url, video_url, views, created_at "
                    "FROM video_library WHERE status = 'published' ORDER BY created_at DESC LIMIT 60"
                )
            items = [dict(r) for r in cur.fetchall()]
            return ok({'items': items})
    finally:
        conn.close()


def handle_get(item_id: int) -> dict:
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("UPDATE video_library SET views = views + 1 WHERE id = %s", (item_id,))
            cur.execute("SELECT * FROM video_library WHERE id = %s LIMIT 1", (item_id,))
            row = cur.fetchone()
            conn.commit()
            if not row:
                return err('Ролик не найден', 404)
            return ok({'item': dict(row)})
    finally:
        conn.close()


def handle_delete(token: str, body: dict) -> dict:
    item_id = body.get('id')
    if not item_id:
        return err('Нужен id ролика')
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход в аккаунт', 401)
            cur.execute(
                "DELETE FROM video_library WHERE id = %s AND user_id = %s",
                (int(item_id), user_id),
            )
            deleted = cur.rowcount > 0
            conn.commit()
            return ok({'deleted': deleted})
    finally:
        conn.close()


def handler(event, context):
    """Точка входа Cloud Function библиотеки видео."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''

    qs = event.get('queryStringParameters') or {}
    body = {}
    if method == 'POST':
        try:
            raw = event.get('body') or '{}'
            body = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            return err('Некорректный JSON')

    action = qs.get('action') or body.get('action') or ''

    try:
        if action == 'save':
            return handle_save(token, body)
        if action == 'list':
            return handle_list(token, mine=(qs.get('mine') == '1'))
        if action == 'get':
            return handle_get(int(qs.get('id') or 0))
        if action == 'delete':
            return handle_delete(token, body)
        return err(f'Неизвестное действие: {action}. Доступно: save, list, get, delete')
    except Exception as e:
        return err(f'{type(e).__name__}: {str(e)[:200]}', 500)
