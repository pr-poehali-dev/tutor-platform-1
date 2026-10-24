"""Бот MAX: приветствие по /start с кнопкой мини-приложения и «задание дня» в 17:00 по Москве.

Формат кнопок и событий — по документации MAX (dev.max.ru/docs-api) и официальной библиотеке @maxhub/max-bot-api:
кнопка мини-приложения {type: open_app, text, web_app}, колбэк {type: callback, text, payload},
событие нажатия message_callback -> callback.callback_id / payload / user, ответ — POST /answers?callback_id=.
"""
import json
import os
import ssl
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

from certs import RUSSIAN_TRUSTED_CA
from exam_tasks import TASKS

API = 'https://platform-api2.max.ru'
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
MINIAPP_URL = 'https://xn--h1amcedk2a6b.xn--p1ai/max'
MSK = timezone(timedelta(hours=3))
SEND_HOUR_MSK = 17
SUBJECTS = {'math': 'Математика', 'russian': 'Русский язык', 'physics': 'Физика',
            'informatics': 'Информатика', 'social': 'Обществознание'}
TIME_BUDGET_SEC = 25
PAUSE_SEC = 0.1


def t(name):
    return f'{SCHEMA}.{name}'


_CTX = None


def ssl_ctx():
    """platform-api2.max.ru подписан сертификатом Минцифры (Russian Trusted Root CA) — MAX требует добавить его в доверенные.
    Сертификаты — в certs.py, проверка подлинности сервера остаётся включённой."""
    global _CTX
    if _CTX is None:
        _CTX = ssl.create_default_context()
        _CTX.load_verify_locations(cadata=RUSSIAN_TRUSTED_CA)
    return _CTX


def api(method: str, path: str, payload=None):
    token = os.environ.get('MAX_BOT_TOKEN', '')
    if not token:
        return False, 'MAX_BOT_TOKEN not set'
    data = json.dumps(payload, ensure_ascii=False).encode() if payload is not None else None
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={'Content-Type': 'application/json', 'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=12, context=ssl_ctx()) as r:
            return True, r.read().decode('utf-8', 'ignore')[:500]
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code}: {e.read().decode("utf-8", "ignore")[:300]}'
    except Exception as e:
        return False, str(e)[:300]


def keyboard(rows):
    return [{'type': 'inline_keyboard', 'payload': {'buttons': rows}}]


def open_app_btn(text='Открыть УЧИСЬПРО'):
    return {'type': 'open_app', 'text': text, 'web_app': MINIAPP_URL}


def send(user_id: int, text: str, rows=None):
    body = {'text': text[:3900]}
    if rows:
        body['attachments'] = keyboard(rows)
    return api('POST', f'/messages?user_id={int(user_id)}', body)


def settings(cur):
    cur.execute(f"SELECT daily_enabled, welcome_text FROM {t('max_bot_settings')} WHERE id=1")
    r = cur.fetchone()
    return {'daily_enabled': bool(r[0]), 'welcome_text': r[1]} if r else {'daily_enabled': False, 'welcome_text': ''}


def upsert_subscriber(cur, user: dict, chat_id=None, resubscribe=False):
    uid = int(user.get('user_id') or 0)
    if not uid:
        return
    name = ' '.join(x for x in [user.get('first_name') or user.get('name') or '', user.get('last_name') or ''] if x)[:200] or None
    cur.execute(
        f"INSERT INTO {t('max_bot_subscribers')} (max_user_id, chat_id, name) VALUES (%s,%s,%s) "
        f"ON CONFLICT (max_user_id) DO UPDATE SET chat_id=COALESCE(EXCLUDED.chat_id, {t('max_bot_subscribers')}.chat_id), "
        f"name=COALESCE(EXCLUDED.name, {t('max_bot_subscribers')}.name), blocked=FALSE, updated_at=now()"
        + (", daily_task=TRUE, unsubscribed_at=NULL" if resubscribe else ""),
        (uid, chat_id, name))


def welcome(cur, user: dict, chat_id=None):
    upsert_subscriber(cur, user, chat_id)
    st = settings(cur)
    text = st['welcome_text'] or 'Привет! Я бот УЧИСЬПРО. Нажмите «Открыть УЧИСЬПРО», чтобы начать.'
    cur.execute(f"SELECT daily_task FROM {t('max_bot_subscribers')} WHERE max_user_id=%s", (int(user['user_id']),))
    r = cur.fetchone()
    rows = [[open_app_btn()]]
    if r and not r[0]:
        rows.append([{'type': 'callback', 'text': 'Получать задание дня', 'payload': 'daily_on'}])
    return send(user['user_id'], text, rows)


def daily_task_for(day) -> dict:
    """То же правило, что в мини-приложении (ExamTab.dailyTask), для ОГЭ: индекс дня по Москве × 7919."""
    pool = [x for x in TASKS if x['exam'] == 'ОГЭ'] or TASKS
    day_index = int((datetime(day.year, day.month, day.day, tzinfo=timezone.utc).timestamp()) // 86400)
    return pool[(day_index * 7919) % len(pool)]


def daily_text(task) -> str:
    return (f"🎯 Задание дня · {SUBJECTS.get(task['subject'], task['subject'])}, {task['exam']} №{task['n']}\n"
            f"Тема: {task['topic']}\n\n{task['q']}\n\n"
            f"Ответ, разбор и частые ошибки — в приложении. Это 5 минут.")


def daily_rows():
    return [[open_app_btn('Решить в приложении')],
            [{'type': 'callback', 'text': 'Отписаться', 'payload': 'daily_off'}]]


def handle_callback(conn, body: dict):
    cb = body.get('callback') or {}
    cb_id = cb.get('callback_id')
    payload = cb.get('payload') or ''
    user = cb.get('user') or {}
    uid = int(user.get('user_id') or 0)
    if not (cb_id and uid):
        return
    with conn.cursor() as cur:
        if payload == 'daily_off':
            upsert_subscriber(cur, user)
            cur.execute(f"UPDATE {t('max_bot_subscribers')} SET daily_task=FALSE, unsubscribed_at=now(), updated_at=now() "
                        f"WHERE max_user_id=%s", (uid,))
            note = 'Готово, задание дня больше не придёт. Вернуть — кнопкой «Получать задание дня» или командой /start.'
        elif payload == 'daily_on':
            upsert_subscriber(cur, user, resubscribe=True)
            note = 'Подписка включена: задание дня — каждый день в 17:00 по Москве.'
        else:
            note = None
        conn.commit()
    if note:
        api('POST', f'/answers?callback_id={cb_id}', {'notification': note})


def handle_update(conn, body: dict) -> bool:
    """События нового формата. Возвращает True, если событие обработано здесь."""
    kind = body.get('update_type')
    if kind == 'bot_started':
        start_payload = str(body.get('payload') or '')
        if start_payload.lower().startswith('pilot'):
            import school_pilot
            school_pilot.start(conn, body.get('user') or {}, start_payload)
            return True
        if start_payload.startswith('tutor'):
            import tutors
            tutors.start(conn, body.get('user') or {}, start_payload)
            return True
        with conn.cursor() as cur:
            welcome(cur, body.get('user') or {}, body.get('chat_id'))
            conn.commit()
        return True
    if kind == 'message_callback':
        import tutors
        if tutors.on_callback(conn, body.get('callback') or {}):
            return True
        handle_callback(conn, body)
        return True
    if kind == 'bot_stopped':
        uid = int((body.get('user') or {}).get('user_id') or 0)
        if uid:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {t('max_bot_subscribers')} SET blocked=TRUE, updated_at=now() WHERE max_user_id=%s", (uid,))
                conn.commit()
        return True
    return False


def run_daily(conn, force=False) -> dict:
    """Рассылка задания дня. Запускается часто; шлёт только с 17:00 по Москве и каждому не больше раза в день."""
    now = datetime.now(MSK)
    today = now.date()
    with conn.cursor() as cur:
        st = settings(cur)
        if not st['daily_enabled'] and not force:
            return {'skipped': 'disabled'}
        if now.hour < SEND_HOUR_MSK and not force:
            return {'skipped': 'too_early'}
        if now.hour >= 22 and not force:
            return {'skipped': 'too_late'}
        cur.execute(f"SELECT max_user_id FROM {t('max_bot_subscribers')} WHERE daily_task AND NOT blocked "
                    f"AND (last_sent_on IS NULL OR last_sent_on < %s) ORDER BY max_user_id LIMIT 200", (today,))
        ids = [r[0] for r in cur.fetchall()]
    task = daily_task_for(today)
    text = daily_text(task)
    sent = failed = 0
    started = time.time()
    for uid in ids:
        if time.time() - started > TIME_BUDGET_SEC:
            break
        ok_, res = send(uid, text, daily_rows())
        with conn.cursor() as cur:
            if ok_:
                sent += 1
                cur.execute(f"UPDATE {t('max_bot_subscribers')} SET last_sent_on=%s WHERE max_user_id=%s", (today, uid))
            else:
                failed += 1
                blocked = '403' in res or 'blocked' in res.lower() or 'not found' in res.lower()
                cur.execute(f"UPDATE {t('max_bot_subscribers')} SET last_sent_on=%s, blocked=%s WHERE max_user_id=%s",
                            (today, blocked, uid))
                print(f'[daily] fail {uid}: {res[:200]}')
            conn.commit()
        time.sleep(PAUSE_SEC)
    if sent or failed:
        with conn.cursor() as cur:
            cur.execute(f"INSERT INTO {t('max_bot_daily_log')} (sent_on, task_id, sent, failed) VALUES (%s,%s,%s,%s)",
                        (today, task['id'], sent, failed))
            conn.commit()
    return {'sent': sent, 'failed': failed, 'left': max(0, len(ids) - sent - failed), 'task': task['id']}


def admin_status(conn) -> dict:
    with conn.cursor() as cur:
        st = settings(cur)
        cur.execute(f"SELECT count(*), count(*) FILTER (WHERE daily_task AND NOT blocked), count(*) FILTER (WHERE blocked), "
                    f"count(*) FILTER (WHERE NOT daily_task), count(*) FILTER (WHERE started_at > now() - interval '7 days') "
                    f"FROM {t('max_bot_subscribers')}")
        total, daily, blocked, unsub, new7 = cur.fetchone()
        cur.execute(f"SELECT count(*) FROM {SCHEMA}.auth_users WHERE max_user_id IS NOT NULL")
        app_users = cur.fetchone()[0]
        cur.execute(f"SELECT sent_on, task_id, sum(sent), sum(failed) FROM {t('max_bot_daily_log')} "
                    f"GROUP BY 1,2 ORDER BY 1 DESC LIMIT 14")
        log = [{'date': str(d), 'task_id': tid, 'sent': s, 'failed': f} for d, tid, s, f in cur.fetchall()]
    today_task = daily_task_for(datetime.now(MSK).date())
    return {'settings': st, 'subscribers': {'total': total, 'daily': daily, 'blocked': blocked, 'unsubscribed': unsub, 'new_7d': new7},
            'app_users': app_users, 'log': log, 'today_task': {'id': today_task['id'], 'preview': daily_text(today_task)},
            'send_hour_msk': SEND_HOUR_MSK}


def admin_save(conn, body: dict) -> dict:
    with conn.cursor() as cur:
        if 'daily_enabled' in body:
            cur.execute(f"UPDATE {t('max_bot_settings')} SET daily_enabled=%s, updated_at=now() WHERE id=1", (bool(body['daily_enabled']),))
        if 'welcome_text' in body:
            text = str(body.get('welcome_text') or '').strip()[:3500]
            if len(text) < 10:
                return {'error': 'Текст приветствия слишком короткий'}
            cur.execute(f"UPDATE {t('max_bot_settings')} SET welcome_text=%s, updated_at=now() WHERE id=1", (text,))
        conn.commit()
        return {'settings': settings(cur)}
