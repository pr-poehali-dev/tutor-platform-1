"""Уведомления владельцу: в MAX и на почту. Ошибки доставки не роняют основной запрос."""
import json
import os
import smtplib
import ssl
import urllib.error
import urllib.request
from email.message import EmailMessage
from email.utils import formataddr

MAX_API = 'https://botapi.max.ru'


def _max_post(token: str, param: str, ident: str, text: str) -> bool:
    req = urllib.request.Request(f'{MAX_API}/messages?{param}={ident}',
                                 data=json.dumps({'text': text[:3900]}).encode('utf-8'), method='POST',
                                 headers={'Content-Type': 'application/json', 'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=4):
            return True
    except Exception as e:
        print(f'[notify] max {param}: {type(e).__name__}')
        return False


def to_max(text: str) -> bool:
    token = os.environ.get('MAX_BOT_TOKEN', '')
    ident = os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return False
    return _max_post(token, 'chat_id', ident, text) or _max_post(token, 'user_id', ident, text)


def owner_email() -> str:
    return (os.environ.get('SUPPORT_NOTIFY_EMAIL') or os.environ.get('SMTP_USER') or '').strip()


def to_email(subject: str, text: str, reply_to: str = '') -> bool:
    user = os.environ.get('SMTP_USER', '').strip()
    password = os.environ.get('SMTP_PASSWORD', '').strip()
    to = owner_email()
    if not (user and password and to):
        return False
    msg = EmailMessage()
    msg['Subject'] = subject[:200]
    msg['From'] = formataddr(('УЧИСЬПРО · поддержка', user))
    msg['To'] = to
    if reply_to:
        msg['Reply-To'] = reply_to
    msg.set_content(text)
    try:
        with smtplib.SMTP_SSL(os.environ.get('SMTP_HOST', 'smtp.yandex.ru'), int(os.environ.get('SMTP_PORT', '465')),
                              context=ssl.create_default_context(), timeout=6) as s:
            s.login(user, password)
            s.send_message(msg)
        return True
    except Exception as e:
        print(f'[notify] email: {type(e).__name__}')
        return False


def both(subject: str, text: str, reply_to: str = '') -> dict:
    """Сначала MAX (быстро), затем почта."""
    return {'max': to_max(f'{subject}\n\n{text}'), 'email': to_email(subject, text, reply_to)}
