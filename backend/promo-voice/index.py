"""
Business: озвучивает сценарий промо-ролика УЧИСЬПРО через Yandex SpeechKit
голосом Filipp (бодрый молодой мужской) и склеивает все сцены в один MP3-файл.
Сохраняет результат в S3, возвращает публичный URL + длительности каждой сцены
(для синхронизации с видео-рендером на клиенте).
Args: event с body {variant_id, scenes:[{text, duration}]}; context с request_id
Returns: HTTP 200 с {audio_url, scene_offsets:[{start_sec, duration_sec}], total_sec}
"""
import json
import os
import re
import time
import urllib.request
import urllib.parse
import urllib.error
import base64
import hashlib

import boto3


VOICE = 'lera'             # молодая женская — естественная, живая (аналог "Лисы")
EMOTION = 'good'           # дружелюбно-энергично, отлично подходит для промо
SPEED = 1.15               # быстрее, бодрее — соцсети любят динамику
LANG = 'ru-RU'
FORMAT = 'mp3'
SAMPLE_RATE = '48000'

YA_URL = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize'

HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
}


def humanize(text: str) -> str:
    """Делает речь более человечной через нативные паузы SpeechKit.

    - sil<[300]> — короткая пауза 300 мс (после запятой, тире)
    - sil<[500]> — средняя (после точки, восклицания)
    - sil<[800]> — длинная (между предложениями, перед новой мыслью)
    Без этого голос «тараторит» и проглатывает окончания.
    """
    t = (text or '').strip()
    t = re.sub(r'\s+', ' ', t)
    # Короткие паузы — голос звучит живо, но темп остаётся быстрым
    t = re.sub(r'([.!?])\s+([А-ЯA-Z])', r'\1 sil<[350]> \2', t)
    t = re.sub(r'([:—–])\s+', r'\1 sil<[200]> ', t)
    t = re.sub(r',\s+', ', sil<[120]> ', t)
    # Хвостовая пауза — последнее слово не обрывается
    t = t.rstrip('.!?,;') + '. sil<[400]>'
    return t


def synth_one(text: str) -> bytes:
    """Один запрос к SpeechKit, возвращает MP3 байты."""
    api_key = os.environ.get('YANDEX_SPEECHKIT_API_KEY', '')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', '')
    if not api_key:
        raise RuntimeError('YANDEX_SPEECHKIT_API_KEY not set')

    data = {
        'text': humanize(text)[:4900],
        'voice': VOICE,
        'emotion': EMOTION,
        'speed': str(SPEED),
        'lang': LANG,
        'format': FORMAT,
        'sampleRateHertz': SAMPLE_RATE,
    }
    if folder_id:
        data['folderId'] = folder_id

    body = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(
        YA_URL,
        data=body,
        headers={
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def upload_to_s3(audio_bytes: bytes, variant_id: str) -> str:
    """Загружает MP3 в S3, возвращает CDN-URL."""
    aws_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    aws_secret = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    if not aws_key or not aws_secret:
        raise RuntimeError('AWS credentials missing')

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=aws_key,
        aws_secret_access_key=aws_secret,
    )

    h = hashlib.md5(audio_bytes).hexdigest()[:10]
    key = f'promo/voice/{variant_id}-{h}.mp3'
    s3.put_object(
        Bucket='files',
        Key=key,
        Body=audio_bytes,
        ContentType='audio/mpeg',
        CacheControl='public, max-age=86400',
    )
    return f"https://cdn.poehali.dev/projects/{aws_key}/bucket/{key}"


def handler(event: dict, context) -> dict:
    """Озвучивает все сцены сценария и возвращает один склеенный MP3.

    body = {variant_id: str, scenes: [{text: str, duration: float}]}
    """
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}

    if method != 'POST':
        return {'statusCode': 405, 'headers': HEADERS,
                'body': json.dumps({'error': 'Method not allowed'})}

    try:
        body_raw = event.get('body') or '{}'
        if event.get('isBase64Encoded'):
            body_raw = base64.b64decode(body_raw).decode('utf-8')
        body = json.loads(body_raw)
        if not isinstance(body, dict):
            raise ValueError('body must be a JSON object')
    except (json.JSONDecodeError, ValueError):
        return {'statusCode': 400, 'headers': HEADERS,
                'body': json.dumps({'error': 'Invalid JSON'})}

    variant_id = (body.get('variant_id') or 'shorts60').strip()[:32]
    scenes = body.get('scenes') or []
    if not isinstance(scenes, list) or not scenes:
        return {'statusCode': 400, 'headers': HEADERS,
                'body': json.dumps({'error': 'scenes required'})}

    # Склеиваем весь текст в одну дорожку — так SpeechKit даёт более ровную
    # интонацию между сценами + один HTTP-запрос вместо N.
    full_text_parts = []
    scene_offsets = []
    running = 0.0
    for sc in scenes:
        txt = str(sc.get('text', '')).strip()
        dur = float(sc.get('duration', 5))
        full_text_parts.append(txt)
        scene_offsets.append({'start_sec': running, 'duration_sec': dur})
        running += dur

    # Между сценами — 700 мс паузы для естественной смены кадра
    full_text = ' sil<[700]> '.join(full_text_parts)

    try:
        audio = synth_one(full_text)
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode('utf-8', errors='ignore')[:500]
        except Exception:
            err_body = ''
        return {'statusCode': 502, 'headers': HEADERS,
                'body': json.dumps({'error': f'speechkit_http_{e.code}',
                                    'detail': err_body,
                                    'voice': VOICE,
                                    'text_preview': full_text[:200]},
                                   ensure_ascii=False)}
    except (urllib.error.URLError, RuntimeError, OSError) as e:
        return {'statusCode': 502, 'headers': HEADERS,
                'body': json.dumps({'error': 'speechkit_failed',
                                    'detail': str(e)[:200]},
                                   ensure_ascii=False)}

    # Загружаем в S3 для скачивания, но не критично если упадёт —
    # клиент получит аудио в base64 напрямую (без CORS-проблем с CDN).
    audio_url = ''
    try:
        audio_url = upload_to_s3(audio, variant_id)
    except (RuntimeError, OSError):
        pass

    # Base64 аудио передаём прямо в ответе — клиент декодирует
    # без сетевого запроса к CDN. Это обходит блокировку CORS на bucket.poehali.dev.
    audio_b64 = base64.b64encode(audio).decode('ascii')

    return {
        'statusCode': 200,
        'headers': HEADERS,
        'body': json.dumps({
            'ok': True,
            'audio_url': audio_url,
            'audio_base64': audio_b64,
            'audio_size_bytes': len(audio),
            'voice': VOICE,
            'total_sec': running,
            'scene_offsets': scene_offsets,
            'cached': False,
            'generated_at': int(time.time()),
        }, ensure_ascii=False),
    }