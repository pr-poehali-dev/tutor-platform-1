"""
Уведомления пользователя и письма на почту.

GET  /?action=list                  X-Auth-Token   -> последние 30
GET  /?action=unread_count          X-Auth-Token   -> {count: N}
POST /?action=mark_read             X-Auth-Token   body: {id} | {all: true}
POST /?action=create                X-Admin-Key    body: {user_id, kind, title, body, icon, url}

ПОЧТА (email_log, password_resets):
POST /?action=reset_request                        body: {email}            -> письмо со ссылкой
POST /?action=reset_confirm                        body: {token, password}  -> смена пароля
POST /?action=welcome               X-Admin-Key    body: {user_id}
POST /?action=abandoned             X-Admin-Key                             -> брошенные заказы
POST /?action=paid                  X-Admin-Key    body: {email, amount, name, description}
POST /?action=mail_test             X-Admin-Key    body: {email}
GET  /?action=mail_status           X-Admin-Key                             -> диагностика SMTP
"""
import base64
import hashlib
import json
import os
import re
import secrets
import smtplib
import ssl
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr

import psycopg2

ADMIN_KEY = os.environ.get('ADMIN_KEY', '')

SITE_URL = 'https://xn--80ahdri7a.xn--p1ai'
SITE_NAME = 'УЧИСЬПРО'
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
RESET_TTL_HOURS = 2
ABANDON_MIN_AGE_H = 2
ABANDON_MAX_AGE_H = 72


def mail_creds():
    return os.environ.get('SMTP_USER', '').strip(), os.environ.get('SMTP_PASSWORD', '').strip()


def cors() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors(),
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(m: str, s: int = 400) -> dict:
    return ok({'error': m}, s)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token=%s LIMIT 1",
        (token,)
    )
    r = cur.fetchone()
    if not r:
        return None
    uid, exp, rev = r
    if rev is not None:
        return None
    if exp and exp < datetime.now(timezone.utc):
        return None
    return uid


def is_admin(headers: dict) -> bool:
    key = (headers.get('X-Admin-Key') or headers.get('x-admin-key') or '').strip()
    return bool(ADMIN_KEY) and key == ADMIN_KEY


def handle_list(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            cur.execute(
                "SELECT id, kind, title, body, icon, url, is_read, created_at "
                "FROM notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 30",
                (uid,)
            )
            items = [
                {
                    'id': r[0], 'kind': r[1], 'title': r[2], 'body': r[3] or '',
                    'icon': r[4] or 'Bell', 'url': r[5],
                    'is_read': bool(r[6]),
                    'created_at': r[7].isoformat() if r[7] else None,
                }
                for r in cur.fetchall()
            ]
            return ok({'items': items, 'authenticated': True})
    finally:
        conn.close()


def handle_unread_count(token: str) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return ok({'count': 0, 'authenticated': False})
            cur.execute(
                "SELECT COUNT(*) FROM notifications WHERE user_id=%s AND is_read=FALSE",
                (uid,)
            )
            cnt = cur.fetchone()[0]
            return ok({'count': cnt, 'authenticated': True})
    finally:
        conn.close()


def handle_mark_read(token: str, body: dict) -> dict:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            uid = resolve_user(cur, token)
            if not uid:
                return err('Требуется вход', 401)
            if body.get('all') is True:
                cur.execute(
                    "UPDATE notifications SET is_read=TRUE, read_at=NOW() "
                    "WHERE user_id=%s AND is_read=FALSE",
                    (uid,)
                )
            else:
                try:
                    notif_id = int(body.get('id'))
                except (TypeError, ValueError):
                    return err('id обязателен', 400)
                cur.execute(
                    "UPDATE notifications SET is_read=TRUE, read_at=NOW() "
                    "WHERE id=%s AND user_id=%s",
                    (notif_id, uid)
                )
            conn.commit()
            return ok({'ok': True})
    finally:
        conn.close()


def handle_create(headers: dict, body: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    try:
        user_id = int(body.get('user_id'))
    except (TypeError, ValueError):
        return err('user_id обязателен', 400)
    kind = (body.get('kind') or 'system').strip()[:40]
    title = (body.get('title') or '').strip()[:300]
    if not title:
        return err('title обязателен', 400)
    bd = (body.get('body') or '').strip()[:2000] or None
    icon = (body.get('icon') or 'Bell').strip()[:40]
    url = (body.get('url') or '').strip()[:500] or None
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO notifications (user_id, kind, title, body, icon, url) "
                "VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                (user_id, kind, title, bd, icon, url)
            )
            nid = cur.fetchone()[0]
            conn.commit()
            return ok({'ok': True, 'id': nid})
    finally:
        conn.close()


# ─────────────────────────── ШАБЛОН ───────────────────────────

def layout(title: str, body_html: str, cta_text: str = '', cta_url: str = '') -> str:
    """Письмо строится таблицами и инлайн-стилями: почтовые клиенты
    (особенно Mail.ru и Outlook) вырезают внешние стили и flex-вёрстку."""
    cta = ''
    if cta_text and cta_url:
        cta = (
            f'<table cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">'
            f'<tr><td align="center" bgcolor="#7C3AED" style="border-radius:10px;">'
            f'<a href="{cta_url}" style="display:inline-block;padding:14px 32px;'
            f'font-family:Arial,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;'
            f'text-decoration:none;border-radius:10px;">{cta_text}</a>'
            f'</td></tr></table>'
        )
    return f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title></head>
<body style="margin:0;padding:0;background:#F4F5F7;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F5F7;padding:24px 12px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#1E1B4B;padding:22px 32px;">
<span style="font-family:Arial,sans-serif;font-size:19px;font-weight:bold;color:#ffffff;letter-spacing:.5px;">{SITE_NAME}</span>
</td></tr>
<tr><td style="padding:32px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#1F2937;">
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#111827;">{title}</h1>
{body_html}
{cta}
</td></tr>
<tr><td style="padding:20px 32px;background:#F9FAFB;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#6B7280;">
{SITE_NAME} — онлайн-платформа с ИИ-репетитором.<br>
<a href="{SITE_URL}" style="color:#7C3AED;text-decoration:none;">учисьпро.рф</a>
</td></tr>
</table></td></tr></table></body></html>"""


def tpl_reset(name: str, link: str):
    who = f'{name}, ' if name else ''
    html = layout(
        'Восстановление пароля',
        f'<p style="margin:0 0 14px;">{who}вы запросили смену пароля на сайте {SITE_NAME}.</p>'
        f'<p style="margin:0 0 14px;">Нажмите кнопку — откроется страница, где можно задать новый пароль. '
        f'Ссылка действует {RESET_TTL_HOURS} часа и сработает один раз.</p>'
        f'<p style="margin:0;color:#6B7280;font-size:14px;">Если вы не запрашивали смену пароля — '
        f'просто удалите письмо. Ваш текущий пароль останется прежним.</p>',
        'Задать новый пароль', link)
    text = (f'{who}вы запросили смену пароля на сайте {SITE_NAME}.\n\n'
            f'Откройте ссылку и задайте новый пароль:\n{link}\n\n'
            f'Ссылка действует {RESET_TTL_HOURS} часа и сработает один раз.\n'
            f'Если вы не запрашивали смену — удалите письмо.')
    return 'Восстановление пароля — УЧИСЬПРО', html, text


def tpl_welcome(name: str):
    who = f'{name}, д' if name else 'Д'
    html = layout(
        'Добро пожаловать!',
        f'<p style="margin:0 0 14px;">{who}обро пожаловать в {SITE_NAME}.</p>'
        f'<p style="margin:0 0 14px;">Начать советуем с бесплатных курсов логики — они развивают '
        f'мышление, на котором держатся все остальные предметы:</p>'
        f'<ul style="margin:0 0 14px;padding-left:20px;">'
        f'<li style="margin-bottom:8px;"><a href="{SITE_URL}/kurs/logika-dlya-mladshih-golovolomki-i-zakonomernosti-37" style="color:#7C3AED;">Головоломки и закономерности</a> — 1–4 класс</li>'
        f'<li style="margin-bottom:8px;"><a href="{SITE_URL}/kurs/logika-5-8-klass-algoritmy-mnozhestva-i-kombinatorika-38" style="color:#7C3AED;">Алгоритмы и множества</a> — 5–8 класс</li>'
        f'<li><a href="{SITE_URL}/kurs/logika-i-kriticheskoe-myshlenie-10-11-klass-39" style="color:#7C3AED;">Логика и критическое мышление</a> — 10–11 класс</li>'
        f'</ul>'
        f'<p style="margin:0;">Все три бесплатны, оплата не потребуется ни на одном шаге.</p>',
        'Открыть каталог курсов', f'{SITE_URL}/courses')
    text = (f'Добро пожаловать в {SITE_NAME}!\n\n'
            f'Начните с бесплатных курсов логики:\n'
            f'{SITE_URL}/kurs/logika-dlya-mladshih-golovolomki-i-zakonomernosti-37\n'
            f'{SITE_URL}/kurs/logika-5-8-klass-algoritmy-mnozhestva-i-kombinatorika-38\n'
            f'{SITE_URL}/kurs/logika-i-kriticheskoe-myshlenie-10-11-klass-39\n\n'
            f'Каталог: {SITE_URL}/courses')
    return 'Добро пожаловать в УЧИСЬПРО', html, text


def tpl_abandoned(name: str, amount: float, pay_url: str):
    who = f'{name}, в' if name else 'В'
    amt = f'{amount:,.0f}'.replace(',', ' ')
    html = layout(
        'Вы не завершили оформление',
        f'<p style="margin:0 0 14px;">{who}ы начали оформлять заказ на {amt} ₽, но не завершили оплату.</p>'
        f'<p style="margin:0 0 14px;">Заказ сохранён — его можно оплатить по кнопке ниже.</p>'
        f'<p style="margin:0;color:#6B7280;font-size:14px;">Если передумали или возник вопрос — '
        f'просто ответьте на это письмо, мы поможем.</p>',
        'Завершить оплату', pay_url)
    text = (f'{who}ы начали оформлять заказ на {amt} ₽, но не завершили оплату.\n\n'
            f'Завершить: {pay_url}\n\nВопросы — ответьте на это письмо.')
    return 'Ваш заказ ждёт оплаты — УЧИСЬПРО', html, text


def tpl_paid(name: str, amount: float, description: str):
    who = f'{name}, с' if name else 'С'
    amt = f'{amount:,.0f}'.replace(',', ' ')
    html = layout(
        'Оплата прошла успешно',
        f'<p style="margin:0 0 14px;">{who}пасибо за покупку!</p>'
        f'<table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 18px;'
        f'background:#F9FAFB;border-radius:10px;">'
        f'<tr><td style="padding:16px;font-family:Arial,sans-serif;font-size:15px;color:#1F2937;">'
        f'<strong>{description}</strong><br>'
        f'<span style="color:#6B7280;">Сумма: {amt} ₽</span></td></tr></table>'
        f'<p style="margin:0;">Доступ уже открыт в личном кабинете.</p>',
        'Перейти к обучению', f'{SITE_URL}/my-courses')
    text = (f'{who}пасибо за покупку!\n\n{description}\nСумма: {amt} ₽\n\n'
            f'Доступ открыт: {SITE_URL}/my-courses')
    return 'Оплата прошла — доступ открыт', html, text


# ─────────────────────────── ОТПРАВКА ───────────────────────────

def send_mail(cur, to_email: str, kind: str, subject: str, html: str, text: str,
              user_id=None, order_id=None) -> tuple:
    """Отправляет письмо и пишет результат в журнал. Возвращает (успех, причина)."""
    user, password = mail_creds()
    if not user or not password:
        cur.execute(
            "INSERT INTO email_log (to_email, kind, subject, status, error, user_id, order_id) "
            "VALUES (%s,%s,%s,'failed','SMTP не настроен: нет SMTP_USER/SMTP_PASSWORD',%s,%s)",
            (to_email[:320], kind, subject[:400], user_id, order_id))
        return False, 'smtp_not_configured'

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = formataddr((SITE_NAME, user))
    msg['To'] = to_email
    msg.set_content(text)
    msg.add_alternative(html, subtype='html')

    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=20) as s:
            s.login(user, password)
            s.send_message(msg)
        cur.execute(
            "INSERT INTO email_log (to_email, kind, subject, status, user_id, order_id) "
            "VALUES (%s,%s,%s,'sent',%s,%s)",
            (to_email[:320], kind, subject[:400], user_id, order_id))
        return True, 'sent'
    except Exception as e:
        cur.execute(
            "INSERT INTO email_log (to_email, kind, subject, status, error, user_id, order_id) "
            "VALUES (%s,%s,%s,'failed',%s,%s,%s)",
            (to_email[:320], kind, subject[:400], str(e)[:900], user_id, order_id))
        return False, str(e)[:200]


# ─────────────────────────── ДЕЙСТВИЯ ───────────────────────────

def handle_reset_request(body, source_ip):
    """Запрос ссылки на смену пароля. Всегда отвечает одинаково — иначе по ответу
    можно проверить, зарегистрирован ли человек на сайте."""
    email = (body.get('email') or '').strip().lower()
    if not EMAIL_RE.match(email):
        return err('Введите корректный email')

    neutral = {'ok': True, 'message': 'Если такой адрес зарегистрирован, письмо отправлено'}
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM auth_users WHERE LOWER(email)=%s LIMIT 1", (email,))
        row = cur.fetchone()
        if not row:
            conn.commit()
            return ok(neutral)
        uid, name = row

        cur.execute(
            "SELECT count(*) FROM password_resets WHERE user_id=%s AND created_at > NOW() - interval '15 minutes'",
            (uid,))
        if cur.fetchone()[0] >= 3:
            conn.commit()
            return ok(neutral)

        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expires = datetime.now(timezone.utc) + timedelta(hours=RESET_TTL_HOURS)
        cur.execute(
            "INSERT INTO password_resets (user_id, token_hash, expires_at, request_ip) "
            "VALUES (%s,%s,%s,%s)", (uid, token_hash, expires, (source_ip or '')[:64]))

        link = f'{SITE_URL}/reset-password?token={token}'
        subject, html, text = tpl_reset(name or '', link)
        send_mail(cur, email, 'password_reset', subject, html, text, user_id=uid)
        conn.commit()
        return ok(neutral)
    finally:
        conn.close()


def handle_reset_confirm(body):
    """Установка нового пароля по токену из письма."""
    token = (body.get('token') or '').strip()
    password = body.get('password') or ''
    if not token:
        return err('Ссылка недействительна')
    if len(password) < 6:
        return err('Пароль должен быть не короче 6 символов')

    token_hash = hashlib.sha256(token.encode()).hexdigest()
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash=%s LIMIT 1",
            (token_hash,))
        row = cur.fetchone()
        if not row:
            return err('Ссылка недействительна или устарела', 400)
        rid, uid, expires, used = row
        if used is not None:
            return err('Ссылка уже использована. Запросите новую.', 400)
        if expires < datetime.now(timezone.utc):
            return err('Срок действия ссылки истёк. Запросите новую.', 400)

        # Хеш формируем так же, как в auth: pbkdf2_sha256$iters$salt$hash
        # Параметры ОБЯЗАНЫ совпадать с backend/auth (PBKDF2_ITERATIONS=200_000,
        # SALT_BYTES=16, sha256) — иначе с новым паролем не получится войти.
        salt = secrets.token_bytes(16)
        iters = 200_000
        digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iters)
        pwd_hash = 'pbkdf2_sha256${}${}${}'.format(
            iters, base64.b64encode(salt).decode(), base64.b64encode(digest).decode())

        cur.execute("UPDATE auth_users SET password_hash=%s WHERE id=%s", (pwd_hash, uid))
        cur.execute("UPDATE password_resets SET used_at=NOW() WHERE id=%s", (rid,))
        # Прочие активные ссылки гасим — ими уже нельзя воспользоваться.
        cur.execute(
            "UPDATE password_resets SET used_at=NOW() WHERE user_id=%s AND used_at IS NULL AND id<>%s",
            (uid, rid))
        conn.commit()
        return ok({'ok': True, 'message': 'Пароль изменён. Теперь можно войти.'})
    finally:
        conn.close()


def handle_welcome(body, headers):
    """Приветственное письмо после регистрации."""
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    uid = body.get('user_id')
    if not uid:
        return err('Нужен user_id')
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT email, name, welcome_mailed_at FROM auth_users WHERE id=%s LIMIT 1", (uid,))
        row = cur.fetchone()
        if not row or not row[0]:
            return err('Пользователь не найден', 404)
        email, name, mailed = row
        if mailed is not None:
            return ok({'ok': True, 'skipped': 'already_sent'})
        subject, html, text = tpl_welcome(name or '')
        sent, reason = send_mail(cur, email, 'welcome', subject, html, text, user_id=uid)
        if sent:
            cur.execute("UPDATE auth_users SET welcome_mailed_at=NOW() WHERE id=%s", (uid,))
        conn.commit()
        return ok({'ok': sent, 'reason': reason})
    finally:
        conn.close()


def handle_abandoned(headers):
    """Напоминание о незавершённых заказах. Берём заказы старше 2 часов и
    младше 3 суток — раньше человек ещё оформляет, позже напоминание неуместно."""
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, user_email, user_name, amount, payment_url FROM orders "
            "WHERE status='pending' AND abandon_mailed_at IS NULL "
            "AND payment_url IS NOT NULL AND user_email IS NOT NULL "
            "AND created_at < NOW() - (%s || ' hours')::interval "
            "AND created_at > NOW() - (%s || ' hours')::interval "
            "AND user_email NOT LIKE %s AND user_email NOT LIKE %s "
            "AND COALESCE(user_name,'') NOT LIKE %s "
            "ORDER BY id DESC LIMIT 50",
            (str(ABANDON_MIN_AGE_H), str(ABANDON_MAX_AGE_H),
             '%@uchispro.ru', '%@example.com', '%СЛУЖЕБНАЯ%'))
        rows = cur.fetchall()
        sent_n = 0
        for oid, email, name, amount, pay_url in rows:
            subject, html, text = tpl_abandoned(name or '', float(amount or 0), pay_url)
            sent, _ = send_mail(cur, email, 'abandoned_cart', subject, html, text, order_id=oid)
            cur.execute("UPDATE orders SET abandon_mailed_at=NOW() WHERE id=%s", (oid,))
            if sent:
                sent_n += 1
        conn.commit()
        return ok({'ok': True, 'candidates': len(rows), 'sent': sent_n})
    finally:
        conn.close()


def handle_paid(body, headers):
    """Письмо о доступе после успешной оплаты. Вызывается вебхуком ЮKassa."""
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    email = (body.get('email') or '').strip()
    if not EMAIL_RE.match(email):
        return err('Нужен корректный email')
    amount = float(body.get('amount') or 0)
    name = (body.get('name') or '').strip()
    description = (body.get('description') or 'Заказ курса').strip()[:200]
    order_id = body.get('order_id')
    conn = get_db()
    try:
        cur = conn.cursor()
        subject, html, text = tpl_paid(name, amount, description)
        sent, reason = send_mail(cur, email, 'order_paid', subject, html, text, order_id=order_id)
        conn.commit()
        return ok({'ok': sent, 'reason': reason})
    finally:
        conn.close()


def handle_mail_status(headers):
    """Диагностика: настроен ли SMTP и что уходило последним."""
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    user, password = mail_creds()
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT kind, status, count(*) FROM email_log "
                    "WHERE created_at > NOW() - interval '30 days' GROUP BY 1,2 ORDER BY 3 DESC")
        stats = [{'kind': k, 'status': s, 'count': c} for k, s, c in cur.fetchall()]
        cur.execute("SELECT to_email, kind, status, error, created_at FROM email_log "
                    "ORDER BY id DESC LIMIT 10")
        last = [{'to': t, 'kind': k, 'status': s, 'error': e, 'at': d}
                for t, k, s, e, d in cur.fetchall()]
        return ok({'smtp_configured': bool(user and password),
                   'smtp_host': SMTP_HOST, 'smtp_port': SMTP_PORT,
                   'sender': user or None, 'stats_30d': stats, 'last': last})
    finally:
        conn.close()


def handle_mail_test(body, headers):
    """Пробное письмо — проверить, что SMTP работает."""
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    to = (body.get('email') or '').strip()
    if not EMAIL_RE.match(to):
        return err('Нужен корректный email')
    conn = get_db()
    try:
        cur = conn.cursor()
        subject, html, text = tpl_reset('', f'{SITE_URL}/reset-password?token=TEST')
        sent, reason = send_mail(cur, to, 'test', 'Проверка почты — УЧИСЬПРО', html, text)
        conn.commit()
        return ok({'ok': sent, 'reason': reason})
    finally:
        conn.close()



def handler(event: dict, context) -> dict:
    """Уведомления пользователя."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'list').strip()
    headers = event.get('headers') or {}
    token = (headers.get('X-Auth-Token') or headers.get('x-auth-token') or '').strip()
    raw = event.get('body') or '{}'
    if event.get('isBase64Encoded'):
        try:
            raw = base64.b64decode(raw).decode('utf-8', 'replace')
        except Exception:
            raw = '{}'
    try:
        body = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        body = {}
    if not isinstance(body, dict):
        body = {}

    if action == 'list':
        return handle_list(token)
    if action == 'unread_count':
        return handle_unread_count(token)
    if action == 'mark_read' and method == 'POST':
        return handle_mark_read(token, body)
    if action == 'create' and method == 'POST':
        return handle_create(headers, body)

    source_ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')
    if action == 'reset_request' and method == 'POST':
        return handle_reset_request(body, source_ip)
    if action == 'reset_confirm' and method == 'POST':
        return handle_reset_confirm(body)
    if action == 'welcome' and method == 'POST':
        return handle_welcome(body, headers)
    if action == 'abandoned' and method == 'POST':
        return handle_abandoned(headers)
    if action == 'paid' and method == 'POST':
        return handle_paid(body, headers)
    if action == 'mail_test' and method == 'POST':
        return handle_mail_test(body, headers)
    if action == 'mail_status':
        return handle_mail_status(headers)

    return err('Неизвестное действие', 404)