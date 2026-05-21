"""
Business: Хранение пользовательских данных — избранные курсы, история просмотров, мои курсы (с прогрессом), бейджи, ежедневная активность для календаря и графиков.
Args: event с httpMethod, body (action, user_uid, ...); context с request_id
Returns: HTTP-ответ с JSON в зависимости от action
"""
import json
import os
import psycopg2
from datetime import date, datetime, timedelta


SCHEMA = 't_p78828167_tutor_platform_1'


def esc(s: str) -> str:
    return str(s).replace("'", "''")


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Uid',
        'Access-Control-Max-Age': '86400',
    }


def get_conn():
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        raise Exception('DATABASE_URL не настроен')
    return psycopg2.connect(dsn)


# ───── Избранное ─────
def toggle_favorite(uid: str, course_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id FROM {SCHEMA}.user_favorites WHERE user_uid = '{esc(uid)}' AND course_id = {int(course_id)}"
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    f"DELETE FROM {SCHEMA}.user_favorites WHERE user_uid = '{esc(uid)}' AND course_id = {int(course_id)}"
                )
                conn.commit()
                return {'favorited': False}
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.user_favorites (user_uid, course_id) VALUES ('{esc(uid)}', {int(course_id)})"
                )
                conn.commit()
                return {'favorited': True}
    finally:
        conn.close()


def list_favorites(uid: str):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT course_id FROM {SCHEMA}.user_favorites WHERE user_uid = '{esc(uid)}' ORDER BY created_at DESC"
            )
            ids = [r[0] for r in cur.fetchall()]
        return {'course_ids': ids}
    finally:
        conn.close()


# ───── История просмотров ─────
def track_view(uid: str, course_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.user_course_history (user_uid, course_id) "
                f"VALUES ('{esc(uid)}', {int(course_id)}) "
                f"ON CONFLICT (user_uid, course_id) DO UPDATE SET viewed_at = NOW()"
            )
            conn.commit()
        return {'ok': True}
    finally:
        conn.close()


def list_history(uid: str, limit: int = 20):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT course_id, viewed_at FROM {SCHEMA}.user_course_history "
                f"WHERE user_uid = '{esc(uid)}' ORDER BY viewed_at DESC LIMIT {int(limit)}"
            )
            rows = [{'course_id': r[0], 'viewed_at': r[1].isoformat() if r[1] else None} for r in cur.fetchall()]
        return {'history': rows}
    finally:
        conn.close()


# ───── Мои курсы ─────
def start_course(uid: str, course_id: int, subject: str, grade: str, course_title: str):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.user_my_courses "
                f"(user_uid, course_id, subject, grade, course_title) "
                f"VALUES ('{esc(uid)}', {int(course_id)}, '{esc(subject)}', '{esc(grade)}', '{esc(course_title)}') "
                f"ON CONFLICT (user_uid, course_id) DO UPDATE SET last_activity_at = NOW(), status = 'active'"
            )
            conn.commit()
        return {'ok': True}
    finally:
        conn.close()


def update_progress(uid: str, course_id: int, progress: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            p = max(0, min(100, int(progress)))
            status_sql = "'completed'" if p >= 100 else "'active'"
            completed_sql = "NOW()" if p >= 100 else "NULL"
            cur.execute(
                f"UPDATE {SCHEMA}.user_my_courses SET progress_percent = {p}, "
                f"status = {status_sql}, last_activity_at = NOW(), "
                f"completed_at = COALESCE(completed_at, {completed_sql}) "
                f"WHERE user_uid = '{esc(uid)}' AND course_id = {int(course_id)}"
            )
            conn.commit()
        return {'ok': True}
    finally:
        conn.close()


def list_my_courses(uid: str):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT course_id, subject, grade, course_title, status, progress_percent, "
                f"last_activity_at, started_at, completed_at "
                f"FROM {SCHEMA}.user_my_courses WHERE user_uid = '{esc(uid)}' "
                f"ORDER BY last_activity_at DESC"
            )
            rows = []
            for r in cur.fetchall():
                rows.append({
                    'course_id': r[0], 'subject': r[1], 'grade': r[2], 'title': r[3],
                    'status': r[4], 'progress': r[5],
                    'last_activity_at': r[6].isoformat() if r[6] else None,
                    'started_at': r[7].isoformat() if r[7] else None,
                    'completed_at': r[8].isoformat() if r[8] else None,
                })
        return {'courses': rows}
    finally:
        conn.close()


# ───── Активность + статистика + уровень ─────
def log_activity(uid: str, minutes: int = 0, lessons: int = 0, tasks: int = 0, xp: int = 0):
    today = date.today().isoformat()
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            # Запись в активность за день
            cur.execute(
                f"INSERT INTO {SCHEMA}.user_activity_log "
                f"(user_uid, activity_date, minutes_spent, lessons_completed, tasks_solved, xp_earned) "
                f"VALUES ('{esc(uid)}', '{today}', {int(minutes)}, {int(lessons)}, {int(tasks)}, {int(xp)}) "
                f"ON CONFLICT (user_uid, activity_date) DO UPDATE SET "
                f"minutes_spent = {SCHEMA}.user_activity_log.minutes_spent + EXCLUDED.minutes_spent, "
                f"lessons_completed = {SCHEMA}.user_activity_log.lessons_completed + EXCLUDED.lessons_completed, "
                f"tasks_solved = {SCHEMA}.user_activity_log.tasks_solved + EXCLUDED.tasks_solved, "
                f"xp_earned = {SCHEMA}.user_activity_log.xp_earned + EXCLUDED.xp_earned"
            )
            # Обновим суммарную статистику + streak
            cur.execute(
                f"INSERT INTO {SCHEMA}.user_stats "
                f"(user_uid, total_xp, lessons_completed, tasks_solved, streak_days, last_active_date) "
                f"VALUES ('{esc(uid)}', {int(xp)}, {int(lessons)}, {int(tasks)}, 1, '{today}') "
                f"ON CONFLICT (user_uid) DO UPDATE SET "
                f"total_xp = {SCHEMA}.user_stats.total_xp + EXCLUDED.total_xp, "
                f"lessons_completed = {SCHEMA}.user_stats.lessons_completed + EXCLUDED.lessons_completed, "
                f"tasks_solved = {SCHEMA}.user_stats.tasks_solved + EXCLUDED.tasks_solved, "
                f"streak_days = CASE "
                f"  WHEN {SCHEMA}.user_stats.last_active_date = CURRENT_DATE THEN {SCHEMA}.user_stats.streak_days "
                f"  WHEN {SCHEMA}.user_stats.last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN {SCHEMA}.user_stats.streak_days + 1 "
                f"  ELSE 1 END, "
                f"last_active_date = CURRENT_DATE, "
                f"level = GREATEST(1, ({SCHEMA}.user_stats.total_xp + EXCLUDED.total_xp) / 500 + 1)"
            )
            conn.commit()
        return {'ok': True}
    finally:
        conn.close()


def get_stats(uid: str):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT total_xp, level, lessons_completed, tasks_solved, streak_days, last_active_date "
                f"FROM {SCHEMA}.user_stats WHERE user_uid = '{esc(uid)}'"
            )
            r = cur.fetchone()
            stats = {
                'total_xp': r[0] if r else 0,
                'level': r[1] if r else 1,
                'lessons_completed': r[2] if r else 0,
                'tasks_solved': r[3] if r else 0,
                'streak_days': r[4] if r else 0,
                'last_active_date': r[5].isoformat() if r and r[5] else None,
            }
            # Активность за последние 120 дней для тепловой карты
            cur.execute(
                f"SELECT activity_date, minutes_spent, lessons_completed, tasks_solved, xp_earned "
                f"FROM {SCHEMA}.user_activity_log "
                f"WHERE user_uid = '{esc(uid)}' AND activity_date >= CURRENT_DATE - INTERVAL '120 days' "
                f"ORDER BY activity_date ASC"
            )
            activity = []
            for row in cur.fetchall():
                activity.append({
                    'date': row[0].isoformat(),
                    'minutes': row[1], 'lessons': row[2], 'tasks': row[3], 'xp': row[4],
                })
            # Бейджи
            cur.execute(
                f"SELECT badge_id, earned_at FROM {SCHEMA}.user_badges "
                f"WHERE user_uid = '{esc(uid)}' ORDER BY earned_at DESC"
            )
            badges = [{'id': r[0], 'earned_at': r[1].isoformat() if r[1] else None} for r in cur.fetchall()]
        return {'stats': stats, 'activity': activity, 'badges': badges}
    finally:
        conn.close()


def award_badge(uid: str, badge_id: str):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.user_badges (user_uid, badge_id) "
                f"VALUES ('{esc(uid)}', '{esc(badge_id)}') "
                f"ON CONFLICT (user_uid, badge_id) DO NOTHING RETURNING id"
            )
            row = cur.fetchone()
            conn.commit()
        return {'awarded': bool(row)}
    finally:
        conn.close()


def handler(event, context):
    """Пользовательские данные: избранное, история, мои курсы, активность, бейджи"""
    method = event.get('httpMethod', 'POST')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}
    if method != 'POST':
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

    try:
        body_str = event.get('body', '{}')
        body = json.loads(body_str) if isinstance(body_str, str) else body_str
        action = body.get('action', '')
        uid = str(body.get('user_uid', '')).strip()[:64]
        if not uid:
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_uid обязателен'}, ensure_ascii=False)}

        if action == 'toggle_favorite':
            result = toggle_favorite(uid, int(body.get('course_id', 0)))
        elif action == 'list_favorites':
            result = list_favorites(uid)
        elif action == 'track_view':
            result = track_view(uid, int(body.get('course_id', 0)))
        elif action == 'list_history':
            result = list_history(uid, int(body.get('limit', 20)))
        elif action == 'start_course':
            result = start_course(uid, int(body.get('course_id', 0)),
                                  str(body.get('subject', '')), str(body.get('grade', '')),
                                  str(body.get('course_title', '')))
        elif action == 'update_progress':
            result = update_progress(uid, int(body.get('course_id', 0)), int(body.get('progress', 0)))
        elif action == 'list_my_courses':
            result = list_my_courses(uid)
        elif action == 'log_activity':
            result = log_activity(uid,
                                  int(body.get('minutes', 0)),
                                  int(body.get('lessons', 0)),
                                  int(body.get('tasks', 0)),
                                  int(body.get('xp', 0)))
        elif action == 'get_stats':
            result = get_stats(uid)
        elif action == 'award_badge':
            result = award_badge(uid, str(body.get('badge_id', '')))
        else:
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Неизвестный action: {action}'}, ensure_ascii=False)}

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False, default=str),
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)}
