"""
Конструктор онлайн-школ на ИИ (school-builder).

Универсальный генератор курса под любую тему. Отличие от конкурентов:
ИИ отдаёт не пустой каркас, а готовый к запуску пакет — программа + уроки
(конспект, практика, квиз) + маркетинг-пакет (продающее описание, заголовки,
посты, email-цепочка) + бизнес-подсказки (цена, аудитория, УТП).

POST /?action=generate  body: {topic, audience?, level?, lessons_count?, lead_id?}
GET  /?action=get&id=NN                     -> сгенерированный курс
GET  /?action=list        X-Admin-Pin       -> список последних генераций (админ)
"""
import json
import os
import re
import time
import urllib.request
import urllib.error
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'openai/gpt-4o-mini'
POLZA_API_KEY = os.environ.get('POLZA_API_KEY', '')

SYS_PROMPT = (
    "Ты — методист и продюсер онлайн-школ мирового уровня. По теме автора ты "
    "создаёшь ГОТОВЫЙ К ЗАПУСКУ курс: сильную программу с реальными уроками и "
    "полноценный маркетинговый пакет для продаж. Пиши по-русски, конкретно, без воды. "
    "Работаешь с ЛЮБОЙ темой — от английского до кулинарии и программирования."
)


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(d, s: int = 200) -> dict:
    return {'statusCode': s, 'headers': cors(),
            'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def t(name: str) -> str:
    return f'{SCHEMA}.{name}'


def check_admin(headers: dict) -> bool:
    pin_env = os.environ.get('ADMIN_PIN', '')
    if not pin_env:
        return False
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return pin == pin_env


def call_polza(prompt: str, system: str, max_tokens: int = 3000,
               temperature: float = 0.7, retries: int = 2):
    """Вызов polza.ai с ретраями на временные сбои. Возвращает (text|None, error|None)."""
    if not POLZA_API_KEY:
        return None, 'нет POLZA_API_KEY'
    payload = {
        'model': POLZA_MODEL,
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': prompt},
        ],
        'temperature': temperature,
        'max_tokens': max_tokens,
    }
    body_bytes = json.dumps(payload).encode('utf-8')
    last_err = None
    for attempt in range(retries + 1):
        req = urllib.request.Request(
            POLZA_URL, data=body_bytes,
            headers={'Authorization': f'Bearer {POLZA_API_KEY}',
                     'Content-Type': 'application/json'},
            method='POST')
        try:
            with urllib.request.urlopen(req, timeout=55) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                choices = data.get('choices') or []
                if choices:
                    content = (choices[0].get('message') or {}).get('content', '').strip()
                    if content:
                        return content, None
                    last_err = 'пустой ответ ИИ'
                else:
                    last_err = f'нет choices: {str(data)[:150]}'
        except urllib.error.HTTPError as e:
            body = ''
            try:
                body = e.read().decode('utf-8')[:150]
            except Exception:
                pass
            last_err = f'HTTP {e.code}: {body}'
            if e.code < 500:
                return None, last_err
        except urllib.error.URLError as e:
            last_err = f'URLError: {str(e.reason)[:120]}'
        except (json.JSONDecodeError, OSError) as e:
            last_err = f'{type(e).__name__}: {str(e)[:120]}'
        if attempt < retries:
            time.sleep(1.5)
    return None, last_err


def parse_json(text: str):
    """Достаёт JSON из ответа ИИ (снимает markdown-обёртку при наличии)."""
    if not text:
        return None
    cleaned = text.strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find('{')
        end = cleaned.rfind('}')
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except json.JSONDecodeError:
                return None
    return None


def build_prompt(topic: str, audience: str, level: str, lessons: int) -> str:
    aud = audience or 'широкая аудитория, интересующаяся темой'
    lvl = level or 'с нуля до уверенного уровня'
    modules = max(2, round(lessons / 4))
    return f"""Создай ГОТОВЫЙ К ПРОДАЖЕ онлайн-курс по теме.

ТЕМА: «{topic}»
АУДИТОРИЯ: {aud}
УРОВЕНЬ: {lvl}
КОЛИЧЕСТВО УРОКОВ: ровно {lessons}, разбитых на {modules} модулей.

Требования к программе:
- Реальные, конкретные темы уроков (без общих слов), логика от простого к сложному.
- Каждый 4-5-й урок — практика или проверка. Финальный модуль — итоговый проект.
- Для КАЖДОГО урока дай: краткий конспект (3-4 тезиса), 1 практическое задание,
  и мини-квиз из 1 вопроса с 3 вариантами и указанием правильного.

Дополнительно собери маркетинг-пакет для запуска продаж и бизнес-подсказки.

ВЕРНИ СТРОГО ОДИН JSON без пояснений:
{{
  "course_title": "цепкое название курса",
  "tagline": "подзаголовок одной фразой",
  "description": "продающее описание 2-3 предложения",
  "target_audience": "для кого этот курс",
  "outcomes": ["что сможет ученик после курса, 4-5 пунктов"],
  "estimated_hours": число,
  "modules": [
    {{
      "title": "название модуля",
      "lessons": [
        {{
          "title": "тема урока",
          "type": "theory|practice|test|project",
          "summary": ["тезис 1", "тезис 2", "тезис 3"],
          "task": "формулировка практического задания",
          "quiz": {{"q": "вопрос", "options": ["a", "b", "c"], "correct": 0}}
        }}
      ]
    }}
  ],
  "marketing": {{
    "headlines": ["3 варианта заголовка для лендинга"],
    "social_posts": ["2 коротких поста для соцсетей с призывом"],
    "email_sequence": [
      {{"subject": "тема письма", "goal": "цель письма одной фразой"}}
    ]
  }},
  "business": {{
    "price_recommendation": "рекомендованная вилка цены в рублях с обоснованием одной фразой",
    "usp": "уникальное торговое предложение курса одной фразой",
    "channels": ["2-3 канала где искать учеников"]
  }}
}}"""


def count_lessons(plan: dict) -> tuple:
    modules = plan.get('modules') or []
    lessons = sum(len(m.get('lessons') or []) for m in modules)
    return lessons, len(modules)


def fallback_plan(topic: str, lessons: int) -> dict:
    """Аварийный шаблон, если ИИ недоступен — курс всё равно генерируется."""
    per = max(1, lessons // 3)
    blocks = [
        ("Основы", "theory"),
        ("Практика", "practice"),
        ("Проект и итоги", "project"),
    ]
    modules = []
    idx = 1
    for mtitle, mtype in blocks:
        ls = []
        for _ in range(per):
            ls.append({
                "title": f"{topic}: часть {idx}",
                "type": mtype,
                "summary": ["Ключевая идея урока", "Разбор на примере", "Типичные ошибки"],
                "task": "Выполните практическое задание по теме урока.",
                "quiz": {"q": "Освоена ли тема урока?", "options": ["Да", "Частично", "Нет"], "correct": 0},
            })
            idx += 1
        modules.append({"title": f"{mtitle}: {topic}", "lessons": ls})
    return {
        "course_title": f"Курс по теме «{topic}»",
        "tagline": "Пошаговый путь от новичка до результата",
        "description": f"Практический онлайн-курс по теме «{topic}» с заданиями и проверкой знаний.",
        "target_audience": "Все, кто хочет освоить тему с нуля.",
        "outcomes": ["Понимать основы темы", "Применять знания на практике",
                     "Выполнить итоговый проект", "Быть готовым двигаться дальше"],
        "estimated_hours": lessons,
        "modules": modules,
        "marketing": {
            "headlines": [f"Освойте «{topic}» за {lessons} уроков",
                          f"«{topic}» с нуля до результата",
                          f"Практический курс: {topic}"],
            "social_posts": [f"Запускаем курс по теме «{topic}» — присоединяйтесь!",
                             "Учитесь в удобном темпе с практикой и проверкой знаний."],
            "email_sequence": [
                {"subject": "Добро пожаловать на курс", "goal": "познакомить и вовлечь"},
                {"subject": "Старт обучения", "goal": "запустить первый урок"},
            ],
        },
        "business": {
            "price_recommendation": "3 000–9 000 ₽ в зависимости от глубины и поддержки",
            "usp": "Практика и проверка знаний в каждом уроке",
            "channels": ["Соцсети", "Email-рассылка", "Рекомендации учеников"],
        },
    }


def handle_generate(body: dict) -> dict:
    topic = (body.get('topic') or '').strip()[:300]
    audience = (body.get('audience') or '').strip()[:300]
    level = (body.get('level') or '').strip()[:60]
    try:
        lessons = int(body.get('lessons_count') or 12)
    except (TypeError, ValueError):
        lessons = 12
    lessons = max(4, min(24, lessons))
    lead_id = body.get('lead_id')
    try:
        lead_id = int(lead_id) if lead_id is not None else None
    except (TypeError, ValueError):
        lead_id = None

    if len(topic) < 3:
        return err('Опишите тему курса (минимум 3 символа)', 400)

    prompt = build_prompt(topic, audience, level, lessons)
    raw, ai_err = call_polza(prompt, SYS_PROMPT)
    plan = parse_json(raw) if raw else None
    is_fallback = False
    if not plan or not (plan.get('modules')):
        plan = fallback_plan(topic, lessons)
        is_fallback = True

    real_lessons, real_modules = count_lessons(plan)
    course_title = (plan.get('course_title') or f'Курс по теме «{topic}»')[:300]

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO " + t('builder_courses') +
                " (lead_id, topic, audience, level, lessons_count, modules_count, "
                "course_title, status, is_fallback, ai_error, data) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (lead_id, topic, audience or None, level or None, real_lessons,
                 real_modules, course_title, 'ready', is_fallback,
                 (ai_err or None) if is_fallback else None,
                 json.dumps(plan, ensure_ascii=False))
            )
            new_id = cur.fetchone()[0]
            conn.commit()
    finally:
        conn.close()

    return ok({
        'ok': True,
        'id': new_id,
        'is_fallback': is_fallback,
        'lessons_count': real_lessons,
        'modules_count': real_modules,
        'course': plan,
    })


def handle_get(course_id: str) -> dict:
    try:
        cid = int(course_id)
    except (TypeError, ValueError):
        return err('Некорректный id', 400)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, topic, course_title, lessons_count, modules_count, "
                "is_fallback, data, created_at FROM " + t('builder_courses') +
                " WHERE id=%s", (cid,))
            r = cur.fetchone()
            if not r:
                return err('Курс не найден', 404)
            return ok({
                'id': r[0], 'topic': r[1], 'course_title': r[2],
                'lessons_count': r[3], 'modules_count': r[4],
                'is_fallback': r[5], 'course': r[6],
                'created_at': r[7].isoformat() if r[7] else None,
            })
    finally:
        conn.close()


def handle_list() -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, topic, course_title, lessons_count, modules_count, "
                "is_fallback, lead_id, created_at FROM " + t('builder_courses') +
                " ORDER BY created_at DESC LIMIT 200")
            items = [{
                'id': r[0], 'topic': r[1], 'course_title': r[2],
                'lessons_count': r[3], 'modules_count': r[4],
                'is_fallback': r[5], 'lead_id': r[6],
                'created_at': r[7].isoformat() if r[7] else None,
            } for r in cur.fetchall()]
            return ok({'items': items, 'total': len(items)})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """ИИ-конструктор онлайн-школ: генерация готового к запуску курса по теме."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or '').strip()
    headers = event.get('headers') or {}
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}

    if action == 'generate' and method == 'POST':
        return handle_generate(body)
    if action == 'get':
        return handle_get(qs.get('id'))
    if action == 'list':
        if not check_admin(headers):
            return err('Доступ запрещён', 403)
        return handle_list()

    return err('Неизвестное действие', 404)
