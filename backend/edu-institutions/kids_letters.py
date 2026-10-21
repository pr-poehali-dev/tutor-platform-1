"""Письма пилота «Малыш»: детским садам (промокод МАЛЫШ до 31.05.2027) и детским домам (бессрочно)."""
from html import escape

import outreach

SITE = outreach.SITE
SITE_LABEL = outreach.SITE_LABEL

KIDS_CAMPAIGN = 'kids_pilot_2026'
CARE_CAMPAIGN = 'care_2026'
KIDS_PROMO = 'МАЛЫШ'
CARE_PROMO = 'КАЖДЫЙ РЕБЁНОК'


def _wrap(head: str, sub: str, body_html: str, unsub_url: str, why: str) -> str:
    return f"""<!doctype html><html><body style="margin:0;background:#fdf2f8;font-family:Arial,Helvetica,sans-serif;color:#2a1b33">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#be185d;background:linear-gradient(135deg,#db2777,#f59e0b);padding:22px 28px;color:#fff">
<div style="font-size:20px;font-weight:bold">{escape(head)}</div>
<div style="font-size:14px;opacity:.92;margin-top:4px">{escape(sub)}</div></td></tr>
<tr><td style="padding:26px 28px;font-size:15px;line-height:1.55">{body_html}</td></tr>
<tr><td style="padding:16px 28px;background:#fdf7fb;color:#8a7a94;font-size:12px;line-height:1.5">
{escape(why)} <a href="{unsub_url}" style="color:#8a7a94">Больше не присылать письма</a>.</td></tr>
</table></td></tr></table></body></html>"""


def _li(s: str) -> str:
    return f'<li style="margin:0 0 6px">{s}</li>'


def _promo_box(page: str, page_label: str, promo: str, until: str, who: str) -> str:
    return (f'<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border:1px solid #fbcfe8;'
            f'border-radius:12px;margin:0 0 18px"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.6">'
            f'<div style="font-size:15px;font-weight:bold;margin:0 0 8px">Как {who} получить доступ — 2 минуты</div>'
            f'1. Открыть <a href="{page}" style="color:#be185d;font-weight:bold">{escape(page_label)}</a><br>'
            f'2. Зарегистрироваться (email или Яндекс ID)<br>'
            f'3. Ввести промокод <span style="display:inline-block;background:#db2777;color:#fff;font-weight:bold;'
            f'letter-spacing:1px;padding:2px 10px;border-radius:6px">{escape(promo)}</span> — доступ откроется сразу {escape(until)}'
            f'</td></tr></table>')


def _button(url: str, label: str) -> str:
    return (f'<p style="margin:0 0 20px;text-align:center"><a href="{url}" style="display:inline-block;background:#db2777;'
            f'color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">{escape(label)}</a></p>')


def kindergarten_letter(inst: dict, unsub_url: str):
    g = outreach.greeting(inst.get('contact_name', ''))
    org = inst.get('org_name') or 'вашего детского сада'
    page = f'{SITE}/malysh'
    page_label = f'{SITE_LABEL}/malysh'
    deck = f'{SITE}/for-kindergartens/presentation'
    reply = outreach.smtp_creds()[0]
    subject = 'Заведующему детским садом: «Малыш» бесплатно для семей воспитанников — промокод МАЛЫШ'
    chat = ('Наш детский сад участвует в пилотном проекте УЧИСЬПРО. До 31 мая 2027 года бесплатно доступен раздел '
            '«Малыш»: развивающие занятия, сказки с озвучкой, игры и обучение чтению для детей 1–7 лет. '
            f'Откройте {page_label}, зарегистрируйтесь и введите промокод {KIDS_PROMO}.')
    why = 'Вы получили это письмо, потому что адрес вашей организации опубликован в официальном реестре.'

    text = f"""{g}

Обращаюсь к вам как к руководителю {org}. Образовательная платформа УЧИСЬПРО ({SITE_LABEL}) проводит в 2026/27 учебном году пилотный проект «Малыш» для детских садов и предлагает бесплатный доступ для всех семей ваших воспитанников.

ЧТО ПОЛУЧАЮТ ДЕТИ И РОДИТЕЛИ — БЕСПЛАТНО ДО 31 МАЯ 2027 ГОДА
— 25 развивающих занятий для детей 1–7 лет: речь, логика и счёт, моторика, окружающий мир, творчество;
— 48 сказок и стихов с озвучкой, песенки, потешки и пальчиковые игры;
— обучение чтению: 10 ступенек от звуков до предложений;
— 15 игр на внимание, память и логику;
— без рекламы, с контролем экранного времени по нормам СанПиН.

КАК РОДИТЕЛЮ ПОЛУЧИТЬ ДОСТУП (2 минуты)
1. Открыть {page_label}
2. Зарегистрироваться (email или Яндекс ID)
3. Ввести промокод {KIDS_PROMO} — доступ откроется сразу до 31.05.2027

ЧТО НУЖНО ОТ ДЕТСКОГО САДА
Только передать родителям промокод — например, в родительских чатах групп. Для сада участие бесплатное: без договоров, закупок и абонентской платы, дополнительной нагрузки на воспитателей нет. Карта родителям не нужна, ничего не спишется.

Готовый текст для родительских чатов:
«{chat}»

Презентация для заведующего (5 минут): {deck}

Если хотите подключить детский сад официально или задать вопросы — просто ответьте на это письмо.

С уважением,
команда УЧИСЬПРО
{SITE_LABEL}

—
{why} Больше не присылать письма: {unsub_url}
"""
    body = f"""<p style="margin:0 0 14px">{escape(g)}</p>
<p style="margin:0 0 16px">Обращаюсь к вам как к руководителю <b>{escape(org)}</b>. Образовательная платформа УЧИСЬПРО проводит в 2026/27 учебном году пилотный проект «Малыш» для детских садов и предлагает <b>бесплатный доступ для всех семей ваших воспитанников</b>.</p>
<p style="margin:0 0 8px"><b>Что получают дети и родители — бесплатно до 31 мая 2027 года:</b></p>
<ul style="margin:0 0 18px;padding-left:20px">
{_li('<b>25 развивающих занятий</b> для детей 1–7 лет: речь, логика и счёт, моторика, окружающий мир, творчество;')}
{_li('<b>48 сказок и стихов с озвучкой</b>, песенки, потешки и пальчиковые игры;')}
{_li('<b>обучение чтению</b>: 10 ступенек от звуков до предложений;')}
{_li('<b>15 игр</b> на внимание, память и логику;')}
{_li('<b>без рекламы</b>, с контролем экранного времени по нормам СанПиН.')}
</ul>
{_promo_box(page, page_label, KIDS_PROMO, 'до 31.05.2027', 'родителю')}
<p style="margin:0 0 8px"><b>Что нужно от детского сада</b></p>
<p style="margin:0 0 16px">Только передать родителям промокод — например, в чатах групп. Для сада участие бесплатное: <b>без договоров, закупок и абонентской платы</b>, нагрузки на воспитателей нет. Карта родителям не нужна.</p>
<p style="margin:0 0 6px;font-size:13px;color:#6b5b75">Готовый текст для родительских чатов:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-left:4px solid #f59e0b;margin:0 0 20px"><tr><td style="padding:12px 14px;font-size:14px;line-height:1.55;color:#44403c">{escape(chat)}</td></tr></table>
{_button(deck, 'Презентация для заведующего — 5 минут')}
<p style="margin:0 0 14px">Если хотите подключить детский сад официально или задать вопросы — просто <b>ответьте на это письмо</b>.</p>
<p style="margin:0">С уважением,<br>команда УЧИСЬПРО<br><a href="{SITE}" style="color:#be185d">{SITE_LABEL}</a></p>"""
    html = _wrap('УЧИСЬПРО · Малыш', 'Пилотный проект для детских садов · 2026/27 учебный год', body, unsub_url, why)
    return subject, html, text, reply


def care_letter(inst: dict, unsub_url: str):
    g = outreach.greeting(inst.get('contact_name', ''))
    org = inst.get('org_name') or 'вашего учреждения'
    page = f'{SITE}/kazhdyj-rebenok'
    page_label = f'{SITE_LABEL}/kazhdyj-rebenok'
    deck = f'{SITE}/for-kindergartens/presentation/care'
    reply = outreach.smtp_creds()[0]
    subject = 'Бесплатное обучение для ваших воспитанников — без срока и без оплаты'
    why = 'Вы получили это письмо, потому что адрес вашей организации опубликован в официальном реестре.'

    text = f"""{g}

Обращаюсь к вам как к руководителю {org}. Мы — образовательная платформа УЧИСЬПРО ({SITE_LABEL}). Мы убеждены, что между детьми не должно быть разницы: каждый ребёнок достоин хорошего образования. Поэтому для детских домов, школ-интернатов и центров содействия семейному устройству всё обучение на платформе бесплатно и без ограничения срока.

ЧТО ПОЛУЧАЮТ ВОСПИТАННИКИ — БЕСПЛАТНО, НАВСЕГДА
— раздел «Малыш» для детей 1–7 лет: 25 развивающих занятий, 48 сказок с озвучкой, обучение чтению, игры;
— все курсы раздела «Школьникам»: 1–11 класс, подготовка к ОГЭ и ЕГЭ;
— ИИ-наставник по школьным предметам 24/7: объясняет тему, а не решает за ребёнка;
— без рекламы и без платежей.

КАК ПОДКЛЮЧИТЬСЯ (2 минуты)
1. Открыть {page_label}
2. Зарегистрировать аккаунт педагога или воспитателя (email или Яндекс ID)
3. Ввести промокод {CARE_PROMO} — доступ откроется сразу и без срока

Один аккаунт можно использовать для занятий с группой детей на общем планшете или компьютере. Договоры, закупки и отчётность не нужны.

Презентация (5 минут): {deck}

Если нужна помощь с запуском или подбором занятий — просто ответьте на это письмо.

С уважением,
команда УЧИСЬПРО
{SITE_LABEL}

—
{why} Больше не присылать письма: {unsub_url}
"""
    body = f"""<p style="margin:0 0 14px">{escape(g)}</p>
<p style="margin:0 0 16px">Обращаюсь к вам как к руководителю <b>{escape(org)}</b>. Мы — образовательная платформа УЧИСЬПРО. Мы убеждены, что между детьми не должно быть разницы: <b>каждый ребёнок достоин хорошего образования</b>. Поэтому для детских домов, школ-интернатов и центров содействия семейному устройству всё обучение на платформе <b>бесплатно и без ограничения срока</b>.</p>
<p style="margin:0 0 8px"><b>Что получают воспитанники — бесплатно, навсегда:</b></p>
<ul style="margin:0 0 18px;padding-left:20px">
{_li('<b>раздел «Малыш»</b> для детей 1–7 лет: 25 развивающих занятий, 48 сказок с озвучкой, обучение чтению, игры;')}
{_li('<b>все курсы «Школьникам»</b>: 1–11 класс, подготовка к ОГЭ и ЕГЭ;')}
{_li('<b>ИИ-наставник</b> по школьным предметам 24/7 — объясняет тему, а не решает за ребёнка;')}
{_li('<b>без рекламы и без платежей</b>.')}
</ul>
{_promo_box(page, page_label, CARE_PROMO, 'и без срока', 'учреждению')}
<p style="margin:0 0 16px">Один аккаунт можно использовать для занятий с группой детей на общем планшете или компьютере. <b>Договоры, закупки и отчётность не нужны.</b></p>
{_button(deck, 'Презентация — 5 минут')}
<p style="margin:0 0 14px">Если нужна помощь с запуском или подбором занятий — просто <b>ответьте на это письмо</b>.</p>
<p style="margin:0">С уважением,<br>команда УЧИСЬПРО<br><a href="{SITE}" style="color:#be185d">{SITE_LABEL}</a></p>"""
    html = _wrap('УЧИСЬПРО · Каждый ребёнок', 'Бесплатно для детских домов и интернатов — без срока', body, unsub_url, why)
    return subject, html, text, reply


def letter_for(inst: dict, audience: str, unsub_url: str):
    return care_letter(inst, unsub_url) if audience == 'care' else kindergarten_letter(inst, unsub_url)


def campaign_for(audience: str) -> str:
    return CARE_CAMPAIGN if audience == 'care' else KIDS_CAMPAIGN
