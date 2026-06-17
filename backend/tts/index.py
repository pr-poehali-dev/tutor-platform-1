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
import io
import wave
import audioop
import base64
import urllib.request
import urllib.parse
import urllib.error


def pitch_up_lpcm(pcm_bytes: bytes, sample_rate: int, semitones: float) -> bytes:
    """Поднимает высоту тона звука (pitch-shift), сохраняя темп речи.

    Делает голос «детским»: звонким и более высоким, но Оксаночка не
    тараторит — длительность остаётся прежней.

    Принцип без внешних библиотек (только stdlib audioop):
    1. Ускоряем звук, понижая частоту дискретизации в factor раз —
       это одновременно поднимает тон и укорачивает запись.
    2. Возвращаем исходную длительность, растягивая обратно через ratecv —
       тон при этом остаётся высоким.

    pcm_bytes — сырой моно LPCM 16-bit.
    """
    if semitones <= 0:
        return pcm_bytes
    factor = 2.0 ** (semitones / 12.0)  # 3 полутона ≈ 1.19x
    width = 2  # 16-bit
    channels = 1

    # Шаг 1: поднимаем тон — интерпретируем как более высокий sample_rate,
    # затем ресемплим обратно к base rate (звук становится выше и короче).
    raised_rate = int(sample_rate * factor)
    shifted, _ = audioop.ratecv(pcm_bytes, width, channels, raised_rate, sample_rate, None)

    # Шаг 2: восстанавливаем исходную длительность (тон не меняется).
    stretched, _ = audioop.ratecv(
        shifted, width, channels, int(sample_rate / factor), sample_rate, None
    )
    return stretched


def lpcm_to_wav(pcm_bytes: bytes, sample_rate: int) -> bytes:
    """Упаковывает сырой LPCM 16-bit моно в WAV-контейнер."""
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm_bytes)
    return buf.getvalue()


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

    # 1. Markdown, HTML, код, URL — всё что AI-ответ может приехать с собой,
    # и что Yandex читает буквально («звёздочка», «слэш», «эйч-ти-ти-пи»).

    # 1a. Кодовые блоки и инлайн-код полностью выкидываем
    result = re.sub(r'```[\s\S]*?```', ' ', result)
    result = re.sub(r'`[^`]+`', ' ', result)

    # 1b. Markdown-ссылки [текст](url) → оставляем только текст
    result = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', result)
    # Просто URL (http/https/www) выкидываем — синтезатор их читает по буквам
    result = re.sub(r'https?://\S+', ' ссылка ', result)
    result = re.sub(r'\bwww\.\S+', ' ссылка ', result)
    # Email
    result = re.sub(r'\b[\w\.\-]+@[\w\.\-]+\.\w+', ' электронная почта ', result)

    # 1c. HTML-теги
    result = re.sub(r'<[^>]+>', ' ', result)
    # HTML-сущности
    result = result.replace('&nbsp;', ' ').replace('&amp;', ' и ')
    result = result.replace('&lt;', ' ').replace('&gt;', ' ').replace('&quot;', '"')

    # 1d. Markdown форматирование
    result = re.sub(r'\*+', '', result)
    result = re.sub(r'_{2,}', '', result)
    result = re.sub(r'~~', '', result)
    result = re.sub(r'#{1,6}\s+', '', result)
    # Маркеры списка в начале строки
    result = re.sub(r'(?m)^\s*[-•·–]\s+', '', result)
    result = re.sub(r'(?m)^\s*\d+[\.\)]\s+', '', result)

    # 1e. Эмодзи и пиктограммы (расширенный диапазон)
    result = re.sub(
        r'[\U0001F000-\U0001FFFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF'
        r'\U00002700-\U000027BF\U0001F300-\U0001F5FF\U0001F600-\U0001F64F'
        r'\U0001F680-\U0001F6FF\U0001F900-\U0001F9FF]',
        '',
        result,
    )
    # Стрелки и спец-символы
    result = re.sub(r'[→←↑↓⇒⇐↔⇔►◄▲▼■□●○]', ' ', result)

    # 1f. JSON-подобные структуры { "key": "value" } упрощаем до читаемого
    result = re.sub(r'[{}\[\]]', ' ', result)

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

    # 3. Латинские символы — главная причина «иностранного акцента»:
    # Yandex видит латиницу и переключается на английский TTS-движок.

    # 3a. Степени и индексы: x^2 → «икс в квадрате», x^3 → «икс в кубе», x^n → «икс в степени эн»
    result = re.sub(
        r'([a-zA-Zа-яА-Я0-9])\s*\^\s*2\b',
        lambda m: f'{m.group(1)} в квадрате',
        result,
    )
    result = re.sub(
        r'([a-zA-Zа-яА-Я0-9])\s*\^\s*3\b',
        lambda m: f'{m.group(1)} в кубе',
        result,
    )
    result = re.sub(
        r'([a-zA-Zа-яА-Я0-9])\s*\^\s*(\d+)',
        lambda m: f'{m.group(1)} в степени {m.group(2)}',
        result,
    )

    # 3b. Математические операторы — только в МАТЕМАТИЧЕСКОМ контексте
    # (между цифрами/латинскими буквами), не в обычном тексте
    result = re.sub(r'(?<=[\da-zA-Z])\s*\+\s*(?=[\da-zA-Z])', ' плюс ', result)
    result = re.sub(r'(?<=[\da-zA-Z])\s*[×∙·]\s*(?=[\da-zA-Z])', ' умножить на ', result)
    result = re.sub(r'(?<=\d)\s*/\s*(?=\d)', ' делить на ', result)
    result = re.sub(r'\s*≥\s*', ' больше или равно ', result)
    result = re.sub(r'\s*≤\s*', ' меньше или равно ', result)
    result = re.sub(r'\s*≠\s*', ' не равно ', result)
    result = re.sub(r'\s*±\s*', ' плюс-минус ', result)
    result = re.sub(r'\s*∞\s*', ' бесконечность ', result)
    # Знак равенства — только между цифрами (в тексте «=» уже обычно расшифровано)
    result = re.sub(r'(?<=\d)\s*=\s*(?=\d)', ' равно ', result)

    # 3c. Одиночные латинские переменные → русское произношение
    latin_vars = {
        'a': 'а', 'b': 'бэ', 'c': 'цэ', 'd': 'дэ', 'e': 'е', 'f': 'эф',
        'g': 'жэ', 'h': 'аш', 'i': 'и', 'j': 'жи', 'k': 'ка', 'l': 'эль',
        'm': 'эм', 'n': 'эн', 'o': 'о', 'p': 'пэ', 'q': 'ку', 'r': 'эр',
        's': 'эс', 't': 'тэ', 'u': 'у', 'v': 'вэ', 'w': 'дубль вэ',
        'x': 'икс', 'y': 'игрек', 'z': 'зэт',
    }
    def replace_single_latin(match):
        letter = match.group(0).lower()
        return ' ' + latin_vars.get(letter, letter) + ' '
    # Одиночные латинские буквы (не часть слова из 2+ латинских букв)
    result = re.sub(r'(?<![a-zA-Z])[a-zA-Z](?![a-zA-Z])', replace_single_latin, result)

    # 3d. Многобуквенные английские слова — оставляем как есть только если
    # это явно термины (программирование/наука), остальное помечаем для Yandex
    # как иностранное слово, чтобы он читал по-английски осознанно, а не
    # «русским голосом по буквам».
    # Популярные технические термины с русским произношением:
    tech_terms = {
        r'\bJavaScript\b': 'джава скрипт',
        r'\bTypeScript\b': 'тайп скрипт',
        r'\bPython\b': 'питон',
        r'\bHTML\b': 'эйч-ти-эм-эль',
        r'\bCSS\b': 'си-эс-эс',
        r'\bSQL\b': 'эс-кю-эль',
        r'\bAPI\b': 'эй-пи-ай',
        r'\bURL\b': 'ю-эр-эль',
        r'\bJSON\b': 'джейсон',
        r'\bGitHub\b': 'гитхаб',
        r'\bReact\b': 'реакт',
        r'\bNode\b': 'ноуд',
        r'\bvs\b': 'против',
        r'\bok\b': 'окей',
        r'\bOK\b': 'окей',
    }
    for pattern, replacement in tech_terms.items():
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
    # Ксюша — ведущая игры «Познавашка» и Игротеки в модуле Малыш.
    # Звонкий, высокий, задорный детский голосок в духе мультяшной девочки.
    # Берём живой голос Алёны и сильно поднимаем тон постобработкой +
    # ускоряем речь, чтобы получился бойкий озорной детский тембр.
    'ksusha': {
        'voice': 'alena',
        'role': 'friendly',
        'speed': '1.08',          # бойкая, задорная речь
        'pitch_shift': 0,
        'child_pitch': 5,         # сильный подъём тона — звонкий детский голос
    },
    # Няня Лиса — тёплый, мягкий, для малышей
    'fox': {
        'voice': 'alena',
        'role': 'friendly',  # was: good — больше материнской теплоты
        'speed': '0.95',
        'pitch_shift': 0,
    },
    # ─── Психологическая помощь: Ксюша — мягкий, тёплый, спокойный голос ───
    # alena + friendly даёт самую тёплую женскую интонацию. Речь чуть замедлена
    # (0.94–0.97) — спокойно, бережно, без спешки, чтобы человеку было уютно.
    'psy_parent': {
        'voice': 'alena',
        'role': 'friendly',
        'speed': '0.96',
        'pitch_shift': 0,
    },
    'psy_teen': {
        'voice': 'alena',
        'role': 'friendly',
        'speed': '0.98',  # чуть живее — на равных с подростком
        'pitch_shift': 0,
    },
    'psy_veteran': {
        'voice': 'alena',
        'role': 'friendly',
        'speed': '0.93',  # медленнее и спокойнее — максимально бережно
        'pitch_shift': 0,
    },
    'psy_self': {
        'voice': 'alena',
        'role': 'friendly',
        'speed': '0.96',
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

        # Если у голоса задан child_pitch — синтезируем в сыром LPCM,
        # чтобы потом поднять тон и сделать голос «детским».
        child_pitch = float(voice_cfg.get('child_pitch', 0) or 0)
        pcm_rate = 48000
        out_format = 'lpcm' if child_pitch > 0 else 'mp3'

        params = {
            'text': text,
            'lang': 'ru-RU',
            'voice': voice_cfg['voice'],
            # role вместо emotion — даёт более живые интонации в нейроголосах
            'role': voice_cfg['role'],
            'speed': voice_cfg['speed'],
            'format': out_format,
        }
        if out_format == 'lpcm':
            params['sampleRateHertz'] = pcm_rate
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

        # Детский тон: поднимаем высоту голоса и упаковываем в WAV
        if child_pitch > 0:
            try:
                shifted = pitch_up_lpcm(audio_bytes, pcm_rate, child_pitch)
                wav_bytes = lpcm_to_wav(shifted, pcm_rate)
                audio_b64 = base64.b64encode(wav_bytes).decode('ascii')
                mime = 'audio/wav'
            except Exception:
                # Если обработка не удалась — отдаём как WAV без сдвига тона
                wav_bytes = lpcm_to_wav(audio_bytes, pcm_rate)
                audio_b64 = base64.b64encode(wav_bytes).decode('ascii')
                mime = 'audio/wav'
        else:
            audio_b64 = base64.b64encode(audio_bytes).decode('ascii')
            mime = 'audio/mpeg'

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({
                'audio_base64': audio_b64,
                'mime': mime,
            }),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }