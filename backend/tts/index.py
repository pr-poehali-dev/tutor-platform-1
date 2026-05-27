"""
Business: Синтез живой человекоподобной речи через Yandex SpeechKit v3 — превращает
текст ответа ИИ-преподавателя в голос с интонациями, паузами и эмоциями.
Использует нейросетевые голоса (alena, jane, filipp, ermil, zahar) + SSML для
естественного звучания. Также делает текст распевным для песенок Няни Лисы.
Args: event с httpMethod, body (text, teacher_id, sing); context с request_id
Returns: HTTP-ответ с MP3 аудио в base64
"""
import json
import os
import re
import base64
import urllib.request
import urllib.parse
import urllib.error


VOWELS = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ'


def humanize_text(text: str) -> str:
    """Добавляет в текст естественные паузы, лёгкие междометия и интонационные
    знаки — чтобы синтезатор звучал как живой человек, а не диктор-робот.

    Что делаем:
    - Длинные предложения разбиваем многоточием на короткие фразы
    - Перед ключевыми словами (но, а, потому что, например, итак) — короткая пауза
    - В конце вопросов оставляем "?" + лёгкое тире для подъёма интонации
    - Восклицания усиливаем точкой паузы
    - Цифры и сокращения подсказываем (км, г., %)
    """
    if not text:
        return text

    result = text.strip()

    # Сокращения → полные слова (Yandex иначе читает буквенно)
    abbreviations = {
        r'\bт\.е\.': 'то есть',
        r'\bт\.к\.': 'так как',
        r'\bт\.д\.': 'так далее',
        r'\bт\.п\.': 'тому подобное',
        r'\bи\.т\.д\.': 'и так далее',
        r'\bи др\.': 'и другие',
        r'\bстр\.': 'страница',
        r'\bг\.': 'год',
        r'\bкм\b': 'километров',
        r'\bкг\b': 'килограмм',
        r'\bсм\b': 'сантиметров',
        r'\bмм\b': 'миллиметров',
        r'\bр\.': 'рублей',
        r'\bруб\.': 'рублей',
        r'%': ' процентов',
        r'№': 'номер ',
        r'\bAI\b': 'эй ай',
        r'\bТЗ\b': 'тэ зэ',
    }
    for pattern, replacement in abbreviations.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    # Лёгкие паузы перед связками — там, где человек обычно делает вдох
    connectors = [
        'но ', 'однако ', 'хотя ', 'потому что ', 'поэтому ', 'кстати ',
        'например ', 'во-первых ', 'во-вторых ', 'итак ', 'значит ',
        'смотри ', 'послушай ', 'представь ', 'короче ',
    ]
    for conn in connectors:
        result = re.sub(
            r'(?<=[\.\!\?])\s+(' + conn + r')',
            r' ... \1',
            result,
            flags=re.IGNORECASE,
        )

    # После запятой в длинных перечислениях — лёгкая пауза (визуально - тире)
    # Это даёт синтезатору естественный ритм
    result = re.sub(r',\s+(и\s)', r', — \1', result)

    # Многоточия → реальная пауза
    result = result.replace('…', '...')
    result = re.sub(r'\.{4,}', '...', result)

    # После вопроса и восклицания — пауза для интонационного подъёма/спада
    result = re.sub(r'\?\s+([А-ЯA-Z])', r'? — \1', result)
    result = re.sub(r'!\s+([А-ЯA-Z])', r'! — \1', result)

    # Тире (em-dash) → нормальное тире с пробелами (Yandex его лучше читает)
    result = result.replace('—', ' — ').replace('–', ' — ')
    # Убираем двойные пробелы
    result = re.sub(r'\s+', ' ', result).strip()

    return result


def make_singing_text(text: str) -> str:
    """Превращает обычный текст в «распевный» для песенок Няни Лисы.

    ВАЖНО: НЕ коверкаем русские слова дублированием букв — это ломает
    произношение в Yandex TTS («Ладушкии» вместо «Ладушки»). Эффект
    распевности достигается замедленным темпом голоса (speed=0.72-0.82
    в VOICE_MAP), длинными паузами между строками и эмоциональной ролью.
    """
    if not text:
        return text
    # переносы строк → запятые с длинной паузой
    result = text.replace('\n\n', '... ').replace('\n', ', — ')
    # добавляем тире после ! и ? для распевной паузы
    result = result.replace('!', '! — ').replace('?', '? — ')

    # НЕ дублируем гласные — это ломает русское произношение в Yandex TTS.
    # Эффект распевности достигается замедленным темпом (speed=0.72-0.82
    # в VOICE_MAP) и эмоциональной ролью голоса.
    # Многоточия нормализуем
    result = result.replace('…', '...')
    # Убираем двойные пробелы
    result = re.sub(r'\s+', ' ', result).strip()
    return result


# Нейросетевые голоса Yandex SpeechKit (v3). Звучат сильно живее обычных.
# role: neutral / good / strict / friendly / whisper — добавляет эмоциональный окрас.
VOICE_MAP = {
    'alex': {
        'voice': 'filipp',  # мужской, дружелюбный
        'role': 'neutral',
        'speed': '1.05',
        'pitch_shift': 0,
    },
    'sofia': {
        'voice': 'jane',  # женский, тёплый
        'role': 'good',
        'speed': '1.08',
        'pitch_shift': 0,
    },
    'dmitry': {
        'voice': 'ermil',  # мужской, серьёзный
        'role': 'good',
        'speed': '1.0',
        'pitch_shift': 0,
    },
    'nika': {
        'voice': 'alena',  # женский, дружелюбный
        'role': 'good',
        'speed': '1.02',
        'pitch_shift': 0,
    },
    # Няня Лиса — тёплый, мягкий, для малышей
    'fox': {
        'voice': 'alena',
        'role': 'good',
        'speed': '0.95',
        'pitch_shift': 0,
    },
    # Няня Лиса поёт нараспев — мягко и медленно, но без коверканья речи
    'fox_song': {
        'voice': 'alena',
        'role': 'good',
        'speed': '0.88',
        'pitch_shift': 0,
    },
    # Колыбельная — самый медленный режим (но не настолько, чтобы звук плыл)
    'fox_lullaby': {
        'voice': 'alena',
        'role': 'good',
        'speed': '0.80',
        'pitch_shift': 0,
    },
}


def handler(event, context):
    """Озвучка текста через Yandex SpeechKit с нейросетевыми голосами и SSML."""
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
        sing = bool(body.get('sing', False))

        if not text:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Текст не может быть пустым'}, ensure_ascii=False),
            }

        if len(text) > 5000:
            text = text[:5000]

        # Распевный режим — для песенок Лисы
        if sing:
            text = make_singing_text(text)
        else:
            # Обычный режим — делаем речь живой
            text = humanize_text(text)

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
            # role вместо emotion — даёт более живые интонации в нейроголосах
            'role': voice_cfg['role'],
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
            with urllib.request.urlopen(req, timeout=25) as response:
                audio_bytes = response.read()
                audio_b64 = base64.b64encode(audio_bytes).decode('ascii')
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            # Если v3-параметр role не поддерживается, повторяем с emotion (fallback)
            if 'role' in err_body.lower() or e.code == 400:
                params.pop('role', None)
                params['emotion'] = 'good' if voice_cfg['role'] in ('good', 'friendly') else 'neutral'
                payload = urllib.parse.urlencode(params).encode('utf-8')
                req2 = urllib.request.Request(
                    'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
                    data=payload,
                    headers={
                        'Authorization': f'Api-Key {api_key}',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    method='POST',
                )
                try:
                    with urllib.request.urlopen(req2, timeout=25) as response:
                        audio_bytes = response.read()
                        audio_b64 = base64.b64encode(audio_bytes).decode('ascii')
                except urllib.error.HTTPError as e2:
                    err_body2 = e2.read().decode('utf-8', errors='ignore')
                    return {
                        'statusCode': 502,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Yandex TTS error: {e2.code}', 'detail': err_body2[:300]}, ensure_ascii=False),
                    }
            else:
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