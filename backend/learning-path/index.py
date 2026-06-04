"""
Business: Адаптивный обучающий маршрут — генерирует диагностические тесты, выявляет пробелы, формирует программу обучения и уникальные задания через polza.ai (методики Bloom + Mastery Learning + Spaced Repetition). Версия с валидацией задач.
Args: event с httpMethod, body (action, subject, grade, answers, weak_topics, completed_tasks); context с request_id
Returns: HTTP-ответ с JSON в зависимости от action
"""
import json
import os
import re
import random
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
    'chinese': {
        'name': 'Китайский язык',
        'topics': {
            '5-9': ['Пиньинь и тоны', 'Базовые иероглифы', 'Порядок слов', 'Счётные слова', 'Разговорные фразы'],
            '10-11': ['Грамматика HSK', 'Иероглифика', 'Аудирование', 'Чтение текстов', 'Разговорная практика'],
            'ege': ['Грамматика HSK', 'Лексика HSK', 'Аудирование', 'Чтение', 'Письмо'],
        }
    },
    'korean': {
        'name': 'Корейский язык',
        'topics': {
            '5-9': ['Хангыль', 'Уровни вежливости', 'Частицы', 'Спряжение глаголов', 'Разговорные фразы'],
            '10-11': ['Грамматика TOPIK', 'Лексика', 'Аудирование', 'Чтение', 'Разговорная практика'],
            'ege': ['Грамматика TOPIK', 'Лексика TOPIK', 'Аудирование', 'Чтение', 'Письмо'],
        }
    },
    'datascience': {
        'name': 'Data Science и анализ данных',
        'topics': {
            '5-9': ['Python основы', 'Работа с данными', 'Визуализация', 'Статистика', 'Логика анализа'],
            '10-11': ['Pandas и NumPy', 'Визуализация', 'SQL', 'Статистика', 'Машинное обучение'],
            'ege': ['Pandas', 'Машинное обучение', 'Метрики моделей', 'SQL', 'Подготовка данных'],
        }
    },
    'product': {
        'name': 'Продакт-менеджмент',
        'topics': {
            '5-9': ['Продуктовое мышление', 'Исследование пользователей', 'Метрики', 'Приоритизация', 'MVP'],
            '10-11': ['CustDev и JTBD', 'Юнит-экономика', 'Roadmap', 'A/B-тесты', 'Go-to-market'],
            'ege': ['Метрики продукта', 'Юнит-экономика', 'Приоритизация', 'Запуск MVP', 'Аналитика'],
        }
    },
    'avangard': {
        'name': 'Внедрение ИИ-ассистента Avangard AI',
        'topics': {
            '5-9': ['Возможности ассистента', 'Настройка', 'База знаний', 'Интеграции', 'Аналитика'],
            '10-11': ['Сценарии диалогов', 'Обучение на данных', 'CRM-интеграция', 'Автоматизация', 'ROI'],
            'ege': ['Настройка ассистента', 'База знаний', 'Интеграции', 'Автоматизация продаж', 'Аналитика'],
        }
    },
    'roomscan': {
        'name': '3D-сканирование помещений RoomScan AI',
        'topics': {
            '5-9': ['Основы сканирования', 'Подготовка помещения', 'Получение плана', 'Расчёт площадей', 'Экспорт'],
            '10-11': ['Точность замеров', 'Сложные помещения', 'Планировки', 'Расчёт материалов', 'Экспорт моделей'],
            'ege': ['Сканирование', 'Планировки', 'Площади', 'Материалы', 'Экспорт'],
        }
    },
    'business': {
        'name': 'Бизнес и предпринимательство',
        'topics': {
            '5-9': ['Основы бизнеса', 'Финансовая грамотность', 'Маркетинг', 'Продажи', 'Планирование'],
            '10-11': ['Регистрация бизнеса', 'Налоги РФ', 'Маркетинг', 'Финансы', 'Стратегия'],
            'ege': ['Бизнес-модель', 'Налоги', 'Маркетинг', 'Финансы', 'Право'],
        }
    },
    'chemistry': {
        'name': 'Химия',
        'topics': {
            '5-9': ['Атомы и молекулы', 'Периодическая таблица', 'Химические реакции', 'Растворы', 'Кислоты и основания'],
            '10-11': ['Органическая химия', 'Углеводороды', 'Окислительно-восстановительные реакции', 'Электролиз', 'Скорость реакций'],
            'ege': ['Строение атома', 'Химические свойства веществ', 'Органическая химия', 'Реакции в растворах', 'Расчётные задачи'],
        }
    },
    'biology': {
        'name': 'Биология',
        'topics': {
            '5-9': ['Клетка', 'Растения', 'Животные', 'Организм человека', 'Экология'],
            '10-11': ['Генетика', 'Эволюция', 'Молекулярная биология', 'Анатомия человека', 'Экосистемы'],
            'ege': ['Цитология', 'Генетика', 'Эволюция', 'Анатомия и физиология', 'Экология'],
        }
    },
    'cs': {
        'name': 'Информатика и программирование',
        'topics': {
            '5-9': ['Алгоритмы', 'Python основы', 'Переменные и циклы', 'Условия', 'Функции'],
            '10-11': ['Структуры данных', 'ООП', 'Базы данных', 'Веб-разработка', 'Алгоритмы сортировки'],
            'ege': ['Системы счисления', 'Логика', 'Программирование на Python', 'Алгоритмы', 'Обработка информации'],
        }
    },
    'ai': {
        'name': 'Искусственный интеллект и нейросети',
        'topics': {
            '5-9': ['Что такое ИИ', 'Нейросети простыми словами', 'Машинное обучение', 'Применение ИИ', 'Промпты'],
            '10-11': ['Машинное обучение', 'Нейронные сети', 'Обучение моделей', 'Компьютерное зрение', 'Обработка текста'],
            'ege': ['Основы ML', 'Нейросети', 'Подготовка данных', 'Метрики моделей', 'Этика ИИ'],
        }
    },
    'history': {
        'name': 'История',
        'topics': {
            '5-9': ['Древний мир', 'Средние века', 'История России', 'Великие открытия', 'Войны и революции'],
            '10-11': ['Российская империя', 'XX век', 'Мировые войны', 'СССР', 'Современная Россия'],
            'ege': ['Древняя Русь', 'Российская империя', 'СССР', 'Великая Отечественная война', 'Работа с источниками'],
        }
    },
    'society': {
        'name': 'Обществознание',
        'topics': {
            '5-9': ['Человек и общество', 'Финансовая грамотность', 'Право', 'Экономика', 'Социальные нормы'],
            '10-11': ['Политика', 'Экономика', 'Право', 'Социология', 'Духовная сфера'],
            'ege': ['Человек и общество', 'Экономика', 'Социальные отношения', 'Политика', 'Право'],
        }
    },
    'geography': {
        'name': 'География',
        'topics': {
            '5-9': ['План и карта', 'Литосфера', 'Гидросфера', 'Климат', 'География России'],
            '10-11': ['Население мира', 'Мировое хозяйство', 'Регионы мира', 'Природные ресурсы', 'Глобальные проблемы'],
            'ege': ['Карты и координаты', 'Природа Земли', 'Население', 'Хозяйство России', 'Регионы мира'],
        }
    },
    'logic': {
        'name': 'Логика и мышление',
        'topics': {
            '5-9': ['Закономерности', 'Логические задачи', 'Головоломки', 'Истина и ложь', 'Множества'],
            '10-11': ['Логические операции', 'Высказывания', 'Доказательства', 'Критическое мышление', 'Парадоксы'],
            'ege': ['Логические операции', 'Высказывания', 'Аргументация', 'Логические задачи', 'Анализ суждений'],
        }
    },
    'skills': {
        'name': 'Soft Skills и личное развитие',
        'topics': {
            '5-9': ['Коммуникация', 'Работа в команде', 'Тайм-менеджмент', 'Эмоциональный интеллект', 'Публичные выступления'],
            '10-11': ['Лидерство', 'Переговоры', 'Управление временем', 'Критическое мышление', 'Самопрезентация'],
            'ege': ['Коммуникация', 'Эмоциональный интеллект', 'Управление собой', 'Командная работа', 'Презентации'],
        }
    },
    'career': {
        'name': 'Профориентация и карьера',
        'topics': {
            '5-9': ['Мир профессий', 'Твои сильные стороны', 'Профессии будущего', 'Как выбрать путь', 'Образование'],
            '10-11': ['Выбор профессии', 'Построение карьеры', 'Резюме и собеседование', 'Рынок труда', 'Личный бренд'],
            'ege': ['Профессии будущего', 'Карьерный план', 'Резюме', 'Собеседование', 'Развитие навыков'],
        }
    },
    'literature': {
        'name': 'Литература',
        'topics': {
            '5-9': ['Анализ произведения', 'Жанры литературы', 'Образы героев', 'Средства выразительности', 'Сочинение'],
            '10-11': ['Русская классика', 'Анализ поэзии', 'Литературные направления', 'Сочинение-рассуждение', 'Аргументация'],
            'ege': ['Анализ текста', 'Литературные направления', 'Сочинение', 'Поэзия', 'Аргументация'],
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
    """Шаг 1: Диагностический тест СРЕДНЕЙ сложности — реально проверяет понимание."""
    s = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])
    topics = s['topics'].get(grade, list(s['topics'].values())[0])
    topics_str = ', '.join(topics)

    prompt = f"""Ты — опытный школьный методист. Сгенерируй честный ДИАГНОСТИЧЕСКИЙ тест по предмету "{s['name']}" для класса "{grade}".

Цель теста — реально измерить уровень знаний ученика и выявить пробелы.
Темы для покрытия: {topics_str}.

КРИТИЧНО ПО СЛОЖНОСТИ — ВСЕ ВОПРОСЫ СРЕДНЕЙ СЛОЖНОСТИ (уровень 3 по Блуму = применение знаний):
- НЕ слишком лёгкие («что такое дробь?» — нет!)
- НЕ слишком сложные (без хитрых ловушек и олимпиадных задач)
- Каждый вопрос требует ПРИМЕНИТЬ правило/формулу или ПОНЯТЬ концепцию
- Уровень — типичные задачи, которые ученик встречает на контрольной по этой теме в школе
- Реалистичные числа и формулировки, как в обычных учебниках

ВЕРНИ строго JSON:
{{
  "test": [
    {{
      "id": 1,
      "topic": "название темы из списка",
      "level": 3,
      "question": "конкретная задача среднего уровня",
      "options": ["вариант A", "вариант B", "вариант C", "вариант D"],
      "correct": 0,
      "explanation": "разбор: КАК прийти к ответу (2-3 предложения с логикой решения)"
    }},
    ... всего 8 вопросов
  ]
}}

Правила:
- РОВНО 8 вопросов, покрывающих минимум 6 разных тем из списка
- ВСЕ 8 вопросов уровня 3 (среднего, на применение)
- Варианты ответа — правдоподобные, с типичными ошибками учеников в неверных вариантах
- correct — индекс правильного ответа (0-3)
- explanation объясняет ЛОГИКУ решения, а не просто говорит «правильно X»
- Без LaTeX, простой текст. Формулы пиши словами или знаками: x^2 + 2*x - 3 = 0"""

    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=3000, temperature=0.5)
    return data


def action_analyze_results(subject, grade, answers):
    """Шаг 2: Анализ ответов — выявление пробелов и сильных тем"""
    answers_str = json.dumps(answers, ensure_ascii=False)
    subject_name = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])['name']
    prompt = f"""Ты — диагност-педагог. Проанализируй ответы ученика на диагностический тест по "{subject_name}" (уровень {grade}).

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
    """Шаг 3: РЕАЛЬНАЯ персональная программа.
    Каждый модуль = последовательность уроков с теорией, видео, практикой и контрольным тестом.
    Программа реально учит, а не просто список тем."""
    topics_list = ', '.join([t['topic'] if isinstance(t, dict) else t for t in weak_topics])
    subject_name = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])['name']
    prompt = f"""Ты — опытный методист и педагог. Составь РЕАЛЬНУЮ персональную программу обучения по предмету "{subject_name}" для класса {grade}.

Уровень ученика: {level}
Слабые темы (от критичных к лёгким): {topics_list}

КРИТИЧНО ПО КАЧЕСТВУ ПРОГРАММЫ:
Программа должна РЕАЛЬНО научить ученика, а не быть формальным списком. Каждый модуль закрывает конкретный пробел и содержит:
1. Теоретический урок (живое объяснение с примерами)
2. Видео-разбор (короткий ролик 3-5 минут, мы сгенерируем)
3. 3-5 практических задач от простой к сложной
4. Контрольный мини-тест из 5 вопросов
5. Закрепление через интервальное повторение (1, 3, 7 дней)

Методики:
- Mastery Learning: переход к следующему модулю только после 80% правильных ответов
- Scaffolding: от простого к сложному внутри модуля
- Spaced Repetition: ключевые навыки возвращаются в следующих модулях
- Активное обучение: задачи на применение, а не на запоминание

ВЕРНИ строго JSON:
{{
  "program_title": "Понятное название (например: «От пробелов к уверенности: алгебра 9 класса»)",
  "program_description": "2-3 предложения: что ученик реально получит и сможет делать после прохождения",
  "estimated_days": число (реалистичное: 14-45),
  "estimated_hours_total": число часов всего обучения,
  "methodology": "Краткое описание методики простыми словами (3-4 предложения, обращение к ученику на ты)",
  "total_modules": число,
  "modules": [
    {{
      "id": 1,
      "topic": "название темы из слабых",
      "title": "Модуль 1: конкретное название",
      "goal": "Что ученик научится делать после модуля (одно предложение, измеримый результат)",
      "description": "Зачем этот модуль и где знания пригодятся (2 предложения, обращение на ты)",
      "skills": ["конкретный навык 1", "конкретный навык 2", "конкретный навык 3"],
      "lessons": [
        {{
          "id": "1.1",
          "type": "theory",
          "title": "Урок 1: название урока",
          "summary": "Что разбираем: ключевая идея (1 предложение)",
          "estimated_minutes": число (10-20)
        }},
        {{
          "id": "1.2",
          "type": "video",
          "title": "Видео-разбор: название",
          "summary": "Визуальное объяснение темы с примерами",
          "estimated_minutes": число (3-5)
        }},
        {{
          "id": "1.3",
          "type": "practice",
          "title": "Практика: тип задач",
          "summary": "3-5 задач от простой к сложной",
          "estimated_minutes": число (15-30),
          "tasks_count": число (3-5)
        }},
        {{
          "id": "1.4",
          "type": "test",
          "title": "Контрольный тест по модулю",
          "summary": "5 вопросов на закрепление",
          "estimated_minutes": 10,
          "passing_score": 80
        }}
      ],
      "difficulty": "средний",
      "estimated_minutes": сумма по урокам,
      "repeat_after_days": [1, 3, 7],
      "prerequisites": ["что нужно знать до этого модуля"]
    }},
    ... всего 5-7 модулей (по числу слабых тем)
  ],
  "weekly_schedule": {{
    "days_per_week": 5,
    "minutes_per_day": 30,
    "best_time": "вечер после школы (рекомендация)"
  }},
  "milestones": [
    {{"after_module": 2, "achievement": "Что ученик сможет делать на этом этапе"}},
    {{"after_module": 4, "achievement": "Что ученик сможет делать"}}
  ],
  "tips": [
    "конкретный совет 1 (например: записывай разбор каждой задачи)",
    "конкретный совет 2",
    "конкретный совет 3"
  ]
}}

ВАЖНО:
- Темы и названия — конкретные, привязанные к школьной программе РФ для класса {grade}
- Каждый модуль закрывает ОДНУ слабую тему
- lessons[] всегда содержит 4 урока в порядке: theory → video → practice → test
- Никаких общих фраз вроде «изучить математику»
- Текст по-русски, обращение к ученику на «ты»"""

    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=4000, temperature=0.6)
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
- В explanation — обязательно итоговый ответ совпадающий с correct_answer_text
- ЕДИНИЦЫ ИЗМЕРЕНИЯ ПРАВИЛЬНЫЕ: скорость — км/ч или м/с (НЕ "ч", НЕ "км"), время — ч/мин/с, расстояние — км/м, масса — кг/г, деньги — руб. Пример: 120 км / 2 ч = 60 км/ч (НЕ "60 ч"). Единицы во всех options одинаковые и корректные.

🚫 НЕ РАСКРЫВАЙ ОТВЕТ ЗАРАНЕЕ — ученик должен решить САМ:
- "question" — ТОЛЬКО условие и вопрос. БЕЗ готового ответа, без хода решения, без фраз "ответ: ...".
- "context" — пустая строка "" (или нейтральная вводная). НИКОГДА не клади туда ответ или решение.
- "hints": подсказка 1 — общее направление (какую формулу/правило вспомнить), БЕЗ числа ответа. Подсказка 2 — конкретнее, но без финального числа. Только подсказка 3 может почти подвести к ответу. Готовое число ответа — НЕ в подсказках.
- Сам ответ и разбор — ТОЛЬКО в "correct_answer", "correct_answer_text" и "explanation"."""


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


def _build_exclusion_block(shown_questions):
    """Готовит блок промпта со списком уже показанных задач (для исключения повторов)."""
    if not shown_questions:
        return ''
    # берём максимум 25 последних, обрезаем длинные формулировки
    last = [str(q).strip()[:140] for q in shown_questions[-25:] if str(q).strip()]
    if not last:
        return ''
    bullet = '\n'.join(f'— {q}' for q in last)
    return (
        "\n\n🚫 ЗАПРЕЩЕНО ПОВТОРЯТЬ ИЛИ ПЕРЕФРАЗИРОВАТЬ ЭТИ ЗАДАЧИ "
        "(пользователь уже их видел — будет скучно):\n"
        f"{bullet}\n"
        "Сделай ДРУГИЕ задачи: другие числа, другой контекст, другие сюжеты. "
        "Избегай близких по смыслу формулировок."
    )


def _generate_lesson_tasks_only(subject_name, topic, grade, difficulty, shown_questions=None, n=5, seed=None):
    """Генерирует и ВАЛИДИРУЕТ задачи к уроку.

    shown_questions — список текстов задач, которые уже показывались (исключаем повторы).
    seed — случайное число для дополнительного разнообразия в промпте.
    """
    exclusion = _build_exclusion_block(shown_questions)
    variability_hint = ''
    if seed is not None:
        variability_hint = (
            f"\n\n🎲 СИД РАЗНООБРАЗИЯ: {seed}. Используй разные сюжеты (магазин, спорт, кулинария, "
            "путешествия, игры, природа), разные диапазоны чисел, разные постановки вопроса."
        )

    prompt = TASK_GEN_PROMPT_TEMPLATE.format(
        subject_name=subject_name, topic=topic, grade=grade, difficulty=difficulty, n=n
    ) + exclusion + variability_hint

    # temperature повышена до 0.85 для большего разнообразия задач между запросами.
    # timeout=22 без ретраев — чтобы уложиться в лимит Cloud Function (иначе 500 по таймауту).
    data = call_polza([{'role': 'user', 'content': prompt}], max_tokens=2000, temperature=0.85, timeout=22, retries=0)
    raw_tasks = data.get('tasks', []) if isinstance(data, dict) else []

    # нормализуем shown_set для проверки повторов на стороне сервера
    shown_set = set()
    if shown_questions:
        for q in shown_questions:
            norm = re.sub(r'\s+', ' ', str(q).lower()).strip()
            if norm:
                shown_set.add(norm)

    valid_tasks = []
    bad_count = 0
    for t in raw_tasks:
        ok, _reason = _validate_task(t)
        if not ok:
            bad_count += 1
            continue
        q_norm = re.sub(r'\s+', ' ', str(t.get('question', '')).lower()).strip()
        if q_norm in shown_set:
            bad_count += 1
            continue
        valid_tasks.append(t)
        shown_set.add(q_norm)

    # Если задач совсем мало (меньше половины) — ОДИН быстрый добивочный запрос.
    # Короткий timeout без ретраев, чтобы суммарно уложиться в лимит Cloud Function.
    if valid_tasks and len(valid_tasks) < max(2, n // 2):
        need = n - len(valid_tasks)
        try:
            prompt2 = (
                TASK_GEN_PROMPT_TEMPLATE.format(
                    subject_name=subject_name, topic=topic, grade=grade, difficulty=difficulty, n=need
                )
                + exclusion
                + f"\n\nДОПОЛНИТЕЛЬНО: {need} НОВЫХ задач, ОТЛИЧАЮЩИХСЯ от ранее данных. "
                  "Возьми другие числа и другой сюжет!"
            )
            data2 = call_polza([{'role': 'user', 'content': prompt2}], max_tokens=1500, temperature=0.9, timeout=18, retries=0)
            extra = data2.get('tasks', []) if isinstance(data2, dict) else []
            for t in extra:
                if len(valid_tasks) >= n:
                    break
                ok, _ = _validate_task(t)
                if not ok:
                    continue
                q_norm = re.sub(r'\s+', ' ', str(t.get('question', '')).lower()).strip()
                if q_norm in shown_set:
                    continue
                valid_tasks.append(t)
                shown_set.add(q_norm)
        except Exception:
            pass

    return valid_tasks[:n]


def action_generate_lesson(subject, topic, grade, difficulty, lesson_title='', include_tasks=True, shown_questions=None):
    """Урок: теория + примеры. Задачи опционально.

    Теория кэшируется (одинаковая тема даёт одинаковую теорию — это хорошо для скорости),
    но ЗАДАЧИ всегда генерируются свежие — чтобы пользователь не видел повторов.
    """
    cached = get_cached_lesson(subject, topic, grade, difficulty, lesson_title)
    if cached and isinstance(cached, dict):
        cached = dict(cached)  # копия, чтобы не мутировать кэш
        cached['_cached'] = True
        # ВАЖНО: задачи НЕ берём из кэша — всегда свежие
        if include_tasks:
            subject_name = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])['name']
            try:
                cached['tasks'] = _generate_lesson_tasks_only(
                    subject_name, topic, grade, difficulty,
                    shown_questions=shown_questions,
                    seed=random.randint(1000, 9999),
                )
            except Exception:
                cached['tasks'] = []
        else:
            cached['tasks'] = []
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

    # timeout=20 без ретраев — теория генерируется отдельным запросом, надёжно укладывается в лимит функции.
    # При сбое ИИ (таймаут/недоступность) не роняем функцию 500, а возвращаем понятную ошибку — фронт покажет «Попробовать снова».
    try:
        data = call_polza([{'role': 'user', 'content': prompt_main}], max_tokens=2400, temperature=0.7, timeout=20, retries=0)
    except Exception:
        return {'_error': 'Урок готовится дольше обычного. Попробуй ещё раз.'}

    if not isinstance(data, dict):
        data = {}

    # В кэш сохраняем БЕЗ задач — задачи всегда свежие
    cache_payload = {k: v for k, v in data.items() if k != 'tasks'}
    save_lesson_to_cache(subject, topic, grade, difficulty, lesson_title, cache_payload)

    # Задачи опционально (если фронт хочет всё сразу)
    if include_tasks:
        try:
            data['tasks'] = _generate_lesson_tasks_only(
                subject_name, topic, grade, difficulty,
                shown_questions=shown_questions,
                seed=random.randint(1000, 9999),
            )
        except Exception:
            data['tasks'] = []
    else:
        data['tasks'] = []

    data['_cached'] = False
    return data


def action_generate_lesson_tasks(subject, topic, grade, difficulty, shown_questions=None, n=5):
    """Отдельный быстрый запрос — только задачи к уроку.

    shown_questions — список текстов задач, которые уже видел пользователь (исключаем повторы).
    n — сколько задач сгенерировать (по умолчанию 5).
    """
    subject_name = SUBJECT_TOPICS.get(subject, SUBJECT_TOPICS['math'])['name']
    tasks = _generate_lesson_tasks_only(
        subject_name, topic, grade, difficulty,
        shown_questions=shown_questions,
        n=max(1, min(int(n or 5), 8)),
        seed=random.randint(1000, 9999),
    )
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


def action_report_task(body):
    """Сохранить жалобу пользователя на некорректную задачу"""
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        raise Exception('DATABASE_URL не настроен')

    import psycopg2
    subject = str(body.get('subject', ''))[:32]
    topic = str(body.get('topic', ''))[:255]
    grade = str(body.get('grade', ''))[:16]
    lesson_title = str(body.get('lesson_title', ''))[:500]
    task_id = str(body.get('task_id', ''))[:32]
    task_type = str(body.get('task_type', ''))[:32]
    question = str(body.get('question', ''))[:4000]
    options = body.get('options', [])
    correct_answer = str(body.get('correct_answer', ''))[:500]
    user_reason = str(body.get('reason', 'other'))[:64]
    user_comment = str(body.get('comment', ''))[:2000]
    user_answer = str(body.get('user_answer', ''))[:500]

    if not question or not subject:
        raise Exception('question и subject обязательны')

    options_json = json.dumps(options, ensure_ascii=False) if isinstance(options, list) else '[]'

    # экранирование одинарных кавычек для Simple Query Protocol
    def esc(s):
        return s.replace("'", "''")

    sql = (
        "INSERT INTO t_p78828167_tutor_platform_1.task_reports "
        "(subject, topic, grade, lesson_title, task_id, task_type, question, options_json, correct_answer, user_reason, user_comment, user_answer) "
        f"VALUES ('{esc(subject)}', '{esc(topic)}', '{esc(grade)}', '{esc(lesson_title)}', '{esc(task_id)}', '{esc(task_type)}', "
        f"'{esc(question)}', '{esc(options_json)}'::jsonb, '{esc(correct_answer)}', '{esc(user_reason)}', "
        f"'{esc(user_comment)}', '{esc(user_answer)}') RETURNING id;"
    )

    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()
        conn.commit()
        return {'ok': True, 'report_id': row[0] if row else None}
    finally:
        conn.close()


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
            shown_questions = body.get('shown_questions') or []
            if not isinstance(shown_questions, list):
                shown_questions = []
            if not topic:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'topic обязателен'}, ensure_ascii=False),
                }
            try:
                result = action_generate_lesson(subject, topic, grade, difficulty, lesson_title, include_tasks=include_tasks, shown_questions=shown_questions)
            except Exception as e:
                print(f'[learning-path] generate_lesson failed: {str(e)[:200]}')
                return {
                    'statusCode': 503,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Урок готовится дольше обычного. Попробуй ещё раз.'}, ensure_ascii=False),
                }
            if isinstance(result, dict) and result.get('_error'):
                return {
                    'statusCode': 503,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': result['_error']}, ensure_ascii=False),
                }

        elif action == 'generate_lesson_tasks':
            subject = body.get('subject', 'math')
            topic = body.get('topic', '')
            grade = body.get('grade', '5-9')
            difficulty = body.get('difficulty', 'средний')
            shown_questions = body.get('shown_questions') or []
            if not isinstance(shown_questions, list):
                shown_questions = []
            n = body.get('n', 5)
            if not topic:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'topic обязателен'}, ensure_ascii=False),
                }
            try:
                result = action_generate_lesson_tasks(subject, topic, grade, difficulty, shown_questions=shown_questions, n=n)
            except Exception as e:
                print(f'[learning-path] generate_lesson_tasks failed: {str(e)[:200]}')
                result = {'tasks': []}

        elif action == 'subjects':
            result = {
                'subjects': [
                    {'id': k, 'name': v['name'], 'grades': list(v['topics'].keys())}
                    for k, v in SUBJECT_TOPICS.items()
                ]
            }

        elif action == 'report_task':
            try:
                result = action_report_task(body)
            except Exception as e:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)}, ensure_ascii=False),
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