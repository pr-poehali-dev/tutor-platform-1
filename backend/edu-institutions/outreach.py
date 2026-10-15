"""Рассылка директорам школ: письмо о пилотном проекте, отправка партиями, журнал, отписка."""
import os
import smtplib
import ssl
import time
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from html import escape

SITE = 'https://xn--h1amcedk2a6b.xn--p1ai'
SITE_LABEL = 'учисьпро.рф'
CAMPAIGN = 'samara_pilot_2026'
SUBJECT = 'Бесплатный ИИ-помощник для учеников вашей школы — пилотный проект в Самаре'
BATCH_MAX = 15
PAUSE_SEC = 0.25


def smtp_creds():
    return os.environ.get('SMTP_USER', '').strip(), os.environ.get('SMTP_PASSWORD', '').strip()


def greeting(director: str) -> str:
    parts = (director or '').split()
    if len(parts) >= 3:
        mid = parts[2].lower()
        if mid.endswith(('вна', 'чна', 'кызы')):
            return f'Уважаемая {parts[1]} {parts[2]}!'
        if mid.endswith(('вич', 'ич', 'оглы')):
            return f'Уважаемый {parts[1]} {parts[2]}!'
        return f'Здравствуйте, {parts[1]} {parts[2]}!'
    return 'Уважаемый руководитель!'


def build_letter(inst: dict, unsub_url: str):
    g = greeting(inst.get('contact_name', ''))
    deck = f'{SITE}/for-schools/presentation'
    article = f'{SITE}/feed/pilotnyy-proekt-uchispro-dlya-shkol-samary'
    samara = f'{SITE}/samara'
    reply = smtp_creds()[0]

    text = f"""{g}

Пишу вам от образовательной платформы УЧИСЬПРО ({SITE_LABEL}). В 2026/27 учебном году мы проводим пилотный проект со школами Самары и приглашаем {inst.get('org_name') or 'вашу школу'} принять участие.

Что получают ученики — бесплатно до 31 мая 2027 года:
— ИИ-наставник 24/7: объясняет тему простыми словами и ведёт к ответу наводящими вопросами, а не выдаёт готовое решение;
— разбор домашнего задания по фото — по шагам, чтобы понять ход решения;
— курсы 1–11 класса по основным предметам, подготовка к ОГЭ и ЕГЭ.

Для школы участие тоже бесплатное: без договоров, закупок и абонентской платы. Учителям не добавляется работы — достаточно один раз рассказать классу о пилоте. Персональные данные обрабатываются по 152-ФЗ.

Как подключиться: ученик открывает {SITE_LABEL}/samara, входит и активирует промокод САМАРА.

Презентация для директора (5 минут): {deck}
Подробнее о пилоте: {article}

Если идея вам интересна, ответьте на это письмо — пришлём готовые тексты для школьных чатов и памятку для родителей, назначим удобное время для короткого звонка.

С уважением,
команда УЧИСЬПРО
{SITE_LABEL}

—
Вы получили это письмо, потому что адрес вашей школы опубликован в официальном справочнике образовательных организаций Самары. Больше не присылать письма: {unsub_url}
"""

    li = lambda s: f'<li style="margin:0 0 6px">{s}</li>'
    html = f"""<!doctype html><html><body style="margin:0;background:#f4f2fb;font-family:Arial,Helvetica,sans-serif;color:#1f1b2e">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2fb;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:22px 28px;color:#fff">
<div style="font-size:20px;font-weight:bold">УЧИСЬПРО</div>
<div style="font-size:14px;opacity:.9;margin-top:4px">Пилотный проект для школ Самары · 2026/27</div></td></tr>
<tr><td style="padding:26px 28px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{escape(g)}</p>
<p style="margin:0 0 14px">Пишу вам от образовательной платформы УЧИСЬПРО. В 2026/27 учебном году мы проводим пилотный проект со школами Самары и приглашаем <b>{escape(inst.get('org_name') or 'вашу школу')}</b> принять участие.</p>
<p style="margin:0 0 8px"><b>Что получают ученики — бесплатно до 31 мая 2027 года:</b></p>
<ul style="margin:0 0 14px;padding-left:20px">
{li('<b>ИИ-наставник 24/7</b> — объясняет тему простыми словами и ведёт к ответу наводящими вопросами, а не выдаёт готовое решение;')}
{li('<b>разбор домашнего задания по фото</b> — по шагам, чтобы понять ход решения;')}
{li('<b>курсы 1–11 класса</b> по основным предметам, подготовка к ОГЭ и ЕГЭ.')}
</ul>
<p style="margin:0 0 14px">Для школы участие тоже бесплатное: <b>без договоров, закупок и абонентской платы</b>. Учителям не добавляется работы — достаточно один раз рассказать классу о пилоте. Персональные данные обрабатываются по 152-ФЗ.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin:0 0 18px"><tr><td style="padding:14px 16px;font-size:14px">
Как подключиться: ученик открывает <a href="{samara}" style="color:#6d28d9">{SITE_LABEL}/samara</a>, входит и активирует промокод
<span style="display:inline-block;background:#7c3aed;color:#fff;font-weight:bold;letter-spacing:1px;padding:3px 10px;border-radius:6px">САМАРА</span></td></tr></table>
<p style="margin:0 0 20px;text-align:center">
<a href="{deck}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Смотреть презентацию для директора</a></p>
<p style="margin:0 0 14px">Подробнее о пилоте — в <a href="{article}" style="color:#6d28d9">статье на сайте</a>.</p>
<p style="margin:0 0 14px">Если идея вам интересна, просто <b>ответьте на это письмо</b> — пришлём готовые тексты для школьных чатов и памятку для родителей, назначим удобное время для короткого звонка.</p>
<p style="margin:0">С уважением,<br>команда УЧИСЬПРО<br><a href="{SITE}" style="color:#6d28d9">{SITE_LABEL}</a></p>
</td></tr>
<tr><td style="padding:16px 28px;background:#faf9fd;color:#8a849c;font-size:12px;line-height:1.5">
Вы получили это письмо, потому что адрес вашей школы опубликован в официальном справочнике образовательных организаций Самары.
<a href="{unsub_url}" style="color:#8a849c">Больше не присылать письма</a>.</td></tr>
</table></td></tr></table></body></html>"""
    return SUBJECT, html, text, reply


def send_one(smtp, to_email: str, subject: str, html: str, text: str, unsub_url: str, reply_to: str):
    user = smtp_creds()[0]
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = formataddr(('УЧИСЬПРО', user))
    msg['To'] = to_email
    if reply_to:
        msg['Reply-To'] = reply_to
    msg['Message-ID'] = make_msgid(domain=user.split('@')[-1] if '@' in user else None)
    msg['List-Unsubscribe'] = f'<{unsub_url}>'
    msg['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
    msg.set_content(text)
    msg.add_alternative(html, subtype='html')
    smtp.send_message(msg)


def open_smtp():
    user, password = smtp_creds()
    host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
    port = int(os.environ.get('SMTP_PORT', '465'))
    s = smtplib.SMTP_SSL(host, port, context=ssl.create_default_context(), timeout=15)
    s.login(user, password)
    return s


def pause():
    time.sleep(PAUSE_SEC)
