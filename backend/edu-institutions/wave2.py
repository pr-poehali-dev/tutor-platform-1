"""Вторая волна: «Расскажите о школе» — приглашение в справочник УЧИСЬПРО.

Уходит школам, которые получили первое письмо не раньше чем WAIT_DAYS назад.
Включается само, когда очередь первой волны пуста: лимит Яндекса не делится между волнами.
"""
import os
from html import escape

import outreach

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
TABLE = f'{SCHEMA}.edu_institutions'
CAMPAIGN = 'school_profile_2026'
WAIT_DAYS = 7
SUBJECT = 'Страница вашей школы в справочнике УЧИСЬПРО — расскажите о достижениях'


def audience_where() -> str:
    """Получили первое письмо ≥ WAIT_DAYS назад, не отписались, ещё не получили это и не заполнили анкету."""
    return (f"{TABLE}.audience='school' AND {TABLE}.email<>'' AND {TABLE}.unsubscribed_at IS NULL AND {TABLE}.status NOT IN ('declined') "
            # Не чаще одного письма в 3 дня — даже если между волнами ушло письмо об ИИ-помощнике.
            f"AND ({TABLE}.last_mailed_at IS NULL OR {TABLE}.last_mailed_at < now() - interval '3 days') "
            f"AND {TABLE}.slug IS NOT NULL AND {TABLE}.hidden_in_directory = FALSE "
            f"AND EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends s WHERE s.institution_id={TABLE}.id "
            f"AND s.status='sent' AND s.is_test=FALSE AND s.campaign_code<>'{CAMPAIGN}' "
            f"AND s.created_at < now() - interval '{WAIT_DAYS} days') "
            f"AND NOT EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends s WHERE s.institution_id={TABLE}.id "
            f"AND s.campaign_code='{CAMPAIGN}' AND s.is_test=FALSE "
            f"AND (s.status='sent' OR (SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
            f"AND f.campaign_code='{CAMPAIGN}' AND f.status='failed') >= {outreach.MAX_ATTEMPTS})) "
            f"AND NOT EXISTS (SELECT 1 FROM {SCHEMA}.school_profiles p WHERE p.institution_id={TABLE}.id)")


def ensure_profile_token(cur, rid) -> str:
    cur.execute(f"UPDATE {TABLE} SET profile_token = coalesce(profile_token, md5(random()::text || clock_timestamp()::text || id::text)) "
                f"WHERE id=%s RETURNING profile_token", (rid,))
    return cur.fetchone()[0]


def ratings_line(cur, rid) -> str:
    cur.execute(f"SELECT list_name, place FROM {SCHEMA}.school_ratings WHERE institution_id=%s ORDER BY list_size DESC, place LIMIT 2", (rid,))
    rows = cur.fetchall()
    if not rows:
        return ''
    parts = [f'{place}-е место в списке «{name}»' for name, place in rows]
    return 'Ваша школа уже отмечена в открытых рейтингах RAEX 2026: ' + '; '.join(parts) + '.'


def build(inst: dict, page_url: str, form_url: str, unsub_url: str, rating: str):
    g = outreach.greeting(inst.get('contact_name', ''))
    school = inst.get('org_name') or 'вашей школы'
    reply = outreach.smtp_creds()[0]
    page_label = page_url.replace(outreach.SITE, outreach.SITE_LABEL)

    text = f"""{g}

Неделю назад мы писали вам о бесплатном доступе к УЧИСЬПРО для учеников. Сегодня — о другом: о вашей школе.

Мы запустили открытый справочник школ — для родителей, которые выбирают школу, и для коллег, которые ищут сильные практики. У {school} уже есть страница: {page_label}
{(chr(10) + rating + chr(10)) if rating else ''}
Сейчас на странице только сведения из официального реестра: адрес, телефон, сайт. Родителям этого мало — они хотят знать, чем школа сильна.

РАССКАЖИТЕ О ШКОЛЕ — 5 МИНУТ
— достижения: олимпиады, конкурсы, поступления, результаты ЕГЭ;
— уникальные методики и авторские программы;
— профильные классы и направления.

Анкета по личной ссылке, без регистрации: {form_url}

Что это даст школе:
— страница с достижениями — в поиске и в справочнике по городу;
— отметка «Сведения подтверждены школой» и более высокое место в рейтинге справочника;
— лучшие методики мы расскажем коллегам в нашей ленте — с указанием школы и автора.

Участие бесплатное и ни к чему не обязывает. Публикуем только то, что вы пришлёте, и только с вашего согласия. Если что-то на странице неверно или вы не хотите её показывать — просто ответьте на это письмо.

С уважением,
команда УЧИСЬПРО
{outreach.SITE_LABEL}

—
Вы получили это письмо, потому что адрес вашей школы опубликован в официальном справочнике образовательных организаций. Больше не присылать письма: {unsub_url}
"""

    li = lambda s: f'<li style="margin:0 0 6px">{s}</li>'
    rating_html = (f'<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;'
                   f'border-radius:12px;margin:0 0 16px"><tr><td style="padding:12px 16px;font-size:14px;line-height:1.5">'
                   f'🏆 {escape(rating)}</td></tr></table>') if rating else ''
    html = f"""<!doctype html><html><body style="margin:0;background:#f4f2fb;font-family:Arial,Helvetica,sans-serif;color:#1f1b2e">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2fb;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#6d28d9;background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:22px 28px;color:#fff">
<div style="font-size:20px;font-weight:bold">УЧИСЬПРО</div>
<div style="font-size:14px;opacity:.9;margin-top:4px">Справочник школ · расскажите о своей школе</div></td></tr>
<tr><td style="padding:26px 28px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{escape(g)}</p>
<p style="margin:0 0 14px">Неделю назад мы писали вам о бесплатном доступе к УЧИСЬПРО для учеников. Сегодня — о другом: <b>о вашей школе</b>.</p>
<p style="margin:0 0 16px">Мы запустили открытый справочник школ — для родителей, которые выбирают школу, и для коллег, которые ищут сильные практики. У <b>{escape(school)}</b> уже есть страница: <a href="{page_url}" style="color:#6d28d9">{escape(page_label)}</a></p>
{rating_html}
<p style="margin:0 0 8px">Сейчас там только сведения из официального реестра. Родителям этого мало — они хотят знать, чем школа сильна. <b>Расскажите о школе — 5 минут:</b></p>
<ul style="margin:0 0 18px;padding-left:20px">
{li('<b>достижения</b>: олимпиады, конкурсы, поступления, результаты ЕГЭ;')}
{li('<b>уникальные методики</b> и авторские программы;')}
{li('<b>профильные классы</b> и направления.')}
</ul>
<p style="margin:0 0 20px;text-align:center">
<a href="{form_url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:10px">Заполнить анкету школы</a><br>
<span style="font-size:12px;color:#8a849c">Личная ссылка, без регистрации</span></p>
<p style="margin:0 0 8px"><b>Что это даст школе</b></p>
<ul style="margin:0 0 16px;padding-left:20px">
{li('страница с достижениями — в поиске и в справочнике по городу;')}
{li('отметка «Сведения подтверждены школой» и более высокое место в рейтинге справочника;')}
{li('лучшие методики мы расскажем коллегам в нашей ленте — с указанием школы и автора.')}
</ul>
<p style="margin:0 0 14px">Участие бесплатное и ни к чему не обязывает. Публикуем только то, что вы пришлёте, и только с вашего согласия. Если что-то на странице неверно или вы не хотите её показывать — просто <b>ответьте на это письмо</b>.</p>
<p style="margin:0">С уважением,<br>команда УЧИСЬПРО<br><a href="{outreach.SITE}" style="color:#6d28d9">{outreach.SITE_LABEL}</a></p>
</td></tr>
<tr><td style="padding:16px 28px;background:#faf9fd;color:#8a849c;font-size:12px;line-height:1.5">
Вы получили это письмо, потому что адрес вашей школы опубликован в официальном справочнике образовательных организаций.
<a href="{unsub_url}" style="color:#8a849c">Больше не присылать письма</a>.</td></tr>
</table></td></tr></table></body></html>"""
    return SUBJECT, html, text, reply


def letter_for(cur, rid, inst: dict, unsub_url: str):
    cur.execute(f"SELECT slug FROM {TABLE} WHERE id=%s", (rid,))
    slug = cur.fetchone()[0]
    token = ensure_profile_token(cur, rid)
    page = f'{outreach.SITE}/shkoly/{slug}'
    form = f'{outreach.SITE}/shkoly/anketa?t={token}'
    return build(inst, page, form, unsub_url, ratings_line(cur, rid))
