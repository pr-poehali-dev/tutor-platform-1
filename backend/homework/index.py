"""
Business: Модуль «Домашка» — школьник фотографирует задачу или своё решение в тетради,
а ИИ проверяет/решает. Два режима: solve (реши задачу с фото) и review (проверь моё решение).
Фото грузится в S3, разбор кэшируется по хэшу фото (чтобы не генерировать заново), история — в БД.
Доступ только авторизованным (X-Auth-Token).
Действия:
  POST /?action=check   body: {image_base64, mode, subject, grade}  -> {result, is_correct, image_url, from_cache, check_id}
  GET  /?action=history                                            -> {items: [...]}
Args: event с httpMethod, headers (X-Auth-Token), body; context (object с request_id)
Returns: HTTP-ответ с JSON
"""
import json
import os
import re
import time
import hashlib
import base64
import urllib.request
import urllib.error
from datetime import datetime, timezone

import psycopg2
from psycopg2.extras import RealDictCursor
import boto3


SUBJECTS = {
    'math': 'математика', 'physics': 'физика', 'chemistry': 'химия',
    'russian': 'русский язык', 'english': 'английский язык', 'biology': 'биология',
    'history': 'история', 'geography': 'география', 'literature': 'литература',
    'society': 'обществознание', 'cs': 'информатика',
}

GRADES = {
    '1-4': '1–4 класс', '5-9': '5–9 класс', '10-11': '10–11 класс',
    'oge': 'подготовка к ОГЭ', 'ege': 'подготовка к ЕГЭ',
}

# Сколько бесплатных проверок в сутки (мягкий лимит на пользователя)
DAILY_LIMIT = 20


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


def strip_data_url(b64: str) -> str:
    """Убирает префикс data:image/...;base64, если есть."""
    if ',' in b64 and b64.strip().lower().startswith('data:'):
        return b64.split(',', 1)[1]
    return b64


def upload_to_s3(image_bytes: bytes, image_hash: str, content_type: str) -> str:
    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    ext = 'jpg'
    if 'png' in content_type:
        ext = 'png'
    elif 'webp' in content_type:
        ext = 'webp'
    key = f"homework/{image_hash[:16]}-{int(time.time())}.{ext}"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )
    s3.put_object(
        Bucket='files', Key=key, Body=image_bytes,
        ContentType=content_type or 'image/jpeg',
        CacheControl='public, max-age=31536000',
    )
    return f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"


def build_prompt(mode: str, subject: str, grade: str) -> str:
    subj = SUBJECTS.get(subject, subject or 'школьный предмет')
    grd = GRADES.get(grade, grade or 'школьная программа')
    common = (
        "Ты — опытный российский учитель и репетитор. Отвечай по-русски, по школьной программе РФ (ФГОС). "
        f"Предмет: {subj}. Уровень: {grd}. "
        "На фото — задание из учебника/тетради. Сначала кратко распознай условие. "
        "Если на фото несколько задач — разбери каждую. "
        "Будь точным: если на фото нечитаемо или это не учебное задание — честно скажи об этом. "
        "Пиши понятным языком для ученика, без воды и без лишних вступлений."
    )
    if mode == 'review':
        return common + (
            "\n\nРЕЖИМ ПРОВЕРКИ РЕШЕНИЯ УЧЕНИКА. На фото — решение, выполненное учеником в тетради. "
            "Сделай так:\n"
            "1) Проверь, верный ли ответ и ход решения.\n"
            "2) Если есть ошибка — укажи КОНКРЕТНО где (на каком шаге) и почему.\n"
            "3) Покажи, как правильно.\n"
            "4) В самом конце добавь отдельной строкой ровно один из вердиктов: "
            "«ВЕРДИКТ: ВЕРНО» или «ВЕРДИКТ: ЕСТЬ ОШИБКИ»."
        )
    return common + (
        "\n\nРЕЖИМ РЕШЕНИЯ ЗАДАЧИ. Реши задание с фото ПОШАГОВО: "
        "объясни каждый шаг и зачем он, затем дай итоговый ответ. "
        "Цель — чтобы ученик понял метод, а не просто списал."
    )


def call_vision(prompt: str, image_b64: str, content_type: str) -> str:
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        raise RuntimeError('POLZA_API_KEY не настроен')
    data_url = f"data:{content_type or 'image/jpeg'};base64,{image_b64}"
    messages = [{
        'role': 'user',
        'content': [
            {'type': 'text', 'text': prompt},
            {'type': 'image_url', 'image_url': {'url': data_url}},
        ],
    }]
    payload = json.dumps({
        'model': 'openai/gpt-4o-mini',
        'messages': messages,
        'temperature': 0.3,
        'max_tokens': 900,
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://api.polza.ai/api/v1/chat/completions',
        data=payload,
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=60) as response:
        result = json.loads(response.read().decode('utf-8'))
        return result['choices'][0]['message']['content'].strip()


def detect_verdict(text: str):
    """Для режима review достаёт булев вердикт из ответа ИИ."""
    low = text.lower()
    if 'вердикт: верно' in low:
        return True
    if 'вердикт: есть ошибк' in low or 'вердикт: ошибк' in low:
        return False
    return None


def count_today(cur, user_id: int) -> int:
    cur.execute(
        "SELECT COUNT(*) FROM homework_checks WHERE user_id = %s AND created_at >= date_trunc('day', NOW())",
        (user_id,),
    )
    return cur.fetchone()[0]


def handle_check(token: str, body: dict) -> dict:
    image_raw = body.get('image_base64') or ''
    mode = body.get('mode', 'solve')
    if mode not in ('solve', 'review'):
        mode = 'solve'
    subject = (body.get('subject') or '')[:40]
    grade = (body.get('grade') or '')[:20]
    if not image_raw:
        return err('Нужно фото задания (image_base64)')

    image_b64 = strip_data_url(image_raw)
    content_type = body.get('content_type') or 'image/jpeg'
    try:
        image_bytes = base64.b64decode(image_b64)
    except Exception:
        return err('Некорректное изображение')
    if len(image_bytes) > 8 * 1024 * 1024:
        return err('Фото слишком большое (макс. 8 МБ). Сожми снимок и попробуй снова.')

    image_hash = hashlib.sha256(image_bytes).hexdigest()
    cache_key = f"{image_hash}:{mode}:{subject}:{grade}"

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход в аккаунт', 401)

            # Дневной лимит
            if count_today(cur, user_id) >= DAILY_LIMIT:
                return err(f'Достигнут дневной лимит проверок ({DAILY_LIMIT}). Возвращайся завтра!', 429)

            # 1) Кэш — не генерируем заново для того же фото/режима/предмета
            cur.execute(
                "SELECT result, is_correct, image_url FROM homework_cache WHERE cache_key = %s LIMIT 1",
                (cache_key,),
            )
            cached = cur.fetchone()
            if cached:
                result_text, is_correct, image_url = cached
                cur.execute("UPDATE homework_cache SET hits = hits + 1 WHERE cache_key = %s", (cache_key,))
                cur.execute(
                    "INSERT INTO homework_checks (user_id, mode, subject, grade, image_url, image_hash, result, is_correct, from_cache) "
                    "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,TRUE) RETURNING id",
                    (user_id, mode, subject, grade, image_url, image_hash, result_text, is_correct),
                )
                check_id = cur.fetchone()[0]
                conn.commit()
                return ok({
                    'result': result_text, 'is_correct': is_correct, 'image_url': image_url,
                    'from_cache': True, 'check_id': check_id, 'mode': mode,
                })

            # 2) Загружаем фото в S3
            try:
                image_url = upload_to_s3(image_bytes, image_hash, content_type)
            except Exception as e:
                image_url = None  # не блокируем проверку, если S3 недоступен

            # 3) Vision-разбор через ИИ
            prompt = build_prompt(mode, subject, grade)
            try:
                result_text = call_vision(prompt, image_b64, content_type)
            except urllib.error.HTTPError as e:
                detail = e.read().decode('utf-8', errors='ignore')[:200]
                return err(f'Ошибка ИИ ({e.code}). Попробуй ещё раз. {detail}', 502)
            except Exception as e:
                return err(f'Не удалось обработать фото: {str(e)[:150]}', 502)

            is_correct = detect_verdict(result_text) if mode == 'review' else None

            # 4) Сохраняем в кэш и историю
            cur.execute(
                "INSERT INTO homework_cache (cache_key, image_hash, mode, subject, grade, image_url, result, is_correct, hits) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,1) ON CONFLICT (cache_key) DO NOTHING",
                (cache_key, image_hash, mode, subject, grade, image_url, result_text, is_correct),
            )
            cur.execute(
                "INSERT INTO homework_checks (user_id, mode, subject, grade, image_url, image_hash, result, is_correct, from_cache) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,FALSE) RETURNING id",
                (user_id, mode, subject, grade, image_url, image_hash, result_text, is_correct),
            )
            check_id = cur.fetchone()[0]
            conn.commit()
            return ok({
                'result': result_text, 'is_correct': is_correct, 'image_url': image_url,
                'from_cache': False, 'check_id': check_id, 'mode': mode,
            })
    finally:
        conn.close()


def handle_history(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход в аккаунт', 401)
            cur.execute(
                "SELECT id, mode, subject, grade, image_url, result, is_correct, from_cache, created_at "
                "FROM homework_checks WHERE user_id = %s ORDER BY created_at DESC LIMIT 30",
                (user_id,),
            )
            items = [dict(r) for r in cur.fetchall()]
            return ok({'items': items})
    finally:
        conn.close()


def handler(event, context):
    """Точка входа Cloud Function модуля «Домашка»."""
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
        if action == 'check':
            return handle_check(token, body)
        if action == 'history':
            return handle_history(token)
        return err(f'Неизвестное действие: {action}. Доступно: check, history')
    except Exception as e:
        return err(f'{type(e).__name__}: {str(e)[:200]}', 500)
