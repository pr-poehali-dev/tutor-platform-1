"""
Business: Адаптивный обучающий маршрут — генерирует диагностические тесты, выявляет пробелы, формирует программу обучения и уникальные задания через polza.ai (методики Bloom + Mastery Learning + Spaced Repetition).
Args: event с httpMethod, body (action, subject, grade, answers, weak_topics, completed_tasks); context с request_id
Returns: HTTP-ответ с JSON в зависимости от action
"""
import json
import os
import urllib.request
import urllib.error


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
