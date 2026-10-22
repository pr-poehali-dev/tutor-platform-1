"""
Поиск репетиторов-партнёров и работа с ними (только для администратора, заголовок X-Admin-Pin).

GET  ?action=ping                                   -> health-check
GET  ?action=status                                 -> какие источники подключены
POST ?action=search   {source, query, city}         -> найти и показать (без сохранения)
POST ?action=save     {items:[...], query}          -> сохранить выбранных в базу
GET  ?action=list     &status=&q=                   -> база партнёров + счётчики по этапам
POST ?action=add      {url, name, subject, ...}     -> добавить вручную
POST ?action=update   {id, status?, notes?, draft?, subject?, phone?, email?, messenger?, next_step_at?}
POST ?action=draft    {id}                          -> ИИ пишет личное предложение
POST ?action=sent     {id, channel}                 -> отметить «написали»
POST ?action=send_max {id, text}                    -> отправить в MAX (если репетитор писал боту)
GET  ?action=events   &id=                          -> история общения
POST ?action=sync_bot                               -> подтянуть заявки из ботов MAX
"""
import json
import os
import ssl
import urllib.error
import urllib.request

import psycopg2

import admin_guard
import sources
from certs import RUSSIAN_TRUSTED_CA

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'openai/gpt-4o-mini'
MAX_API = 'https://platform-api2.max.ru'
SITE = 'https://учисьпро.рф'
BOT_LINK = 'https://max.ru/id631205241205_bot?start=tutor_outreach'
STATUSES = ('found', 'contacted', 'replied', 'talks', 'partner', 'declined')

CORS = {'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin',
        'Access-Control-Max-Age': '86400'}

COLS = ('id', 'source', 'kind', 'name', 'subject', 'city', 'url', 'snippet', 'phone', 'email',
        'messenger', 'write_url', 'status', 'draft', 'notes', 'search_query', 'contacted_at',
        'next_step_at', 'created_at', 'updated_at', 'max_user_id')


def t(name):
    return f'{SCHEMA}.{name}'


def resp(data, code=200):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def row_to(r):
    return {k: (v.isoformat() if hasattr(v, 'isoformat') else v) for k, v in zip(COLS, r)}


def log_event(cur, pid, kind, text=None):
    cur.execute(f"INSERT INTO {t('tutor_partner_events')} (partner_id, kind, text) VALUES (%s,%s,%s)",
                (pid, kind, (text or '')[:4000] or None))


# ---------- ИИ-черновик ----------

DRAFT_SYSTEM = (
    "Ты пишешь первое личное сообщение репетитору от команды образовательной платформы УЧИСЬПРО. "
    "Мы НЕ конкуренты, а партнёры: не переманиваем учеников, не предлагаем работу на нас. "
    "Предложение одно: бесплатный ИИ-помощник для занятий репетитора — готовит домашние задания и "
    "варианты в формате ОГЭ/ЕГЭ, проверяет решения учеников по фото, объясняет темы между уроками, "
    "экономит репетитору часы подготовки. Репетитор остаётся хозяином своих учеников. "
    "Правила: 4–6 коротких предложений, обращение по имени, если оно есть; одна деталь из его анкеты "
    "(предмет, формат, город), чтобы было видно, что письмо не массовое; без эмодзи-гирлянд (максимум одно), "
    "без канцелярита, без слов «уникальный», «революционный»; не выдумывай фактов о человеке и о платформе. "
    "Закончи мягким вопросом, интересно ли посмотреть, и ссылкой на бота: {bot}. "
    "Подпись: «Команда УЧИСЬПРО». Только текст сообщения, на русском."
)


def ai_draft(p: dict) -> str:
    key = os.environ.get('POLZA_API_KEY', '')
    about = '\n'.join(f'{k}: {v}' for k, v in [
        ('Имя или название', p.get('name')), ('Предмет', p.get('subject')), ('Город', p.get('city')),
        ('Где нашли', {'vk': 'ВКонтакте', 'web': 'сайт в интернете', 'channels': 'канал в мессенджере',
                       'bot': 'сам написал нашему боту', 'manual': 'добавлен вручную'}.get(p.get('source'), '')),
        ('Тип', {'group': 'сообщество/школа', 'post': 'объявление', 'channel': 'канал/чат'}.get(p.get('kind'), 'частный репетитор')),
        ('Текст анкеты/объявления', (p.get('snippet') or '')[:900])] if v)
    if not key:
        return fallback_draft(p)
    payload = json.dumps({'model': POLZA_MODEL, 'temperature': 0.6, 'max_tokens': 450,
                          'messages': [{'role': 'system', 'content': DRAFT_SYSTEM.format(bot=BOT_LINK)},
                                       {'role': 'user', 'content': about or 'Данных мало — напиши нейтрально.'}]}).encode()
    req = urllib.request.Request(POLZA_URL, data=payload, method='POST',
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=22) as r:
            data = json.loads(r.read().decode('utf-8'))
        text = ((data.get('choices') or [{}])[0].get('message') or {}).get('content', '').strip()
        return text or fallback_draft(p)
    except Exception as e:
        print(f'[ai_draft] {type(e).__name__}: {str(e)[:200]}')
        return fallback_draft(p)


def fallback_draft(p: dict) -> str:
    first = (p.get('name') or '').split()[0] if p.get('kind') in (None, 'person', 'post') and p.get('name') else ''
    subj = f" по предмету «{p['subject']}»" if p.get('subject') else ''
    return (f"Здравствуйте{', ' + first if first else ''}! Увидели ваши занятия{subj} и хотим предложить "
            "партнёрство, а не конкуренцию. У нас есть бесплатный ИИ-помощник для репетиторов: готовит "
            "домашки и варианты ОГЭ/ЕГЭ, проверяет решения учеников по фото и объясняет темы между уроками. "
            "Ученики остаются вашими — помощник просто экономит часы подготовки.\n\n"
            f"Интересно посмотреть? Подробности за минуту: {BOT_LINK}\n\nКоманда УЧИСЬПРО")


# ---------- MAX ----------

_CTX = None


def max_send(user_id: int, text: str):
    global _CTX
    token = os.environ.get('MAX_BOT_TOKEN', '')
    if not token:
        return False, 'Не подключён бот MAX'
    if _CTX is None:
        _CTX = ssl.create_default_context()
        _CTX.load_verify_locations(cadata=RUSSIAN_TRUSTED_CA)
    req = urllib.request.Request(f'{MAX_API}/messages?user_id={int(user_id)}',
                                 data=json.dumps({'text': text[:3900]}, ensure_ascii=False).encode(),
                                 method='POST', headers={'Content-Type': 'application/json', 'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=12, context=_CTX) as r:
            r.read()
        return True, None
    except urllib.error.HTTPError as e:
        return False, f'MAX: ошибка {e.code}'
    except Exception as e:
        return False, f'MAX не ответил: {type(e).__name__}'


# ---------- Действия ----------

def save_items(cur, items, query):
    added = 0
    for it in items[:100]:
        url = (it.get('url') or '').strip()[:600]
        if not url.startswith('http'):
            continue
        cur.execute(
            f"INSERT INTO {t('tutor_partners')} (source, kind, name, subject, city, url, snippet, phone, email, "
            f"messenger, write_url, search_query) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "
            f"ON CONFLICT (url) DO NOTHING RETURNING id",
            (it.get('source') or 'manual', it.get('kind') or 'person', (it.get('name') or '')[:300] or None,
             (it.get('subject') or '')[:200] or None, (it.get('city') or '')[:120] or None, url,
             (it.get('snippet') or '')[:1200] or None, (it.get('phone') or '')[:60] or None,
             (it.get('email') or '')[:200] or None, (it.get('messenger') or '')[:300] or None,
             (it.get('write_url') or url)[:600], (query or '')[:300] or None))
        r = cur.fetchone()
        if r:
            added += 1
            log_event(cur, r[0], 'found', f"Источник: {it.get('source')}. Запрос: {query or '—'}")
    return added


def known_urls(cur, urls):
    if not urls:
        return set()
    cur.execute(f"SELECT url FROM {t('tutor_partners')} WHERE url = ANY(%s)", (list(urls),))
    return {r[0] for r in cur.fetchall()}


def get_partner(cur, pid):
    cur.execute(f"SELECT {', '.join(COLS)} FROM {t('tutor_partners')} WHERE id=%s", (pid,))
    r = cur.fetchone()
    return row_to(r) if r else None


def sync_bot(cur):
    """Заявки, оставленные репетиторами в боте MAX, попадают в общую базу как «ответили»."""
    cur.execute(f"SELECT max_user_id, name, source, subject, interest, contact FROM {t('tutor_leads')} "
                f"WHERE step='done' AND status <> 'test'")
    added = 0
    for uid, name, src, subject, interest, contact in cur.fetchall():
        info = sources.contacts_from(contact or '')
        cur.execute(
            f"INSERT INTO {t('tutor_partners')} (source, kind, name, subject, url, snippet, phone, email, "
            f"messenger, write_url, status, max_user_id) VALUES ('bot','person',%s,%s,%s,%s,%s,%s,%s,%s,'replied',%s) "
            f"ON CONFLICT (url) DO NOTHING RETURNING id",
            (name, subject, f'max-bot://{uid}', f"Сам оставил заявку в боте MAX. Источник: {src or '—'}. "
             f"Интерес: {interest or '—'}. Контакт: {contact or '—'}", info['phone'], info['email'],
             info['messenger'], f'max-bot://{uid}', uid))
        r = cur.fetchone()
        if r:
            added += 1
            log_event(cur, r[0], 'replied', 'Заявка из бота MAX')
    return added


def handler(event: dict, context) -> dict:
    """Инструмент поиска репетиторов-партнёров в VK, интернете и каналах, с воронкой общения и ИИ-черновиками."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}
    params = event.get('queryStringParameters') or {}
    action = (params.get('action') or 'ping').lower()
    if action == 'ping':
        return resp({'ok': True, 'service': 'tutor-scout'})
    if not admin_guard.check_pin(event.get('headers') or {}):
        return resp({'error': 'Нет доступа'}, 403)
    try:
        body = json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        body = {}

    if action == 'status':
        return resp({'ok': True, 'sources': sources.status()})

    if action == 'search':
        try:
            items = sources.run(body.get('source') or '', body.get('query') or '', (body.get('city') or '').strip()[:80])
        except sources.SourceError as e:
            return resp({'ok': False, 'error': str(e)})
        conn = db()
        try:
            with conn.cursor() as cur:
                known = known_urls(cur, [i['url'] for i in items])
        finally:
            conn.close()
        for i in items:
            i['in_base'] = i['url'] in known
        return resp({'ok': True, 'items': items})

    conn = db()
    try:
        with conn.cursor() as cur:
            if action == 'save':
                n = save_items(cur, body.get('items') or [], body.get('query'))
                conn.commit()
                return resp({'ok': True, 'added': n})

            if action == 'add':
                url = (body.get('url') or '').strip()
                if not url.startswith('http'):
                    return resp({'ok': False, 'error': 'Укажите ссылку на страницу репетитора (начинается с http)'})
                extra = sources.contacts_from(f"{body.get('snippet', '')} {url}")
                item = {**extra, **{k: v for k, v in body.items() if v}, 'source': 'manual', 'url': url}
                n = save_items(cur, [item], 'вручную')
                conn.commit()
                return resp({'ok': True, 'added': n})

            if action == 'list':
                sync_bot(cur)
                conn.commit()
                where, args = [], []
                st = params.get('status') or ''
                if st in STATUSES:
                    where.append('status=%s')
                    args.append(st)
                q = (params.get('q') or '').strip()
                if q:
                    where.append('(name ILIKE %s OR subject ILIKE %s OR snippet ILIKE %s OR city ILIKE %s)')
                    args += [f'%{q}%'] * 4
                sql = (f"SELECT {', '.join(COLS)} FROM {t('tutor_partners')} "
                       + (f"WHERE {' AND '.join(where)} " if where else '')
                       + "ORDER BY (next_step_at IS NULL), next_step_at, updated_at DESC LIMIT 300")
                cur.execute(sql, args)
                items = [row_to(r) for r in cur.fetchall()]
                cur.execute(f"SELECT status, count(*) FROM {t('tutor_partners')} GROUP BY status")
                counts = dict(cur.fetchall())
                return resp({'ok': True, 'items': items, 'counts': counts})

            pid = int(body.get('id') or params.get('id') or 0)
            p = get_partner(cur, pid) if pid else None
            if not p:
                return resp({'ok': False, 'error': 'Карточка не найдена'}, 404)

            if action == 'events':
                cur.execute(f"SELECT kind, text, created_at FROM {t('tutor_partner_events')} WHERE partner_id=%s "
                            f"ORDER BY created_at DESC LIMIT 50", (pid,))
                return resp({'ok': True, 'events': [{'kind': k, 'text': x, 'at': a.isoformat()} for k, x, a in cur.fetchall()]})

            if action == 'update':
                sets, args = [], []
                for f in ('notes', 'draft', 'subject', 'phone', 'email', 'messenger', 'city', 'name'):
                    if f in body:
                        sets.append(f'{f}=%s')
                        args.append((body[f] or '').strip() or None)
                if 'next_step_at' in body:
                    sets.append('next_step_at=%s')
                    args.append(body['next_step_at'] or None)
                new_status = body.get('status')
                if new_status in STATUSES and new_status != p['status']:
                    sets.append('status=%s')
                    args.append(new_status)
                    if new_status == 'contacted' and not p['contacted_at']:
                        sets.append('contacted_at=NOW()')
                    log_event(cur, pid, new_status, body.get('event_text'))
                elif 'notes' in body and (body['notes'] or '') != (p['notes'] or ''):
                    log_event(cur, pid, 'note', body['notes'])
                if sets:
                    cur.execute(f"UPDATE {t('tutor_partners')} SET {', '.join(sets)}, updated_at=NOW() WHERE id=%s",
                                args + [pid])
                conn.commit()
                return resp({'ok': True, 'item': get_partner(cur, pid)})

            if action == 'draft':
                text = ai_draft(p)
                cur.execute(f"UPDATE {t('tutor_partners')} SET draft=%s, updated_at=NOW() WHERE id=%s", (text, pid))
                conn.commit()
                return resp({'ok': True, 'draft': text})

            if action == 'sent':
                channel = (body.get('channel') or 'вручную')[:40]
                cur.execute(f"UPDATE {t('tutor_partners')} SET status=CASE WHEN status='found' THEN 'contacted' ELSE status END, "
                            f"contacted_at=COALESCE(contacted_at, NOW()), next_step_at=COALESCE(next_step_at, CURRENT_DATE + 3), "
                            f"updated_at=NOW() WHERE id=%s", (pid,))
                log_event(cur, pid, 'contacted', f"Написали: {channel}\n\n{(body.get('text') or p['draft'] or '')[:3000]}")
                conn.commit()
                return resp({'ok': True, 'item': get_partner(cur, pid)})

            if action == 'send_max':
                if not p.get('max_user_id'):
                    return resp({'ok': False, 'error': 'Этот репетитор ещё не писал боту MAX — напишите ему по ссылке'})
                text = (body.get('text') or '').strip()
                if not text:
                    return resp({'ok': False, 'error': 'Пустое сообщение'})
                ok_, err = max_send(p['max_user_id'], text)
                if ok_:
                    log_event(cur, pid, 'contacted', f'Отправлено в MAX:\n\n{text[:3000]}')
                    cur.execute(f"UPDATE {t('tutor_partners')} SET contacted_at=COALESCE(contacted_at, NOW()), "
                                f"updated_at=NOW() WHERE id=%s", (pid,))
                    conn.commit()
                return resp({'ok': ok_, 'error': err})

            return resp({'error': 'Неизвестное действие'}, 404)
    finally:
        conn.close()
