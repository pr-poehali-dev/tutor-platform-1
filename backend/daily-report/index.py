"""
Business: Ежедневный отчёт владельцу в MAX — посетители, регистрации, продажи, активность за день.
Args: event с httpMethod, queryStringParameters (action=send|preview), headers (Authorization: Bearer CRON_SECRET)
Returns: HTTP-ответ с текстом отчёта и статусом отправки
"""
import json
import os
import urllib.request
from datetime import date, timedelta

import psycopg2

SCHEMA = 't_p78828167_tutor_platform_1'
MAX_API_BASE = 'https://botapi.max.ru'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Pin',
    'Access-Control-Max-Age': '86400',
}


def ok(payload, status=200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(payload, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return ok({'error': msg}, status)


def _max_post(token, param, ident, text):
    url = f"{MAX_API_BASE}/messages?{param}={ident}"
    data = json.dumps({'text': text}).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST',
                                 headers={'Content-Type': 'application/json',
                                          'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=10):
            return True
    except Exception:
        return False


def notify_max(text):
    token = os.environ.get('MAX_BOT_TOKEN', '')
    ident = os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return False
    if _max_post(token, 'chat_id', ident, text):
        return True
    return _max_post(token, 'user_id', ident, text)


def _one(cur, sql, params=None):
    cur.execute(sql, params or ())
    row = cur.fetchone()
    return row[0] if row and row[0] is not None else 0


def collect_stats():
    """Собирает показатели за сегодня и за вчера для сравнения."""
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        return None
    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            s = {}
            s['views'] = _one(cur, f"SELECT COUNT(*) FROM {SCHEMA}.page_visits "
                                   "WHERE created_at::date = CURRENT_DATE")
            s['visitors'] = _one(cur, f"SELECT COUNT(DISTINCT visitor_id) FROM {SCHEMA}.page_visits "
                                      "WHERE created_at::date = CURRENT_DATE")
            s['visitors_prev'] = _one(cur, f"SELECT COUNT(DISTINCT visitor_id) FROM {SCHEMA}.page_visits "
                                           "WHERE created_at::date = CURRENT_DATE - 1")
            s['signups'] = _one(cur, "SELECT COUNT(*) FROM auth_users "
                                     "WHERE created_at::date = CURRENT_DATE")
            s['signups_prev'] = _one(cur, "SELECT COUNT(*) FROM auth_users "
                                          "WHERE created_at::date = CURRENT_DATE - 1")
            s['logins'] = _one(cur, "SELECT COUNT(*) FROM auth_sessions "
                                    "WHERE created_at::date = CURRENT_DATE")

            s['paid_cnt'] = _one(cur, f"SELECT COUNT(*) FROM {SCHEMA}.course_purchases "
                                      "WHERE status='paid' AND purchased_at::date = CURRENT_DATE")
            s['paid_sum'] = _one(cur, f"SELECT COALESCE(SUM(amount_kopecks),0)/100 FROM {SCHEMA}.course_purchases "
                                      "WHERE status='paid' AND purchased_at::date = CURRENT_DATE")
            s['started_cnt'] = _one(cur, f"SELECT COUNT(*) FROM {SCHEMA}.course_purchases "
                                         "WHERE created_at::date = CURRENT_DATE")
            s['abandoned'] = _one(cur, f"SELECT COALESCE(SUM(amount_kopecks),0)/100 FROM {SCHEMA}.course_purchases "
                                       "WHERE status <> 'paid' AND created_at::date = CURRENT_DATE")

            s['lessons'] = _one(cur, f"SELECT COUNT(*) FROM {SCHEMA}.course_interactive_progress "
                                     "WHERE updated_at::date = CURRENT_DATE")
            s['homework'] = _one(cur, f"SELECT COUNT(*) FROM {SCHEMA}.homework_checks "
                                      "WHERE created_at::date = CURRENT_DATE")
            s['articles'] = _one(cur, f"SELECT COUNT(*) FROM {SCHEMA}.feed_articles "
                                      "WHERE published_at::date = CURRENT_DATE")
            s['leads'] = _one(cur, f"SELECT COUNT(*) FROM {SCHEMA}.feedback_requests "
                                   "WHERE created_at::date = CURRENT_DATE")

            s['month_paid'] = _one(cur, f"SELECT COALESCE(SUM(amount_kopecks),0)/100 FROM {SCHEMA}.course_purchases "
                                        "WHERE status='paid' AND purchased_at >= date_trunc('month', CURRENT_DATE)")
            s['users_total'] = _one(cur, "SELECT COUNT(*) FROM auth_users")

            cur.execute(f"SELECT path, COUNT(*) FROM {SCHEMA}.page_visits "
                        "WHERE created_at::date = CURRENT_DATE "
                        "GROUP BY path ORDER BY COUNT(*) DESC LIMIT 3")
            s['top_pages'] = cur.fetchall()
            return s
    finally:
        conn.close()


def _delta(now, prev):
    """Стрелка динамики относительно вчера."""
    if prev == 0 and now == 0:
        return ''
    if prev == 0:
        return f' (↑ +{now})'
    diff = now - prev
    if diff > 0:
        return f' (↑ +{diff})'
    if diff < 0:
        return f' (↓ {diff})'
    return ' (=)'


def build_report(s):
    today = date.today().strftime('%d.%m.%Y')
    lines = [f'📊 Отчёт УЧИСЬПРО за {today}', '']

    lines.append('👥 Трафик')
    lines.append(f'• Посетителей: {s["visitors"]}{_delta(s["visitors"], s["visitors_prev"])}')
    lines.append(f'• Просмотров страниц: {s["views"]}')
    if s['top_pages']:
        top = ', '.join(f'{p} ({c})' for p, c in s['top_pages'])
        lines.append(f'• Популярное: {top}')
    lines.append('')

    lines.append('🙋 Люди')
    lines.append(f'• Регистраций: {s["signups"]}{_delta(s["signups"], s["signups_prev"])}')
    lines.append(f'• Входов: {s["logins"]}')
    lines.append(f'• Всего в базе: {s["users_total"]}')
    lines.append('')

    lines.append('💰 Продажи')
    if s['paid_cnt']:
        lines.append(f'• Оплачено: {s["paid_cnt"]} на {s["paid_sum"]:,} ₽'.replace(',', ' '))
    else:
        lines.append('• Оплат сегодня нет')
    if s['abandoned']:
        lines.append(f'• Не завершили оплату: {s["abandoned"]:,} ₽'.replace(',', ' '))
    lines.append(f'• С начала месяца: {s["month_paid"]:,} ₽'.replace(',', ' '))
    lines.append('')

    lines.append('📚 Активность')
    lines.append(f'• Уроков пройдено: {s["lessons"]}')
    lines.append(f'• Домашек проверено: {s["homework"]}')
    lines.append(f'• Заявок: {s["leads"]}')
    lines.append(f'• Статей опубликовано: {s["articles"]}')

    # Короткий вывод — на что обратить внимание
    lines.append('')
    if s['visitors'] == 0:
        lines.append('⚠️ Ни одного посетителя за день — проверь рекламу и доступность сайта.')
    elif s['signups'] == 0 and s['visitors'] >= 10:
        lines.append('⚠️ Трафик есть, но никто не зарегистрировался — стоит усилить призыв на главной.')
    elif s['paid_cnt'] == 0 and s['started_cnt'] > 0:
        lines.append('⚠️ Оплату начинали, но не завершили — есть смысл напомнить этим людям.')
    elif s['paid_cnt'] > 0:
        lines.append('🎉 Есть продажи — так держать!')

    return '\n'.join(lines)


def handler(event: dict, context) -> dict:
    """Ежедневный отчёт по трафику, регистрациям и продажам в MAX"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = (params.get('action') or 'preview').strip()

    stats = collect_stats()
    if stats is None:
        return err('База данных недоступна', 500)

    text = build_report(stats)

    if action == 'send':
        headers = event.get('headers') or {}
        auth = (headers.get('Authorization') or headers.get('authorization')
                or headers.get('X-Authorization') or '')
        secret = os.environ.get('CRON_SECRET', '')
        if not secret or auth.replace('Bearer ', '').strip() != secret:
            return err('Доступ запрещён', 403)
        sent = notify_max(text)
        return ok({'sent': sent, 'report': text})

    return ok({'report': text})
