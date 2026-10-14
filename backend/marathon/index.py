"""
Марафон скорочтения: регистрация, кабинет участника, тест скорости чтения, напоминания.

POST /?action=register     {email, name, track, source}      -> {token, unlocked_day}
GET  /?action=me&token=    -> участник, открытые дни, замеры
POST /?action=complete_day {token, day, homework}
POST /?action=reading_test {token?, visitor_id, grade, words, seconds, comprehension}
GET  /?action=tick         -> напоминания (запускается «пульсом» с сайта)
Привязка MAX: участник пишет боту /start MXXXXXX — обрабатывает функция max-bot.
GET  /?action=stats        (X-Admin-Key) -> статистика марафона
"""
import json
import os
import re
import secrets
import smtplib
import ssl
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr

import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
SITE = 'https://учисьпро.рф'
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
TRACKS = {
    'teacher': {
        'title': 'Педагог скорочтения с нуля',
        'slug': 'marafon-skorochtenie-pedagogam',
        'days': ['Почему дети читают медленно', 'Упражнения, которые работают', 'Частная практика: ученики и доход'],
        'offer': 'Преподаватель скорочтения для детей',
        'offer_url': '/kurs/prepodavatel-skorochteniya-dlya-detey-96',
    },
    'parent': {
        'title': 'Ребёнок читает быстрее и с удовольствием',
        'slug': 'marafon-skorochtenie-dlya-detej',
        'days': ['Почему ребёнок читает медленно', 'Игры, которые ускоряют чтение', 'Любовь к чтению и понимание текста'],
        'offer': 'Скорочтение для детей 6–11 лет',
        'offer_url': '/kurs/skorochtenie-dlya-detey-6-11-let-97',
    },
}
CHECKLIST_URL = f'{SITE}/files/chek-list-10-sposobov-bystro-chitat.pdf'
PROMO = 'MARAFON30'
MAX_API = 'https://botapi.max.ru'


def t(name: str) -> str:
    return f'{SCHEMA}.{name}'


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors(), 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg: str, status: int = 400) -> dict:
    return ok({'error': msg}, status)


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def unlocked_day(started_at: datetime) -> int:
    """День 1 открыт сразу, каждый следующий — через сутки."""
    hours = (datetime.now(timezone.utc) - started_at).total_seconds() / 3600
    return max(1, min(4, int(hours // 24) + 1))


def cabinet_url(track: str, token: str) -> str:
    return f"{SITE}/{TRACKS[track]['slug']}/kabinet?t={token}"


# ───────────────────────── отправка ─────────────────────────

def send_email(cur, to: str, subject: str, text: str, html: str, kind: str) -> bool:
    user = os.environ.get('SMTP_USER', '').strip()
    password = os.environ.get('SMTP_PASSWORD', '').strip()
    if not user or not password:
        cur.execute(
            f"INSERT INTO {t('email_log')} (to_email, kind, subject, status, error) VALUES (%s,%s,%s,'failed',%s)",
            (to, kind, subject[:400], 'SMTP не настроен'))
        return False
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = formataddr(('УЧИСЬПРО', user))
    msg['To'] = to
    msg.set_content(text)
    msg.add_alternative(html, subtype='html')
    try:
        host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
        port = int(os.environ.get('SMTP_PORT', '465'))
        with smtplib.SMTP_SSL(host, port, context=ssl.create_default_context(), timeout=15) as s:
            s.login(user, password)
            s.send_message(msg)
        cur.execute(
            f"INSERT INTO {t('email_log')} (to_email, kind, subject, status) VALUES (%s,%s,%s,'sent')",
            (to, kind, subject[:400]))
        return True
    except Exception as e:
        cur.execute(
            f"INSERT INTO {t('email_log')} (to_email, kind, subject, status, error) VALUES (%s,%s,%s,'failed',%s)",
            (to, kind, subject[:400], str(e)[:900]))
        return False


def send_max(chat_id: int, text: str) -> bool:
    token = os.environ.get('MAX_BOT_TOKEN', '')
    if not token or not chat_id:
        return False
    req = urllib.request.Request(
        f'{MAX_API}/messages?chat_id={chat_id}',
        data=json.dumps({'text': text}).encode('utf-8'), method='POST',
        headers={'Content-Type': 'application/json', 'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            r.read()
        return True
    except (urllib.error.URLError, OSError):
        return False


def letter(title: str, lines: list, button_text: str, button_url: str) -> tuple:
    text = title + '\n\n' + '\n\n'.join(lines) + f'\n\n{button_text}: {button_url}\n\n— Команда УЧИСЬПРО'
    body = ''.join(f'<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#334155">{l}</p>' for l in lines)
    html = (
        '<div style="background:#f5f3ff;padding:28px 12px;font-family:Arial,sans-serif">'
        '<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:28px">'
        '<p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#0891b2;letter-spacing:.5px">УЧИСЬПРО · МАРАФОН СКОРОЧТЕНИЯ</p>'
        f'<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#4c1d95">{title}</h1>{body}'
        f'<a href="{button_url}" style="display:inline-block;margin-top:6px;background:#7c3aed;color:#fff;'
        f'text-decoration:none;font-weight:bold;padding:13px 22px;border-radius:12px">{button_text}</a>'
        '<p style="margin:22px 0 0;font-size:12px;color:#94a3b8">Вы получили письмо, потому что зарегистрировались '
        'на бесплатный марафон на учисьпро.рф.</p></div></div>'
    )
    return text, html


# ───────────────────────── действия ─────────────────────────

def handle_register(body: dict, source_ip: str) -> dict:
    email = (body.get('email') or '').strip().lower()[:320]
    name = (body.get('name') or '').strip()[:120]
    track = body.get('track') or ''
    source = (body.get('source') or '').strip()[:120]
    if track not in TRACKS:
        return err('Неизвестный марафон')
    if not EMAIL_RE.match(email):
        return err('Укажите корректный email')
    conn = db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT access_token, started_at FROM {t('marathon_participants')} WHERE track=%s AND email=%s",
                        (track, email))
            row = cur.fetchone()
            if row:
                return ok({'token': row[0], 'unlocked_day': unlocked_day(row[1]), 'existing': True})
            token = secrets.token_urlsafe(24)
            code = 'M' + secrets.token_hex(3).upper()
            cur.execute(
                f"INSERT INTO {t('marathon_participants')} (track, email, name, access_token, source, max_link_code) "
                f"VALUES (%s,%s,%s,%s,%s,%s)", (track, email, name, token, source, code))
            info = TRACKS[track]
            hello = f'{name}, добро пожаловать!' if name else 'Добро пожаловать на марафон!'
            text, html = letter(
                hello,
                [f'Вы зарегистрировались на бесплатный марафон «{info["title"]}». Первый урок уже открыт, '
                 'следующие будут открываться раз в сутки.',
                 f'Обещанный подарок — чек-лист «10 способов научить ребёнка быстро читать»: '
                 f'<a href="{CHECKLIST_URL}">скачать PDF</a>.',
                 'Сохраните это письмо: по кнопке ниже вы попадаете в личный кабинет марафона с любого устройства.'],
                'Открыть урок 1', cabinet_url(track, token))
            send_email(cur, email, f'Марафон скорочтения: урок 1 открыт + подарок', text.replace('<a href="' + CHECKLIST_URL + '">скачать PDF</a>', CHECKLIST_URL), html, 'marathon_welcome')
            conn.commit()
            return ok({'token': token, 'unlocked_day': 1, 'existing': False})
    finally:
        conn.close()


def load_participant(cur, token: str):
    cur.execute(
        f"SELECT id, track, email, name, started_at, completed_days, homework, max_link_code, max_chat_id "
        f"FROM {t('marathon_participants')} WHERE access_token=%s", (token,))
    return cur.fetchone()


def handle_me(token: str) -> dict:
    if not token:
        return err('Нужна ссылка доступа', 401)
    conn = db()
    try:
        with conn.cursor() as cur:
            p = load_participant(cur, token)
            if not p:
                return err('Участник не найден', 404)
            cur.execute(
                f"SELECT wpm, comprehension, created_at FROM {t('reading_tests')} WHERE participant_id=%s "
                f"ORDER BY created_at", (p[0],))
            tests = [{'wpm': r[0], 'comprehension': r[1], 'at': r[2]} for r in cur.fetchall()]
            return ok({
                'track': p[1], 'email': p[2], 'name': p[3], 'started_at': p[4],
                'unlocked_day': unlocked_day(p[4]), 'completed_days': p[5] or [], 'homework': p[6] or {},
                'max_link_code': p[7], 'max_linked': bool(p[8]),
                'max_bot': os.environ.get('MAX_BOT_USERNAME', ''), 'tests': tests,
            })
    finally:
        conn.close()


def handle_complete_day(body: dict) -> dict:
    token = body.get('token') or ''
    try:
        day = int(body.get('day') or 0)
    except (TypeError, ValueError):
        return err('Неверный день')
    homework = (body.get('homework') or '').strip()[:3000]
    conn = db()
    try:
        with conn.cursor() as cur:
            p = load_participant(cur, token)
            if not p:
                return err('Участник не найден', 404)
            if day < 1 or day > 3 or day > unlocked_day(p[4]):
                return err('Этот день ещё закрыт')
            done = sorted(set((p[5] or []) + [day]))
            hw = p[6] or {}
            if homework:
                hw[str(day)] = homework
            cur.execute(
                f"UPDATE {t('marathon_participants')} SET completed_days=%s::jsonb, homework=%s::jsonb, updated_at=NOW() "
                f"WHERE id=%s", (json.dumps(done), json.dumps(hw, ensure_ascii=False), p[0]))
            conn.commit()
            return ok({'completed_days': done})
    finally:
        conn.close()


def handle_reading_test(body: dict) -> dict:
    try:
        words = int(body.get('words') or 0)
        seconds = float(body.get('seconds') or 0)
        comprehension = max(0, min(100, int(body.get('comprehension') or 0)))
    except (TypeError, ValueError):
        return err('Неверные данные')
    if words <= 0 or seconds < 3 or seconds > 1800:
        return err('Неверные данные')
    wpm = int(round(words / seconds * 60))
    visitor = (body.get('visitor_id') or '')[:64]
    grade = (body.get('grade') or '')[:10]
    conn = db()
    try:
        with conn.cursor() as cur:
            pid = None
            token = body.get('token') or ''
            if token:
                p = load_participant(cur, token)
                pid = p[0] if p else None
            cur.execute(
                f"INSERT INTO {t('reading_tests')} (participant_id, visitor_id, grade, words, seconds, wpm, comprehension) "
                f"VALUES (%s,%s,%s,%s,%s,%s,%s)", (pid, visitor, grade, words, seconds, wpm, comprehension))
            conn.commit()
            return ok({'wpm': wpm, 'comprehension': comprehension})
    finally:
        conn.close()


def reminder_texts(track: str, day: int, name: str, token: str):
    info = TRACKS[track]
    who = f'{name}, ' if name else ''
    if day <= 3:
        title = f'Урок {day} открыт: {info["days"][day - 1]}'
        lines = [f'{who}новый урок марафона «{info["title"]}» уже ждёт вас. Займёт около 30 минут — '
                 'с упражнениями и ИИ-наставником.']
        button = f'Открыть урок {day}'
    else:
        title = 'Марафон пройден — ваш подарок внутри'
        lines = [f'{who}спасибо, что прошли марафон до конца!',
                 f'Для участников действует скидка 30% на курс «{info["offer"]}» по промокоду {PROMO}. '
                 '']
        button = 'Забрать скидку'
    url = cabinet_url(track, token)
    max_text = f'{title}\n\n' + '\n'.join(lines) + f'\n\n{url}'
    return title, lines, button, url, max_text


def handle_tick() -> dict:
    """Рассылает напоминание о каждом новом дне (2, 3) и финальное письмо со скидкой (день 4)."""
    conn = db()
    sent = 0
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, track, email, name, access_token, started_at, reminders_sent, max_chat_id "
                f"FROM {t('marathon_participants')} WHERE started_at > NOW() - INTERVAL '5 days' "
                f"AND started_at < NOW() - INTERVAL '24 hours' ORDER BY started_at LIMIT 40")
            for pid, track, email, name, token, started, done, chat in cur.fetchall():
                day = unlocked_day(started)
                done = done or []
                if day < 2 or day in done or track not in TRACKS:
                    continue
                title, lines, button, url, max_text = reminder_texts(track, day, name, token)
                text, html = letter(title, lines, button, url)
                send_email(cur, email, title, text, html, f'marathon_day{day}')
                if chat:
                    send_max(chat, max_text)
                cur.execute(
                    f"UPDATE {t('marathon_participants')} SET reminders_sent=%s::jsonb WHERE id=%s",
                    (json.dumps(done + [day]), pid))
                conn.commit()
                sent += 1
        return ok({'sent': sent})
    finally:
        conn.close()


def handle_stats(headers: dict) -> dict:
    key = headers.get('X-Admin-Key') or headers.get('x-admin-key') or ''
    if not key or key != os.environ.get('ADMIN_KEY', ''):
        return err('Нет доступа', 401)
    conn = db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT track, COUNT(*), COUNT(*) FILTER (WHERE jsonb_array_length(completed_days) >= 3), "
                f"COUNT(*) FILTER (WHERE max_chat_id IS NOT NULL) FROM {t('marathon_participants')} GROUP BY track")
            rows = [{'track': r[0], 'registered': r[1], 'finished': r[2], 'max_linked': r[3]} for r in cur.fetchall()]
            cur.execute(f"SELECT COUNT(*), COALESCE(ROUND(AVG(wpm)),0) FROM {t('reading_tests')}")
            tc, avg = cur.fetchone()
            return ok({'tracks': rows, 'reading_tests': tc, 'avg_wpm': avg})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """Марафон скорочтения: регистрация, кабинет, тест скорости, напоминания."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action') or ''
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}
    if not isinstance(body, dict):
        body = {}
    ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')

    if action == 'register':
        return handle_register(body, ip)
    if action == 'me':
        return handle_me(qs.get('token') or '')
    if action == 'complete_day':
        return handle_complete_day(body)
    if action == 'reading_test':
        return handle_reading_test(body)
    if action == 'tick':
        return handle_tick()
    if action == 'stats':
        return handle_stats(event.get('headers') or {})
    return err('Неизвестное действие', 404)
