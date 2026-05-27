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


def call_polza(messages, model='openai/gpt-4o-mini', temperature=0.6, max_tokens=6000):
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
        with urllib.request.urlopen(req, timeout=90) as r:
            data = json.loads(r.read().decode('utf-8'))
            raw = data['choices'][0]['message']['content'].strip()
            raw = re.sub(r'^```json\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            return json.loads(raw), None
    except urllib.error.HTTPError as e:
        return None, f'polza HTTP {e.code}'
    except Exception as e:
        return None, f'{type(e).__name__}: {str(e)[:100]}'


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

    target_modules = max(4, min(8, total_lessons // 6))
    lessons_per_module = total_lessons // target_modules

    user_msg = f"""Создай РЕАЛЬНУЮ программу платного курса. Этот курс — продукт, за который ученик платит деньги, программа должна быть конкретной.

КУРС:
- Название: «{course_title}»
- Предмет: {subject}
- Класс/уровень: {grade}
- Всего уроков: {total_lessons}
- Длительность: {duration}
- Формат: {course_format}
- Описание: {description}

ТРЕБОВАНИЯ:
1. Точное количество уроков = {total_lessons}, разбитых на {target_modules} модулей (примерно {lessons_per_module} уроков в каждом)
2. Каждый урок — РЕАЛЬНАЯ тема из школьной программы РФ по этому предмету, а не «Урок 5: продолжение»
3. Темы идут от простого к сложному (scaffolding)
4. Каждый 4-5-й урок — практика или контрольный
5. Финальный модуль — итоговый проект/экзамен
6. Темы должны соответствовать ФГОС для указанного класса
7. Первые 2 урока — preview (бесплатное знакомство)

ВЕРНИ строго JSON:
{{
  "program_description": "2-3 предложения чему реально научится ученик после курса",
  "target_audience": "Для кого курс подойдёт идеально (1-2 предложения)",
  "prerequisites": ["что нужно знать до начала курса"],
  "learning_outcomes": [
    "Сможет решать задачи типа X",
    "Сможет объяснить концепцию Y",
    "Сможет применять метод Z",
    "Будет готов к экзамену/проекту W"
  ],
  "methodology": "Краткое описание методики (Mastery Learning, видеоразборы, практика и т.д.)",
  "final_project": "Описание финального проекта/экзамена курса",
  "estimated_hours": число часов общего обучения,
  "modules": [
    {{
      "module_index": 1,
      "module_title": "Конкретное название модуля",
      "module_description": "Что ученик освоит в этом модуле",
      "lessons": [
        {{
          "lesson_index": 1,
          "title": "Конкретное название урока (тема из учебника)",
          "summary": "Что разбираем в уроке (1 предложение)",
          "type": "theory|video|practice|test|project",
          "estimated_minutes": число (15-45),
          "topics": ["конкретная тема 1", "тема 2"],
          "skills_acquired": ["навык 1", "навык 2"],
          "homework_description": "Описание ДЗ или null"
        }}
      ]
    }}
  ]
}}

ВАЖНО: ровно {total_lessons} уроков суммарно по всем модулям. Темы — РЕАЛЬНЫЕ из учебников РФ. Никаких «Урок N: практика темы»."""

    data, gen_err = call_polza(
        [{'role': 'system', 'content': sys_prompt}, {'role': 'user', 'content': user_msg}],
        model=model, temperature=temp, max_tokens=8000,
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

        cur.execute("""
            INSERT INTO course_curricula
                (course_id, course_title, subject, grade_band, total_lessons, total_modules,
                 estimated_hours, program_description, learning_outcomes, target_audience,
                 prerequisites, methodology, final_project, certificate_available, generated_by, version)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            'curriculum_designer',
            1,
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
    """Пакетная генерация: получает список курсов (course_info[]) и создаёт программы для тех,
    у кого их ещё нет. Возвращает отчёт по каждому."""
    courses = body.get('courses') or []
    force = bool(body.get('force'))
    if not courses or not isinstance(courses, list):
        return err('courses: массив объектов с course_info')

    limit = int(body.get('limit') or 5)
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

        existing, _ = fetch_existing(conn, course_id)
        if existing and not force:
            results.append({
                'course_id': course_id,
                'title': existing['course_title'],
                'skipped': True,
                'reason': 'уже сгенерирована',
                'version': existing['version'],
            })
            continue

        plan, gen_err = generate_curriculum(conn, course_info)
        if not plan:
            results.append({
                'course_id': course_id,
                'title': course_info.get('title'),
                'generated': False,
                'error': gen_err,
            })
            continue

        save_curriculum(conn, course_id, course_info, plan)
        curr, _ = fetch_existing(conn, course_id)
        results.append({
            'course_id': course_id,
            'title': course_info.get('title'),
            'generated': True,
            'total_lessons': curr['total_lessons'] if curr else None,
            'total_modules': curr['total_modules'] if curr else None,
        })

    generated = sum(1 for r in results if r.get('generated'))
    skipped = sum(1 for r in results if r.get('skipped'))
    failed = sum(1 for r in results if r.get('generated') is False)

    return ok({
        'processed': len(results),
        'generated': generated,
        'skipped': skipped,
        'failed': failed,
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
        if action == 'mark_progress':
            return action_mark_progress(conn, body, user_id)
        if action == 'user_progress':
            return action_user_progress(conn, qs, user_id)
        return err(f'Неизвестное действие: {action}. Доступно: get, regenerate, list_lessons, mark_progress, user_progress')
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