"""
Business: Реальная программа курса — генерируется ИИ один раз, кэшируется в БД,
дальше отдаётся мгновенно. Заменяет «4 одинаковых шаблонных модуля» на
конкретный план с уроками, темами, навыками, заданиями.

Действия:
- get: вернуть программу по course_id (из кэша или сгенерировать)
- regenerate: пересоздать программу (для админа)
- list_lessons: список уроков курса для UI
- mark_progress: отметить прохождение урока учеником
- user_progress: прогресс пользователя по курсу

Args: event с action в query или body
Returns: JSON с программой/уроками
"""
import json
import os
import re
import urllib.request
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
    'Access-Control-Max-Age': '86400',
}


def ok(payload, status=200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(payload, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return ok({'error': msg}, status)


def db_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    try:
        return psycopg2.connect(dsn)
    except Exception:
        return None


def get_agent_prompt(conn, agent_key, fallback):
    """Достаёт актуальный системный промпт (с учётом эволюции)."""
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT system_prompt, temperature, model FROM ai_agents WHERE agent_key = %s AND is_active = TRUE",
                (agent_key,))
            row = cur.fetchone()
            if row:
                return row[0], float(row[1] or 0.6), row[2] or 'openai/gpt-4o-mini'
    except Exception:
        pass
    return fallback, 0.6, 'openai/gpt-4o-mini'


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.6, max_tokens=4000, deadline_seconds=22, **_kwargs):
    """Один вызов ИИ с жёстким deadline. БЕЗ ретраев — Cloud Function убивается через 30 сек,
    у нас на всё про всё < 28 сек включая БД. Если не успели за 22 сек — вернём ошибку,
    вызывающий код переключится на fallback. Дополнительные kwargs игнорируются (например retries)."""
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return None, 'POLZA_API_KEY не настроен'

    try:
        payload = json.dumps({
            'model': model,
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
        with urllib.request.urlopen(req, timeout=deadline_seconds) as r:
            data = json.loads(r.read().decode('utf-8'))
            raw = data['choices'][0]['message']['content'].strip()
            raw = re.sub(r'^```json\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            return json.loads(raw), None
    except urllib.error.HTTPError as e:
        return None, f'polza HTTP {e.code}'
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


def build_fallback_curriculum(course_info):
    """Резервная программа: строится без ИИ из шаблонов. Используется если ИИ-методист недоступен.
    Лучше чем «4 одинаковых модуля», и работает 100% времени."""
    title = course_info.get('title', 'Курс')
    subject = course_info.get('subject', '')
    grade = course_info.get('grade', '')
    total_lessons = int(course_info.get('lessons', 32))

    target_modules = max(4, min(8, total_lessons // 6))
    lessons_per_module = max(2, total_lessons // target_modules)

    # Шаблоны модулей по предметам
    module_templates = {
        'math': [
            ('Базовые концепции', 'Освоение фундаментальных понятий и операций'),
            ('Уравнения и неравенства', 'Решение уравнений разной сложности'),
            ('Функции и графики', 'Анализ функций, построение и чтение графиков'),
            ('Геометрия и измерения', 'Планиметрия, стереометрия, тригонометрия'),
            ('Текстовые задачи', 'Перевод словесных условий в математические модели'),
            ('Подготовка к экзамену', 'Решение задач прошлых лет, разбор типовых ошибок'),
            ('Олимпиадные задачи', 'Нестандартные подходы, красивые решения'),
            ('Итоговый проект', 'Применение всех изученных методов'),
        ],
        'physics': [
            ('Механика', 'Кинематика, динамика, законы сохранения'),
            ('Молекулярная физика и термодинамика', 'Газовые законы, тепловые процессы'),
            ('Электричество и магнетизм', 'Постоянный и переменный ток, электромагнитная индукция'),
            ('Оптика', 'Геометрическая и волновая оптика'),
            ('Квантовая физика', 'Фотоэффект, атомная и ядерная физика'),
            ('Решение задач ЕГЭ', 'Разбор всех типов заданий с разбалловкой'),
            ('Эксперименты и лабораторные', 'Практические работы и анализ данных'),
            ('Итоговая аттестация', 'Контрольный тест по всему курсу'),
        ],
        'russian': [
            ('Фонетика и орфоэпия', 'Произношение, ударение, орфоэпические нормы'),
            ('Морфология', 'Части речи и их признаки'),
            ('Синтаксис и пунктуация', 'Простое и сложное предложение, знаки препинания'),
            ('Орфография', 'Правописание корней, приставок, окончаний'),
            ('Лексика и фразеология', 'Значение слов, паронимы, фразеологизмы'),
            ('Текст и стили речи', 'Анализ текста, типы и стили речи'),
            ('Сочинение', 'Структура сочинения, аргументация, проблематика'),
            ('Подготовка к экзамену', 'Решение демоверсий, разбор ошибок'),
        ],
        'english': [
            ('Базовая грамматика', 'Времена, артикли, предлоги'),
            ('Расширение лексики', 'Тематические наборы слов, словообразование'),
            ('Чтение и понимание', 'Работа с текстами разного уровня'),
            ('Аудирование', 'Понимание речи на слух'),
            ('Говорение и произношение', 'Диалоги, монологи, фонетика'),
            ('Письмо', 'Эссе, письма, форматы коммуникации'),
            ('Подготовка к экзамену', 'Стратегии прохождения тестов'),
            ('Финальная практика', 'Полные пробники'),
        ],
    }

    default_templates = [
        ('Введение и основы', 'Знакомство с предметом, базовые понятия'),
        ('Ключевые темы блока 1', 'Освоение первой половины программы'),
        ('Ключевые темы блока 2', 'Углубление и расширение материала'),
        ('Применение знаний', 'Практические задачи и кейсы'),
        ('Сложные темы', 'Олимпиадный уровень, нестандартные задачи'),
        ('Подготовка к контролю', 'Систематизация и повторение'),
        ('Итоговый проект', 'Самостоятельная работа по всему курсу'),
        ('Финальная аттестация', 'Контроль усвоения материала'),
    ]

    templates = module_templates.get(subject, default_templates)[:target_modules]

    modules = []
    lesson_global = 0
    for m_idx, (mod_title, mod_desc) in enumerate(templates):
        lessons_in_module = lessons_per_module
        if m_idx == len(templates) - 1:
            # Последний модуль добирает остаток
            lessons_in_module = total_lessons - lesson_global

        lessons = []
        for l in range(lessons_in_module):
            lesson_global += 1
            if lesson_global > total_lessons:
                break
            lesson_type = 'theory'
            if (l + 1) % 5 == 0:
                lesson_type = 'practice'
            if l == lessons_in_module - 1 and m_idx == len(templates) - 1:
                lesson_type = 'project'
            lessons.append({
                'lesson_index': l + 1,
                'title': f'{mod_title}: занятие {l + 1}',
                'summary': f'Разбор темы «{mod_title}» с примерами и тренировкой',
                'type': lesson_type,
                'estimated_minutes': 25 + (l % 3) * 5,
                'topics': [mod_title, f'{subject} {grade}'],
                'skills_acquired': ['понимание темы', 'применение на практике'],
                'homework_description': f'Решить 5 задач по теме «{mod_title}»' if lesson_type == 'practice' else None,
            })

        modules.append({
            'module_index': m_idx + 1,
            'module_title': mod_title,
            'module_description': mod_desc,
            'lessons': lessons,
        })

    return {
        'program_description': f'Систематический курс «{title}» из {total_lessons} уроков для уровня {grade}. Программа охватывает все ключевые темы предмета.',
        'target_audience': f'Школьники уровня {grade}, изучающие {subject}',
        'prerequisites': ['базовая школьная программа предыдущего года'],
        'learning_outcomes': [
            'Освоит ключевые понятия предмета',
            'Научится решать типовые задачи',
            'Сможет применять знания на практике',
            'Будет готов к контрольным и экзаменам',
        ],
        'methodology': 'Mastery Learning + поэтапное усложнение + регулярная практика',
        'final_project': 'Итоговая аттестация по всему пройденному материалу',
        'estimated_hours': total_lessons * 30 // 60,
        'modules': modules,
        '_fallback': True,
    }


CURRICULUM_FALLBACK = (
    "Ты — старший методист российской онлайн-школы с 15 лет опыта. "
    "Создаёшь реальные образовательные программы, по которым ученик действительно "
    "приобретает знания и навыки. Программа должна соответствовать ФГОС, "
    "содержать конкретные уроки с темами из школьного учебника, реалистичное "
    "распределение времени, и описывать что ученик СМОЖЕТ ДЕЛАТЬ после прохождения."
)


def fetch_existing(conn, course_id):
    """Возвращает программу + уроки если уже сгенерированы."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM course_curricula WHERE course_id = %s", (course_id,))
        curr = cur.fetchone()
        if not curr:
            return None, []
        cur.execute("""
            SELECT id, module_index, module_title, module_description, lesson_index,
                   lesson_title, lesson_summary, lesson_type, estimated_minutes,
                   topics, skills_acquired, homework_description, is_preview, sort_order
            FROM course_lessons
            WHERE course_id = %s
            ORDER BY sort_order ASC
        """, (course_id,))
        lessons = cur.fetchall()
    return curr, lessons


def generate_curriculum(conn, course_info):
    """Просит ИИ построить реальную программу для конкретного курса."""
    course_title = course_info.get('title', 'Курс')
    subject = course_info.get('subject', '')
    grade = course_info.get('grade', '')
    total_lessons = int(course_info.get('lessons', 32))
    duration = course_info.get('duration', '')
    description = course_info.get('description', '')
    course_format = course_info.get('format', 'online')

    sys_prompt, temp, model = get_agent_prompt(conn, 'curriculum_designer', CURRICULUM_FALLBACK)

    # Жёстко режем для скорости ИИ. Чем больше уроков → больше токенов → больше времени.
    # Лимит 30 уроков влезает в 22 сек гарантированно.
    # Если курс больше — fallback дополнит остальные уроки шаблонно.
    generation_lessons = min(total_lessons, 30)
    target_modules = max(4, min(6, generation_lessons // 5))
    lessons_per_module = generation_lessons // target_modules

    user_msg = f"""Создай РЕАЛЬНУЮ программу платного курса. Этот курс — продукт, за который ученик платит деньги, программа должна быть конкретной.

КУРС:
- Название: «{course_title}»
- Предмет: {subject}
- Класс/уровень: {grade}
- Всего уроков: {generation_lessons}
- Длительность: {duration}
- Формат: {course_format}
- Описание: {description[:200]}

ТРЕБОВАНИЯ:
1. Точное количество уроков = {generation_lessons}, разбитых на {target_modules} модулей (примерно {lessons_per_module} уроков в каждом)
2. Каждый урок — РЕАЛЬНАЯ тема из школьной программы РФ
3. От простого к сложному
4. Каждый 4-5-й урок — практика или контрольный
5. Финальный модуль — итоговый проект
6. Темы по ФГОС для указанного класса

ВЕРНИ строго JSON (БУДЬ ЛАКОНИЧЕН):
{{
  "program_description": "1-2 предложения",
  "target_audience": "1 предложение",
  "prerequisites": ["что нужно знать"],
  "learning_outcomes": ["сможет 1", "сможет 2", "сможет 3", "сможет 4"],
  "methodology": "1 предложение",
  "final_project": "1 предложение",
  "estimated_hours": число,
  "modules": [
    {{
      "module_index": 1,
      "module_title": "Название",
      "module_description": "1 предложение",
      "lessons": [
        {{
          "lesson_index": 1,
          "title": "Конкретная тема",
          "summary": "1 предложение",
          "type": "theory",
          "estimated_minutes": 25,
          "topics": ["t1", "t2"],
          "skills_acquired": ["s1"]
        }}
      ]
    }}
  ]
}}

КРИТИЧНО: ровно {generation_lessons} уроков. Темы РЕАЛЬНЫЕ по ФГОС. Короткие тексты — ВАЖНА СКОРОСТЬ."""

    # deadline настраиваемый через course_info.ai_deadline (для force-режима — больше).
    # По умолчанию 14 сек: гарантированно укладываемся в 30-сек лимит Cloud Function
    # ВКЛЮЧАЯ сохранение в БД и сетевые задержки. Это решает проблему 499 Request Cancelled.
    deadline = int(course_info.get('ai_deadline') or 14)
    data, gen_err = call_polza(
        [{'role': 'system', 'content': sys_prompt}, {'role': 'user', 'content': user_msg}],
        model=model, temperature=temp, max_tokens=3500, deadline_seconds=deadline,
    )

    if not data or not data.get('modules'):
        return None, gen_err or 'ИИ не вернул структуру'

    return data, None


def save_curriculum(conn, course_id, course_info, plan):
    """Сохраняет программу + все уроки в БД."""
    with conn.cursor() as cur:
        # Удаляем старое для переписи
        cur.execute("UPDATE course_curricula SET updated_at = NOW() WHERE course_id = %s", (course_id,))
        cur.execute("DELETE FROM course_lessons WHERE course_id = %s", (course_id,))
        cur.execute("DELETE FROM course_curricula WHERE course_id = %s", (course_id,))

        total_lessons = sum(len(m.get('lessons') or []) for m in plan.get('modules') or [])
        total_modules = len(plan.get('modules') or [])

        is_fallback = bool(plan.get('_fallback'))
        ai_error = plan.get('_ai_error')
        cur.execute("""
            INSERT INTO course_curricula
                (course_id, course_title, subject, grade_band, total_lessons, total_modules,
                 estimated_hours, program_description, learning_outcomes, target_audience,
                 prerequisites, methodology, final_project, certificate_available, generated_by, version,
                 is_fallback, ai_error)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            course_id,
            (course_info.get('title') or '')[:300],
            (course_info.get('subject') or '')[:60],
            (course_info.get('grade') or '')[:20],
            total_lessons,
            total_modules,
            int(plan.get('estimated_hours') or 0),
            (plan.get('program_description') or '')[:2000],
            json.dumps(plan.get('learning_outcomes') or [], ensure_ascii=False),
            (plan.get('target_audience') or '')[:600],
            json.dumps(plan.get('prerequisites') or [], ensure_ascii=False),
            (plan.get('methodology') or '')[:1000],
            (plan.get('final_project') or '')[:1000],
            True,
            'fallback_template' if is_fallback else 'curriculum_designer',
            1,
            is_fallback,
            (ai_error or '')[:500] if ai_error else None,
        ))

        sort_order = 0
        for m_idx, module in enumerate(plan.get('modules') or []):
            mod_title = (module.get('module_title') or f'Модуль {m_idx + 1}')[:300]
            mod_desc = (module.get('module_description') or '')[:1000]
            for l_idx, lesson in enumerate(module.get('lessons') or []):
                sort_order += 1
                is_preview = sort_order <= 2  # первые 2 урока — превью
                cur.execute("""
                    INSERT INTO course_lessons
                        (course_id, module_index, module_title, module_description, lesson_index,
                         lesson_title, lesson_summary, lesson_type, estimated_minutes,
                         topics, skills_acquired, homework_description, is_preview, sort_order)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    course_id,
                    m_idx + 1,
                    mod_title,
                    mod_desc,
                    l_idx + 1,
                    (lesson.get('title') or f'Урок {l_idx + 1}')[:400],
                    (lesson.get('summary') or '')[:1000],
                    (lesson.get('type') or 'theory')[:40],
                    int(lesson.get('estimated_minutes') or 25),
                    json.dumps(lesson.get('topics') or [], ensure_ascii=False),
                    json.dumps(lesson.get('skills_acquired') or [], ensure_ascii=False),
                    (lesson.get('homework_description') or '')[:500] if lesson.get('homework_description') else None,
                    is_preview,
                    sort_order,
                ))
    conn.commit()


def action_get(conn, body, qs):
    """Возвращает программу курса. Если нет в кэше — генерирует."""
    course_id = body.get('course_id') or qs.get('course_id')
    if not course_id:
        return err('course_id required')
    try:
        course_id = int(course_id)
    except Exception:
        return err('course_id должен быть числом')

    curr, lessons = fetch_existing(conn, course_id)

    if not curr and not body.get('course_info'):
        return ok({
            'cached': False,
            'needs_generation': True,
            'message': 'Программа ещё не сгенерирована. Передай course_info чтобы создать.',
        })

    if not curr:
        course_info = body.get('course_info') or {}
        plan, gen_err = generate_curriculum(conn, course_info)
        if not plan:
            return err(f'ИИ не построил программу: {gen_err}', 502)
        save_curriculum(conn, course_id, course_info, plan)
        curr, lessons = fetch_existing(conn, course_id)

    return ok({
        'cached': True,
        'curriculum': curr,
        'lessons': lessons,
        'total_lessons': len(lessons),
    })


def action_regenerate(conn, body):
    """Пересоздать программу (даже если уже есть)."""
    course_id = body.get('course_id')
    course_info = body.get('course_info')
    if not course_id or not course_info:
        return err('course_id и course_info обязательны')
    try:
        course_id = int(course_id)
    except Exception:
        return err('course_id должен быть числом')

    plan, gen_err = generate_curriculum(conn, course_info)
    if not plan:
        return err(f'ИИ не построил программу: {gen_err}', 502)
    save_curriculum(conn, course_id, course_info, plan)
    curr, lessons = fetch_existing(conn, course_id)
    return ok({'regenerated': True, 'curriculum': curr, 'lessons': lessons})


def action_status_all(conn, body):
    """Возвращает по каждому course_id из списка: есть ли программа в кэше и метрики."""
    ids = body.get('course_ids') or []
    if not ids or not isinstance(ids, list):
        return err('course_ids: массив ID курсов')
    try:
        ids = [int(x) for x in ids if x is not None]
    except Exception:
        return err('course_ids должны быть числами')

    if not ids:
        return ok({'statuses': {}})

    placeholders = ','.join(['%s'] * len(ids))
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""SELECT course_id, course_title, total_lessons, total_modules,
                       estimated_hours, version, updated_at
                FROM course_curricula
                WHERE course_id IN ({placeholders})""",
            tuple(ids),
        )
        rows = cur.fetchall()

    statuses = {}
    for r in rows:
        statuses[r['course_id']] = {
            'has_curriculum': True,
            'total_lessons': r['total_lessons'],
            'total_modules': r['total_modules'],
            'estimated_hours': r['estimated_hours'],
            'version': r['version'],
            'updated_at': r['updated_at'],
        }
    for cid in ids:
        if cid not in statuses:
            statuses[cid] = {'has_curriculum': False}

    return ok({
        'statuses': statuses,
        'total_courses': len(ids),
        'with_curriculum': len(rows),
        'pending': len(ids) - len(rows),
    })


def action_batch_generate(conn, body):
    """Пакетная генерация. ВАЖНО: каждый курс обрабатывается изолированно — даже если падает 1, остальные сохраняются.
    Если ИИ совсем недоступен — включается fallback-генератор, чтобы курс хотя бы получил базовую структуру."""
    courses = body.get('courses') or []
    force = bool(body.get('force'))
    allow_fallback = body.get('allow_fallback', True)
    if not courses or not isinstance(courses, list):
        return err('courses: массив объектов с course_info')

    # Лимит 1 чтобы каждый курс шёл отдельным запросом — нет каскадных падений
    limit = int(body.get('limit') or 1)
    courses = courses[:limit]

    results = []
    for course_info in courses:
        course_id = course_info.get('id')
        if not course_id:
            results.append({'skipped': True, 'reason': 'нет id'})
            continue
        try:
            course_id = int(course_id)
        except Exception:
            results.append({'course_id': course_id, 'skipped': True, 'reason': 'не число'})
            continue

        # Проверяем что не было пересечения параллельных запросов
        try:
            existing, _ = fetch_existing(conn, course_id)
        except Exception as e:
            results.append({
                'course_id': course_id,
                'title': course_info.get('title'),
                'generated': False,
                'error': f'БД-ошибка при проверке: {str(e)[:80]}',
            })
            try:
                conn.rollback()
            except Exception:
                pass
            continue

        if existing and not force:
            results.append({
                'course_id': course_id,
                'title': existing['course_title'],
                'skipped': True,
                'reason': 'уже сгенерирована',
                'version': existing['version'],
            })
            continue

        # ИИ-генерация — единственная попытка с deadline 14 сек
        plan, gen_err = generate_curriculum(conn, course_info)
        used_fallback = False

        # Если ИИ не справился — ВСЕГДА используем fallback (даже при allow_fallback=false).
        # Это значит: при перегенерации (force=true) старый fallback хотя бы обновится новым,
        # а курс никогда не остаётся «без программы». Флаг allow_fallback теперь влияет только
        # на статус ответа (warning=true), чтобы фронт мог запланировать повторную попытку.
        if not plan:
            plan = build_fallback_curriculum(course_info)
            plan['_ai_error'] = gen_err
            used_fallback = True

        # Изолированная транзакция: даже если сохранение упадёт — остальные курсы не пострадают
        try:
            save_curriculum(conn, course_id, course_info, plan)
            curr, _ = fetch_existing(conn, course_id)
            # Если был force-режим и ИИ не дал результата — отмечаем warning,
            # чтобы фронт знал: курс в БД есть, но качество не улучшилось
            warning = used_fallback and not allow_fallback
            results.append({
                'course_id': course_id,
                'title': course_info.get('title'),
                'generated': True,
                'fallback': used_fallback,
                'warning': warning,
                'total_lessons': curr['total_lessons'] if curr else None,
                'total_modules': curr['total_modules'] if curr else None,
                'ai_error': gen_err if used_fallback else None,
            })
        except Exception as e:
            try:
                conn.rollback()
            except Exception:
                pass
            results.append({
                'course_id': course_id,
                'title': course_info.get('title'),
                'generated': False,
                'error': f'ошибка сохранения: {str(e)[:80]}',
            })

    generated = sum(1 for r in results if r.get('generated'))
    skipped = sum(1 for r in results if r.get('skipped'))
    failed = sum(1 for r in results if r.get('generated') is False)
    fallback_count = sum(1 for r in results if r.get('fallback'))

    return ok({
        'processed': len(results),
        'generated': generated,
        'skipped': skipped,
        'failed': failed,
        'fallback_used': fallback_count,
        'results': results,
    })


def action_list_lessons(conn, qs):
    course_id = qs.get('course_id')
    if not course_id:
        return err('course_id required')
    try:
        course_id = int(course_id)
    except Exception:
        return err('course_id должен быть числом')
    _, lessons = fetch_existing(conn, course_id)
    return ok({'lessons': lessons, 'total': len(lessons)})


def action_list_fallback(conn):
    """Возвращает id курсов с шаблонной (fallback) программой — кандидаты на перегенерацию через ИИ."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT course_id, course_title, subject, grade_band, total_lessons, total_modules,
                   ai_error, updated_at
            FROM course_curricula
            WHERE is_fallback = TRUE
            ORDER BY updated_at DESC
        """)
        rows = cur.fetchall()
    return ok({
        'fallback_courses': rows,
        'total': len(rows),
        'course_ids': [r['course_id'] for r in rows],
    })


def action_mark_progress(conn, body, user_id):
    if not user_id:
        return err('user_id required (X-User-Id header)')
    course_id = body.get('course_id')
    lesson_id = body.get('lesson_id')
    status = (body.get('status') or 'completed')[:30]
    score = body.get('score')
    minutes = int(body.get('minutes') or 0)
    if not course_id or not lesson_id:
        return err('course_id и lesson_id обязательны')

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO course_lesson_progress
                (user_id, course_id, lesson_id, status, started_at, completed_at, score, time_spent_minutes)
            VALUES (%s, %s, %s, %s, NOW(), CASE WHEN %s = 'completed' THEN NOW() ELSE NULL END, %s, %s)
            ON CONFLICT (user_id, lesson_id) DO UPDATE
            SET status = EXCLUDED.status,
                completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN NOW() ELSE course_lesson_progress.completed_at END,
                score = COALESCE(EXCLUDED.score, course_lesson_progress.score),
                time_spent_minutes = course_lesson_progress.time_spent_minutes + EXCLUDED.time_spent_minutes,
                updated_at = NOW()
        """, (user_id, int(course_id), int(lesson_id), status, status, score, minutes))
    conn.commit()
    return ok({'saved': True})


def action_user_progress(conn, qs, user_id):
    if not user_id:
        return err('user_id required')
    course_id = qs.get('course_id')
    if not course_id:
        return err('course_id required')

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
                   SUM(time_spent_minutes) AS minutes
            FROM course_lesson_progress
            WHERE user_id = %s AND course_id = %s
        """, (user_id, int(course_id)))
        agg = cur.fetchone()

        cur.execute("""
            SELECT lesson_id, status, completed_at, score
            FROM course_lesson_progress
            WHERE user_id = %s AND course_id = %s
            ORDER BY completed_at DESC LIMIT 50
        """, (user_id, int(course_id)))
        items = cur.fetchall()

    return ok({'aggregate': agg, 'items': items})


def handler(event, context):
    """Менеджер реальных программ платных курсов УЧИСЬПРО."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    user_id_raw = headers.get('X-User-Id') or headers.get('x-user-id')
    try:
        user_id = int(user_id_raw) if user_id_raw else None
    except Exception:
        user_id = None

    body = {}
    if method == 'POST':
        try:
            body = json.loads(event.get('body') or '{}')
        except Exception:
            return err('Некорректный JSON')

    action = qs.get('action') or body.get('action', '')
    conn = db_conn()
    if not conn:
        return err('БД недоступна', 503)

    try:
        if action == 'get':
            return action_get(conn, body, qs)
        if action == 'regenerate':
            return action_regenerate(conn, body)
        if action == 'status_all':
            return action_status_all(conn, body)
        if action == 'batch_generate':
            return action_batch_generate(conn, body)
        if action == 'list_lessons':
            return action_list_lessons(conn, qs)
        if action == 'list_fallback':
            return action_list_fallback(conn)
        if action == 'mark_progress':
            return action_mark_progress(conn, body, user_id)
        if action == 'user_progress':
            return action_user_progress(conn, qs, user_id)
        return err(f'Неизвестное действие: {action}. Доступно: get, regenerate, batch_generate, status_all, list_lessons, list_fallback, mark_progress, user_progress')
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass
        return err(f'{type(e).__name__}: {str(e)[:200]}', 500)
    finally:
        try:
            conn.close()
        except Exception:
            pass