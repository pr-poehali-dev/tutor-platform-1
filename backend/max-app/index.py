"""
Мини-приложение УЧИСЬПРО в MAX: прогресс ученика.

Все запросы — с X-Auth-Token (сессия выдаётся после проверки подписи MAX в функции auth, action=max-login).

GET  /?action=summary                          -> имя, класс, статистика занятий, задание дня решено ли, прогресс по темам
POST /?action=answer   body: {task_id, subject, exam, topic, correct, is_daily}  -> записать ответ на задание ОГЭ/ЕГЭ
"""
import json
import os

import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')


def cors():
    return {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token', 'Access-Control-Max-Age': '86400',
            'Content-Type': 'application/json'}


def ok(d, s=200):
    return {'statusCode': s, 'headers': cors(), 'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m, s=400):
    return ok({'error': m}, s)


def user_by_token(cur, token):
    if not token:
        return None
    cur.execute(f"SELECT u.id, u.name, u.grade FROM {SCHEMA}.auth_sessions s JOIN {SCHEMA}.auth_users u ON u.id=s.user_id "
                f"WHERE s.token=%s AND s.revoked_at IS NULL AND s.expires_at > now()", (token,))
    return cur.fetchone()


def summary(cur, uid, name, grade):
    msk_today = "(now() AT TIME ZONE 'Europe/Moscow')::date"
    cur.execute(f"SELECT count(*), count(*) FILTER (WHERE correct), "
                f"count(DISTINCT (created_at AT TIME ZONE 'Europe/Moscow')::date), "
                f"count(*) FILTER (WHERE created_at > now() - interval '7 days'), "
                f"bool_or(is_daily AND (created_at AT TIME ZONE 'Europe/Moscow')::date = {msk_today}), "
                f"bool_or(is_daily AND correct AND (created_at AT TIME ZONE 'Europe/Moscow')::date = {msk_today}) "
                f"FROM {SCHEMA}.exam_task_answers WHERE user_id=%s", (uid,))
    total, correct, days, week, daily_done, daily_ok = cur.fetchone()
    cur.execute(f"SELECT count(DISTINCT (created_at AT TIME ZONE 'Europe/Moscow')::date) FROM {SCHEMA}.max_app_opens "
                f"WHERE user_id=%s AND created_at > now() - interval '7 days'", (uid,))
    active_days_week = cur.fetchone()[0]
    cur.execute(f"SELECT subject, topic, count(*), count(*) FILTER (WHERE correct) FROM {SCHEMA}.exam_task_answers "
                f"WHERE user_id=%s GROUP BY 1,2 ORDER BY count(*) DESC LIMIT 30", (uid,))
    topics = [{'subject': s, 'topic': t, 'total': n, 'correct': c} for s, t, n, c in cur.fetchall()]
    # Серия: подряд идущие дни с хотя бы одним заданием, считая от сегодня или вчера
    cur.execute(f"SELECT DISTINCT (created_at AT TIME ZONE 'Europe/Moscow')::date d FROM {SCHEMA}.exam_task_answers "
                f"WHERE user_id=%s AND created_at > now() - interval '60 days' ORDER BY d DESC", (uid,))
    dates = [r[0] for r in cur.fetchall()]
    cur.execute(f"SELECT {msk_today}")
    today = cur.fetchone()[0]
    streak = 0
    if dates and (today - dates[0]).days <= 1:
        streak, prev = 1, dates[0]
        for d in dates[1:]:
            if (prev - d).days == 1:
                streak, prev = streak + 1, d
            else:
                break
    return {'name': name, 'grade': grade,
            'stats': {'tasks': total, 'correct': correct, 'days': days, 'week_tasks': week,
                      'active_days_week': active_days_week, 'streak': streak},
            'daily': {'done': bool(daily_done), 'correct': bool(daily_ok)}, 'topics': topics}


def answer(cur, uid, b):
    task_id = str(b.get('task_id') or '')[:80]
    subject = str(b.get('subject') or '')[:30]
    exam = str(b.get('exam') or '')[:30]
    topic = str(b.get('topic') or '')[:200]
    if not (task_id and subject and topic):
        return err('Нет данных задания')
    is_daily = bool(b.get('is_daily'))
    if is_daily:
        cur.execute(f"SELECT 1 FROM {SCHEMA}.exam_task_answers WHERE user_id=%s AND is_daily "
                    f"AND (created_at AT TIME ZONE 'Europe/Moscow')::date = (now() AT TIME ZONE 'Europe/Moscow')::date", (uid,))
        if cur.fetchone():
            is_daily = False
    cur.execute(f"SELECT count(*) FROM {SCHEMA}.exam_task_answers WHERE user_id=%s AND created_at > now() - interval '1 hour'", (uid,))
    if cur.fetchone()[0] >= 200:
        return err('Слишком много ответов подряд — сделай перерыв', 429)
    cur.execute(f"INSERT INTO {SCHEMA}.exam_task_answers (user_id, task_id, subject, exam, topic, correct, is_daily) "
                f"VALUES (%s,%s,%s,%s,%s,%s,%s)", (uid, task_id, subject, exam, topic, bool(b.get('correct')), is_daily))
    return ok({'ok': True})


def handler(event: dict, context) -> dict:
    """Прогресс ученика в мини-приложении MAX: задание дня, ответы ОГЭ/ЕГЭ, статистика профиля."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    headers = event.get('headers') or {}
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action') or 'summary'
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        with conn.cursor() as cur:
            u = user_by_token(cur, token)
            if not u:
                return err('Войдите заново', 401)
            if action == 'summary':
                res = ok(summary(cur, *u))
            elif action == 'answer' and event.get('httpMethod') == 'POST':
                res = answer(cur, u[0], body)
            else:
                res = err('Неизвестное действие', 404)
        conn.commit()
        return res
    finally:
        conn.close()
