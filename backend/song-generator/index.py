"""Генератор настоящих детских песен (вокал + музыка) через polza.ai (Suno).

POST /?action=generate  body:{song_id, prompt, style, title, version?}
     Полный цикл с автоповтором: запуск (ретраи при 503) → поллинг готовности →
     скачивание mp3 → загрузка в S3 → запись в БД. Возвращает CDN-URL.
GET  /?action=list       → карта готовых песен {song_id: audio_url} из БД.
GET  /?action=poll&id=<media_id>   → сырой статус media (диагностика).

Секреты: POLZA_API_KEY, AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, DATABASE_URL.
"""
import json
import os
import time
import urllib.request
import urllib.error

import boto3
import psycopg2

POLZA_MEDIA_URL = 'https://api.polza.ai/api/v1/media'
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Access-Control-Max-Age': '86400',
}


def _resp(status, data):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }


def _polza_post(payload):
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 503, 'POLZA_API_KEY не настроен'
    req = urllib.request.Request(
        POLZA_MEDIA_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode('utf-8')), 200, None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'ignore')
        return None, e.code, f'polza {e.code}: {body[:400]}'
    except Exception as e:
        return None, 0, f'polza error: {e}'


def _polza_get(media_id):
    api_key = os.environ.get('POLZA_API_KEY', '')
    req = urllib.request.Request(
        f'{POLZA_MEDIA_URL}/{media_id}',
        headers={'Authorization': f'Bearer {api_key}'}, method='GET',
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode('utf-8')), None
    except urllib.error.HTTPError as e:
        return None, f'polza {e.code}: {e.read().decode("utf-8", "ignore")[:400]}'
    except Exception as e:
        return None, f'polza error: {e}'


def _extract_audio_url(data):
    """Достаёт ссылку на аудио из ответа media разной формы."""
    if not isinstance(data, dict):
        return None
    # Прямые поля
    for k in ('audio_url', 'audioUrl', 'url', 'output_url'):
        v = data.get(k)
        if isinstance(v, str) and v.startswith('http'):
            return v
    # Вложенные структуры result/data/output
    for key in ('result', 'data', 'output', 'media'):
        sub = data.get(key)
        if isinstance(sub, dict):
            found = _extract_audio_url(sub)
            if found:
                return found
        if isinstance(sub, list):
            for it in sub:
                found = _extract_audio_url(it) if isinstance(it, dict) else None
                if found:
                    return found
                if isinstance(it, str) and it.startswith('http') and '.mp3' in it:
                    return it
    return None


def _db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _save_to_s3(song_id, audio_url):
    req = urllib.request.Request(audio_url, headers={'User-Agent': 'UchispriBot/1.0'})
    with urllib.request.urlopen(req, timeout=120) as r:
        audio_bytes = r.read()
    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    s3 = boto3.client(
        's3', endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key, aws_secret_access_key=secret_key,
    )
    s3_key = f'songs/full-{song_id}.mp3'
    s3.put_object(
        Bucket='files', Key=s3_key, Body=audio_bytes,
        ContentType='audio/mpeg', CacheControl='public, max-age=31536000',
    )
    return f'https://cdn.poehali.dev/projects/{access_key}/bucket/{s3_key}', len(audio_bytes)


def _db_upsert(song_id, cdn_url, media_id):
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.kids_song_audio (song_id, audio_url, status, media_id, updated_at) "
            f"VALUES (%s, %s, 'ready', %s, now()) "
            f"ON CONFLICT (song_id) DO UPDATE SET audio_url = EXCLUDED.audio_url, "
            f"status = 'ready', media_id = EXCLUDED.media_id, updated_at = now()",
            (song_id, cdn_url, media_id),
        )
        conn.commit()
    finally:
        conn.close()


def _db_set_pending(song_id, media_id):
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.kids_song_audio (song_id, audio_url, status, media_id, updated_at) "
            f"VALUES (%s, '', 'pending', %s, now()) "
            f"ON CONFLICT (song_id) DO UPDATE SET status = 'pending', "
            f"media_id = EXCLUDED.media_id, updated_at = now()",
            (song_id, media_id),
        )
        conn.commit()
    finally:
        conn.close()


def action_generate(body):
    """Быстрый запуск генерации (без ожидания). Автоповтор при 503.
    Готовый трек забирается позже через ?action=finalize."""
    song_id = str(body.get('song_id', '')).strip()
    prompt = str(body.get('prompt', '')).strip()
    style = str(body.get('style', '')).strip()
    title = str(body.get('title', '')).strip()
    version = str(body.get('version', 'V5')).strip() or 'V5'
    model = str(body.get('model', 'suno/generate')).strip() or 'suno/generate'
    if not song_id or not all(c.isalnum() or c in '-_' for c in song_id):
        return _resp(400, {'error': 'Некорректный song_id'})
    if not prompt:
        return _resp(400, {'error': 'prompt обязателен'})

    payload = {'model': model, 'prompt': prompt}
    if model.startswith('suno'):
        payload['version'] = version
    if style:
        payload['style'] = style
    if title:
        payload['title'] = title

    # АВТОПОВТОР запуска: несколько попыток при 503/сбое провайдера
    data = None
    last_err = None
    for _ in range(4):
        data, code, err = _polza_post(payload)
        if data is not None:
            break
        last_err = err
        if code in (503, 502, 0, 429):
            time.sleep(3)
            continue
        break
    if data is None:
        return _resp(502, {'error': f'Suno недоступен: {last_err}', 'retry': True})

    media_id = data.get('id')
    audio_url = _extract_audio_url(data)

    # Готово мгновенно — сохраняем сразу
    if audio_url:
        try:
            cdn_url, size = _save_to_s3(song_id, audio_url)
            _db_upsert(song_id, cdn_url, media_id)
            return _resp(200, {'ok': True, 'song_id': song_id, 'audioUrl': cdn_url, 'size': size})
        except Exception as e:
            return _resp(502, {'error': f'Сохранение не удалось: {e}'})

    # Иначе — запоминаем задачу как pending, заберём позже через finalize
    try:
        _db_set_pending(song_id, media_id)
    except Exception:
        pass
    return _resp(202, {'ok': True, 'pending': True, 'song_id': song_id, 'media_id': media_id})


def _db_mark_failed(song_id):
    """Сбрасывает задачу, чтобы её можно было сгенерировать заново."""
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.kids_song_audio SET status = 'failed', updated_at = now() "
            f"WHERE song_id = %s",
            (song_id,),
        )
        conn.commit()
    finally:
        conn.close()


def action_finalize():
    """Проверяет pending-задачи: готовые сохраняет, провалившиеся у Suno помечает
    как failed (их фронт пересоздаст). Долгие задачи оставляет в pending."""
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT song_id, media_id FROM {SCHEMA}.kids_song_audio "
            f"WHERE status = 'pending' AND media_id IS NOT NULL LIMIT 5"
        )
        rows = cur.fetchall()
    finally:
        conn.close()

    done, still, failed = [], [], []
    for song_id, media_id in rows:
        pd, perr = _polza_get(media_id)
        # Провал на стороне Suno — помечаем failed, чтобы пересоздать
        if not perr and isinstance(pd, dict) and pd.get('status') in ('failed', 'error'):
            try:
                _db_mark_failed(song_id)
            except Exception:
                pass
            failed.append(song_id)
            continue
        if perr or not isinstance(pd, dict):
            still.append(song_id)
            continue
        audio_url = _extract_audio_url(pd)
        if not audio_url:
            still.append(song_id)
            continue
        try:
            cdn_url, _ = _save_to_s3(song_id, audio_url)
            _db_upsert(song_id, cdn_url, media_id)
            done.append(song_id)
        except Exception:
            still.append(song_id)
    return _resp(200, {'ok': True, 'finalized': done, 'pending': still, 'failed': failed})


def action_list():
    conn = _db()
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT song_id, audio_url, status FROM {SCHEMA}.kids_song_audio"
        )
        rows = cur.fetchall()
    finally:
        conn.close()
    songs, pending = {}, []
    for song_id, audio_url, status in rows:
        if status == 'ready' and audio_url:
            songs[song_id] = audio_url
        elif status == 'pending':
            pending.append(song_id)
    return _resp(200, {'ok': True, 'songs': songs, 'pending': pending})


def action_poll(qs):
    media_id = str(qs.get('id', '')).strip()
    if not media_id:
        return _resp(400, {'error': 'id обязателен'})
    data, err = _polza_get(media_id)
    if err:
        return _resp(502, {'error': err})
    return _resp(200, {'ok': True, 'raw': data, 'audio_url': _extract_audio_url(data)})


def handler(event, context):
    """Генерация детских песен через polza.ai Suno: generate / finalize / list / poll."""
    method = event.get('httpMethod', 'POST')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or '').strip()

    body = {}
    raw = event.get('body') or ''
    if raw:
        try:
            body = json.loads(raw)
        except Exception:
            body = {}

    if action == 'generate':
        return action_generate(body)
    if action == 'finalize':
        return action_finalize()
    if action == 'list':
        return action_list()
    if action == 'poll':
        return action_poll(qs)
    return _resp(400, {'error': 'Unknown action'})