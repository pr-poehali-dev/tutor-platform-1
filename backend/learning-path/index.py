"""
Business: Адаптивный обучающий маршрут — генерирует диагностические тесты, выявляет пробелы, формирует программу обучения и уникальные задания через polza.ai (методики Bloom + Mastery Learning + Spaced Repetition).
Args: event с httpMethod, body (action, subject, grade, answers, weak_topics, completed_tasks); context с request_id
Returns: HTTP-ответ с JSON в зависимости от action
"""
import json
import os
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


def call_polza(messages, max_tokens=900, temperature=0.7):
    """Вызов polza.ai с заданными сообщениями"""
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

    req = urllib.request.Request(
        'https://api.polza.ai/api/v1/chat/completions',
        data=payload,
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=28) as response:
        result = json.loads(response.read().decode('utf-8'))
    content = result['choices'][0]['message']['content'].strip()
    return json.loads(content)


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


def action_generate_lesson(subject, topic, grade, difficulty, lesson_title=''):
    """Шаг: Полный урок с теорией, примерами и задачами для самопроверки (с кэшем в БД)"""
    cached = get_cached_lesson(subject, topic, grade, difficulty, lesson_title)
    if cached:
        if isinstance(cached, dict):
            cached['_cached'] = True
        return cached

    subject_name = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])['name']
    title_hint = f'Название урока: "{lesson_title}". ' if lesson_title else ''

    prompt = f"""Ты — лучший школьный преподаватель по предмету "{subject_name}". Составь ПОДРОБНЫЙ обучающий урок по теме "{topic}" для уровня "{grade}", сложность "{difficulty}".
{title_hint}
Урок должен быть РЕАЛЬНЫМ и ПОЛЕЗНЫМ — как будто живой учитель объясняет с нуля. НИКАКИХ заглушек, общих фраз вроде "изучите тему" или "lorem ipsum". Только конкретные факты, формулы, правила, примеры.

ВЕРНИ строго JSON следующей структуры:
{{
  "title": "название урока (5-9 слов)",
  "subtitle": "что ученик освоит за урок (1 предложение)",
  "duration_minutes": число от 20 до 40,
  "objectives": [
    "цель урока 1 (что научится делать)",
    "цель урока 2",
    "цель урока 3"
  ],
  "theory_blocks": [
    {{
      "heading": "Заголовок раздела теории (например: 'Что такое дробь')",
      "content": "ПОДРОБНОЕ объяснение раздела в 4-7 предложений. Простым языком, с аналогиями из жизни (пицца, шоколадка, деньги). Конкретные определения, формулы (без LaTeX, обычным текстом), правила.",
      "key_points": ["ключевой тезис 1", "ключевой тезис 2", "ключевой тезис 3"]
    }},
    {{
      "heading": "Заголовок 2",
      "content": "Подробное объяснение второго раздела теории...",
      "key_points": ["тезис 1", "тезис 2"]
    }},
    {{
      "heading": "Заголовок 3",
      "content": "Подробное объяснение третьего раздела (правила, исключения, формулы)...",
      "key_points": ["тезис 1", "тезис 2"]
    }}
  ],
  "examples": [
    {{
      "title": "Пример 1: краткое название",
      "problem": "Условие задачи (конкретное, с числами/фактами)",
      "solution_steps": [
        "Шаг 1: что делаем и почему (с пояснением)",
        "Шаг 2: следующее действие с расчётом",
        "Шаг 3: следующее действие",
        "Шаг 4: получаем ответ"
      ],
      "answer": "финальный ответ",
      "note": "важный нюанс/частая ошибка (1 предложение)"
    }},
    ... 4 разобранных примера от простого к сложному
  ],
  "common_mistakes": [
    "типичная ошибка 1 — как её избежать",
    "типичная ошибка 2 — как её избежать",
    "типичная ошибка 3 — как её избежать"
  ],
  "summary": "Краткое резюме урока в 2-3 предложения (что узнал, главное правило)",
  "tasks": [
    {{
      "task_id": "t1",
      "type": "multiple_choice",
      "question": "формулировка задачи 1 (простая, для закрепления)",
      "context": "",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "hints": ["общая подсказка", "более конкретная", "почти решение"],
      "explanation": "разбор решения в 3-4 предложения с шагами",
      "fun_fact": ""
    }},
    {{
      "task_id": "t2",
      "type": "multiple_choice",
      "question": "формулировка задачи 2 (средней сложности)",
      "context": "",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 1,
      "hints": ["...", "...", "..."],
      "explanation": "...",
      "fun_fact": ""
    }},
    {{
      "task_id": "t3",
      "type": "input",
      "question": "формулировка задачи 3 (ввод короткого ответа)",
      "context": "",
      "options": [],
      "correct_answer": "ответ",
      "hints": ["...", "...", "..."],
      "explanation": "...",
      "fun_fact": ""
    }},
    {{
      "task_id": "t4",
      "type": "multiple_choice",
      "question": "формулировка задачи 4 (применение)",
      "context": "",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 2,
      "hints": ["...", "...", "..."],
      "explanation": "...",
      "fun_fact": ""
    }},
    {{
      "task_id": "t5",
      "type": "multiple_choice",
      "question": "формулировка задачи 5 (сложная, анализ)",
      "context": "",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 3,
      "hints": ["...", "...", "..."],
      "explanation": "...",
      "fun_fact": "интересный факт по теме"
    }}
  ]
}}

ЖЁСТКИЕ ТРЕБОВАНИЯ:
- Минимум 3 раздела теории по 4-7 предложений каждый — реальное содержательное объяснение
- 4 разобранных примера со ШАГАМИ решения (не просто ответ)
- 5 задач для самопроверки: 70% multiple_choice, остальные input
- Без LaTeX, обычным текстом (используй ^, /, * для формул)
- Языковая норма: русский, обращение на "ты", без занудства
- Примеры из реальной жизни где возможно (деньги, скорость, спорт, еда)
- НЕ копируй ничего из учебников — формулируй своими словами"""

    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=4500, temperature=0.7)
    save_lesson_to_cache(subject, topic, grade, difficulty, lesson_title, data)
    if isinstance(data, dict):
        data['_cached'] = False
    return data


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
            if not topic:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'topic обязателен'}, ensure_ascii=False),
                }
            result = action_generate_lesson(subject, topic, grade, difficulty, lesson_title)

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