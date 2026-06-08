"""
Business: Прогресс прохождения интерактивных уроков и квизов курса.
 - GET  ?course_id=N  → прогресс пользователя по курсу (пройденные уроки, квизы)
 - POST action=complete_lesson → отметить урок пройденным
 - POST action=save_quiz → сохранить результат квиза модуля (score/total)
Авторизация: заголовок X-Auth-Token (сессия из auth_sessions).
Args: event с httpMethod, headers, queryStringParameters, body; context с request_id
Returns: HTTP-ответ с JSON
"""
import json
import os
from datetime import datetime, timezone
import psycopg2
from psycopg2.extras import RealDictCursor


SCHEMA = 't_p78828167_tutor_platform_1'


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
    }


def get_conn():
    return psycopg2.connect(os.environ.get('DATABASE_URL', ''))


def esc(value):
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def num(value):
    if value is None or value == '':
        return 'NULL'
    try:
        return str(int(value))
    except (TypeError, ValueError):
        return 'NULL'


def respond(status, payload):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(payload, ensure_ascii=False),
    }


def get_token(event):
    headers = event.get('headers') or {}
    return headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''


def get_user_id(cur, token):
    """Возвращает user_id по валидному токену сессии или None."""
    if not token:
        return None
    cur.execute(
        f"SELECT s.user_id, s.expires_at, s.revoked_at "
        f"FROM {SCHEMA}.auth_sessions s WHERE s.token = {esc(token)}"
    )
    row = cur.fetchone()
    if not row:
        return None
    expires_at = row['expires_at']
    if row['revoked_at'] is not None:
        return None
    if expires_at is not None and expires_at < datetime.now(timezone.utc):
        return None
    return row['user_id']


def fetch_progress(cur, user_id, course_id):
    cur.execute(
        f"SELECT lesson_key, lesson_title, module_id, kind, status, score, total "
        f"FROM {SCHEMA}.course_interactive_progress "
        f"WHERE user_id = {num(user_id)} AND course_id = {num(course_id)} "
        f"ORDER BY updated_at DESC"
    )
    rows = cur.fetchall()
    lessons = []
    quizzes = []
    for r in rows:
        item = {
            'lesson_key': r['lesson_key'],
            'lesson_title': r['lesson_title'],
            'module_id': r['module_id'],
            'status': r['status'],
            'score': r['score'],
            'total': r['total'],
        }
        if r['kind'] == 'quiz':
            quizzes.append(item)
        else:
            lessons.append(item)
    return {'course_id': int(course_id), 'lessons': lessons, 'quizzes': quizzes}


def upsert(cur, user_id, course_id, lesson_key, lesson_title, module_id, kind, status, score, total):
    cur.execute(
        f"INSERT INTO {SCHEMA}.course_interactive_progress "
        f"(user_id, course_id, lesson_key, lesson_title, module_id, kind, status, score, total, updated_at) "
        f"VALUES ({num(user_id)}, {num(course_id)}, {esc(lesson_key)}, {esc(lesson_title)}, "
        f"{num(module_id)}, {esc(kind)}, {esc(status)}, {num(score)}, {num(total)}, now()) "
        f"ON CONFLICT (user_id, course_id, lesson_key) DO UPDATE SET "
        f"status = EXCLUDED.status, score = GREATEST(COALESCE({SCHEMA}.course_interactive_progress.score, 0), EXCLUDED.score), "
        f"total = EXCLUDED.total, lesson_title = EXCLUDED.lesson_title, "
        f"module_id = EXCLUDED.module_id, updated_at = now()"
    )


def handler(event, context):
    """Хранит и отдаёт прогресс прохождения интерактивных уроков и квизов курса."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    token = get_token(event)
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            user_id = get_user_id(cur, token)
            if not user_id:
                return respond(401, {'error': 'Не авторизован'})

            if method == 'GET':
                params = event.get('queryStringParameters') or {}
                course_id = params.get('course_id')
                if not course_id:
                    return respond(400, {'error': 'course_id обязателен'})
                data = fetch_progress(cur, user_id, course_id)
                return respond(200, data)

            if method == 'POST':
                body_str = event.get('body', '{}') or '{}'
                body = json.loads(body_str) if isinstance(body_str, str) else body_str
                action = body.get('action', '')
                course_id = body.get('course_id')
                lesson_key = (body.get('lesson_key') or '').strip()[:120]

                if not course_id or not lesson_key:
                    return respond(400, {'error': 'course_id и lesson_key обязательны'})

                lesson_title = (body.get('lesson_title') or '')[:300] or None
                module_id = body.get('module_id')

                if action == 'complete_lesson':
                    upsert(cur, user_id, course_id, lesson_key, lesson_title,
                           module_id, 'lesson', 'completed',
                           body.get('score'), body.get('total'))
                elif action == 'save_quiz':
                    upsert(cur, user_id, course_id, lesson_key, lesson_title,
                           module_id, 'quiz', 'completed',
                           body.get('score'), body.get('total'))
                else:
                    return respond(400, {'error': 'Неизвестное действие'})

                conn.commit()
                data = fetch_progress(cur, user_id, course_id)
                return respond(200, data)

            return respond(405, {'error': 'Метод не поддерживается'})
    finally:
        conn.close()
