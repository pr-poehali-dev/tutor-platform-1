"""Генератор настоящих детских песен (вокал + музыка) через polza.ai (Suno).

POST /?action=start   body:{song_id, prompt, style, title, version?}  → запускает генерацию, возвращает task media id
GET  /?action=poll&id=<media_id>                                       → статус генерации + ссылки на аудио
POST /?action=save    body:{song_id, audio_url}                        → скачивает готовый mp3 и кладёт в S3, возвращает CDN-URL

Секреты: POLZA_API_KEY (polza.ai), AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (S3).
"""
import json
import os
import urllib.request
import urllib.error

import boto3

POLZA_MEDIA_URL = 'https://api.polza.ai/api/v1/media'

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
        return None, 'POLZA_API_KEY не настроен'
    req = urllib.request.Request(
        POLZA_MEDIA_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode('utf-8')), None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'ignore')
        return None, f'polza {e.code}: {body[:600]}'
    except Exception as e:
        return None, f'polza error: {e}'


def _polza_get(media_id):
    api_key = os.environ.get('POLZA_API_KEY', '')
    url = f'{POLZA_MEDIA_URL}/{media_id}'
    req = urllib.request.Request(
        url, headers={'Authorization': f'Bearer {api_key}'}, method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode('utf-8')), None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'ignore')
        return None, f'polza {e.code}: {body[:600]}'
    except Exception as e:
        return None, f'polza error: {e}'


def action_start(body):
    prompt = str(body.get('prompt', '')).strip()
    style = str(body.get('style', '')).strip()
    title = str(body.get('title', '')).strip()
    version = str(body.get('version', 'V5')).strip() or 'V5'
    model = str(body.get('model', 'suno/generate')).strip() or 'suno/generate'
    if not prompt:
        return _resp(400, {'error': 'prompt обязателен'})
    payload = {'model': model, 'prompt': prompt}
    if model.startswith('suno'):
        payload['version'] = version
    if style:
        payload['style'] = style
    if title:
        payload['title'] = title
    data, err = _polza_post(payload)
    if err:
        return _resp(502, {'error': err})
    return _resp(200, {'ok': True, 'raw': data})


def action_poll(qs):
    media_id = str(qs.get('id', '')).strip()
    if not media_id:
        return _resp(400, {'error': 'id обязателен'})
    data, err = _polza_get(media_id)
    if err:
        return _resp(502, {'error': err})
    return _resp(200, {'ok': True, 'raw': data})


def action_save(body):
    song_id = str(body.get('song_id', '')).strip()
    audio_url = str(body.get('audio_url', '')).strip()
    if not song_id or not all(c.isalnum() or c in '-_' for c in song_id):
        return _resp(400, {'error': 'Некорректный song_id'})
    if not audio_url.startswith('http'):
        return _resp(400, {'error': 'Некорректный audio_url'})

    try:
        req = urllib.request.Request(audio_url, headers={'User-Agent': 'UchispriBot/1.0'})
        with urllib.request.urlopen(req, timeout=120) as r:
            audio_bytes = r.read()
    except Exception as e:
        return _resp(502, {'error': f'Скачивание не удалось: {e}'})

    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )
    s3_key = f'songs/full-{song_id}.mp3'
    try:
        s3.put_object(
            Bucket='files',
            Key=s3_key,
            Body=audio_bytes,
            ContentType='audio/mpeg',
            CacheControl='public, max-age=31536000',
        )
    except Exception as e:
        return _resp(500, {'error': f'S3 upload failed: {e}'})

    cdn_url = f'https://cdn.poehali.dev/projects/{access_key}/bucket/{s3_key}'
    return _resp(200, {'ok': True, 'song_id': song_id, 'audioUrl': cdn_url, 'size': len(audio_bytes)})


def handler(event, context):
    """Генерация детских песен через polza.ai Suno: start / poll / save."""
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

    if action == 'start':
        return action_start(body)
    if action == 'poll':
        return action_poll(qs)
    if action == 'save':
        return action_save(body)
    return _resp(400, {'error': 'Unknown action'})