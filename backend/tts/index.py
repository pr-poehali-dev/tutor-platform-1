"""
Business: Синтез речи через Yandex SpeechKit — превращает текст ответа ИИ-преподавателя в голос.
Args: event с httpMethod, body (text, voice); context с request_id
Returns: HTTP-ответ с MP3 аудио в base64
"""
import json
import os
import re
import base64
import urllib.request
import urllib.parse
import urllib.error


def make_singing_text(text: str) -> str:
    """Превращает обычный текст в «распевный»: растягивает последнюю ударную
    гласную в каждом слове перед знаком препинания и добавляет паузы между
    строками. Yandex TTS не поддерживает полный SSML, но реагирует на
    повторённые буквы и знаки препинания — это даёт эффект пения.
    """
    if not text:
        return text
    vowels = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ'
    # переносы строк → запятые с длинной паузой
    result = text.replace('\n\n', '... ').replace('\n', ', — ')
    # добавляем тире после ! и ? для распевной паузы
    result = result.replace('!', '! — ').replace('?', '? — ')

    def stretch_vowel(match):
        word = match.group(1)
        punct = match.group(2)
        # удваиваем последнюю гласную в слове
        for i in range(len(word) - 1, -1, -1):
            if word[i] in vowels:
                return word[:i] + word[i] + word[i] + word[i + 1:] + punct
        return word + punct

    # Слова из 3+ букв перед знаками препинания — растягиваем гласную
    result = re.sub(r'(\w{3,})([,.!?\-…]+)', stretch_vowel, result)
    return result


VOICE_MAP = {
    'alex': {'voice': 'filipp', 'emotion': 'neutral', 'speed': '1.1'},
    'sofia': {'voice': 'jane', 'emotion': 'good', 'speed': '1.15'},
    'dmitry': {'voice': 'ermil', 'emotion': 'neutral', 'speed': '1.0'},
    'nika': {'voice': 'alena', 'emotion': 'good', 'speed': '1.05'},
    # Няня Лиса — тёплый, медленный, для малышей и родителей
    'fox': {'voice': 'alena', 'emotion': 'good', 'speed': '0.95'},
    # Няня Лиса поёт нараспев — для песенок (медленнее, мягче, с эмоцией)
    'fox_song': {'voice': 'alena', 'emotion': 'good', 'speed': '0.80'},
    # Колыбельная — самый медленный режим
    'fox_lullaby': {'voice': 'alena', 'emotion': 'good', 'speed': '0.70'},
}


def handler(event, context):
    """Озвучка текста через Yandex SpeechKit"""
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

        text = body.get('text', '').strip()
        teacher_id = body.get('teacher_id', 'alex')
        # sing=true → текст превращается в распевный (растягиваем гласные)
        sing = bool(body.get('sing', False))

        if not text:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Текст не может быть пустым'}, ensure_ascii=False),
            }

        if len(text) > 5000:
            text = text[:5000]

        if sing:
            text = make_singing_text(text)

        api_key = os.environ.get('YANDEX_SPEECHKIT_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'YANDEX_SPEECHKIT_API_KEY не настроен'}, ensure_ascii=False),
            }

        voice_cfg = VOICE_MAP.get(teacher_id, VOICE_MAP['alex'])
        folder_id = os.environ.get('YANDEX_FOLDER_ID', '').strip()

        params = {
            'text': text,
            'lang': 'ru-RU',
            'voice': voice_cfg['voice'],
            'emotion': voice_cfg['emotion'],
            'speed': voice_cfg['speed'],
            'format': 'mp3',
        }
        if folder_id:
            params['folderId'] = folder_id
        payload = urllib.parse.urlencode(params).encode('utf-8')

        req = urllib.request.Request(
            'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
            data=payload,
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method='POST',
        )

        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                audio_bytes = response.read()
                audio_b64 = base64.b64encode(audio_bytes).decode('ascii')
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Yandex TTS error: {e.code}', 'detail': err_body[:300]}, ensure_ascii=False),
            }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({
                'audio_base64': audio_b64,
                'mime': 'audio/mpeg',
            }),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }