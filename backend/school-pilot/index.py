"""
Пилот для школ: школа подключается сама за минуту, ученики приходят по ссылке школы.

POST ?action=join      {school_name, contact_name, contact (email|телефон), city, institution_ref?, source?}
                       -> {code, admin_key, ...}  моментально, без проверки; уведомление владельцу в MAX
GET  ?action=school    &code=        -> публичные данные школы для страницы учеников
POST ?action=activate  {code, class_label?}  (X-Auth-Token)  -> открывает «Школьникам» до 31.05.2027
GET  ?action=stats     &code=&key=   -> сколько учеников подключилось, по классам и дням
GET  ?action=cities                  -> города пилота для формы
GET  ?action=lookup    &ref=         -> школа из письма (по токену отписки) для автозаполнения формы
GET  ?action=weekly_report [&send=1]  (Authorization: Bearer CRON_SECRET) -> сводка за 7 дней владельцу в MAX
GET  ?action=weekly_tick              -> то же без секрета: шлёт только по понедельникам с 9:00 МСК и раз в неделю
"""
import json
import os
from datetime import datetime, timedelta, timezone
import re
import secrets
import urllib.request

import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
SITE = 'https://xn--h1amcedk2a6b.xn--p1ai'
SITE_LABEL = 'учисьпро.рф'
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
PHONE_RE = re.compile(r'^[+\d][\d\s()\-]{8,20}$')
# Без похожих символов (0/O, 1/I/L) — код диктуют вслух и пишут на доске.
CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token', 'Access-Control-Max-Age': '86400'}


def t(n: str) -> str:
    return f'{SCHEMA}.{n}'


def resp(data: dict, code: int = 200) -> dict:
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def notify_max(text: str) -> None:
    token, ident = os.environ.get('MAX_BOT_TOKEN', ''), os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return
    for param in ('chat_id', 'user_id'):
        try:
            req = urllib.request.Request(f'https://botapi.max.ru/messages?{param}={ident}',
                                         data=json.dumps({'text': text}).encode(), method='POST',
                                         headers={'Content-Type': 'application/json', 'Authorization': token})
            urllib.request.urlopen(req, timeout=5).read()
            return
        except Exception as e:
            print(f'[notify_max] {param}: {type(e).__name__}')


def city_page(cur, slug: str):
    """Город пилота и его промокод. Регионы пользуются промокодом областного центра."""
    cur.execute(f"SELECT c.slug, c.name, coalesce(c.page_slug, c.slug), c.promo_code FROM {t('pilot_cities')} c "
                f"WHERE c.slug=%s AND c.active=TRUE", (slug,))
    return cur.fetchone()


def norm_name(x: str) -> str:
    """«МБОУ "Школа № 5"» и «мбоу школа №5» — одна школа."""
    return re.sub(r'[\W_]+', '', (x or '').lower().replace('ё', 'е'))


def new_code(cur) -> str:
    for _ in range(20):
        code = ''.join(secrets.choice(CODE_ALPHABET) for _ in range(6))
        cur.execute(f"SELECT 1 FROM {t('pilot_schools')} WHERE code=%s", (code,))
        if not cur.fetchone():
            return code
    raise RuntimeError('code space exhausted')


def school_out(row, with_key=False) -> dict:
    sid, code, key, name, contact, city_slug, city_name, page_slug, promo = row
    d = {'code': code, 'school_name': name, 'contact_name': contact, 'city': city_slug, 'city_name': city_name,
         'city_page': '/samara' if page_slug == 'samara' else f'/pilot/{page_slug}', 'promo': promo,
         'student_url': f'{SITE}/s/{code}', 'student_label': f'{SITE_LABEL}/s/{code}'}
    if with_key:
        d['admin_key'] = key
        d['stats_url'] = f'{SITE}/podklyuchit-shkolu/moya?c={code}&k={key}'
    return d


SCHOOL_SELECT = (f"SELECT s.id, s.code, s.admin_key, s.school_name, s.contact_name, s.city_slug, c.name, "
                 f"coalesce(c.page_slug, c.slug), c.promo_code FROM {t('pilot_schools')} s "
                 f"JOIN {t('pilot_cities')} c ON c.slug = s.city_slug ")


def handle_join(body: dict, ip: str) -> dict:
    name = str(body.get('school_name') or '').strip()[:300]
    person = str(body.get('contact_name') or '').strip()[:160]
    contact = str(body.get('contact') or '').strip()[:200]
    city = str(body.get('city') or '').strip()[:60]
    ref = str(body.get('institution_ref') or '').strip()[:64]
    source = re.sub(r'[^a-z0-9_\-]', '', str(body.get('source') or '').lower())[:40] or None
    if len(name) < 3:
        return resp({'error': 'Укажите название школы'}, 400)
    if len(person) < 2:
        return resp({'error': 'Укажите, как к вам обращаться'}, 400)
    email = contact.lower() if EMAIL_RE.match(contact) else None
    phone = contact if not email and PHONE_RE.match(contact) else None
    if not email and not phone:
        return resp({'error': 'Оставьте email или телефон — пришлём материалы и ответим на вопросы'}, 400)
    is_test = bool((email and (email.endswith('@example.com') or '@test.' in email)) or name.lower().startswith('тест')
                   or 'проверка' in name.lower())

    conn = db()
    try:
        with conn.cursor() as cur:
            c = city_page(cur, city)
            if not c:
                return resp({'error': 'Выберите город из списка'}, 400)
            inst_id = None
            if ref:
                cur.execute(f"SELECT id FROM {t('edu_institutions')} WHERE unsubscribe_token=%s", (ref,))
                r = cur.fetchone()
                inst_id = r[0] if r else None
            # Повторная отправка той же школой (дважды нажали, вернулись через день) — те же ссылки, без дублей.
            # Python lower() понимает кириллицу при любой локали базы — сравниваем нормализованные названия.
            row = None
            if inst_id:
                cur.execute(SCHOOL_SELECT + "WHERE s.institution_id=%s ORDER BY s.id LIMIT 1", (inst_id,))
                row = cur.fetchone()
            if not row:
                cur.execute(SCHOOL_SELECT + "WHERE s.city_slug=%s AND (s.contact_email=%s OR s.contact_phone=%s) "
                            "ORDER BY s.id", (city, email, phone))
                row = next((r for r in cur.fetchall() if norm_name(r[3]) == norm_name(name)), None)
            if row:
                return resp({'ok': True, 'existing': True, 'school': school_out(row, with_key=True)})
            code, key = new_code(cur), secrets.token_urlsafe(16)
            cur.execute(f"INSERT INTO {t('pilot_schools')} (code, admin_key, school_name, contact_name, contact_email, "
                        f"contact_phone, city_slug, institution_id, source, is_test) "
                        f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                        (code, key, name, person, email, phone, city, inst_id, source, is_test))
            if inst_id:
                cur.execute(f"UPDATE {t('edu_institutions')} SET status='partner', updated_at=now() WHERE id=%s", (inst_id,))
            cur.execute(SCHOOL_SELECT + "WHERE s.code=%s", (code,))
            row = cur.fetchone()
            conn.commit()
    finally:
        conn.close()
    if not is_test:
        notify_max(f"🏫 Школа подключилась к пилоту\n{name}\n{c[1]}\nКонтакт: {person}, {email or phone}"
                   f"\nИсточник: {source or 'сайт'}\nСсылка учеников: {SITE_LABEL}/s/{code}")
    print(f'[join] {code} city={city} src={source} ip={ip[:20]}')
    return resp({'ok': True, 'existing': False, 'school': school_out(row, with_key=True)})


def resolve_user(cur, token: str):
    if not token:
        return None
    cur.execute(f"SELECT user_id FROM {t('auth_sessions')} WHERE token=%s AND revoked_at IS NULL "
                f"AND (expires_at IS NULL OR expires_at > now())", (token,))
    r = cur.fetchone()
    return r[0] if r else None


def handle_activate(token: str, body: dict) -> dict:
    code = str(body.get('code') or '').strip().upper()[:12]
    label = re.sub(r'\s+', '', str(body.get('class_label') or '').upper())[:20] or None
    conn = db()
    try:
        with conn.cursor() as cur:
            user_id = resolve_user(cur, token)
            if not user_id:
                return resp({'error': 'Сначала войдите в аккаунт'}, 401)
            cur.execute(SCHOOL_SELECT + "WHERE s.code=%s", (code,))
            row = cur.fetchone()
            if not row:
                return resp({'error': 'Ссылка школы не найдена — проверьте адрес'}, 404)
            promo = row[8]
            cur.execute(f"SELECT id, expires_at FROM {t('access_promo_codes')} WHERE upper(code)=upper(%s) "
                        f"AND active=TRUE AND expires_at > now() LIMIT 1", (promo,))
            p = cur.fetchone()
            if not p:
                return resp({'error': 'Пилот в этом городе завершён'}, 410)
            promo_id, expires_at = p
            cur.execute(f"INSERT INTO {t('access_grants')} (user_id, scope, promo_code_id, expires_at) "
                        f"VALUES (%s,'school',%s,%s) ON CONFLICT (user_id, scope) DO UPDATE SET "
                        f"promo_code_id=EXCLUDED.promo_code_id, expires_at=EXCLUDED.expires_at, created_at=NOW() "
                        f"WHERE {t('access_grants')}.expires_at < EXCLUDED.expires_at", (user_id, promo_id, expires_at))
            cur.execute(f"INSERT INTO {t('pilot_school_students')} (school_id, user_id, class_label) VALUES (%s,%s,%s) "
                        f"ON CONFLICT (school_id, user_id) DO UPDATE SET class_label=coalesce(EXCLUDED.class_label, "
                        f"{t('pilot_school_students')}.class_label) RETURNING (xmax = 0)", (row[0], user_id, label))
            fresh = cur.fetchone()[0]
            if fresh:
                cur.execute(f"UPDATE {t('access_promo_codes')} SET used_count=used_count+1 WHERE id=%s", (promo_id,))
            conn.commit()
            return resp({'ok': True, 'expires_at': expires_at.isoformat(), 'school_name': row[3], 'already': not fresh})
    finally:
        conn.close()


def handle_stats(code: str, key: str) -> dict:
    conn = db()
    try:
        with conn.cursor() as cur:
            cur.execute(SCHOOL_SELECT + "WHERE s.code=%s AND s.admin_key=%s", (code.upper(), key))
            row = cur.fetchone()
            if not row:
                return resp({'error': 'Ссылка недействительна'}, 403)
            sid = row[0]
            cur.execute(f"SELECT count(*), count(*) FILTER (WHERE created_at > now() - interval '7 days') "
                        f"FROM {t('pilot_school_students')} WHERE school_id=%s", (sid,))
            total, week = cur.fetchone()
            cur.execute(f"SELECT coalesce(class_label,'Не указан'), count(*) FROM {t('pilot_school_students')} "
                        f"WHERE school_id=%s GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 60", (sid,))
            classes = [{'label': a, 'count': b} for a, b in cur.fetchall()]
            cur.execute(f"SELECT created_at::date, count(*) FROM {t('pilot_school_students')} WHERE school_id=%s "
                        f"AND created_at > now() - interval '30 days' GROUP BY 1 ORDER BY 1", (sid,))
            days = [{'day': a.isoformat(), 'count': b} for a, b in cur.fetchall()]
            return resp({'ok': True, 'school': school_out(row, with_key=True),
                         'total': total, 'week': week, 'classes': classes, 'days': days})
    finally:
        conn.close()


def plural(n: int, one: str, few: str, many: str) -> str:
    n10, n100 = n % 10, n % 100
    w = one if n10 == 1 and n100 != 11 else few if 2 <= n10 <= 4 and not 12 <= n100 <= 14 else many
    return f'{n} {w}'


def weekly_report(cur) -> str:
    """Сводка за последние 7 дней: новые школы, ученики по ссылкам школ, самые активные школы."""
    real = f"p.is_test=FALSE"
    cur.execute(f"SELECT count(*) FILTER (WHERE created_at > now() - interval '7 days'), count(*), "
                f"count(*) FILTER (WHERE created_at > now() - interval '14 days' AND created_at <= now() - interval '7 days') "
                f"FROM {t('pilot_schools')} p WHERE {real}")
    new_s, all_s, prev_s = cur.fetchone()
    cur.execute(f"SELECT count(*) FILTER (WHERE st.created_at > now() - interval '7 days'), count(*), "
                f"count(*) FILTER (WHERE st.created_at > now() - interval '14 days' AND st.created_at <= now() - interval '7 days') "
                f"FROM {t('pilot_school_students')} st JOIN {t('pilot_schools')} p ON p.id=st.school_id WHERE {real}")
    new_u, all_u, prev_u = cur.fetchone()
    cur.execute(f"SELECT p.school_name, c.name, count(st.id) FILTER (WHERE st.created_at > now() - interval '7 days') w, "
                f"count(st.id) total FROM {t('pilot_schools')} p JOIN {t('pilot_cities')} c ON c.slug=p.city_slug "
                f"LEFT JOIN {t('pilot_school_students')} st ON st.school_id=p.id WHERE {real} "
                f"GROUP BY p.id, p.school_name, c.name HAVING count(st.id) > 0 ORDER BY w DESC, total DESC LIMIT 5")
    top = cur.fetchall()
    cur.execute(f"SELECT p.school_name, c.name, coalesce(p.contact_email, p.contact_phone) FROM {t('pilot_schools')} p "
                f"JOIN {t('pilot_cities')} c ON c.slug=p.city_slug WHERE {real} AND p.created_at > now() - interval '7 days' "
                f"ORDER BY p.id DESC LIMIT 10")
    fresh = cur.fetchall()
    cur.execute(f"SELECT count(*) FROM {t('pilot_schools')} p WHERE {real} AND p.created_at < now() - interval '7 days' "
                f"AND NOT EXISTS (SELECT 1 FROM {t('pilot_school_students')} st WHERE st.school_id=p.id)")
    silent = cur.fetchone()[0]
    cur.execute(f"SELECT coalesce(sum(used_count),0) FROM {t('access_promo_codes')} WHERE scope='school'")
    promo = cur.fetchone()[0]

    def delta(now, before):
        if not before:
            return ''
        d = now - before
        return f' ({"+" if d >= 0 else ""}{d} к прошлой неделе)'

    end = datetime.now(timezone.utc) + timedelta(hours=3)
    start = end - timedelta(days=7)
    lines = [f"🏫 Пилот для школ · неделя {start:%d.%m}–{end:%d.%m}", "",
             f"Новых школ: {new_s}{delta(new_s, prev_s)}",
             f"Учеников по ссылкам школ: {new_u}{delta(new_u, prev_u)}",
             f"Всего: {plural(all_s, 'школа', 'школы', 'школ')}, {plural(all_u, 'ученик', 'ученика', 'учеников')}",
             f"Активаций всего (с городскими промокодами): {promo}"]
    if top:
        lines += ["", "🔥 Самые активные школы (за неделю / всего):"]
        lines += [f"{i}. {n} ({c}) — +{w} / {tot}" for i, (n, c, w, tot) in enumerate(top, 1)]
    if fresh:
        lines += ["", "🆕 Подключились за неделю:"]
        lines += [f"• {n} ({c}) — {contact}" for n, c, contact in fresh]
    if silent:
        lines += ["", f"⚠️ {plural(silent, 'школа подключилась', 'школы подключились', 'школ подключились')} больше недели назад, "
                      f"но учеников пока нет — стоит позвонить и помочь разослать ссылку."]
    if not new_s and not new_u:
        lines += ["", "За неделю подключений не было. Напоминание школам и новые письма продолжают уходить."]
    lines += ["", f"Все школы: {SITE_LABEL}/admin/pilot-outreach"]
    return '\n'.join(lines)


def already_sent_week(cur) -> bool:
    cur.execute(f"SELECT 1 FROM {t('feed_cron_runs')} WHERE kind='pilot_weekly' AND started_at > now() - interval '6 days' LIMIT 1")
    return cur.fetchone() is not None


def send_weekly(conn, cur) -> dict:
    text = weekly_report(cur)
    token, ident = os.environ.get('MAX_BOT_TOKEN', ''), os.environ.get('MAX_ADMIN_CHAT_ID', '')
    if not token or not ident:
        return {'sent': False, 'reason': 'MAX не настроен', 'report': text}
    sent = False
    for param in ('chat_id', 'user_id'):
        try:
            req = urllib.request.Request(f'https://botapi.max.ru/messages?{param}={ident}',
                                         data=json.dumps({'text': text}).encode(), method='POST',
                                         headers={'Content-Type': 'application/json', 'Authorization': token})
            urllib.request.urlopen(req, timeout=8).read()
            sent = True
            break
        except Exception as e:
            print(f'[weekly] {param}: {type(e).__name__}')
    if sent:
        cur.execute(f"INSERT INTO {t('feed_cron_runs')} (kind, status, finished_at) VALUES ('pilot_weekly','ok',NOW())")
        conn.commit()
    return {'sent': sent, 'report': text}


def handler(event: dict, context) -> dict:
    """Пилот для школ: самостоятельное подключение школы, ссылка для учеников и статистика для директора."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}
    qs = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    action = qs.get('action') or 'ping'
    try:
        body = json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        body = {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp') or ''

    if action == 'ping':
        return resp({'ok': True, 'service': 'school-pilot'})
    if action == 'join':
        return handle_join(body, ip)
    if action == 'activate':
        return handle_activate(token, body)
    if action == 'stats':
        return handle_stats(qs.get('code') or '', qs.get('key') or '')
    if action in ('weekly_report', 'weekly_tick'):
        auth = (headers.get('Authorization') or headers.get('authorization') or headers.get('X-Authorization') or '')
        secret = os.environ.get('CRON_SECRET', '')
        authorized = bool(secret) and auth.replace('Bearer ', '').strip() == secret
        if action == 'weekly_report' and not authorized:
            return resp({'error': 'Доступ запрещён'}, 403)
        conn = db()
        try:
            with conn.cursor() as cur:
                if action == 'weekly_report' and qs.get('send') != '1':
                    return resp({'ok': True, 'sent': False, 'report': weekly_report(cur)})
                if action == 'weekly_tick':
                    # Без секрета — только по понедельникам с 9:00 по Москве, чтобы планировщик или сайт
                    # могли дёргать часто, а сводка всё равно уходила раз в неделю.
                    msk = datetime.now(timezone.utc) + timedelta(hours=3)
                    if msk.weekday() != 0 or msk.hour < 9:
                        return resp({'ok': True, 'sent': False, 'skipped': 'not_monday_morning'})
                if already_sent_week(cur) and qs.get('force') != '1':
                    return resp({'ok': True, 'sent': False, 'skipped': 'already_sent_this_week'})
                r = send_weekly(conn, cur)
                return resp({'ok': True, **({k: v for k, v in r.items() if k != 'report'} if not authorized else r)})
        finally:
            conn.close()

    conn = db()
    try:
        with conn.cursor() as cur:
            if action == 'cities':
                cur.execute(f"SELECT slug, name FROM {t('pilot_cities')} WHERE active=TRUE ORDER BY name")
                return resp({'ok': True, 'cities': [{'slug': a, 'name': b} for a, b in cur.fetchall()]})
            if action == 'school':
                cur.execute(SCHOOL_SELECT + "WHERE s.code=%s", ((qs.get('code') or '').upper()[:12],))
                row = cur.fetchone()
                if not row:
                    return resp({'error': 'Ссылка школы не найдена'}, 404)
                return resp({'ok': True, 'school': school_out(row)})
            if action == 'lookup':
                ref = (qs.get('ref') or '')[:64]
                if len(ref) < 16:
                    return resp({'error': 'not found'}, 404)
                cur.execute(f"SELECT i.org_name, i.contact_name, i.email, i.city FROM {t('edu_institutions')} i "
                            f"WHERE i.unsubscribe_token=%s", (ref,))
                r = cur.fetchone()
                if not r:
                    return resp({'error': 'not found'}, 404)
                cur.execute(f"SELECT slug FROM {t('pilot_cities')} WHERE name=%s AND active=TRUE LIMIT 1", (r[3],))
                c = cur.fetchone()
                return resp({'ok': True, 'school_name': r[0], 'contact_name': (r[1] or '').strip(),
                             'contact': r[2], 'city': c[0] if c else ''})
            return resp({'error': 'Неизвестное действие'}, 404)
    finally:
        conn.close()
