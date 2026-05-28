"""
Business: Распознавание речи через Yandex SpeechKit — превращает голос ученика в текст.
Args: event с httpMethod, body (audio_base64); context с request_id
Returns: HTTP-ответ {text: str} — распознанный текст вопроса
"""
import json
import os
import base64
import urllib.request
import urllib.error


def handler(event, context):
    """Распознаёт речь ученика через Yandex SpeechKit"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    try:
        body_str = event.get('body', '{}')
        body = json.loads(body_str) if isinstance(body_str, str) else body_str

        audio_b64 = body.get('audio_base64', '')
        fmt_raw = (body.get('format') or 'oggopus').strip().lower()

        # Yandex SpeechKit v1 принимает только lpcm и oggopus.
        # Safari/iOS пишут audio/mp4 (AAC) — Yandex его не поймёт.
        # Поэтому для mp4 не передаём format вообще: Yandex попытается
        # определить контейнер по первым байтам.
        if fmt_raw in ('mp4', 'm4a', 'aac', 'mpeg'):
            fmt = ''  # пусть Yandex определит сам
        elif fmt_raw == 'lpcm':
            fmt = 'lpcm'
        else:
            fmt = 'oggopus'

        if not audio_b64:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Аудио не передано'}, ensure_ascii=False),
            }

        api_key = os.environ.get('YANDEX_SPEECHKIT_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'YANDEX_SPEECHKIT_API_KEY не настроен'}, ensure_ascii=False),
            }

        try:
            audio_bytes = base64.b64decode(audio_b64)
        except Exception:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Невалидный base64 аудио'}, ensure_ascii=False),
            }

        if len(audio_bytes) > 1024 * 1024:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Файл больше 1 МБ. Запиши короче.'}, ensure_ascii=False),
            }

        folder_id = os.environ.get('YANDEX_FOLDER_ID', '').strip()
        params = ['lang=ru-RU', 'topic=general']
        if fmt:
            params.append(f'format={fmt}')
        if folder_id:
            params.append(f'folderId={folder_id}')
        url = 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?' + '&'.join(params)

        req = urllib.request.Request(
            url,
            data=audio_bytes,
            headers={
                'Authorization': f'Api-Key {api_key}',
            },
            method='POST',
        )

        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                result = json.loads(response.read().decode('utf-8'))
                text = result.get('result', '').strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            # Делаем понятное пользователю сообщение
            low = err_body.lower()
            if 'format' in low or 'codec' in low or 'unsupported' in low:
                user_msg = ('Браузер записал звук в формате, который не понимает '
                            'распознавалка. Открой сайт в Chrome или обнови Safari.')
            elif 'too short' in low or 'short' in low:
                user_msg = 'Запись слишком короткая. Зажми кнопку и говори чётче.'
            elif 'quota' in low or 'limit' in low or e.code == 429:
                user_msg = 'Сервис распознавания временно перегружен. Попробуй через минуту.'
            elif e.code in (401, 403):
                user_msg = 'Сбой авторизации сервиса. Мы уже разбираемся.'
            else:
                user_msg = f'Сервис распознавания ответил ошибкой (код {e.code}). Попробуй ещё раз.'
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': user_msg,
                    'yandex_code': e.code,
                    'detail': err_body[:300],
                }, ensure_ascii=False),
            }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({'text': text}, ensure_ascii=False),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }