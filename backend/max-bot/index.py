"""
Интеграция с мессенджером MAX: уведомления родителям о занятиях ребёнка.

Эндпоинты:
GET  /?action=link_status     header X-Auth-Token  -> статус привязки + код для /start
POST /?action=update_settings header X-Auth-Token  -> {notify_daily_report, notify_reminders, notify_achievements}
POST /?action=unlink          header X-Auth-Token  -> отвязать MAX
POST /?action=webhook                              -> приём апдейтов от MAX (обработка /start CODE)
POST /?action=cron            header Authorization: Bearer CRON_SECRET -> ежедневная рассылка
"""
import json
import os
import secrets
import string
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone, date
import psycopg2

MAX_API_BASE = "https://botapi.max.ru"
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(data, ensure_ascii=False)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def t(name: str) -> str:
    return f'{SCHEMA}.{name}'


def gen_code(n: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    alphabet = alphabet.replace('O', '').replace('0', '').replace('I', '').replace('1', '')
    return ''.join(secrets.choice(alphabet) for _ in range(n))


def resolve_user_id(conn, token: str):
    if not token:
        return None
    with conn.cursor() as cur:
        cur.execute(
            "SELECT s.user_id FROM " + t('auth_sessions') + " s "
            "WHERE s.token = %s AND s.revoked_at IS NULL AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
    return row[0] if row else None


# ---------- MAX Bot API ----------

WEBHOOK_URL = "https://functions.poehali.dev/63e9b695-9607-4b29-aa00-b08e1fa1b7be?action=webhook"


def max_api(method: str, path: str, payload: dict = None) -> tuple:
    """Универсальный вызов Bot API MAX. Возвращает (ok, body_str)."""
    token = os.environ.get('MAX_BOT_TOKEN', '')
    if not token:
        return False, 'MAX_BOT_TOKEN not set'
    url = f"{MAX_API_BASE}{path}"
    data = json.dumps(payload).encode('utf-8') if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={'Content-Type': 'application/json',
                                          'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return True, resp.read().decode('utf-8', 'ignore')[:600]
    except urllib.error.HTTPError as e:
        return False, f'HTTP {e.code}: {e.read().decode("utf-8", "ignore")[:600]}'
    except Exception as e:
        return False, str(e)[:400]


def handle_setup() -> dict:
    """Регистрирует webhook-подписку бота в MAX и возвращает диагностику."""
    ok_me, me = max_api('GET', '/me')
    ok_sub, sub = max_api('POST', '/subscriptions', {'url': WEBHOOK_URL})
    print(f'[setup] me ok={ok_me} {me}')
    print(f'[setup] subscribe ok={ok_sub} {sub}')
    return ok({'me_ok': ok_me, 'me': me, 'subscribe_ok': ok_sub, 'subscribe': sub,
               'webhook_url': WEBHOOK_URL})


def handle_check() -> dict:
    """Показывает данные бота и активные подписки."""
    ok_me, me = max_api('GET', '/me')
    ok_subs, subs = max_api('GET', '/subscriptions')
    return ok({'me_ok': ok_me, 'me': me, 'subscriptions_ok': ok_subs, 'subscriptions': subs})


def max_send_message(chat_id: int, text: str) -> tuple:
    """Отправка текстового сообщения в чат MAX. Возвращает (ok, error)."""
    token = os.environ.get('MAX_BOT_TOKEN', '')
    if not token:
        return False, 'MAX_BOT_TOKEN not set'
    url = f"{MAX_API_BASE}/messages?chat_id={chat_id}"
    payload = json.dumps({'text': text}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, method='POST',
                                 headers={'Content-Type': 'application/json',
                                          'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
        return True, None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'ignore')
        return False, f'HTTP {e.code}: {body[:300]}'
    except Exception as e:
        return False, str(e)[:300]


# ---------- Контент уведомлений ----------

ACTIVITY_LABELS = {
    'reading': 'чтение',
    'poznavashka': 'Познавашка',
    'kids_game': 'игротека',
    'achievement': 'достижения',
    'daily_checkin': 'ежедневный вход',
}


def build_daily_report(conn, user_id: int) -> tuple:
    """Готовит текст ежедневного отчёта. Возвращает (text|None, has_activity)."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT COALESCE(SUM(amount),0), COUNT(*) FROM " + t('znaika_transactions') + " "
            "WHERE user_id = %s AND kind = 'earn' AND created_at::date = CURRENT_DATE",
            (user_id,)
        )
        earned, cnt = cur.fetchone()

        cur.execute(
            "SELECT reason, COUNT(*) FROM " + t('znaika_transactions') + " "
            "WHERE user_id = %s AND kind = 'earn' AND created_at::date = CURRENT_DATE "
            "AND reason IN ('reading','poznavashka','kids_game') GROUP BY reason",
            (user_id,)
        )
        by_reason = cur.fetchall()

        cur.execute(
            "SELECT balance, current_streak FROM " + t('znaika_balances') + " WHERE user_id = %s",
            (user_id,)
        )
        brow = cur.fetchone()
    balance = brow[0] if brow else 0
    streak = brow[1] if brow else 0

    if not by_reason and (earned or 0) <= 0:
        return None, False

    lines = ["🦊 Малыш сегодня занимался!", ""]
    if by_reason:
        parts = []
        for reason, c in by_reason:
            parts.append(f"• {ACTIVITY_LABELS.get(reason, reason)} — {c} раз")
        lines.append("Чем занимался:")
        lines.extend(parts)
        lines.append("")
    if (earned or 0) > 0:
        lines.append(f"⭐ Заработал сегодня: {earned} ЗНАЕК")
    lines.append(f"💰 Всего на счету: {balance} ЗНАЕК")
    if streak and streak > 1:
        lines.append(f"🔥 Занимается {streak} дней подряд — так держать!")
    lines.append("")
    lines.append("Открыть Малыша: https://учисьпро.рф/kids")
    return "\n".join(lines), True


def build_reminder(conn, user_id: int) -> str:
    return ("🦊 Лиса заскучала!\n\n"
            "Малыш не занимался уже несколько дней. Пять минут чтения или одна весёлая игра — "
            "и день станет полезнее.\n\nЗайти в Малыша: https://учисьпро.рф/kids")


def days_since_activity(conn, user_id: int):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT MAX(created_at)::date FROM " + t('znaika_transactions') + " WHERE user_id = %s",
            (user_id,)
        )
        row = cur.fetchone()
    if not row or not row[0]:
        return None
    return (date.today() - row[0]).days


# ---------- Handlers ----------

def handle_link_status(conn, user_id: int) -> dict:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT max_chat_id, max_user_name, link_code, status, "
            "notify_daily_report, notify_reminders, notify_achievements "
            "FROM " + t('max_links') + " WHERE user_id = %s",
            (user_id,)
        )
        row = cur.fetchone()
        if not row:
            code = gen_code()
            cur.execute(
                "INSERT INTO " + t('max_links') + " (user_id, link_code, status) "
                "VALUES (%s, %s, 'pending') RETURNING link_code",
                (user_id, code)
            )
            conn.commit()
            return ok({'status': 'pending', 'link_code': code, 'bot_username': os.environ.get('MAX_BOT_USERNAME', ''),
                       'settings': {'notify_daily_report': True, 'notify_reminders': True, 'notify_achievements': True}})
        chat_id, uname, code, status, nd, nr, na = row
        # если ещё не привязан — обновим код на случай протухания не нужно, оставляем тот же
        return ok({
            'status': status,
            'link_code': code,
            'max_user_name': uname,
            'bot_username': os.environ.get('MAX_BOT_USERNAME', ''),
            'settings': {'notify_daily_report': nd, 'notify_reminders': nr, 'notify_achievements': na},
        })


def handle_update_settings(conn, user_id: int, body: dict) -> dict:
    nd = bool(body.get('notify_daily_report', True))
    nr = bool(body.get('notify_reminders', True))
    na = bool(body.get('notify_achievements', True))
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE " + t('max_links') + " SET notify_daily_report=%s, notify_reminders=%s, "
            "notify_achievements=%s, updated_at=NOW() WHERE user_id=%s",
            (nd, nr, na, user_id)
        )
        conn.commit()
    return ok({'ok': True, 'settings': {'notify_daily_report': nd, 'notify_reminders': nr, 'notify_achievements': na}})


def handle_unlink(conn, user_id: int) -> dict:
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE " + t('max_links') + " SET status='revoked', max_chat_id=NULL, updated_at=NOW() "
            "WHERE user_id=%s",
            (user_id,)
        )
        conn.commit()
    return ok({'ok': True, 'status': 'revoked'})


def handle_webhook(conn, body: dict) -> dict:
    """Приём апдейтов от MAX. Обрабатываем команду /start CODE для привязки."""
    msg = body.get('message') or body.get('message_created') or {}
    # MAX update формат: {update_type, message:{ body:{text}, sender:{user_id, name}, recipient:{chat_id} }}
    if not msg and body.get('update_type') == 'message_created':
        msg = body.get('message', {})
    text = ''
    chat_id = None
    user_name = None
    try:
        mbody = msg.get('body', {})
        text = (mbody.get('text') or '').strip()
        sender = msg.get('sender', {})
        user_name = (sender.get('name') or sender.get('first_name')
                     or sender.get('username') or '')
        recipient = msg.get('recipient', {})
        chat_id = (recipient.get('chat_id') or recipient.get('user_id')
                   or sender.get('user_id'))
    except Exception:
        pass

    if not chat_id:
        return ok({'ok': True})

    low = text.lower().strip()
    if low in ('/id', 'chatid', 'chat id', 'мой id', '/chatid'):
        max_send_message(chat_id,
                         f"Ваш chat_id: {chat_id}\n\n"
                         "Впишите это число в секрет MAX_ADMIN_CHAT_ID на сайте — "
                         "и сюда начнут приходить новые заявки на конструктор школ.")
        return ok({'ok': True})

    code = None
    if text.lower().startswith('/start'):
        parts = text.split()
        if len(parts) >= 2:
            code = parts[1].strip().upper()

    if not code:
        max_send_message(chat_id,
                         "Привет! Я бот УЧИСЬПРО 🦊\n\n"
                         "Чтобы получать отчёты о занятиях ребёнка, привяжите аккаунт: "
                         "откройте Настройки родителя на сайте и нажмите «Подключить MAX».")
        return ok({'ok': True})

    with conn.cursor() as cur:
        cur.execute(
            "SELECT user_id, status FROM " + t('max_links') + " WHERE link_code = %s",
            (code,)
        )
        row = cur.fetchone()
        if not row:
            max_send_message(chat_id, "Код не найден или устарел. Сгенерируйте новый в настройках на сайте.")
            return ok({'ok': True})
        user_id = row[0]
        cur.execute(
            "UPDATE " + t('max_links') + " SET max_chat_id=%s, max_user_name=%s, status='linked', "
            "linked_at=NOW(), updated_at=NOW() WHERE user_id=%s",
            (chat_id, user_name, user_id)
        )
        conn.commit()

    max_send_message(chat_id,
                     "✅ Готово! Аккаунт привязан.\n\n"
                     "Теперь я буду присылать отчёты о занятиях вашего малыша, напоминания и достижения. "
                     "Настроить уведомления можно на сайте в разделе настроек родителя.")
    log_notification(conn, user_id, chat_id, 'welcome', None, 'welcome', True, None)
    return ok({'ok': True})


def log_notification(conn, user_id, chat_id, kind, dedup_key, text, success, error):
    with conn.cursor() as cur:
        try:
            cur.execute(
                "INSERT INTO " + t('max_notifications') +
                " (user_id, max_chat_id, kind, dedup_key, text, ok, error) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s) "
                "ON CONFLICT (user_id, dedup_key) DO NOTHING",
                (user_id, chat_id, kind, dedup_key, text, success, error)
            )
            conn.commit()
        except Exception:
            conn.rollback()


def already_sent(conn, user_id: int, dedup_key: str) -> bool:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM " + t('max_notifications') + " WHERE user_id=%s AND dedup_key=%s",
            (user_id, dedup_key)
        )
        return cur.fetchone() is not None


def handle_cron(conn) -> dict:
    """Ежедневная рассылка: отчёты тем, кто занимался, и напоминания тем, кто давно не заходил."""
    today = date.today().isoformat()
    sent_reports = 0
    sent_reminders = 0
    with conn.cursor() as cur:
        cur.execute(
            "SELECT user_id, max_chat_id, notify_daily_report, notify_reminders "
            "FROM " + t('max_links') + " WHERE status='linked' AND max_chat_id IS NOT NULL"
        )
        links = cur.fetchall()

    for user_id, chat_id, nd, nr in links:
        # 1) ежедневный отчёт
        if nd:
            dedup = f"daily_report:{today}"
            if not already_sent(conn, user_id, dedup):
                text, has = build_daily_report(conn, user_id)
                if has and text:
                    success, error = max_send_message(chat_id, text)
                    log_notification(conn, user_id, chat_id, 'daily_report', dedup, text, success, error)
                    if success:
                        sent_reports += 1
                        continue  # если был отчёт — напоминание не шлём
        # 2) напоминание при простое (3+ дня без активности), не чаще раза в 3 дня
        if nr:
            d = days_since_activity(conn, user_id)
            if d is not None and d >= 3:
                bucket = date.today().toordinal() // 3
                dedup = f"reminder:{bucket}"
                if not already_sent(conn, user_id, dedup):
                    text = build_reminder(conn, user_id)
                    success, error = max_send_message(chat_id, text)
                    log_notification(conn, user_id, chat_id, 'reminder', dedup, text, success, error)
                    if success:
                        sent_reminders += 1

    return ok({'ok': True, 'reports': sent_reports, 'reminders': sent_reminders, 'links': len(links)})


def handler(event: dict, context) -> dict:
    """Бот мессенджера MAX: привязка аккаунта родителя и уведомления о занятиях ребёнка."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''

    raw = event.get('body') or '{}'
    try:
        body = json.loads(raw) if raw else {}
    except Exception:
        body = {}

    # Публичный health-check
    if method == 'GET' and action in ('', 'ping'):
        return ok({'ok': True, 'service': 'max-bot'})

    # Настройка вебхука/подписки бота в MAX (одноразово)
    if action == 'setup':
        return handle_setup()
    if action == 'check':
        return handle_check()

    # Webhook от MAX — без авторизации пользователя
    if action == 'webhook':
        conn = get_db()
        try:
            return handle_webhook(conn, body)
        finally:
            conn.close()

    # Cron — защищён CRON_SECRET
    if action == 'cron':
        auth = headers.get('Authorization') or headers.get('authorization') or ''
        expected = 'Bearer ' + os.environ.get('CRON_SECRET', '___')
        if auth != expected:
            return err('forbidden', 403)
        conn = get_db()
        try:
            return handle_cron(conn)
        finally:
            conn.close()

    # Остальные действия требуют авторизации пользователя
    conn = get_db()
    try:
        user_id = resolve_user_id(conn, token)
        if not user_id:
            return err('Не авторизован', 401)
        if action == 'link_status':
            return handle_link_status(conn, user_id)
        if action == 'update_settings':
            return handle_update_settings(conn, user_id, body)
        if action == 'unlink':
            return handle_unlink(conn, user_id)
        return err('Неизвестное действие', 404)
    finally:
        conn.close()