"""
Business: Создаёт раскадровку (storyboard) для образовательного видеоролика.
По теме и длительности генерирует JSON со сценами: текст диктора + промпт для картинки.
Каждая сцена ~ 8-15 секунд, итого 1-3 минуты.
Args: event с body {topic, duration_sec, style, subject?, age_group?}
Returns: HTTP 200 с JSON {scenes: [{narration, image_prompt, duration_sec, transition}]}
"""
import json
import os
import re
import urllib.request
import urllib.error


VISUAL_STYLES = {
    'realistic': 'Реалистичный фотографический стиль, естественное освещение, тёплые цвета',
    'cartoon': '3D-мультяшный стиль Pixar, добрый, яркие цвета, дружелюбные персонажи',
    'flat': 'Плоский векторный стиль для образовательных видео, чистый, минималистичный',
    'sketch': 'Карандашный набросок, образовательная иллюстрация, чёрно-белый с акцентами',
    'cosmic': 'Космический стиль, тёмный фон с туманностями, неоновое свечение, фиолетово-синие тона',
}


SYSTEM_PROMPT = """Ты — режиссёр образовательных видеороликов УЧИСЬПРО.
Твоя задача — превратить тему в раскадровку для видео.

ПРАВИЛА:
1. Каждая сцена — это 8-15 секунд видео.
2. Текст диктора (narration) — короткий, разговорный, понятный школьнику. 15-30 слов.
3. Промпт для картинки (image_prompt) — НА АНГЛИЙСКОМ для FLUX. Детальный, фотореалистичный, без текста на изображении.
4. Структура ролика: интро (1 сцена) → основное содержание (4-12 сцен) → вывод (1 сцена).
5. Логическая последовательность, каждая сцена развивает мысль предыдущей.
6. Никакого текста на картинках — он будет добавлен отдельно.

ФОРМАТ ОТВЕТА — строго JSON:
{
  "title": "Название ролика на русском",
  "scenes": [
    {
      "narration": "Текст, который скажет диктор",
      "image_prompt": "Detailed English prompt for FLUX",
      "duration_sec": 10,
      "transition": "fade"
    }
  ]
}

Допустимые transition: fade, slide, zoom, none.
Никаких пояснений вне JSON."""


def handler(event, context):
    """Создаёт раскадровку для видеоролика по теме."""
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

        topic = (body.get('topic') or '').strip()
        duration_sec = int(body.get('duration_sec') or 60)
        style = body.get('style') or 'realistic'
        subject = body.get('subject') or ''
        age_group = body.get('age_group') or 'школьник 10-15 лет'

        if not topic:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указана тема ролика (topic)'}, ensure_ascii=False),
            }

        # Ограничиваем длительность 30-180 сек
        duration_sec = max(30, min(180, duration_sec))
        target_scenes = max(4, min(15, duration_sec // 10))

        style_desc = VISUAL_STYLES.get(style, VISUAL_STYLES['realistic'])

        user_msg = (
            f"ТЕМА: {topic}\n"
            f"АУДИТОРИЯ: {age_group}\n"
            + (f"ПРЕДМЕТ: {subject}\n" if subject else "")
            + f"ВИЗУАЛЬНЫЙ СТИЛЬ: {style_desc}\n"
            f"ДЛИТЕЛЬНОСТЬ: {duration_sec} секунд (примерно {target_scenes} сцен).\n\n"
            "Сделай раскадровку. ВАЖНО: image_prompt пиши на английском, "
            f"начинай каждый с '{style_desc}, '. Верни строго JSON без markdown."
        )

        api_key = os.environ.get('POLZA_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'POLZA_API_KEY не настроен'}, ensure_ascii=False),
            }

        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
            'messages': [
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_msg},
            ],
            'temperature': 0.8,
            'max_tokens': 3500,
            'response_format': {'type': 'json_object'},
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions',
            data=payload,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode('utf-8'))
                raw = result['choices'][0]['message']['content'].strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'polza.ai error: {e.code}', 'detail': err_body[:300]}, ensure_ascii=False),
            }

        # Чистим возможный markdown
        raw = re.sub(r'^```json\s*', '', raw)
        raw = re.sub(r'^```\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)

        try:
            storyboard = json.loads(raw)
        except json.JSONDecodeError:
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'ИИ вернул некорректный JSON', 'raw': raw[:500]}, ensure_ascii=False),
            }

        # Нормализация
        scenes = storyboard.get('scenes') or []
        normalized_scenes = []
        for i, s in enumerate(scenes[:15]):
            normalized_scenes.append({
                'id': f'scene_{i+1}',
                'narration': (s.get('narration') or '').strip()[:400],
                'image_prompt': (s.get('image_prompt') or '').strip()[:600],
                'duration_sec': max(5, min(20, int(s.get('duration_sec') or 10))),
                'transition': s.get('transition') or 'fade',
            })

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({
                'title': storyboard.get('title', topic),
                'topic': topic,
                'style': style,
                'duration_sec': duration_sec,
                'scenes': normalized_scenes,
                'total_scenes': len(normalized_scenes),
            }, ensure_ascii=False),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }
