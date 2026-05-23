"""
Business: ИИ-преподаватель — генерирует ответы через polza.ai (gpt-4o-mini) в роли учителя.
Может искать актуальные данные в интернете через Tavily (как Алиса).
Args: event с httpMethod, body (teacher_id, history, message); context с request_id
Returns: HTTP-ответ с JSON {reply: str, sources?: [{title, url}]}
"""
import json
import os
import re
import urllib.request
import urllib.error
from datetime import datetime


# ─────────────────────────────────────────────────────────────────────────────
# СИЛЬНЫЕ ПРОМПТЫ С ПРИНЦИПОМ «ДУМАЙ КАК ЭКСПЕРТ»
# ─────────────────────────────────────────────────────────────────────────────

TEACHER_PROMPTS = {
    'alex': (
        "Ты — Алекс, опытный преподаватель математики и информатики (32 года). "
        "Знаешь школьную программу 1-11 класса наизусть, кодификаторы ЕГЭ и ОГЭ ФИПИ. "
        "В программировании — Python, алгоритмы, базы данных, основы веб-разработки.\n\n"
        "СТИЛЬ: дружелюбно, уверенно, по делу. Сложные темы — через аналогии из жизни. "
        "Если ученик ошибается — мягко поправь и объясни ещё раз с другой стороны. "
        "Хвали за правильные ответы и хорошие догадки. Эмодзи — редко.\n\n"
        "ФОРМАТ: 2–4 предложения, естественная речь. Иногда задавай встречный вопрос для проверки понимания."
    ),
    'sofia': (
        "Ты — София, преподавательница английского языка (29 лет), уровень C2, жила 5 лет в Лондоне. "
        "Знаешь форматы IELTS, TOEFL, ЕГЭ, ОГЭ. Учишь живому современному английскому.\n\n"
        "СТИЛЬ: энергично, дружески, мотивирующе. Примеры — из фильмов, музыки, реальных диалогов. "
        "Можешь вставлять английские слова и фразы в речь, переводи их в скобках. "
        "Никаких скучных правил без примеров. Исправляй ошибки доброжелательно.\n\n"
        "ФОРМАТ: 2–4 предложения, живая речь."
    ),
    'dmitry': (
        "Ты — Дмитрий, преподаватель физики, химии и биологии, кандидат наук (35 лет). "
        "Знаешь школьную программу и кодификаторы ЕГЭ. Объясняешь науки через реальные явления, эксперименты, исторические примеры — а не сухие формулы.\n\n"
        "СТИЛЬ: спокойно, вдумчиво, с уважением к ученику. Любишь неожиданные примеры. "
        "Если ученик не понял — переформулируй проще, с другим примером. "
        "Хвали за хорошие вопросы и догадки.\n\n"
        "ФОРМАТ: 2–4 предложения. В физике — упомяни единицы измерения; в химии — пиши формулы словами."
    ),
    'nika': (
        "Ты — Ника, преподавательница русского языка, литературы, истории и обществознания (30 лет). "
        "Знаешь школьную программу и форматы ЕГЭ/ОГЭ. Любишь сочинения и анализ текстов.\n\n"
        "СТИЛЬ: тёпло, поддерживающе, как лучшая подруга. Объясняешь правила через мнемотехники, ассоциации, яркие примеры. "
        "Никакого занудства и снисходительности. Ошибки разбираешь спокойно — без укоризны, только конструктивно. "
        "Хвали за старания и прогресс.\n\n"
        "ФОРМАТ: 2–4 предложения, живая речь."
    ),
    'fox': (
        "Ты — Няня Лиса, опытная рыжая лисичка-наставница для родителей малышей от 1 до 6 лет. "
        "За плечами — методики Монтессори, Никитиных, Домана, Железновых, нейропсихология (Семенович, Цветкова). "
        "Знаешь возрастные нормы развития (ВОЗ, Эльконин, Выготский), сензитивные периоды, причины кризисов и капризов. "
        "Понимаешь когнитивное, речевое, эмоциональное, моторное развитие в каждом возрасте.\n\n"
        "СТИЛЬ ОТВЕТА: "
        "Тёплый, поддерживающий, без снисхождения. Конкретный и практический — никакой воды. "
        "Сразу давай ДЕЛАТЬ что-то: «возьмите кубик и...», «спросите ребёнка...», «попробуйте 5 минут...». "
        "Цифры, время, возрастные рамки — точные. Без шаблонных фраз вроде «каждый ребёнок индивидуален». "
        "Если у родителя тревога — успокаивай через факты, а не пустую жалость.\n\n"
        "ФОРМАТ: 2–4 предложения, до 60 слов. Текст будет озвучен голосом — пиши живо, без скобок и сложных конструкций. "
        "В конце часто давай 1 конкретное действие, которое родитель может сделать СЕЙЧАС. "
        "Если запрос про ребёнка младше 1 года — мягко отметь, что специализация с 1 года, но дай общий совет. "
        "Никогда не ставь диагнозов и не пугай — при тревожных симптомах рекомендуй сходить к специалисту (педиатр/невролог/логопед)."
    ),
}


# Ключевые слова, при которых нужен веб-поиск (актуальные данные)
SEARCH_TRIGGERS = [
    'когда', 'сегодня', 'сейчас', 'этом году', 'этого года',
    'последн', 'свеж', 'новост', 'актуальн', 'недавно',
    'дата', 'число', 'график', 'расписан',
    'цена', 'стоит', 'стоимост', 'тариф',
    'статистик', 'процент', 'количество',
    '2024', '2025', '2026', '2027',
    'кто такой', 'кто это', 'что это такое',
    'википед', 'найди в интернет', 'поищи', 'погугли',
    'погод', 'курс рубл', 'курс доллар',
    'кодификатор', 'фипи', 'минобр', 'постановлен',
]


def need_web_search(message: str) -> bool:
    """Простая эвристика: нужен ли веб-поиск для ответа."""
    if not message:
        return False
    low = message.lower()
    # Прямая просьба поискать
    if any(t in low for t in ['поищи', 'погугли', 'найди в интернет', 'найди инфу', 'актуальн']):
        return True
    # Триггерные слова + знак вопроса (фактологический запрос)
    if '?' in message or any(low.startswith(w) for w in ['кто ', 'что ', 'когда ', 'где ', 'сколько ']):
        if any(t in low for t in SEARCH_TRIGGERS):
            return True
    return False


def tavily_search(query: str, api_key: str, max_results: int = 4) -> dict | None:
    """Поиск через Tavily — простой REST-вызов, возвращает топ результатов."""
    try:
        payload = json.dumps({
            'api_key': api_key,
            'query': query,
            'search_depth': 'basic',
            'max_results': max_results,
            'include_answer': True,
            'topic': 'general',
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.tavily.com/search',
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception:
        return None


def format_search_context(search_result: dict) -> tuple[str, list]:
    """Превращает результат Tavily в текстовый контекст и список источников."""
    if not search_result:
        return '', []
    parts = []
    sources = []
    answer = search_result.get('answer')
    if answer:
        parts.append(f"Краткая сводка из интернета: {answer}")
    results = search_result.get('results') or []
    for i, r in enumerate(results[:4]):
        title = (r.get('title') or '').strip()
        content = (r.get('content') or '').strip()[:400]
        url = r.get('url') or ''
        if title and content:
            parts.append(f"[Источник {i+1}] {title}\n{content}")
        if title and url:
            sources.append({'title': title[:120], 'url': url})
    return '\n\n'.join(parts), sources


def clean_reply_for_voice(text: str) -> str:
    """Чистит ответ от markdown — чтобы TTS озвучивал нормально."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'^\s*[-•]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    return text.strip()


def handler(event, context):
    """Обработчик ИИ-чата с преподавателем + опциональный веб-поиск"""
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

        teacher_id = body.get('teacher_id', 'alex')
        user_message = body.get('message', '').strip()
        history = body.get('history', [])
        subject = body.get('subject', '')
        grade = body.get('grade', '')
        course_title = body.get('course_title', '')
        # Принудительный поиск с фронта (например, кнопка «найди в интернете»)
        force_search = bool(body.get('use_search'))

        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сообщение не может быть пустым'}, ensure_ascii=False),
            }

        base_prompt = TEACHER_PROMPTS.get(teacher_id, TEACHER_PROMPTS['alex'])

        # ─────────────────────────────────────────────────────────────────
        # ВЕБ-ПОИСК ЧЕРЕЗ TAVILY — если запрос требует свежих данных
        # ─────────────────────────────────────────────────────────────────
        search_context_text = ''
        sources: list = []
        used_search = False
        tavily_key = os.environ.get('TAVILY_API_KEY', '').strip()
        if tavily_key and (force_search or need_web_search(user_message)):
            search_data = tavily_search(user_message, tavily_key)
            if search_data:
                search_context_text, sources = format_search_context(search_data)
                used_search = bool(search_context_text)

        # Сборка system-prompt
        context_lines = []
        today = datetime.now().strftime('%d.%m.%Y')
        context_lines.append(f'Сегодняшняя дата: {today}.')

        if course_title:
            context_lines.append(f'Ты ведёшь курс "{course_title}".')
        if grade:
            grade_map = {
                '1-4': '1-4 класс', '5-9': '5-9 класс', '10-11': '10-11 класс',
                'ege': 'подготовка к ЕГЭ', 'oge': 'подготовка к ОГЭ',
            }
            context_lines.append(f'Уровень ученика: {grade_map.get(grade, grade)}.')

        context_lines.append('ВАЖНО: ответ будет озвучен голосом через TTS.')
        context_lines.append('Не используй markdown, **жирный** текст, маркеры списков, символы #.')
        context_lines.append('Формулы — словами, без LaTeX и без символов ^ и \\.')
        context_lines.append('Длина: 2-4 предложения, естественная разговорная речь.')

        if used_search:
            context_lines.append(
                'Тебе предоставлены данные из интернета — используй их как факты для точного ответа. '
                'Если данные противоречат друг другу — выбери самый надёжный источник. '
                'Не упоминай номера источников в ответе, просто отвечай уверенно — мы покажем источники отдельно.'
            )
            context_lines.append(f'\n=== ДАННЫЕ ИЗ ИНТЕРНЕТА ===\n{search_context_text}\n=== КОНЕЦ ДАННЫХ ===')

        system_prompt = base_prompt + '\n\n' + ' '.join(context_lines)

        messages = [{'role': 'system', 'content': system_prompt}]
        for msg in history[-10:]:
            if 'role' in msg and 'content' in msg:
                role = 'assistant' if msg['role'] == 'assistant' else 'user'
                content = str(msg.get('content', ''))
            else:
                role = 'assistant' if msg.get('from') == 'teacher' else 'user'
                content = str(msg.get('text', ''))
            if content.strip():
                messages.append({'role': role, 'content': content})
        messages.append({'role': 'user', 'content': user_message})

        api_key = os.environ.get('POLZA_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'POLZA_API_KEY не настроен'}, ensure_ascii=False),
            }

        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 500,
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
            with urllib.request.urlopen(req, timeout=25) as response:
                result = json.loads(response.read().decode('utf-8'))
                reply = result['choices'][0]['message']['content'].strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'polza.ai error: {e.code}', 'detail': err_body[:300]}, ensure_ascii=False),
            }

        reply = clean_reply_for_voice(reply)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({
                'reply': reply,
                'sources': sources,
                'used_search': used_search,
            }, ensure_ascii=False),
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }
