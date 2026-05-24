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
import urllib.parse
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


USER_AGENT = 'Mozilla/5.0 (compatible; UchispriBot/1.0; +https://учисьпро.рф)'


def _http_json(url: str, *, method: str = 'GET', data: bytes | None = None, headers: dict | None = None, timeout: int = 10) -> dict | None:
    """Универсальный GET/POST JSON-вызов."""
    try:
        req = urllib.request.Request(
            url,
            data=data,
            headers={'User-Agent': USER_AGENT, 'Accept': 'application/json', **(headers or {})},
            method=method,
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# ПОИСКОВИКИ — РАБОТАЮТ БЕЗ КЛЮЧЕЙ
# ─────────────────────────────────────────────────────────────────────────────

def search_wikipedia(query: str, max_results: int = 3) -> dict | None:
    """Поиск по русской Википедии (без ключей). Лучше всего для энциклопедических запросов."""
    try:
        # 1) ищем подходящие статьи
        srch_url = 'https://ru.wikipedia.org/w/api.php?' + urllib.parse.urlencode({
            'action': 'query',
            'list': 'search',
            'srsearch': query,
            'srlimit': max_results,
            'format': 'json',
            'utf8': 1,
        })
        data = _http_json(srch_url, timeout=8)
        if not data:
            return None
        hits = (data.get('query') or {}).get('search') or []
        if not hits:
            return None

        results = []
        for h in hits[:max_results]:
            title = h.get('title') or ''
            # 2) подтягиваем краткое описание (extract)
            ext_url = 'https://ru.wikipedia.org/w/api.php?' + urllib.parse.urlencode({
                'action': 'query',
                'prop': 'extracts',
                'exintro': 1,
                'explaintext': 1,
                'titles': title,
                'format': 'json',
                'utf8': 1,
            })
            ext_data = _http_json(ext_url, timeout=8)
            pages = ((ext_data or {}).get('query') or {}).get('pages') or {}
            content = ''
            for _, page in pages.items():
                content = (page.get('extract') or '').strip()
                break
            if not content:
                # fallback: используем сниппет из поиска (с HTML-тегами — почистим)
                content = re.sub(r'<[^>]+>', '', h.get('snippet') or '').strip()
            url_safe = urllib.parse.quote(title.replace(' ', '_'))
            results.append({
                'title': title,
                'content': content[:600],
                'url': f'https://ru.wikipedia.org/wiki/{url_safe}',
            })
        return {'results': results, 'answer': '', 'source': 'wikipedia'}
    except Exception:
        return None


def search_duckduckgo(query: str) -> dict | None:
    """Поиск через DuckDuckGo Instant Answer API (без ключей).
    Хорошо работает для энциклопедических запросов и определений.
    """
    try:
        url = 'https://api.duckduckgo.com/?' + urllib.parse.urlencode({
            'q': query,
            'format': 'json',
            'no_html': 1,
            'skip_disambig': 1,
            'kl': 'ru-ru',
        })
        data = _http_json(url, timeout=8)
        if not data:
            return None

        results = []
        answer = ''

        # Главный ответ
        abstract = (data.get('AbstractText') or '').strip()
        abstract_url = data.get('AbstractURL') or ''
        abstract_source = data.get('AbstractSource') or ''
        if abstract:
            answer = abstract
            if abstract_url:
                results.append({
                    'title': abstract_source or 'DuckDuckGo',
                    'content': abstract[:600],
                    'url': abstract_url,
                })

        # Связанные темы
        related = data.get('RelatedTopics') or []
        for r in related[:4]:
            if 'FirstURL' not in r:
                continue
            text = (r.get('Text') or '').strip()
            if not text:
                continue
            results.append({
                'title': text.split(' - ')[0][:120] or 'DuckDuckGo',
                'content': text[:400],
                'url': r.get('FirstURL') or '',
            })

        if not results:
            return None
        return {'results': results, 'answer': answer, 'source': 'duckduckgo'}
    except Exception:
        return None


def search_tavily(query: str, api_key: str, max_results: int = 4) -> dict | None:
    """Поиск через Tavily — если есть ключ. Самое качественное LLM-saturated решение."""
    try:
        payload = json.dumps({
            'api_key': api_key,
            'query': query,
            'search_depth': 'basic',
            'max_results': max_results,
            'include_answer': True,
            'topic': 'general',
        }).encode('utf-8')
        data = _http_json(
            'https://api.tavily.com/search',
            method='POST',
            data=payload,
            headers={'Content-Type': 'application/json'},
            timeout=12,
        )
        if not data:
            return None
        # Нормализуем формат — добавим тег источника
        return {**data, 'source': 'tavily'}
    except Exception:
        return None


def web_search(query: str) -> dict | None:
    """Каскадный поиск: Tavily → DuckDuckGo → Wikipedia. Работает без ключей.

    Tavily опциональный (если есть ключ — пробуем сначала),
    DuckDuckGo и Wikipedia всегда доступны без регистрации.
    """
    # 1) Tavily — если настроен
    tavily_key = os.environ.get('TAVILY_API_KEY', '').strip()
    if tavily_key:
        result = search_tavily(query, tavily_key)
        if result and (result.get('results') or result.get('answer')):
            return result

    # 2) DuckDuckGo — без ключей
    result = search_duckduckgo(query)
    if result and result.get('results'):
        return result

    # 3) Wikipedia (русская) — без ключей
    return search_wikipedia(query)


def format_search_context(search_result: dict) -> tuple[str, list]:
    """Превращает результат любого поисковика в текстовый контекст и список источников."""
    if not search_result:
        return '', []
    parts = []
    sources = []
    src_label = {
        'tavily': 'из интернета',
        'duckduckgo': 'из DuckDuckGo',
        'wikipedia': 'из Википедии',
    }.get(search_result.get('source', ''), 'из интернета')

    answer = search_result.get('answer')
    if answer:
        parts.append(f"Краткая сводка {src_label}: {answer}")
    results = search_result.get('results') or []
    for i, r in enumerate(results[:4]):
        title = (r.get('title') or '').strip()
        content = (r.get('content') or '').strip()[:500]
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
        # ВЕБ-ПОИСК — каскад: Tavily (если есть ключ) → DuckDuckGo → Wikipedia
        # Работает БЕЗ ключей — DuckDuckGo и Wikipedia всегда доступны.
        # ─────────────────────────────────────────────────────────────────
        search_context_text = ''
        sources: list = []
        used_search = False
        if force_search or need_web_search(user_message):
            search_data = web_search(user_message)
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