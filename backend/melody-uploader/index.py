"""
Business: Генератор фоновых инструменталок для песенок Няни Лисы. Создаёт
короткие зацикленные WAV-мелодии прямо в Python (без внешних CDN), кодирует
в base64-WAV и кладёт в S3, чтобы их можно было микшировать с TTS-голосом.
Args: event с httpMethod=POST и queryStringParameters.id (folk|pop|lullaby|ethno|march)
Returns: HTTP-ответ с CDN-URL сгенерированной мелодии
"""
import json
import math
import os
import struct
import wave
import io

import boto3


SAMPLE_RATE = 22050
DURATION_SEC = 20  # 20 секунд лупа — браузер сам зациклит


# Ноты в Гц
NOTES = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
    'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25,
    'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00,
    'A3': 220.00, 'B3': 246.94,
    'REST': 0,
}


# Композиции: список (нота, длительность в долях)
MELODIES_DEF = {
    'folk': {
        'key': 'songs/melody-folk.mp3',
        'label': 'Народная гармошка',
        'tempo': 110,
        'timbre': 'square',
        'notes': [
            ('E4', 1), ('G4', 1), ('A4', 1), ('B4', 1),
            ('C5', 2), ('B4', 1), ('A4', 1),
            ('G4', 2), ('E4', 2),
            ('D4', 1), ('E4', 1), ('G4', 1), ('A4', 1),
            ('B4', 2), ('A4', 1), ('G4', 1),
            ('E4', 4),
        ],
    },
    'pop': {
        'key': 'songs/melody-pop.mp3',
        'label': 'Детский поп',
        'tempo': 130,
        'timbre': 'triangle',
        'notes': [
            ('C5', 1), ('E5', 1), ('G5', 2),
            ('C5', 1), ('E5', 1), ('G5', 2),
            ('A4', 1), ('C5', 1), ('E5', 2),
            ('G4', 1), ('B4', 1), ('D5', 2),
            ('F4', 1), ('A4', 1), ('C5', 2),
            ('G4', 4),
        ],
    },
    'lullaby': {
        'key': 'songs/melody-lullaby.mp3',
        'label': 'Колыбельное пианино',
        'tempo': 70,
        'timbre': 'sine',
        'notes': [
            ('E4', 2), ('G4', 2), ('E4', 2), ('C4', 2),
            ('D4', 2), ('E4', 2), ('F4', 4),
            ('E4', 2), ('D4', 2), ('C4', 4),
            ('G3', 2), ('A3', 2), ('B3', 2), ('C4', 2),
            ('D4', 4), ('C4', 4),
        ],
    },
    'ethno': {
        'key': 'songs/melody-ethno.mp3',
        'label': 'Гусли и свирель',
        'tempo': 95,
        'timbre': 'pluck',
        'notes': [
            ('A4', 1), ('B4', 1), ('C5', 1), ('D5', 1),
            ('E5', 2), ('D5', 1), ('C5', 1),
            ('B4', 2), ('A4', 2),
            ('G4', 1), ('A4', 1), ('B4', 1), ('C5', 1),
            ('A4', 4),
            ('E4', 2), ('A4', 2),
        ],
    },
    'march': {
        'key': 'songs/melody-march.mp3',
        'label': 'Игрушечный марш',
        'tempo': 120,
        'timbre': 'square',
        'notes': [
            ('C4', 1), ('C4', 1), ('G4', 1), ('G4', 1),
            ('A4', 1), ('A4', 1), ('G4', 2),
            ('F4', 1), ('F4', 1), ('E4', 1), ('E4', 1),
            ('D4', 1), ('D4', 1), ('C4', 2),
            ('G4', 1), ('G4', 1), ('F4', 1), ('F4', 1),
            ('E4', 2), ('D4', 2),
        ],
    },
}


def synthesize(notes, tempo, timbre, total_sec):
    """Генерирует моно 16-bit PCM сэмплы."""
    beat_sec = 60.0 / tempo / 2  # длительность одной "доли"
    samples = []

    while True:
        for note_name, dur in notes:
            freq = NOTES.get(note_name, 0)
            note_samples = int(SAMPLE_RATE * beat_sec * dur)

            for i in range(note_samples):
                t = i / SAMPLE_RATE
                if freq == 0:
                    val = 0.0
                else:
                    phase = 2 * math.pi * freq * t
                    if timbre == 'sine':
                        val = math.sin(phase)
                    elif timbre == 'square':
                        val = 1.0 if math.sin(phase) > 0 else -1.0
                        val *= 0.4
                    elif timbre == 'triangle':
                        val = 2 / math.pi * math.asin(math.sin(phase))
                    elif timbre == 'pluck':
                        # Затухающий синус, имитация щипка
                        decay = math.exp(-3 * (i / note_samples))
                        val = math.sin(phase) * decay
                    else:
                        val = math.sin(phase)

                # ADSR envelope (мягкая атака и затухание)
                env = 1.0
                attack = int(0.01 * SAMPLE_RATE)
                release = int(0.05 * SAMPLE_RATE)
                if i < attack:
                    env = i / attack
                elif i > note_samples - release:
                    env = max(0, (note_samples - i) / release)

                samples.append(val * env * 0.3)  # громкость 30%

            if len(samples) / SAMPLE_RATE >= total_sec:
                return samples[:int(SAMPLE_RATE * total_sec)]


def encode_wav(samples):
    """Кодирует список float-сэмплов в WAV bytes."""
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = b''.join(struct.pack('<h', max(-32767, min(32767, int(s * 32767)))) for s in samples)
        wf.writeframes(frames)
    return buf.getvalue()


def upload_vocal(body):
    """Заливает готовый вокальный трек песни (base64) в S3 и возвращает CDN-URL.

    body: {song_id, audio_base64, content_type?}
    Ключ в S3: songs/vocal-<song_id>.<ext>. Этот URL кладётся в audioUrl песни.
    """
    import base64

    song_id = str(body.get('song_id', '')).strip()
    audio_b64 = body.get('audio_base64', '')
    content_type = body.get('content_type', 'audio/mpeg')

    # Разрешаем только безопасные символы в id
    if not song_id or not all(c.isalnum() or c in '-_' for c in song_id):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный song_id'}, ensure_ascii=False),
        }

    ext = 'wav' if 'wav' in content_type else 'mp3'
    # data:audio/...;base64,XXXX → берём только часть после запятой
    if ',' in audio_b64:
        audio_b64 = audio_b64.split(',', 1)[1]
    try:
        audio_bytes = base64.b64decode(audio_b64)
    except Exception:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Битый base64'}, ensure_ascii=False),
        }

    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    if not access_key or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'S3 credentials missing'}),
        }

    s3_key = f'songs/vocal-{song_id}.{ext}'
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )
    try:
        s3.put_object(
            Bucket='files',
            Key=s3_key,
            Body=audio_bytes,
            ContentType=content_type,
            CacheControl='public, max-age=31536000',
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'S3 upload failed: {e}'}, ensure_ascii=False),
        }

    cdn_url = f'https://cdn.poehali.dev/projects/{access_key}/bucket/{s3_key}'
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'song_id': song_id, 'audioUrl': cdn_url}, ensure_ascii=False),
    }


def handler(event, context):
    """Генерирует инструменталку (?id=...) ИЛИ заливает вокальный трек песни (POST body с song_id+audio_base64)."""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
        }

    if method not in ('GET', 'POST'):
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    # ── Загрузка готового ВОКАЛЬНОГО трека песни (mp3/wav из Suno и т.п.) ──
    # POST body: {"song_id": "korovka", "audio_base64": "...", "content_type": "audio/mpeg"}
    body_raw = event.get('body') or ''
    if method == 'POST' and body_raw:
        try:
            body = json.loads(body_raw)
        except Exception:
            body = {}
        if body.get('song_id') and body.get('audio_base64'):
            return upload_vocal(body)

    qs = event.get('queryStringParameters') or {}
    melody_id = (qs.get('id') or '').strip()

    if not melody_id or melody_id not in MELODIES_DEF:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'Передай ?id=<melody_id>',
                'available': list(MELODIES_DEF.keys()),
            }, ensure_ascii=False),
        }

    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    if not access_key or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'S3 credentials missing'}),
        }

    m = MELODIES_DEF[melody_id]
    # Меняем расширение на .wav, т.к. генерируем WAV (mp3 без сторонних либ не получится)
    s3_key = m['key'].replace('.mp3', '.wav')

    try:
        samples = synthesize(m['notes'], m['tempo'], m['timbre'], DURATION_SEC)
        wav_bytes = encode_wav(samples)
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Synth failed: {e}'}, ensure_ascii=False),
        }

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

    try:
        s3.put_object(
            Bucket='files',
            Key=s3_key,
            Body=wav_bytes,
            ContentType='audio/wav',
            CacheControl='public, max-age=31536000',
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'S3 upload failed: {e}'}, ensure_ascii=False),
        }

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{s3_key}"

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        'body': json.dumps({
            'ok': True,
            'id': melody_id,
            'key': s3_key,
            'label': m['label'],
            'size': len(wav_bytes),
            'cdn_url': cdn_url,
        }, ensure_ascii=False),
    }