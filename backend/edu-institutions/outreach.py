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
SUBJECT = 'Директору школы: бесплатный доступ для учеников по промокоду САМАРА — пилотный проект 2026/27'

SAMARA = {'slug': 'samara', 'name': 'Самара', 'name_in': 'в Самаре', 'name_gen': 'Самары',
          'promo_code': 'САМАРА', 'campaign_code': CAMPAIGN}


def subject_for(city: dict) -> str:
    return (f"Директору школы: бесплатный доступ для учеников по промокоду {city['promo_code']} "
            f"— пилотный проект 2026/27")


def page_slug(city: dict) -> str:
    """Регионы пользуются страницей, листовкой и презентацией своего областного центра."""
    return city.get('page_slug') or city['slug']


def city_path(city: dict) -> str:
    slug = page_slug(city)
    return '/samara' if slug == 'samara' else f"/pilot/{slug}"
# Отправка «как человек»: небольшие партии и пауза между письмами.
# 16.10 при ~25 письмах в минуту Яндекс начал отклонять письма как спам (554 5.7.1).
BATCH_MAX = 10
PAUSE_SEC = 1.5
# После отказа «подозрение на спам» — пауза во всей рассылке, чтобы восстановилась репутация ящика.
SPAM_COOLDOWN_MIN = 60
# Сколько раз пробовать одну школу, прежде чем убрать её из очереди.
MAX_ATTEMPTS = 3


def is_spam_reject(msg: str) -> bool:
    return '5.7.1' in msg or 'spam' in msg.lower()


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


def build_letter(inst: dict, unsub_url: str, city: dict = None):
    city = city or SAMARA
    promo = city['promo_code']
    gen = city['name_gen']
    g = greeting(inst.get('contact_name', ''))
    school = inst.get('org_name') or 'вашей школы'
    deck = f'{SITE}/for-schools/presentation' + ('' if page_slug(city) == 'samara' else f"/{page_slug(city)}")
    path = city_path(city)
    page = f'{SITE}{path}'
    page_label = f'{SITE_LABEL}{path}'
    reply = smtp_creds()[0]

    chat = (f'Ученики нашей школы участвуют в пилотном проекте УЧИСЬПРО. До 31 мая 2027 года бесплатно доступны '
            f'ИИ-наставник по школьным предметам и курсы 1–11 класса с подготовкой к ОГЭ и ЕГЭ. '
            f'Как подключиться: откройте {page_label}, зарегистрируйтесь и введите промокод {promo}.')

    text = f"""{g}

Обращаюсь к вам как к руководителю {school}. Образовательная платформа УЧИСЬПРО ({SITE_LABEL}) проводит в 2026/27 учебном году пилотный проект для школ {gen} и предлагает бесплатный доступ для всех учеников вашей школы.

ЧТО ПОЛУЧАЮТ УЧЕНИКИ — БЕСПЛАТНО ДО 31 МАЯ 2027 ГОДА
— ИИ-наставник по школьным предметам 24/7: объясняет тему простыми словами и ведёт к ответу наводящими вопросами, а не выдаёт готовое решение;
— разбор домашнего задания по фото — по шагам;
— курсы 1–11 класса: математика, русский язык, физика, химия, биология, информатика, история; подготовка к ОГЭ и ЕГЭ.

КАК УЧЕНИКУ ПОЛУЧИТЬ ДОСТУП (2 минуты)
1. Открыть {page_label}
2. Зарегистрироваться (email или Яндекс ID)
3. Ввести промокод {promo} — доступ откроется сразу до 31.05.2027

ЧТО НУЖНО ОТ ШКОЛЫ
Только передать ученикам и родителям промокод — например, через классных руководителей. Для школы участие бесплатное: без договоров, закупок и абонентской платы; дополнительной нагрузки на учителей нет. Персональные данные обрабатываются по 152-ФЗ.

Готовый текст для школьных и родительских чатов:
«{chat}»

Презентация для директора (5 минут): {deck}

Если хотите подключить школу официально, получить памятку для родителей или задать вопросы — просто ответьте на это письмо.

С уважением,
команда УЧИСЬПРО
{SITE_LABEL}

—
Вы получили это письмо, потому что адрес вашей школы опубликован в официальном справочнике образовательных организаций. Больше не присылать письма: {unsub_url}
"""

    li = lambda s: f'<li style="margin:0 0 6px">{s}</li>'
    html = f"""<!doctype html><html><body style="margin:0;background:#f4f2fb;font-family:Arial,Helvetica,sans-serif;color:#1f1b2e">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2fb;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#6d28d9;background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:22px 28px;color:#fff">
<div style="font-size:20px;font-weight:bold">УЧИСЬПРО</div>
<div style="font-size:14px;opacity:.9;margin-top:4px">Пилотный проект для школ {escape(gen)} · 2026/27 учебный год</div></td></tr>
<tr><td style="padding:26px 28px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{escape(g)}</p>
<p style="margin:0 0 16px">Обращаюсь к вам как к руководителю <b>{escape(school)}</b>. Образовательная платформа УЧИСЬПРО проводит в 2026/27 учебном году пилотный проект для школ {gen} и предлагает <b>бесплатный доступ для всех учеников вашей школы</b>.</p>
<p style="margin:0 0 8px"><b>Что получают ученики — бесплатно до 31 мая 2027 года:</b></p>
<ul style="margin:0 0 18px;padding-left:20px">
{li('<b>ИИ-наставник по школьным предметам 24/7</b> — объясняет тему простыми словами и ведёт к ответу наводящими вопросами, а не выдаёт готовое решение;')}
{li('<b>разбор домашнего задания по фото</b> — по шагам;')}
{li('<b>курсы 1–11 класса</b>: математика, русский язык, физика, химия, биология, информатика, история; подготовка к ОГЭ и ЕГЭ.')}
</ul>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin:0 0 18px"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.6">
<div style="font-size:15px;font-weight:bold;margin:0 0 8px">Как ученику получить доступ — 2 минуты</div>
1. Открыть <a href="{page}" style="color:#6d28d9;font-weight:bold">{escape(page_label)}</a><br>
2. Зарегистрироваться (email или Яндекс ID)<br>
3. Ввести промокод <span style="display:inline-block;background:#7c3aed;color:#fff;font-weight:bold;letter-spacing:1px;padding:2px 10px;border-radius:6px">{escape(promo)}</span> — доступ откроется сразу до 31.05.2027
</td></tr></table>
<p style="margin:0 0 8px"><b>Что нужно от школы</b></p>
<p style="margin:0 0 16px">Только передать ученикам и родителям промокод — например, через классных руководителей. Для школы участие бесплатное: <b>без договоров, закупок и абонентской платы</b>, дополнительной нагрузки на учителей нет. Персональные данные обрабатываются по 152-ФЗ.</p>
<p style="margin:0 0 6px;font-size:13px;color:#5b5670">Готовый текст для школьных и родительских чатов:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-left:4px solid #06b6d4;margin:0 0 20px"><tr><td style="padding:12px 14px;font-size:14px;line-height:1.55;color:#334155">{escape(chat)}</td></tr></table>
<p style="margin:0 0 20px;text-align:center">
<a href="{deck}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Презентация для директора — 5 минут</a></p>
<p style="margin:0 0 14px">Если хотите подключить школу официально, получить памятку для родителей или задать вопросы — просто <b>ответьте на это письмо</b>.</p>
<p style="margin:0">С уважением,<br>команда УЧИСЬПРО<br><a href="{SITE}" style="color:#6d28d9">{SITE_LABEL}</a></p>
</td></tr>
<tr><td style="padding:16px 28px;background:#faf9fd;color:#8a849c;font-size:12px;line-height:1.5">
Вы получили это письмо, потому что адрес вашей школы опубликован в официальном справочнике образовательных организаций.
<a href="{unsub_url}" style="color:#8a849c">Больше не присылать письма</a>.</td></tr>
</table></td></tr></table></body></html>"""
    return subject_for(city), html, text, reply


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
