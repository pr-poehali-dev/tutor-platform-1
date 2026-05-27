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

    # 1. Markdown и спец-символы (Yandex читает звёздочки как «звёздочка»)
    result = re.sub(r'\*+', '', result)
    result = re.sub(r'_{2,}', '', result)
    result = re.sub(r'`+', '', result)
    result = re.sub(r'#{1,6}\s+', '', result)
    # Эмодзи и пиктограммы выкидываем — синтезатор их пропускает или читает странно
    result = re.sub(
        r'[\U0001F300-\U0001FAFF\U0001F600-\U0001F64F\U00002600-\U000027BF]',
        '',
        result,
    )

    # 2. Сокращения и термины → полные русские слова
    # (Yandex иначе читает буквами или путает с английским)
    abbreviations = {
        r'\bт\.\s?е\.': 'то есть',
        r'\bт\.\s?к\.': 'так как',
        r'\bт\.\s?д\.': 'так далее',
        r'\bт\.\s?п\.': 'тому подобное',
        r'\bи\.т\.\s?д\.': 'и так далее',
        r'\bи др\.': 'и другие',
        r'\bстр\.': 'страница',
        r'\bг\.': 'год',
        r'\bвв\.': 'века',
        r'\bв\.': 'век',
        r'\bкм\b': 'километров',
        r'\bкг\b': 'килограмм',
        r'\bмг\b': 'миллиграмм',
        r'\bсм\b': 'сантиметров',
        r'\bмм\b': 'миллиметров',
        r'\bр\.': 'рублей',
        r'\bруб\.': 'рублей',
        r'\bмлн\b': 'миллионов',
        r'\bмлрд\b': 'миллиардов',
        r'\bтыс\.': 'тысяч',
        r'%': ' процентов',
        r'№': 'номер ',
        r'°': ' градусов',
        r'\bАI\b': 'искусственный интеллект',
        r'\bAI\b': 'искусственный интеллект',
        r'\bIT\b': 'айти',
        r'\bIT-': 'айти-',
        r'\bТЗ\b': 'техзадание',
        r'\bЕГЭ\b': 'е-гэ-э',
        r'\bОГЭ\b': 'о-гэ-э',
        r'\bВПР\b': 'вэ-пэ-эр',
        r'\bРФ\b': 'россии',
        r'\bСССР\b': 'эс-эс-эс-эр',
        r'\bСНГ\b': 'эс-эн-гэ',
        r'\bООН\b': 'оон',
        r'\bПК\b': 'компьютер',
        r'\bтел\.': 'телефон',
        r'\bул\.': 'улица',
        r'\bпр\.': 'проспект',
        r'\bокт\.': 'октября',
        r'\bдек\.': 'декабря',
        r'\bянв\.': 'января',
        r'\bфевр\.': 'февраля',
    }
    for pattern, replacement in abbreviations.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    # 3. Латинские буквы в русском тексте — самая частая причина «иностранного»
    # звучания. Yandex видит латиницу и переключается на английский.
    # Одиночные латинские переменные (x, y, z, n) — заменяем на русские названия
    latin_vars = {
        r'(?<![a-zA-Z])x(?![a-zA-Z])': ' икс ',
        r'(?<![a-zA-Z])y(?![a-zA-Z])': ' игрек ',
        r'(?<![a-zA-Z])z(?![a-zA-Z])': ' зэт ',
        r'(?<![a-zA-Z])n(?![a-zA-Z])': ' эн ',
        r'(?<![a-zA-Z])k(?![a-zA-Z])': ' ка ',
        r'(?<![a-zA-Z])X(?![a-zA-Z])': ' икс ',
        r'(?<![a-zA-Z])Y(?![a-zA-Z])': ' игрек ',
        r'(?<![a-zA-Z])Z(?![a-zA-Z])': ' зэт ',
    }
    for pattern, replacement in latin_vars.items():
        result = re.sub(pattern, replacement, result)

    # 4. Паузы перед связками — там, где человек обычно делает вдох
    connectors = [
        'но ', 'однако ', 'хотя ', 'потому что ', 'поэтому ', 'кстати ',
        'например ', 'во-первых ', 'во-вторых ', 'в-третьих ', 'итак ',
        'значит ', 'смотри ', 'послушай ', 'представь ', 'короче ',
        'допустим ', 'предположим ', 'то есть ', 'между прочим ',
    ]
    for conn in connectors:
        result = re.sub(
            r'(?<=[\.\!\?])\s+(' + conn + r')',
            r' ... \1',
            result,
            flags=re.IGNORECASE,
        )

    # 5. После запятой в перечислениях — лёгкая пауза перед "и" (естественный ритм)
    result = re.sub(r',\s+(и\s)', r', — \1', result)

    # 6. Двоеточие → пауза с интонационным понижением (как у живого человека)
    result = re.sub(r':\s+', ': — ', result)

    # 7. Многоточия и точки нормализуем
    result = result.replace('…', '...')
    result = re.sub(r'\.{4,}', '...', result)

    # 8. После вопроса и восклицания — пауза для интонационного подъёма/спада
    result = re.sub(r'\?\s+([А-ЯA-Z])', r'? — \1', result)
    result = re.sub(r'!\s+([А-ЯA-Z])', r'! — \1', result)

    # 9. Тире — Yandex читает чище с пробелами вокруг
    result = result.replace('—', ' — ').replace('–', ' — ')

    # 10. Цифры с буквами слитно ("5кг", "10см") → разделяем
    result = re.sub(r'(\d)([а-яА-Я])', r'\1 \2', result)

    # 11. Убираем двойные пробелы и пробелы перед знаками препинания
    result = re.sub(r'\s+([,\.\!\?\;\:])', r'\1', result)
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


# Нейросетевые голоса Yandex SpeechKit. Звучат сильно живее обычных.
# role: neutral / good / strict / friendly / whisper — добавляет эмоциональный окрас.
# speed: 0.95–1.02 — диапазон естественной человеческой речи (не диктор-робот).
VOICE_MAP = {
    # Алекс — преподаватель математики/информатики, уверенный и доброжелательный
    'alex': {
        'voice': 'filipp',
        'role': 'good',  # was: neutral — теплее, как живой репетитор
        'speed': '1.00',  # естественный темп
        'pitch_shift': 0,
    },
    # София — преподаватель английского, энергичная и тёплая
    'sofia': {
        'voice': 'jane',
        'role': 'good',
        'speed': '1.02',  # was: 1.08 — было слишком торопливо
        'pitch_shift': 0,
    },
    # Дмитрий — преподаватель физики/химии/биологии. zahar — новый нейроголос,
    # сильно живее старого ermil (тот был «дикторский»).
    'dmitry': {
        'voice': 'zahar',
        'role': 'good',
        'speed': '1.00',
        'pitch_shift': 0,
    },
    # Ника — преподаватель русского/литературы, самый мелодичный женский голос
    'nika': {
        'voice': 'alena',
        'role': 'friendly',  # was: good — friendly даёт ещё более тёплую интонацию
        'speed': '1.00',  # was: 1.02
        'pitch_shift': 0,
    },
    # Няня Лиса — тёплый, мягкий, для малышей
    'fox': {
        'voice': 'alena',
        'role': 'friendly',  # was: good — больше материнской теплоты
        'speed': '0.95',
        'pitch_shift': 0,
    },
    # Няня Лиса поёт нараспев — мягко и медленно, но без коверканья речи
    'fox_song': {
        'voice': 'alena',
        'role': 'friendly',
        'speed': '0.88',
        'pitch_shift': 0,
    },
    # Колыбельная — самый медленный режим (но не настолько, чтобы звук плыл)
    'fox_lullaby': {
        'voice': 'alena',
        'role': 'friendly',
        'speed': '0.82',
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