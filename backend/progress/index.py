"""
Business: Управление прогрессом ученика — авторизация по нику, сохранение/загрузка маршрутов, история заданий, расписание повторений (Spaced Repetition).
Args: event с httpMethod, body (action и параметры); context с request_id
Returns: HTTP-ответ с JSON
"""
import json
import os
from datetime import date, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor


SCHEMA = 't_p78828167_tutor_platform_1'


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }


def get_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    return psycopg2.connect(dsn)


def escape_str(value):
    """Экранирование строки для SQL (Simple Query Protocol)"""
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def escape_json(value):
    """JSON в SQL"""
    if value is None:
        return 'NULL'
    return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'::jsonb"


def login_or_register(nickname, display_name=None, avatar='🦁'):
    nickname = nickname.strip().lower()
    if not nickname or len(nickname) > 64:
        raise Exception('Ник должен быть от 1 до 64 символов')

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"SELECT * FROM {SCHEMA}.users WHERE nickname = {escape_str(nickname)}")
            user = cur.fetchone()

            if not user:
                dn = display_name or nickname
                cur.execute(
                    f"INSERT INTO {SCHEMA}.users (nickname, display_name, avatar_emoji, last_active_date) "
                    f"VALUES ({escape_str(nickname)}, {escape_str(dn)}, {escape_str(avatar)}, CURRENT_DATE) RETURNING *"
                )
                user = cur.fetchone()
                conn.commit()
            else:
                today = date.today()
                last = user.get('last_active_date')
                new_streak = user['streak_days']
                if last is None:
                    new_streak = 1
                elif last == today:
                    pass
                elif last == today - timedelta(days=1):
                    new_streak = new_streak + 1
                else:
                    new_streak = 1
                cur.execute(
                    f"UPDATE {SCHEMA}.users SET streak_days = {new_streak}, last_active_date = CURRENT_DATE "
                    f"WHERE id = {user['id']} RETURNING *"
                )
                user = cur.fetchone()
                conn.commit()

        return {
            'id': user['id'],
            'nickname': user['nickname'],
            'display_name': user['display_name'],
            'avatar_emoji': user['avatar_emoji'],
            'total_xp': user['total_xp'],
            'streak_days': user['streak_days'],
        }
    finally:
        conn.close()


def get_user_journeys(user_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"SELECT id, subject, grade, level_assessment, initial_score_percent, "
                f"program_data, weak_topics, strong_topics, completed_module_ids, is_complete, "
                f"created_at, updated_at "
                f"FROM {SCHEMA}.journeys WHERE user_id = {int(user_id)} "
                f"ORDER BY updated_at DESC"
            )
            rows = cur.fetchall()
        journeys = []
        for r in rows:
            journeys.append({
                'id': r['id'],
                'subject': r['subject'],
                'grade': r['grade'],
                'level_assessment': r['level_assessment'],
                'initial_score_percent': r['initial_score_percent'],
                'program_data': r['program_data'],
                'weak_topics': r['weak_topics'],
                'strong_topics': r['strong_topics'],
                'completed_module_ids': r['completed_module_ids'] or [],
                'is_complete': r['is_complete'],
                'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                'updated_at': r['updated_at'].isoformat() if r['updated_at'] else None,
            })
        return {'journeys': journeys}
    finally:
        conn.close()


def save_journey(user_id, subject, grade, level_assessment, score_percent,
                 program_data, weak_topics, strong_topics):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.journeys "
                f"(user_id, subject, grade, level_assessment, initial_score_percent, "
                f"program_data, weak_topics, strong_topics) VALUES ("
                f"{int(user_id)}, {escape_str(subject)}, {escape_str(grade)}, "
                f"{escape_str(level_assessment)}, {int(score_percent)}, "
                f"{escape_json(program_data)}, {escape_json(weak_topics)}, {escape_json(strong_topics)}"
                f") RETURNING id"
            )
            journey_id = cur.fetchone()['id']
            conn.commit()
        return {'journey_id': journey_id}
    finally:
        conn.close()


def complete_module(user_id, journey_id, module_id, repeat_after_days, topic):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"SELECT completed_module_ids, program_data FROM {SCHEMA}.journeys "
                f"WHERE id = {int(journey_id)} AND user_id = {int(user_id)}"
            )
            row = cur.fetchone()
            if not row:
                raise Exception('Маршрут не найден')

            completed = row['completed_module_ids'] or []
            if module_id not in completed:
                completed.append(module_id)

            total_modules = len(row['program_data'].get('modules', []))
            is_complete = len(completed) >= total_modules

            completed_at_sql = 'NOW()' if is_complete else 'NULL'
            cur.execute(
                f"UPDATE {SCHEMA}.journeys SET completed_module_ids = {escape_json(completed)}, "
                f"is_complete = {is_complete}, updated_at = NOW(), "
                f"completed_at = {completed_at_sql} "
                f"WHERE id = {int(journey_id)}"
            )

            for days in (repeat_after_days or []):
                review_date = (date.today() + timedelta(days=int(days))).isoformat()
                cur.execute(
                    f"INSERT INTO {SCHEMA}.spaced_repetition "
                    f"(journey_id, user_id, module_id, topic, review_at) VALUES ("
                    f"{int(journey_id)}, {int(user_id)}, {int(module_id)}, "
                    f"{escape_str(topic)}, '{review_date}'::date)"
                )

            conn.commit()
        return {'ok': True, 'completed_module_ids': completed, 'is_complete': is_complete}
    finally:
        conn.close()


def log_task(user_id, journey_id, module_id, topic, question, is_correct, hints_used, xp):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.completed_tasks "
                f"(journey_id, user_id, module_id, topic, task_question, is_correct, hints_used, xp_earned) "
                f"VALUES ({int(journey_id)}, {int(user_id)}, {int(module_id)}, "
                f"{escape_str(topic)}, {escape_str(question)}, {bool(is_correct)}, "
                f"{int(hints_used)}, {int(xp)})"
            )
            if xp > 0:
                cur.execute(
                    f"UPDATE {SCHEMA}.users SET total_xp = total_xp + {int(xp)} "
                    f"WHERE id = {int(user_id)}"
                )
            conn.commit()
        return {'ok': True}
    finally:
        conn.close()


def get_completed_task_titles(user_id, journey_id, module_id=None):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            where = f"journey_id = {int(journey_id)} AND user_id = {int(user_id)}"
            if module_id is not None:
                where += f" AND module_id = {int(module_id)}"
            cur.execute(
                f"SELECT task_question FROM {SCHEMA}.completed_tasks "
                f"WHERE {where} ORDER BY completed_at DESC LIMIT 30"
            )
            rows = cur.fetchall()
        return {'titles': [r[0] for r in rows]}
    finally:
        conn.close()


def get_user_stats(user_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"SELECT * FROM {SCHEMA}.users WHERE id = {int(user_id)}")
            user = cur.fetchone()

            cur.execute(
                f"SELECT COUNT(*) AS total, "
                f"SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct "
                f"FROM {SCHEMA}.completed_tasks WHERE user_id = {int(user_id)}"
            )
            tasks = cur.fetchone()

            cur.execute(
                f"SELECT COUNT(*) AS total, "
                f"SUM(CASE WHEN is_complete THEN 1 ELSE 0 END) AS complete "
                f"FROM {SCHEMA}.journeys WHERE user_id = {int(user_id)}"
            )
            j = cur.fetchone()

            cur.execute(
                f"SELECT module_id, topic, review_at FROM {SCHEMA}.spaced_repetition "
                f"WHERE user_id = {int(user_id)} AND is_completed = FALSE AND review_at <= CURRENT_DATE "
                f"ORDER BY review_at ASC LIMIT 5"
            )
            due = cur.fetchall()

        return {
            'user': {
                'id': user['id'],
                'nickname': user['nickname'],
                'display_name': user['display_name'],
                'avatar_emoji': user['avatar_emoji'],
                'total_xp': user['total_xp'],
                'streak_days': user['streak_days'],
            },
            'tasks_done': int(tasks['total'] or 0),
            'tasks_correct': int(tasks['correct'] or 0),
            'journeys_total': int(j['total'] or 0),
            'journeys_complete': int(j['complete'] or 0),
            'reviews_due': [
                {'module_id': r['module_id'], 'topic': r['topic'], 'review_at': r['review_at'].isoformat()}
                for r in due
            ],
        }
    finally:
        conn.close()


def handler(event, context):
    """Управление прогрессом ученика в БД"""
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

        if action == 'login':
            nick = body.get('nickname', '')
            dn = body.get('display_name')
            avatar = body.get('avatar_emoji', '🦁')
            result = login_or_register(nick, dn, avatar)

        elif action == 'get_journeys':
            result = get_user_journeys(body['user_id'])

        elif action == 'save_journey':
            result = save_journey(
                body['user_id'], body['subject'], body['grade'],
                body.get('level_assessment', 'средний'),
                body.get('initial_score_percent', 0),
                body['program_data'],
                body.get('weak_topics', []),
                body.get('strong_topics', []),
            )

        elif action == 'complete_module':
            result = complete_module(
                body['user_id'], body['journey_id'], body['module_id'],
                body.get('repeat_after_days', []),
                body.get('topic', ''),
            )

        elif action == 'log_task':
            result = log_task(
                body['user_id'], body['journey_id'], body['module_id'],
                body.get('topic', ''), body.get('question', ''),
                body.get('is_correct', False), body.get('hints_used', 0),
                body.get('xp', 0),
            )

        elif action == 'completed_titles':
            result = get_completed_task_titles(
                body['user_id'], body['journey_id'],
                body.get('module_id'),
            )

        elif action == 'stats':
            result = get_user_stats(body['user_id'])

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

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }
