"""
Чек-лист «До ЕГЭ»: профиль выпускника (предметы, целевой вуз) и статус задач.

GET  /?action=profile          header: X-Auth-Token            -> профиль + все статусы пунктов
POST /?action=save_profile     body: {exam_year, subjects, target_score, target_university_id, target_faculty_id}
POST /?action=toggle_task      body: {task_id, done, note?}    -> переключить пункт чек-листа
"""
import json
import os
from datetime import datetime, timezone
import psycopg2


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT s.user_id, s.expires_at, s.revoked_at "
        "FROM auth_sessions s WHERE s.token = %s LIMIT 1",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    user_id, expires_at, revoked_at = row
    if revoked_at is not None:
        return None
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    return user_id


def load_profile(cur, user_id: int) -> dict:
    cur.execute(
        "SELECT exam_year, subjects, target_score, target_university_id, target_faculty_id, updated_at "
        "FROM exam_profile WHERE user_id = %s LIMIT 1",
        (user_id,)
    )
    row = cur.fetchone()
    if not row:
        return {
            'exam_year': 2026,
            'subjects': [],
            'target_score': 0,
            'target_university_id': None,
            'target_faculty_id': None,
            'exists': False,
        }
    return {
        'exam_year': row[0],
        'subjects': row[1] or [],
        'target_score': row[2] or 0,
        'target_university_id': row[3],
        'target_faculty_id': row[4],
        'updated_at': row[5].isoformat() if row[5] else None,
        'exists': True,
    }


def load_tasks(cur, user_id: int) -> list:
    cur.execute(
        "SELECT task_id, done, note, completed_at, updated_at "
        "FROM exam_checklist_progress WHERE user_id = %s",
        (user_id,)
    )
    return [
        {
            'task_id': r[0],
            'done': bool(r[1]),
            'note': r[2] or '',
            'completed_at': r[3].isoformat() if r[3] else None,
            'updated_at': r[4].isoformat() if r[4] else None,
        }
        for r in cur.fetchall()
    ]


def handle_profile(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return ok({'authenticated': False, 'profile': None, 'tasks': []})
            profile = load_profile(cur, user_id)
            tasks = load_tasks(cur, user_id)
            return ok({'authenticated': True, 'profile': profile, 'tasks': tasks})
    finally:
        conn.close()


ALLOWED_SUBJECTS = {
    'russian', 'math_prof', 'math_base', 'physics', 'chemistry', 'biology',
    'informatics', 'history', 'social', 'literature', 'geography',
    'english', 'foreign',
}


def handle_save_profile(token: str, body: dict) -> dict:
    exam_year = int(body.get('exam_year') or 2026)
    if exam_year < 2025 or exam_year > 2035:
        return err('Год вне допустимого диапазона', 400)

    raw_subjects = body.get('subjects') or []
    if not isinstance(raw_subjects, list):
        return err('subjects должен быть массивом', 400)
    subjects = [s for s in raw_subjects if isinstance(s, str) and s in ALLOWED_SUBJECTS][:6]

    target_score = int(body.get('target_score') or 0)
    if target_score < 0 or target_score > 500:
        target_score = 0

    target_university_id = body.get('target_university_id') or None
    target_faculty_id = body.get('target_faculty_id') or None
    if target_university_id and not isinstance(target_university_id, str):
        target_university_id = None
    if target_faculty_id and not isinstance(target_faculty_id, str):
        target_faculty_id = None
    if target_university_id:
        target_university_id = target_university_id[:60]
    if target_faculty_id:
        target_faculty_id = target_faculty_id[:60]

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            cur.execute(
                """
                INSERT INTO exam_profile (user_id, exam_year, subjects, target_score,
                    target_university_id, target_faculty_id, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    exam_year = EXCLUDED.exam_year,
                    subjects = EXCLUDED.subjects,
                    target_score = EXCLUDED.target_score,
                    target_university_id = EXCLUDED.target_university_id,
                    target_faculty_id = EXCLUDED.target_faculty_id,
                    updated_at = NOW()
                """,
                (user_id, exam_year, json.dumps(subjects), target_score,
                 target_university_id, target_faculty_id)
            )
            conn.commit()
            return ok({'saved': True, 'profile': load_profile(cur, user_id)})
    finally:
        conn.close()


def handle_toggle_task(token: str, body: dict) -> dict:
    task_id = (body.get('task_id') or '').strip()[:80]
    if not task_id:
        return err('task_id обязателен', 400)
    done = bool(body.get('done'))
    note = (body.get('note') or '').strip()[:500] or None

    conn = get_db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return err('Требуется вход', 401)

            cur.execute(
                """
                INSERT INTO exam_checklist_progress (user_id, task_id, done, note,
                    completed_at, updated_at)
                VALUES (%s, %s, %s, %s, CASE WHEN %s THEN NOW() ELSE NULL END, NOW())
                ON CONFLICT (user_id, task_id) DO UPDATE SET
                    done = EXCLUDED.done,
                    note = EXCLUDED.note,
                    completed_at = CASE WHEN EXCLUDED.done THEN NOW() ELSE NULL END,
                    updated_at = NOW()
                """,
                (user_id, task_id, done, note, done)
            )
            conn.commit()
            return ok({'saved': True, 'task_id': task_id, 'done': done})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Чек-лист «До ЕГЭ»: профиль и статус задач."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'profile').strip()

    headers = event.get('headers') or {}
    token = (
        headers.get('X-Auth-Token')
        or headers.get('x-auth-token')
        or ''
    ).strip()

    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    if action == 'profile':
        return handle_profile(token)
    if action == 'save_profile' and method == 'POST':
        return handle_save_profile(token, body)
    if action == 'toggle_task' and method == 'POST':
        return handle_toggle_task(token, body)

    return err('Неизвестное действие', 404)
