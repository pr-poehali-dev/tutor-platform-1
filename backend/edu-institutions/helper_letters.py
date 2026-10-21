"""Второе письмо школам и детским садам: бесплатный ИИ-помощник для родителей.

Уходит только тем, кто уже получил первое письмо (сады — о «Малыше», школы — письмо пилота),
не раньше чем через WAIT_DAYS после последнего письма. В очереди стоит после всех писем о «Малыше».
"""
import os
from html import escape

import outreach

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
TABLE = f'{SCHEMA}.edu_institutions'
CAMPAIGN = 'parents_helper_2026'
WAIT_DAYS = 5
KIDS_CAMPAIGN = 'kids_pilot_2026'


def audience_where() -> str:
    return (
        f"{TABLE}.audience IN ('school','kindergarten') AND {TABLE}.email<>'' AND {TABLE}.unsubscribed_at IS NULL "
        f"AND {TABLE}.status NOT IN ('declined') "
        f"AND {TABLE}.last_mailed_at IS NOT NULL AND {TABLE}.last_mailed_at < now() - interval '{WAIT_DAYS} days' "
        # Первое письмо уже получено: садам — именно о «Малыше», школам — любое письмо пилота.
        f"AND EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends s WHERE s.institution_id={TABLE}.id "
        f"AND s.status='sent' AND s.is_test=FALSE AND s.campaign_code<>'{CAMPAIGN}' "
        f"AND ({TABLE}.audience='school' OR s.campaign_code='{KIDS_CAMPAIGN}')) "
        f"AND NOT EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends s WHERE s.institution_id={TABLE}.id "
        f"AND s.campaign_code='{CAMPAIGN}' AND s.status='sent' AND s.is_test=FALSE) "
        f"AND (SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
        f"AND f.campaign_code='{CAMPAIGN}' AND f.status='failed' AND f.is_test=FALSE) < {outreach.MAX_ATTEMPTS}"
    )


def letter(inst: dict, unsub_url: str):
    is_kg = inst.get('audience') == 'kindergarten'
    g = outreach.greeting(inst.get('contact_name', ''))
    org = inst.get('org_name') or ('вашего детского сада' if is_kg else 'вашей школы')
    place = 'детского сада' if is_kg else 'школы'
    org_gen = 'воспитанников' if is_kg else 'учеников'
    org_gen = f'{org_gen} {org}'
    whole = 'всего детского сада' if is_kg else 'всей школы'
    page = f'{outreach.SITE}/ai-helper'
    demo = f'{outreach.SITE}/ai-helper#how'
    reply = outreach.smtp_creds()[0]
    subject = (f'Бесплатный ИИ-помощник для родителей {place}: отвечает на вопросы вечером и в выходные')
    questions = (['Во сколько можно забрать ребёнка?', 'Что будет на обед?', 'Какие справки нужны после болезни?',
                  'Есть ли кружки и сколько стоят?'] if is_kg else
                 ['Когда родительское собрание?', 'Как записаться в кружок?', 'Где взять справку об обучении?',
                  'Как связаться с классным руководителем?'])
    why = 'Вы получили это письмо, потому что ранее мы писали вам о бесплатном доступе к УЧИСЬПРО.'

    text = f"""{g}

Недавно мы писали вам о бесплатном доступе к УЧИСЬПРО для {org_gen}. Сегодня — инструмент для администрации.

Каждый день родители задают одни и те же вопросы: {', '.join(q[0].lower() + q[1:-1] for q in questions[:3])}. Отвечать приходится в мессенджерах, по телефону, вечером и в выходные.

Мы сделали конструктор «Свой ИИ-помощник». За 10–15 минут вы собираете помощника, который отвечает родителям по вашим правилам — круглосуточно.

КАК ЭТО РАБОТАЕТ
1. Откройте {page} и выберите готовый шаблон «Школа или детский сад».
2. Вставьте то, что обычно объясняете родителям: режим дня, расписание, питание, кружки, документы, контакты.
3. Получите ссылку — отправьте её в родительский чат или поставьте на сайт {place}.

ЧТО ВАЖНО
— Помощник отвечает только по вашим сведениям и не выдумывает. Если ответа нет — честно говорит об этом и даёт контакт администрации.
— Не нужно вносить персональные данные детей и родителей: помощнику достаточно общих правил и расписания.
— Вы видите, какие вопросы задают чаще всего и на что помощник не нашёл ответа.

СКОЛЬКО СТОИТ
Бесплатно: 1 помощник и 100 ответов в месяц — достаточно, чтобы попробовать в одной группе или классе.
Расширенный тариф для {whole} — 490 ₽ в месяц: 3 000 ответов и полный отчёт по вопросам родителей.

Создать помощника: {page}

Если удобнее, ответьте на это письмо — поможем собрать первого помощника вместе.

С уважением,
команда УЧИСЬПРО
{outreach.SITE_LABEL}

—
{why} Больше не присылать письма: {unsub_url}
"""

    li = ''.join(f'<li style="margin:0 0 4px">{escape(q)}</li>' for q in questions)
    html = f"""<!doctype html><html><body style="margin:0;background:#f5f3ff;font-family:Arial,Helvetica,sans-serif;color:#1f1633">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#6d28d9;background:linear-gradient(135deg,#7c3aed,#0891b2);padding:22px 28px;color:#fff">
<div style="font-size:20px;font-weight:bold">УЧИСЬПРО · ИИ-помощник для родителей</div>
<div style="font-size:14px;opacity:.92;margin-top:4px">Бесплатно · 10–15 минут · без программирования</div></td></tr>
<tr><td style="padding:26px 28px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{escape(g)}</p>
<p style="margin:0 0 14px">Недавно мы писали вам о бесплатном доступе к УЧИСЬПРО для <b>{escape(org_gen)}</b>. Сегодня — инструмент для администрации.</p>
<p style="margin:0 0 6px">Каждый день родители задают одни и те же вопросы:</p>
<ul style="margin:0 0 14px;padding-left:20px;color:#4b3f63">{li}</ul>
<p style="margin:0 0 18px">Мы сделали конструктор <b>«Свой ИИ-помощник»</b>. За 10–15 минут вы собираете помощника, который отвечает родителям <b>по вашим правилам — круглосуточно</b>.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin:0 0 18px"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.6">
<div style="font-size:15px;font-weight:bold;margin:0 0 8px">Как это работает</div>
1. Выберите готовый шаблон <b>«Школа или детский сад»</b>.<br>
2. Вставьте то, что обычно объясняете родителям: режим дня, расписание, питание, кружки, документы, контакты.<br>
3. Получите ссылку — отправьте в родительский чат или поставьте на сайт {escape(place)}.
</td></tr></table>
<p style="margin:0 0 20px;text-align:center"><a href="{page}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Создать помощника бесплатно</a></p>
<p style="margin:0 0 6px"><b>Что важно</b></p>
<ul style="margin:0 0 16px;padding-left:20px">
<li style="margin:0 0 6px">Помощник отвечает <b>только по вашим сведениям</b> и не выдумывает. Если ответа нет — честно говорит и даёт контакт администрации.</li>
<li style="margin:0 0 6px"><b>Персональные данные детей и родителей вносить не нужно</b> — достаточно общих правил и расписания.</li>
<li style="margin:0 0 6px">Вы видите, какие вопросы задают чаще всего и на что помощник не нашёл ответа.</li>
</ul>
<p style="margin:0 0 6px"><b>Сколько стоит</b></p>
<p style="margin:0 0 16px">Бесплатно: 1 помощник и 100 ответов в месяц — достаточно, чтобы попробовать в одной группе или классе.<br>
Расширенный тариф для {escape(whole)} — 490 ₽ в месяц: 3 000 ответов и полный отчёт по вопросам родителей.</p>
<p style="margin:0 0 14px;font-size:14px"><a href="{demo}" style="color:#6d28d9">Посмотреть живой пример помощника</a> · Удобнее вместе? Просто ответьте на это письмо — поможем собрать первого помощника.</p>
<p style="margin:0">С уважением,<br>команда УЧИСЬПРО<br><a href="{outreach.SITE}" style="color:#6d28d9">{outreach.SITE_LABEL}</a></p>
</td></tr>
<tr><td style="padding:16px 28px;background:#faf8ff;color:#857a99;font-size:12px;line-height:1.5">
{escape(why)} <a href="{unsub_url}" style="color:#857a99">Больше не присылать письма</a>.</td></tr>
</table></td></tr></table></body></html>"""
    return subject, html, text, reply


def pending(cur) -> int:
    cur.execute(f"SELECT count(*) FROM {TABLE} WHERE {audience_where()}")
    return cur.fetchone()[0]


def stats(cur) -> dict:
    cur.execute(f"SELECT status, count(*) FROM {SCHEMA}.edu_campaign_sends WHERE campaign_code=%s AND is_test=FALSE "
                f"GROUP BY 1", (CAMPAIGN,))
    s = dict(cur.fetchall())
    cur.execute(f"SELECT count(*) FROM {TABLE} WHERE audience IN ('school','kindergarten') AND email<>'' "
                f"AND unsubscribed_at IS NULL AND EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends x "
                f"WHERE x.institution_id={TABLE}.id AND x.status='sent' AND x.is_test=FALSE AND x.campaign_code<>%s) "
                f"AND NOT EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends y WHERE y.institution_id={TABLE}.id "
                f"AND y.campaign_code=%s AND y.status='sent' AND y.is_test=FALSE)", (CAMPAIGN, CAMPAIGN))
    waiting = cur.fetchone()[0]
    ready = pending(cur)
    return {'sent': s.get('sent', 0), 'failed': s.get('failed', 0), 'pending': ready,
            'waiting': max(0, waiting - ready), 'wait_days': WAIT_DAYS}


def send_batch(cur, conn, limit: int, unsub_url, inst_by_id, ensure_token, started: float, time_budget: int) -> dict:
    import time
    total = {'sent': 0, 'failed': 0, 'stop': False}
    if limit <= 0:
        return total
    cur.execute(f"SELECT id, audience FROM {TABLE} WHERE {audience_where()} ORDER BY last_mailed_at, id LIMIT %s", (limit,))
    rows = cur.fetchall()
    if not rows:
        return total
    smtp = None
    try:
        for rid, aud in rows:
            if time.time() - started > time_budget:
                break
            if smtp is None:
                smtp = outreach.open_smtp()
            inst, token = inst_by_id(cur, rid)
            token = ensure_token(cur, rid, token)
            inst['audience'] = aud
            unsub = unsub_url(token)
            subject, html, text, reply = letter(inst, unsub)
            try:
                outreach.send_one(smtp, inst['email'], subject, html, text, unsub, reply)
                cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status) "
                            f"VALUES (%s,%s,%s,'sent')", (CAMPAIGN, rid, inst['email']))
                cur.execute(f"UPDATE {TABLE} SET last_mailed_at=now(), mail_count=mail_count+1, updated_at=now() WHERE id=%s", (rid,))
                total['sent'] += 1
            except Exception as e:
                msg = f'{type(e).__name__}: {str(e)[:300]}'
                cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status, error) "
                            f"VALUES (%s,%s,%s,'failed',%s)", (CAMPAIGN, rid, inst['email'], msg))
                total['failed'] += 1
                if 'SMTPDataError' in msg or 'SMTPSenderRefused' in msg or 'quota' in msg.lower():
                    total['stop'] = 'spam' if outreach.is_spam_reject(msg) else 'blocked'
                    conn.commit()
                    return total
            conn.commit()
            outreach.pause()
    finally:
        if smtp is not None:
            try:
                smtp.quit()
            except Exception:
                pass
    return total
