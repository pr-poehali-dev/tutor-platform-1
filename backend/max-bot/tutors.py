"""Воронка для репетиторов в боте MAX.

Репетитор переходит по ссылке https://max.ru/<бот>?start=tutor_<источник> (её публикуем
в каналах-каталогах репетиторов) или пишет боту /repetitor. Бот за 3 шага узнаёт предмет,
что интересно и как связаться, сохраняет заявку в tutor_leads и шлёт её владельцу в MAX.
"""
import os

from daily import api, keyboard, t

SITE = 'https://xn--h1amcedk2a6b.xn--p1ai'
TUTORS_PAGE = SITE + '/repetitoram'


def page_url(source: str) -> str:
    """Страница для репетиторов с меткой источника: видно, откуда пришла заявка."""
    src = ''.join(ch for ch in (source or '').lower() if ch.isalnum() or ch in '_-')[:40] or 'max'
    return f'{TUTORS_PAGE}?src=max_{src}'

FEE_PERCENT = 8
REFERRAL_PERCENT = 20
TERMS = (f"Условия простые:\n"
         f"• ИИ-помощник и конструктор курсов — бесплатно;\n"
         f"• продаёте свой курс — платформа берёт {FEE_PERCENT}% с продажи, {100 - FEE_PERCENT}% ваши, без абонплаты;\n"
         f"• приводите учеников на подписку УЧИСЬПРО — получаете {REFERRAL_PERCENT}% с каждой их оплаты.")

INTERESTS = {
    'ti_tool': 'ИИ-помощник для занятий',
    'ti_course': 'Свой онлайн-курс с ИИ',
    'ti_students': 'Новые ученики',
    'ti_partner': f'{REFERRAL_PERCENT}% за приведённых учеников',
}


def send(user_id: int, text: str, rows=None):
    body = {'text': text[:3900]}
    if rows:
        body['attachments'] = keyboard(rows)
    return api('POST', f'/messages?user_id={int(user_id)}', body)


def notify_owner(text: str):
    chat = os.environ.get('MAX_ADMIN_CHAT_ID', '').strip()
    if chat.lstrip('-').isdigit():
        api('POST', f'/messages?chat_id={int(chat)}', {'text': text[:3900]})


def get_lead(cur, uid: int):
    cur.execute(f"SELECT step, name, source, subject, interest, contact FROM {t('tutor_leads')} "
                f"WHERE max_user_id=%s", (uid,))
    return cur.fetchone()


def start(conn, user: dict, source: str):
    """Старт воронки: из ссылки ?start=tutor_xxx или по команде /repetitor."""
    uid = int(user.get('user_id') or 0)
    if not uid:
        return
    name = (user.get('name') or user.get('first_name') or '')[:200]
    with conn.cursor() as cur:
        cur.execute(
            f"INSERT INTO {t('tutor_leads')} (max_user_id, name, username, source, step) "
            f"VALUES (%s,%s,%s,%s,'subject') "
            f"ON CONFLICT (max_user_id) DO UPDATE SET step=CASE WHEN {t('tutor_leads')}.step='done' "
            f"THEN 'done' ELSE 'subject' END, updated_at=NOW()",
            (uid, name, (user.get('username') or '')[:100], source[:60]))
        row = get_lead(cur, uid)
        conn.commit()
    if row and row[0] == 'done':
        send(uid, "Рады снова видеть! Ваша заявка у нас, свяжемся в рабочее время "
                  "(пн–пт, 8:00–17:00 мск). Подробности для репетиторов — по кнопке.",
             [[{'type': 'link', 'text': 'Условия для репетиторов', 'url': page_url(source)}]])
        return
    hello = f"Здравствуйте{', ' + name.split()[0] if name else ''}! Это УЧИСЬПРО — платформа с ИИ-репетитором для школьников.\n\n"
    send(uid, hello +
         "Мы не конкуренты, а партнёры: даём репетиторам бесплатный ИИ-помощник для занятий — "
         "готовит домашки и варианты ОГЭ/ЕГЭ, проверяет решения учеников по фото, объясняет темы "
         "между уроками. Ученики остаются вашими.\n\n" + TERMS + "\n\n"
         "Подробности — на странице для репетиторов (кнопка ниже).\n\n"
         "Займёт минуту. Какой предмет вы ведёте? Напишите одним сообщением, например: «Математика, ОГЭ/ЕГЭ».",
         [[{'type': 'link', 'text': 'Условия для репетиторов', 'url': page_url(source)}]])


def on_text(conn, user: dict, text: str) -> bool:
    """Ответ репетитора в воронке. True — сообщение обработано здесь."""
    uid = int(user.get('user_id') or 0)
    if not uid or not text:
        return False
    with conn.cursor() as cur:
        row = get_lead(cur, uid)
        if not row or row[0] not in ('subject', 'contact'):
            return False
        step = row[0]
        if step == 'subject':
            cur.execute(f"UPDATE {t('tutor_leads')} SET subject=%s, step='interest', updated_at=NOW() "
                        f"WHERE max_user_id=%s", (text[:120], uid))
            conn.commit()
            send(uid, "Спасибо! Что вам интереснее всего?",
                 [[{'type': 'callback', 'text': v, 'payload': k}] for k, v in INTERESTS.items()])
            return True
        cur.execute(f"UPDATE {t('tutor_leads')} SET contact=%s, step='done', status='new', updated_at=NOW() "
                    f"WHERE max_user_id=%s", (text[:200], uid))
        conn.commit()
        _, name, source, subject, interest, _c = row
    finish(uid, name, source, subject, interest, text)
    return True


def finish(uid, name, source, subject, interest, contact):
    send(uid, "Готово, заявка принята! Свяжемся с вами в рабочее время: пн–пт, 8:00–17:00 мск.\n\n"
              "Пока можно посмотреть условия и собрать пробный курс — это бесплатно.",
         [[{'type': 'link', 'text': 'Условия для репетиторов', 'url': page_url(source)}],
          [{'type': 'link', 'text': 'Собрать курс с ИИ', 'url': SITE + '/course-builder'}]])
    notify_owner(
        "👩‍🏫 Новый репетитор из MAX\n"
        f"Имя: {name or '—'}\nПредмет: {subject or '—'}\n"
        f"Интерес: {INTERESTS.get(interest or '', interest or '—')}\n"
        f"Контакт: {contact or '—'}\nИсточник: {source or '—'}\n"
        f"Написать в MAX: user_id {uid}")


def on_callback(conn, cb: dict) -> bool:
    payload = cb.get('payload') or ''
    if payload not in INTERESTS:
        return False
    user = cb.get('user') or {}
    uid = int(user.get('user_id') or 0)
    if not uid:
        return True
    with conn.cursor() as cur:
        cur.execute(f"UPDATE {t('tutor_leads')} SET interest=%s, step='contact', updated_at=NOW() "
                    f"WHERE max_user_id=%s AND step IN ('interest','contact')", (payload, uid))
        conn.commit()
    if cb.get('callback_id'):
        api('POST', f"/answers?callback_id={cb['callback_id']}", {'notification': INTERESTS[payload]})
    send(uid, "Отлично! Последний шаг: оставьте телефон или удобный способ связи — "
              "или напишите «здесь», и мы ответим прямо в MAX.")
    return True
