"""
Business: «Говорящие» ролики маскота Ксюши. Генерирует видео-липсинк из фото
Ксюши + текста фразы через Polza.ai (image-to-video / talking avatar), сохраняет
готовое видео в S3 и отдаёт фронту CDN-ссылки. Работает по принципу «готовые
ролики заранее»: фразы кэшируются по phrase_key и не пересоздаются.
Actions:
  - list      (GET)  — все готовые ролики {phrase_key: video_url}
  - generate  (POST) — запустить генерацию ролика для фразы (admin)
  - status    (POST) — опросить статус генерации и забрать готовое видео (admin)
Args: event с httpMethod, queryStringParameters.action, body; context.request_id
Returns: HTTP JSON-ответ
"""
import json
import os
import re
import uuid
import urllib.request
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Admin-Key',
    'Access-Control-Max-Age': '86400',
}

POLZA_BASE = 'https://api.polza.ai/api/v1'
# Фото Ксюши — основа для оживления (talking avatar)
KSUSHA_IMAGE = (
    'https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/'
    'bucket/87a4c173-ed41-4204-8216-2fb7b28f2381.png'
)
# Модель видеогенерации с поддержкой синхронизации движения/речи
VIDEO_MODEL = os.environ.get('KSUSHA_VIDEO_MODEL', 'kling/v2.6-standard')


def ok(payload, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(payload, ensure_ascii=False, default=str),
    }


def err(msg, status=400):
    return ok({'error': msg}, status)


def db_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    try:
        return psycopg2.connect(dsn)
    except Exception:
        return None


def slugify_key(raw: str) -> str:
    """Нормализует phrase_key в безопасный короткий идентификатор."""
    s = (raw or '').strip().lower()
    s = re.sub(r'[^a-z0-9_\-]+', '_', s)
    return (s or 'phrase')[:120]


def polza_create_video(phrase: str) -> tuple:
    """Запускает генерацию говорящего видео в Polza.ai.

    Возвращает (job_id, error). Подробности процесса асинхронные: сначала
    получаем id задачи со статусом pending, потом опрашиваем статус.
    """
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'
    prompt = (
        'A cute Russian cartoon girl Ksusha in a red headscarf is talking warmly '
        'and friendly to a child, natural lip movement and gentle head motion, '
        f'she says: "{phrase}". Soft, kind, child-friendly animation.'
    )
    payload = json.dumps({
        'model': VIDEO_MODEL,
        'input': {
            'prompt': prompt,
            'images': [{'type': 'url', 'data': KSUSHA_IMAGE}],
            'aspect_ratio': '1:1',
            'duration': 5,
        },
    }).encode('utf-8')
    try:
        req = urllib.request.Request(
            f'{POLZA_BASE}/media',
            data=payload,
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode('utf-8'))
        job_id = data.get('id') or data.get('job_id') or (data.get('data') or {}).get('id')
        if not job_id:
            return None, f'Polza не вернул id задачи: {str(data)[:200]}'
        return job_id, None
    except urllib.error.HTTPError as e:
        body = ''
        try:
            body = e.read().decode('utf-8')[:200]
        except Exception:
            pass
        return None, f'Polza HTTP {e.code}: {body}'
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:150]}'


def polza_get_status(job_id: str) -> tuple:
    """Опрашивает статус задачи. Возвращает (status, video_url, error)."""
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return 'failed', None, 'POLZA_API_KEY не настроен'
    try:
        req = urllib.request.Request(
            f'{POLZA_BASE}/media/{job_id}',
            headers={'Authorization': f'Bearer {api_key}'},
            method='GET',
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return 'processing', None, f'Polza HTTP {e.code}'
    except Exception as e:
        return 'processing', None, f'{type(e).__name__}: {str(e)[:120]}'

    raw_status = (data.get('status') or '').lower()
    # Достаём ссылку на готовое видео из разных возможных форматов ответа
    url = None
    output = data.get('output') or data.get('result') or data.get('data') or {}
    if isinstance(output, dict):
        url = output.get('video_url') or output.get('url')
        if not url and isinstance(output.get('videos'), list) and output['videos']:
            v0 = output['videos'][0]
            url = v0.get('url') if isinstance(v0, dict) else v0
    elif isinstance(output, list) and output:
        v0 = output[0]
        url = v0.get('url') if isinstance(v0, dict) else v0
    if not url:
        url = data.get('video_url') or data.get('url')

    if raw_status in ('succeeded', 'success', 'completed', 'ready', 'done') or url:
        return ('ready' if url else 'processing'), url, None
    if raw_status in ('failed', 'error', 'canceled'):
        return 'failed', None, (data.get('error') or 'generation failed')
    return 'processing', None, None


def save_to_s3(video_url: str, phrase_key: str) -> tuple:
    """Скачивает готовое видео и кладёт в S3, возвращает (cdn_url, error)."""
    try:
        import boto3
        with urllib.request.urlopen(video_url, timeout=120) as r:
            video_bytes = r.read()
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        key = f'ksusha/{phrase_key}-{uuid.uuid4().hex[:8]}.mp4'
        s3.put_object(Bucket='files', Key=key, Body=video_bytes, ContentType='video/mp4')
        cdn = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        return cdn, None
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:150]}'


def action_list(conn):
    """Все готовые ролики для фронта."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT phrase_key, phrase, emotion, status, video_url "
            "FROM ksusha_videos WHERE status = 'ready' AND video_url IS NOT NULL"
        )
        rows = cur.fetchall()
    videos = {r['phrase_key']: r['video_url'] for r in rows}
    return ok({'videos': videos, 'items': rows})


def action_generate(conn, body):
    phrase = (body.get('phrase') or '').strip()
    if not phrase:
        return err('phrase обязателен')
    phrase_key = slugify_key(body.get('phrase_key') or phrase[:40])
    emotion = (body.get('emotion') or 'idle')[:40]

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT id, status, video_url FROM ksusha_videos WHERE phrase_key = %s", (phrase_key,))
        existing = cur.fetchone()
        if existing and existing['status'] == 'ready' and existing['video_url']:
            return ok({'phrase_key': phrase_key, 'status': 'ready', 'video_url': existing['video_url'], 'cached': True})

    job_id, gen_err = polza_create_video(phrase)
    if not job_id:
        return err(f'Не удалось запустить генерацию: {gen_err}', 502)

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO ksusha_videos (phrase_key, phrase, emotion, provider_job_id, status)
            VALUES (%s, %s, %s, %s, 'processing')
            ON CONFLICT (phrase_key) DO UPDATE
              SET phrase = EXCLUDED.phrase, emotion = EXCLUDED.emotion,
                  provider_job_id = EXCLUDED.provider_job_id, status = 'processing',
                  error = NULL, updated_at = NOW()
        """, (phrase_key, phrase, emotion, job_id))
    conn.commit()
    return ok({'phrase_key': phrase_key, 'status': 'processing', 'job_id': job_id})


def action_status(conn, body):
    raw_key = (body.get('phrase_key') or '').strip()
    if not raw_key:
        return err('phrase_key обязателен')
    phrase_key = slugify_key(raw_key)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT provider_job_id, status, video_url FROM ksusha_videos WHERE phrase_key = %s", (phrase_key,))
        row = cur.fetchone()
    if not row:
        return err('ролик не найден', 404)
    if row['status'] == 'ready' and row['video_url']:
        return ok({'phrase_key': phrase_key, 'status': 'ready', 'video_url': row['video_url']})

    job_id = row['provider_job_id']
    if not job_id:
        return ok({'phrase_key': phrase_key, 'status': row['status']})

    status, video_url, status_err = polza_get_status(job_id)
    if status == 'ready' and video_url:
        cdn_url, s3_err = save_to_s3(video_url, phrase_key)
        if not cdn_url:
            with conn.cursor() as cur:
                cur.execute("UPDATE ksusha_videos SET status='failed', error=%s, updated_at=NOW() WHERE phrase_key=%s",
                            (s3_err, phrase_key))
            conn.commit()
            return err(f'Не удалось сохранить видео: {s3_err}', 502)
        with conn.cursor() as cur:
            cur.execute("UPDATE ksusha_videos SET status='ready', video_url=%s, error=NULL, updated_at=NOW() WHERE phrase_key=%s",
                        (cdn_url, phrase_key))
        conn.commit()
        return ok({'phrase_key': phrase_key, 'status': 'ready', 'video_url': cdn_url})

    if status == 'failed':
        with conn.cursor() as cur:
            cur.execute("UPDATE ksusha_videos SET status='failed', error=%s, updated_at=NOW() WHERE phrase_key=%s",
                        (status_err, phrase_key))
        conn.commit()
        return ok({'phrase_key': phrase_key, 'status': 'failed', 'error': status_err})

    return ok({'phrase_key': phrase_key, 'status': 'processing'})


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = db_conn()
    if not conn:
        return err('База данных недоступна', 500)

    try:
        method = event.get('httpMethod', 'GET')
        params = event.get('queryStringParameters') or {}
        action = (params.get('action') or '').strip()

        if method == 'GET' and (action == 'list' or not action):
            return action_list(conn)

        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except Exception:
                body = {}

        if action == 'generate':
            return action_generate(conn, body)
        if action == 'status':
            return action_status(conn, body)

        return err('Неизвестное действие', 404)
    finally:
        try:
            conn.close()
        except Exception:
            pass