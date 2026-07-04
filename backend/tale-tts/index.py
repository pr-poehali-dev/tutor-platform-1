import json
import os
import re
import urllib.request
import urllib.parse
import urllib.error

import boto3

VOICE = {'voice': 'alena', 'role': 'friendly', 'speed': '0.95'}
YANDEX_TTS_URL = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize'
MAX_CHUNK = 4500


def _cors(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin',
            'Content-Type': 'application/json',
        },
        'body': json.dumps(body, ensure_ascii=False),
    }


def split_text(text: str) -> list:
    """Разбивает длинный текст на части по границам предложений (<= MAX_CHUNK)."""
    sentences = re.split(r'(?<=[.!?…])\s+', text.strip())
    chunks, cur = [], ''
    for s in sentences:
        if len(cur) + len(s) + 1 > MAX_CHUNK:
            if cur:
                chunks.append(cur.strip())
            cur = s
        else:
            cur = f'{cur} {s}'.strip()
    if cur:
        chunks.append(cur.strip())
    return chunks or [text[:MAX_CHUNK]]


def synth_chunk(text: str, api_key: str, folder_id: str) -> bytes:
    params = {
        'text': text,
        'lang': 'ru-RU',
        'voice': VOICE['voice'],
        'role': VOICE['role'],
        'speed': VOICE['speed'],
        'format': 'mp3',
    }
    if folder_id:
        params['folderId'] = folder_id
    payload = urllib.parse.urlencode(params).encode('utf-8')
    req = urllib.request.Request(
        YANDEX_TTS_URL,
        data=payload,
        headers={
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', errors='ignore')
        # fallback: role -> emotion
        params.pop('role', None)
        params['emotion'] = 'good'
        payload = urllib.parse.urlencode(params).encode('utf-8')
        req2 = urllib.request.Request(
            YANDEX_TTS_URL,
            data=payload,
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method='POST',
        )
        with urllib.request.urlopen(req2, timeout=30) as resp:
            return resp.read()


def handler(event: dict, context) -> dict:
    """Озвучивает текст (сказку) через Yandex SpeechKit, склеивает mp3 и грузит в S3. Возвращает CDN-URL."""
    if event.get('httpMethod') == 'OPTIONS':
        return _cors(200, {})

    admin_pin = os.environ.get('ADMIN_PIN', '')
    headers = event.get('headers') or {}
    provided = headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or ''
    if admin_pin and provided != admin_pin:
        return _cors(401, {'error': 'Требуется X-Admin-Pin'})

    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return _cors(400, {'error': 'Некорректный JSON'})

    text = (body.get('text') or '').strip()
    slug = (body.get('slug') or 'tale').strip()
    if not text:
        return _cors(400, {'error': 'text обязателен'})

    api_key = os.environ.get('YANDEX_SPEECHKIT_API_KEY', '')
    if not api_key:
        return _cors(500, {'error': 'YANDEX_SPEECHKIT_API_KEY не настроен'})
    folder_id = os.environ.get('YANDEX_FOLDER_ID', '').strip()

    chunks = split_text(text)
    audio = b''
    for ch in chunks:
        audio += synth_chunk(ch, api_key, folder_id)

    key = f'feed-audio/{slug}.mp3'
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=audio, ContentType='audio/mpeg')
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return _cors(200, {'audio_url': cdn_url, 'chunks': len(chunks), 'bytes': len(audio)})