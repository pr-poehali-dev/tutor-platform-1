"""
Business: Адаптивный обучающий маршрут — генерирует диагностические тесты, выявляет пробелы, формирует программу обучения и уникальные задания через polza.ai (методики Bloom + Mastery Learning + Spaced Repetition). Версия с валидацией задач.
Args: event с httpMethod, body (action, subject, grade, answers, weak_topics, completed_tasks); context с request_id
Returns: HTTP-ответ с JSON в зависимости от action
"""
import json
import os
import re
import hashlib
import urllib.request
import urllib.error
import psycopg2
import psycopg2.extras


SUBJECT_TOPICS = {
    'math': {
        'name': 'Математика',
        'topics': {
            '5-9': ['Дроби', 'Проценты', 'Уравнения', 'Геометрия', 'Функции', 'Системы уравнений', 'Степени'],
            '10-11': ['Тригонометрия', 'Логарифмы', 'Производные', 'Интегралы', 'Стереометрия', 'Векторы', 'Вероятность'],
            'ege': ['Планиметрия', 'Стереометрия', 'Тригонометрия', 'Логарифмы', 'Производные', 'Текстовые задачи', 'Параметры'],
        }
    },
    'physics': {
        'name': 'Физика',
        'topics': {
            '5-9': ['Механика', 'Тепловые явления', 'Электричество', 'Оптика', 'Звук'],
            '10-11': ['Кинематика', 'Динамика', 'Молекулярная физика', 'Термодинамика', 'Электродинамика', 'Магнетизм', 'Квантовая физика'],
            'ege': ['Механика', 'МКТ', 'Термодинамика', 'Электродинамика', 'Колебания и волны', 'Оптика', 'Атомная физика'],
        }
    },
    'english': {
        'name': 'Английский',
        'topics': {
            '5-9': ['Времена Present', 'Времена Past', 'Времена Future', 'Артикли', 'Модальные глаголы', 'Pronouns'],
            '10-11': ['Perfect Tenses', 'Conditionals', 'Passive Voice', 'Reported Speech', 'Gerund/Infinitive', 'Idioms'],
            'ege': ['Грамматика ЕГЭ', 'Лексика', 'Чтение', 'Аудирование', 'Письмо', 'Устная часть'],
        }
    },
    'russian': {
        'name': 'Русский язык',
        'topics': {
            '5-9': ['Орфография корня', 'Окончания', 'Знаки препинания', 'Части речи', 'Морфология'],
            '10-11': ['Сложноподчинённые предложения', 'Тире и двоеточие', 'Н/НН', 'Слитное/раздельное написание', 'Лексические нормы'],
            'ege': ['Задание 8 ЕГЭ', 'Пунктуация', 'Орфоэпия', 'Лексика', 'Сочинение', 'Аргументация'],
        }
    },
}


def call_polza(messages, max_tokens=900, temperature=0.7, timeout=50, retries=1):
    """Вызов polza.ai с заданными сообщениями + автоматический retry при таймауте"""
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        raise Exception('POLZA_API_KEY не настроен')

    payload = json.dumps({
        'model': 'openai/gpt-4o-mini',
        'messages': messages,
        'temperature': temperature,
        'max_tokens': max_tokens,
        'response_format': {'type': 'json_object'},
    }).encode('utf-8')

    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(
                'https://api.polza.ai/api/v1/chat/completions',
                data=payload,
                headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
                method='POST',
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                result = json.loads(response.read().decode('utf-8'))
            content = result['choices'][0]['message']['content'].strip()
            return json.loads(content)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            last_err = e
            if attempt >= retries:
                break
    raise last_err if last_err else Exception('polza.ai недоступен')


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }


def action_diagnostic_test(subject, grade):
    """Шаг 1: Вводный диагностический тест по таксономии Блума (от простого к сложному)"""
    s = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])
    topics = s['topics'].get(grade, list(s['topics'].values())[0])
    topics_str = ', '.join(topics)

    prompt = f"""Ты — методист. Сгенерируй ДИАГНОСТИЧЕСКИЙ тест по предмету "{s['name']}" для уровня "{grade}".
Цель — выявить пробелы. Используй таксономию Блума: вопросы РАЗНОЙ сложности (1=знание, 2=понимание, 3=применение, 4=анализ, 5=синтез).
Покрой как можно больше из этих тем: {topics_str}.

ВЕРНИ строго JSON:
{{
  "test": [
    {{
      "id": 1,
      "topic": "название темы из списка",
      "level": 1,
      "question": "вопрос",
      "options": ["вариант A", "вариант B", "вариант C", "вариант D"],
      "correct": 0,
      "explanation": "почему этот ответ правильный (1-2 предложения)"
    }},
    ... всего 7 вопросов разных уровней и тем
  ]
}}

Правила:
- 7 вопросов, покрывающих минимум 5 разных тем
- Уровни сложности распределены: 2 простых (1-2), 3 средних (3), 2 сложных (4-5)
- Варианты ответа короткие, осмысленные (не "не знаю")
- correct — индекс правильного ответа (0-3)
- Без LaTeX, простой текст"""

    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=2500, temperature=0.6)
    return data


def action_analyze_results(subject, grade, answers):
    """Шаг 2: Анализ ответов — выявление пробелов и сильных тем"""
    answers_str = json.dumps(answers, ensure_ascii=False)
    prompt = f"""Ты — диагност-педагог. Проанализируй ответы ученика на диагностический тест по "{SUBJECT_TOPICS[subject]['name']}" (уровень {grade}).

Ответы (для каждого вопроса: topic, level, is_correct):
{answers_str}

ВЕРНИ строго JSON:
{{
  "score_percent": 0-100,
  "level_assessment": "начинающий" / "средний" / "продвинутый",
  "weak_topics": [
    {{"topic": "название темы", "severity": "критично"/"умеренно"/"легко", "reason": "почему пробел"}}
  ],
  "strong_topics": ["тема1", "тема2"],
  "personalized_message": "Тёплое мотивирующее сообщение ученику (2-3 предложения, обращение на ты, без занудства)",
  "follow_up_questions": [
    "наводящий вопрос 1 для уточнения проблем по самой слабой теме",
    "наводящий вопрос 2",
    "наводящий вопрос 3"
  ]
}}

Слабые темы = там где ошибся. Сортируй weak_topics от критичных к лёгким."""

    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=1200, temperature=0.5)
    return data


def action_build_program(subject, grade, weak_topics, level):
    """Шаг 3: Формирование персональной программы (Mastery Learning + Spaced Repetition)"""
    topics_list = ', '.join([t['topic'] if isinstance(t, dict) else t for t in weak_topics])
    prompt = f"""Ты — методист. Составь персональную программу обучения "{SUBJECT_TOPICS[subject]['name']}" (уровень {grade}).

Уровень ученика: {level}
Слабые темы (от критичных): {topics_list}

Применяй методики:
- Mastery Learning: каждый модуль — пока не освоит на 80%+
- Spaced Repetition: возврат к сложным темам через 1, 3, 7 дней
- От простого к сложному

ВЕРНИ строго JSON:
{{
  "program_title": "Краткое название программы",
  "estimated_days": число дней до полного освоения,
  "total_modules": число,
  "modules": [
    {{
      "id": 1,
      "topic": "название темы",
      "title": "Модуль 1: ...",
      "description": "что освоит за модуль (1-2 предложения)",
      "skills": ["навык 1", "навык 2", "навык 3"],
      "tasks_count": число (3-5),
      "difficulty": "лёгкий"/"средний"/"сложный",
      "estimated_minutes": число (15-45),
      "repeat_after_days": [1, 3, 7]
    }},
    ... всего 4-6 модулей
  ],
  "tips": ["совет 1 по обучению", "совет 2", "совет 3"]
}}"""

    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=2000, temperature=0.6)
    return data


def _get_db_conn():
    """Создаёт соединение с PostgreSQL"""
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    try:
        return psycopg2.connect(dsn)
    except Exception:
        return None


def _lesson_cache_key(subject, topic, grade, difficulty, lesson_title):
    """Стабильный ключ кэша урока"""
    raw = f'{subject}|{grade}|{topic}|{difficulty}|{lesson_title or ""}'.lower().strip()
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def get_cached_lesson(subject, topic, grade, difficulty, lesson_title):
    """Возвращает урок из кэша БД, если есть, и обновляет счётчик попаданий"""
    key = _lesson_cache_key(subject, topic, grade, difficulty, lesson_title)
    conn = _get_db_conn()
    if conn is None:
        return None
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT lesson_data FROM lesson_cache WHERE cache_key = %s LIMIT 1",
                (key,)
            )
            row = cur.fetchone()
            if not row:
                return None
            cur.execute(
                "UPDATE lesson_cache SET hit_count = hit_count + 1, last_accessed_at = NOW() WHERE cache_key = %s",
                (key,)
            )
            conn.commit()
            data = row['lesson_data']
            if isinstance(data, str):
                data = json.loads(data)
            return data
    except Exception:
        return None
    finally:
        try:
            conn.close()
        except Exception:
            pass


def save_lesson_to_cache(subject, topic, grade, difficulty, lesson_title, lesson_data):
    """Сохраняет сгенерированный урок в кэш БД (idempotent)"""
    key = _lesson_cache_key(subject, topic, grade, difficulty, lesson_title)
    conn = _get_db_conn()
    if conn is None:
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO lesson_cache
                    (cache_key, subject, grade, topic, difficulty, lesson_title, lesson_data)
                VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)
                ON CONFLICT (cache_key) DO NOTHING
                """,
                (
                    key,
                    subject,
                    grade,
                    topic,
                    difficulty,
                    lesson_title or '',
                    json.dumps(lesson_data, ensure_ascii=False),
                )
            )
            conn.commit()
    except Exception:
        pass
    finally:
        try:
            conn.close()
        except Exception:
            pass


TASK_GEN_PROMPT_TEMPLATE = """Ты — ОЧЕНЬ ВНИМАТЕЛЬНЫЙ школьный преподаватель по "{subject_name}". Сгенерируй {n} ЗАДАЧ для самопроверки по теме "{topic}" (уровень {grade}, сложность {difficulty}).

⚠️ КРИТИЧЕСКИ ВАЖНО — ЧАЩЕ ВСЕГО ОШИБАЮТСЯ ИМЕННО ТУТ:
1. РЕШИ задачу САМ перед тем как писать варианты. Запиши верный ответ.
2. Один из вариантов ОБЯЗАТЕЛЬНО должен быть РАВЕН верному ответу — буква в букву, цифра в цифру.
3. correct_answer — это ИНДЕКС (0,1,2,3) того варианта в options, который СОВПАДАЕТ с верным ответом.
4. correct_answer_text — это ТЕКСТ верного ответа (дубликат options[correct_answer]). Двойная проверка.
5. Три остальных варианта — правдоподобные неправильные ответы (типичные ошибки учеников), но НЕ равные правильному.
6. ПРОВЕРЬ ЕЩЁ РАЗ: подставь correct_answer обратно в задачу — действительно ли это ответ?

ПРИМЕР ПРАВИЛЬНОЙ ЗАДАЧИ:
question: "Сколько будет 8 + 9?"
options: ["15", "16", "17", "18"]
correct_answer: 2          ← индекс
correct_answer_text: "17"  ← должен совпадать с options[2]

ПРИМЕР НЕПРАВИЛЬНОЙ ЗАДАЧИ (так делать НЕЛЬЗЯ):
question: "Сколько будет 8 + 9?"
options: ["11","12","13","14"]   ← среди вариантов НЕТ правильного 17 — ЭТО ОШИБКА!

ВЕРНИ строго JSON:
{{
  "tasks": [
    {{
      "task_id": "t1",
      "type": "multiple_choice",
      "question": "формулировка задачи",
      "context": "",
      "options": ["вариант 0","вариант 1","вариант 2","вариант 3"],
      "correct_answer": 2,
      "correct_answer_text": "вариант 2 (текстом)",
      "hints": ["общая подсказка","более конкретная","почти решение"],
      "explanation": "разбор решения с шагами и итоговым ответом",
      "fun_fact": ""
    }}
    /* ... всего {n} задач */
  ]
}}

ТИПЫ ЗАДАЧ В НАБОРЕ:
- Большинство (4 из 5) — type "multiple_choice" с 4 вариантами
- Одна (5-я) — type "input" с короткой строкой ответа: options: [], correct_answer: "ответ строкой", correct_answer_text: "тот же ответ"

ОБЩИЕ ТРЕБОВАНИЯ:
- РОВНО {n} задач от простого к сложному
- Без LaTeX. Формулы обычным текстом (используй ^, /, *)
- Русский язык, обращение на "ты"
- 3 подсказки в каждой — от общей к конкретной
- В explanation — обязательно итоговый ответ совпадающий с correct_answer_text"""


def _validate_task(task):
    """Проверяет одну задачу. Возвращает (is_valid, reason)."""
    if not isinstance(task, dict):
        return False, 'not a dict'
    ttype = task.get('type', '')
    question = str(task.get('question', '')).strip()
    if not question:
        return False, 'empty question'

    if ttype == 'multiple_choice':
        options = task.get('options', [])
        if not isinstance(options, list) or len(options) < 2:
            return False, 'options must be list of 2+'
        try:
            ci = int(task.get('correct_answer'))
        except (TypeError, ValueError):
            return False, 'correct_answer must be int'
        if ci < 0 or ci >= len(options):
            return False, f'correct_answer index {ci} out of range'

        ans_text = str(task.get('correct_answer_text', '')).strip()
        opt_at_idx = str(options[ci]).strip()

        # если ИИ дал correct_answer_text — он должен совпадать с options[correct_answer]
        if ans_text and ans_text.lower() != opt_at_idx.lower():
            # попробуем найти ans_text среди options и поправить индекс
            for i, opt in enumerate(options):
                if str(opt).strip().lower() == ans_text.lower():
                    task['correct_answer'] = i
                    return True, 'fixed index by text match'
            return False, f'correct_answer_text "{ans_text}" не совпадает с options[{ci}]="{opt_at_idx}"'

        # доп. проверка: для простой арифметики ("X + Y" / "X * Y" / "X - Y") — вычислим сами
        m = re.search(r'(\d{1,4})\s*([+\-*/×÷])\s*(\d{1,4})', question.replace('×','*').replace('÷','/'))
        if m:
            a, op, b = int(m.group(1)), m.group(2), int(m.group(3))
            try:
                if op == '+': real = a + b
                elif op == '-': real = a - b
                elif op == '*': real = a * b
                elif op == '/': real = a / b if b else None
                else: real = None
            except Exception:
                real = None
            if real is not None:
                real_str = str(int(real)) if isinstance(real, float) and real.is_integer() else str(real)
                # ищем правильный ответ среди options
                normalized = [str(o).strip() for o in options]
                if real_str not in normalized:
                    return False, f'правильный ответ {real_str} отсутствует в options {normalized}'
                # поправим индекс если ИИ ошибся индексом
                if normalized[ci].strip() != real_str:
                    task['correct_answer'] = normalized.index(real_str)
                    task['correct_answer_text'] = real_str
                    return True, 'fixed index by arithmetic'

        return True, 'ok'

    elif ttype == 'input':
        ca = task.get('correct_answer')
        if ca is None or str(ca).strip() == '':
            return False, 'empty correct_answer'
        return True, 'ok'

    return False, f'unknown type "{ttype}"'


def _generate_lesson_tasks_only(subject_name, topic, grade, difficulty):
    """Генерирует и ВАЛИДИРУЕТ задачи к уроку. Битые задачи перегенерируются."""
    prompt = TASK_GEN_PROMPT_TEMPLATE.format(
        subject_name=subject_name, topic=topic, grade=grade, difficulty=difficulty, n=5
    )
    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=2600, temperature=0.5, timeout=50, retries=1)
    raw_tasks = data.get('tasks', []) if isinstance(data, dict) else []

    valid_tasks = []
    bad_count = 0
    for t in raw_tasks:
        ok, _reason = _validate_task(t)
        if ok:
            valid_tasks.append(t)
        else:
            bad_count += 1

    # Если хоть одна задача битая — добиваем недостающие отдельным запросом
    if bad_count > 0 and len(valid_tasks) < 5:
        need = 5 - len(valid_tasks)
        try:
            prompt2 = TASK_GEN_PROMPT_TEMPLATE.format(
                subject_name=subject_name, topic=topic, grade=grade, difficulty=difficulty, n=need
            ) + f"\n\nДОПОЛНИТЕЛЬНО: {need} новых задач, отличающихся от ранее данных. ОСОБЕННО внимательно с правильными ответами!"
            data2 = call_polza([{'role': 'user', 'content': prompt2}], max_tokens=1800, temperature=0.4, timeout=45, retries=1)
            extra = data2.get('tasks', []) if isinstance(data2, dict) else []
            for t in extra:
                if len(valid_tasks) >= 5:
                    break
                ok, _ = _validate_task(t)
                if ok:
                    valid_tasks.append(t)
        except Exception:
            pass

    return valid_tasks[:5]


def action_generate_lesson(subject, topic, grade, difficulty, lesson_title='', include_tasks=True):
    """Урок: теория + примеры. Задачи опционально (по умолчанию да, для обратной совместимости).
    С кэшем в БД. При include_tasks=False задачи не генерируются — пользователь загрузит их отдельным запросом."""
    cached = get_cached_lesson(subject, topic, grade, difficulty, lesson_title)
    if cached:
        if isinstance(cached, dict):
            cached['_cached'] = True
            # если из кэша запросили без задач — всё равно отдаём задачи целиком
        return cached

    subject_name = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])['name']
    title_hint = f'Название урока: "{lesson_title}". ' if lesson_title else ''

    # ── Этап 1: теория + примеры (быстрый запрос, ~2800 токенов) ──
    prompt_main = f"""Ты — лучший школьный преподаватель по предмету "{subject_name}". Составь ПОДРОБНЫЙ обучающий урок по теме "{topic}" для уровня "{grade}", сложность "{difficulty}".
{title_hint}
Урок должен быть РЕАЛЬНЫМ и ПОЛЕЗНЫМ — как будто живой учитель объясняет с нуля. НИКАКИХ заглушек, общих фраз вроде "изучите тему" или "lorem ipsum". Только конкретные факты, формулы, правила, примеры.

ВЕРНИ строго JSON следующей структуры (БЕЗ массива tasks — задачи будут отдельно):
{{
  "title": "название урока (5-9 слов)",
  "subtitle": "что ученик освоит за урок (1 предложение)",
  "duration_minutes": число от 20 до 40,
  "objectives": ["цель 1","цель 2","цель 3"],
  "theory_blocks": [
    {{
      "heading": "Заголовок раздела теории",
      "content": "ПОДРОБНОЕ объяснение в 4-7 предложений. Простым языком, с аналогиями из жизни (пицца, шоколадка, деньги). Конкретные определения, формулы (без LaTeX), правила.",
      "key_points": ["тезис 1","тезис 2","тезис 3"]
    }},
    {{ "heading":"Заголовок 2", "content":"...", "key_points":["...","..."] }},
    {{ "heading":"Заголовок 3", "content":"...", "key_points":["...","..."] }}
  ],
  "examples": [
    {{
      "title": "Пример 1: краткое название",
      "problem": "Условие (конкретное, с числами)",
      "solution_steps": ["Шаг 1: что делаем","Шаг 2: расчёт","Шаг 3: ...","Шаг 4: ответ"],
      "answer": "финальный ответ",
      "note": "важный нюанс (1 предложение)"
    }},
    ... всего 4 разобранных примера от простого к сложному
  ],
  "common_mistakes": ["ошибка 1 — как избежать","ошибка 2 — как избежать","ошибка 3 — как избежать"],
  "summary": "Краткое резюме в 2-3 предложения"
}}

ЖЁСТКИЕ ТРЕБОВАНИЯ:
- РОВНО 3 раздела теории по 4-7 предложений
- РОВНО 4 разобранных примера со ШАГАМИ
- Без LaTeX, обычным текстом (используй ^, /, * для формул)
- Русский язык, обращение на "ты"
- НЕ возвращай поле tasks — задачи отдельно
- Примеры из жизни (деньги, скорость, спорт, еда)"""

    data = call_polza([{'role': 'user', 'content': prompt_main}], max_tokens=2800, temperature=0.7, timeout=50, retries=1)

    if not isinstance(data, dict):
        data = {}

    # Задачи опционально (если фронт хочет всё сразу)
    if include_tasks:
        try:
            data['tasks'] = _generate_lesson_tasks_only(subject_name, topic, grade, difficulty)
        except Exception:
            data['tasks'] = []
    else:
        data['tasks'] = []

    save_lesson_to_cache(subject, topic, grade, difficulty, lesson_title, data)
    data['_cached'] = False
    return data


def action_generate_lesson_tasks(subject, topic, grade, difficulty):
    """Отдельный быстрый запрос — только задачи к уроку"""
    subject_name = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])['name']
    tasks = _generate_lesson_tasks_only(subject_name, topic, grade, difficulty)
    return {'tasks': tasks}


def action_generate_task(subject, topic, difficulty, completed_tasks):
    """Шаг 4: Уникальное задание для модуля (не повторяется)"""
    completed_str = '; '.join(completed_tasks[-20:]) if completed_tasks else 'нет'
    prompt = f"""Сгенерируй УНИКАЛЬНОЕ задание по теме "{topic}" (предмет: {SUBJECT_TOPICS[subject]['name']}, сложность: {difficulty}).

Уже выданные задания (НЕ повторяй и не делай похожие): {completed_str}

ВЕРНИ строго JSON:
{{
  "task_id": "уникальный id строкой",
  "type": "multiple_choice"/"input"/"explain",
  "question": "формулировка задания",
  "context": "контекст или подсказка к задаче (опционально, может быть пустой строкой)",
  "options": ["A", "B", "C", "D"] или [],
  "correct_answer": "правильный ответ или индекс",
  "hints": ["подсказка 1 (общая)", "подсказка 2 (ближе)", "подсказка 3 (почти решение)"],
  "explanation": "разбор решения (3-5 предложений, с шагами)",
  "fun_fact": "интересный факт по теме (1 предложение, для мотивации)"
}}

Тип задания: 70% multiple_choice, 20% input (короткий ответ), 10% explain (объяснение своими словами).
Формулировка должна быть жизненной, не сухой."""

    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=900, temperature=0.85)
    return data


def handler(event, context):
    """Главная функция роутинга обучающего маршрута"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    try:
        body_str = event.get('body', '{}')
        body = json.loads(body_str) if isinstance(body_str, str) else body_str
        action = body.get('action', '')

        if action == 'diagnostic_test':
            subject = body.get('subject', 'math')
            grade = body.get('grade', '5-9')
            result = action_diagnostic_test(subject, grade)

        elif action == 'analyze_results':
            subject = body.get('subject', 'math')
            grade = body.get('grade', '5-9')
            answers = body.get('answers', [])
            if not answers:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'answers пустой'}, ensure_ascii=False),
                }
            result = action_analyze_results(subject, grade, answers)

        elif action == 'build_program':
            subject = body.get('subject', 'math')
            grade = body.get('grade', '5-9')
            weak_topics = body.get('weak_topics', [])
            level = body.get('level', 'средний')
            result = action_build_program(subject, grade, weak_topics, level)

        elif action == 'generate_task':
            subject = body.get('subject', 'math')
            topic = body.get('topic', '')
            difficulty = body.get('difficulty', 'средний')
            completed = body.get('completed_tasks', [])
            if not topic:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'topic обязателен'}, ensure_ascii=False),
                }
            result = action_generate_task(subject, topic, difficulty, completed)

        elif action == 'generate_lesson':
            subject = body.get('subject', 'math')
            topic = body.get('topic', '')
            grade = body.get('grade', '5-9')
            difficulty = body.get('difficulty', 'средний')
            lesson_title = body.get('lesson_title', '')
            include_tasks = bool(body.get('include_tasks', False))
            if not topic:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'topic обязателен'}, ensure_ascii=False),
                }
            result = action_generate_lesson(subject, topic, grade, difficulty, lesson_title, include_tasks=include_tasks)

        elif action == 'generate_lesson_tasks':
            subject = body.get('subject', 'math')
            topic = body.get('topic', '')
            grade = body.get('grade', '5-9')
            difficulty = body.get('difficulty', 'средний')
            if not topic:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'topic обязателен'}, ensure_ascii=False),
                }
            result = action_generate_lesson_tasks(subject, topic, grade, difficulty)

        elif action == 'subjects':
            result = {
                'subjects': [
                    {'id': k, 'name': v['name'], 'grades': list(v['topics'].keys())}
                    for k, v in SUBJECT_TOPICS.items()
                ]
            }
        else:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Неизвестный action: {action}'}, ensure_ascii=False),
            }

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False),
        }

    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'polza.ai error: {e.code}', 'detail': err_body[:300]}, ensure_ascii=False),
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }