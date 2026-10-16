"""
Справочник школ УЧИСЬПРО: публичные страницы школ, рейтинг по открытым источникам (RAEX 2026)
и анкета «Расскажите о школе», которую школа заполняет по личной ссылке из письма.

Публично (без ключа):
GET  /?action=cities                          -> города справочника с числом школ и школ в рейтингах
GET  /?action=list&city=..&q=..&kind=..&page=  -> школы города (сначала из рейтингов)
GET  /?action=school&slug=..                  -> карточка школы: адрес, сайт, телефон, рейтинги, одобренная анкета
GET  /?action=top&limit=                      -> общий рейтинг: школы из открытых рейтингов + отмеченные анкеты
GET  /?action=profile_form&t=..               -> данные школы для анкеты по личной ссылке
POST /?action=profile_submit  body: {t, ...}  -> анкета школы (на модерацию)
POST /?action=claim           body: {slug, ...} -> анкета без личной ссылки (на строгую модерацию)

Админ (X-Admin-Pin):
GET  /?action=admin_profiles&status=pending   -> анкеты на модерации
POST /?action=admin_review    body: {id, decision: approve|reject, note?}
POST /?action=admin_seed      body: {part}     -> загрузка отметок рейтингов RAEX
POST /?action=admin_hide      body: {id, hidden}
"""
import json
import os
import re

import psycopg2

import ratings_raex
import seed_slugs

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
T = f'{SCHEMA}.edu_institutions'
R = f'{SCHEMA}.school_ratings'
P = f'{SCHEMA}.school_profiles'
PAGE = 30
PUBLIC_WHERE = "hidden_in_directory = FALSE AND unsubscribed_at IS NULL AND slug IS NOT NULL"
TEXT_LIMITS = {'about': 1500, 'achievements': 3000, 'methods': 3000, 'profiles': 600,
               'contact_name': 200, 'contact_role': 200, 'contact_email': 200, 'website': 300}
# Вес рейтинга: федеральный список весомее регионального, верх списка весомее низа.
FEDERAL_WEIGHT = 100
REGIONAL_WEIGHT = 40
PROFILE_BONUS = 15


def cors():
    return {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin', 'Access-Control-Max-Age': '86400',
            'Content-Type': 'application/json'}


def ok(d, s=200, cache=0):
    h = cors()
    if cache:
        h['Cache-Control'] = f'public, max-age={cache}'
    return {'statusCode': s, 'headers': h, 'body': json.dumps(d, ensure_ascii=False, default=str)}


def err(m, s=400):
    return ok({'error': m}, s)


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def is_admin(headers):
    pin_env = os.environ.get('ADMIN_PIN', '') or '7777'
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return pin == pin_env


def school_kind(name: str) -> str:
    n = (name or '').lower()
    if 'гимнази' in n:
        return 'gymnasium'
    if 'лице' in n or re.search(r'(?<![а-я])(фмл|мл|ал|ифмл|фтл|мфл)(?![а-я])', n):
        return 'lyceum'
    if 'кадет' in n:
        return 'cadet'
    return 'school'


def display_name(name: str) -> str:
    """Короткое имя без «Муниципальное бюджетное общеобразовательное учреждение»."""
    s = re.sub(r'^\s*(муниципальное|государственное|частное|негосударственное)\s+(бюджетное|автономное|казенное|казённое)?\s*'
               r'(нетиповое\s+)?(обще)?образовательное\s+учреждение\s*', '', name or '', flags=re.I)
    s = re.sub(r'\s+', ' ', s).strip()
    if s.count('"') % 2:
        s = s.rstrip('"') if s.endswith('"') and s.count('"') == 1 else s + '"'
    if s.count('«') > s.count('»'):
        s += '»' * (s.count('«') - s.count('»'))
    if re.fullmatch(r'"[^"]+"|«[^«»]+»', s):
        s = s[1:-1]
    return (s[:1].upper() + s[1:]) if s else (name or '')


def public_phone(p: str) -> str:
    p = (p or '').strip()
    return p if len(re.sub(r'\D', '', p)) >= 6 else ''


def public_site(w: str) -> str:
    w = (w or '').strip()
    return w if re.match(r'^https?://[^\s@]+\.[^\s@]+', w) else ''


def card(r) -> dict:
    """Публичная карточка: без ФИО директора и почты (их показываем только в админке)."""
    return {'id': r[0], 'slug': r[1], 'name': display_name(r[2]), 'full_name': r[2], 'city': r[3],
            'address': r[4] or '', 'phone': public_phone(r[5]), 'website': public_site(r[6]),
            'segment': r[7], 'kind': school_kind(r[2]), 'score': float(r[8] or 0), 'verified': bool(r[9])}


CARD_COLS = 'id, slug, org_name, city, address, phone, website, segment, rating_score, profile_verified'


def recalc_scores(cur, ids=None):
    where = '' if ids is None else f"WHERE e.id = ANY(%s)"
    args = () if ids is None else (list(ids),)
    cur.execute(
        f"UPDATE {T} e SET rating_score = coalesce((SELECT sum(CASE WHEN r.source_kind='federal' THEN {FEDERAL_WEIGHT} ELSE {REGIONAL_WEIGHT} END "
        f"* (1 - (r.place - 1)::numeric / greatest(r.list_size, 1)) ) FROM (SELECT place, list_size, "
        f"CASE WHEN list_name LIKE 'Топ-300%%' OR list_name LIKE 'Лучшие частные%%' THEN 'federal' ELSE 'regional' END AS source_kind "
        f"FROM {R} WHERE institution_id = e.id) r), 0) + CASE WHEN e.profile_verified THEN {PROFILE_BONUS} ELSE 0 END "
        f"{where}", args)


def ratings_for(cur, ids):
    if not ids:
        return {}
    cur.execute(f"SELECT institution_id, list_name, list_url, place, list_size, year FROM {R} "
                f"WHERE institution_id = ANY(%s) ORDER BY list_size DESC, place", (list(ids),))
    out = {}
    for iid, name, url, place, size, year in cur.fetchall():
        out.setdefault(iid, []).append({'list': name, 'url': url, 'place': place, 'size': size, 'year': year,
                                         'federal': name.startswith(('Топ-300', 'Лучшие частные'))})
    return out


def h_cities(cur):
    cur.execute(f"SELECT city, count(*), count(*) FILTER (WHERE rating_score > 0) FROM {T} "
                f"WHERE {PUBLIC_WHERE} GROUP BY city ORDER BY count(*) DESC")
    cities = [{'city': c, 'schools': n, 'rated': rated} for c, n, rated in cur.fetchall()]
    cur.execute(f"SELECT name, slug, name_in FROM {SCHEMA}.pilot_cities")
    meta = {n: (s, i) for n, s, i in cur.fetchall()}
    for c in cities:
        s, i = meta.get(c['city'], (None, None))
        c['slug'] = s
        c['name_in'] = i or f"в {c['city']}"
        c['region'] = bool(re.search(r'область|край|Республика', c['city']))
    return ok({'cities': cities, 'total': sum(c['schools'] for c in cities)}, cache=600)


def city_by_slug(cur, slug):
    cur.execute(f"SELECT name, name_in FROM {SCHEMA}.pilot_cities WHERE slug=%s", (slug,))
    return cur.fetchone()


def h_list(cur, qs):
    city = (qs.get('city') or '').strip()
    if qs.get('city_slug'):
        r = city_by_slug(cur, qs['city_slug'].strip())
        if not r:
            return err('Город не найден', 404)
        city = r[0]
    if not city:
        return err('Укажите город')
    q = (qs.get('q') or '').strip()[:80]
    kind = (qs.get('kind') or '').strip()
    try:
        page = max(1, int(qs.get('page') or 1))
    except ValueError:
        page = 1
    where = [PUBLIC_WHERE, 'city = %s']
    args = [city]
    if q:
        where.append('(org_name ILIKE %s OR address ILIKE %s)')
        args += [f'%{q}%', f'%{q}%']
    kinds = {'gymnasium': "org_name ILIKE '%%гимнази%%'", 'lyceum': "org_name ILIKE '%%лице%%'",
             'private': "segment = 'private_school'", 'rated': 'rating_score > 0'}
    if kind in kinds:
        where.append(kinds[kind])
    w = ' AND '.join(where)
    cur.execute(f"SELECT count(*) FROM {T} WHERE {w}", args)
    total = cur.fetchone()[0]
    cur.execute(f"SELECT {CARD_COLS} FROM {T} WHERE {w} ORDER BY rating_score DESC, profile_verified DESC, "
                f"(substring(org_name from '№\\s*(\\d+)'))::int NULLS LAST, org_name LIMIT %s OFFSET %s",
                args + [PAGE, (page - 1) * PAGE])
    items = [card(r) for r in cur.fetchall()]
    rt = ratings_for(cur, [i['id'] for i in items if i['score'] > 0])
    for i in items:
        i['ratings'] = rt.get(i['id'], [])
    return ok({'city': city, 'items': items, 'total': total, 'page': page, 'pages': (total + PAGE - 1) // PAGE}, cache=300)


def approved_profile(cur, iid):
    cur.execute(f"SELECT website, about, achievements, methods, profiles, olympiad_winners, avg_ege, reviewed_at "
                f"FROM {P} WHERE institution_id=%s AND status='approved' AND publish_consent ORDER BY reviewed_at DESC LIMIT 1", (iid,))
    r = cur.fetchone()
    if not r:
        return None
    return {'website': r[0], 'about': r[1], 'achievements': r[2], 'methods': r[3], 'profiles': r[4],
            'olympiad_winners': r[5], 'avg_ege': float(r[6]) if r[6] is not None else None, 'updated': r[7]}


def h_school(cur, qs):
    slug = (qs.get('slug') or '').strip()[:220]
    cur.execute(f"SELECT {CARD_COLS} FROM {T} WHERE slug=%s AND {PUBLIC_WHERE}", (slug,))
    r = cur.fetchone()
    if not r:
        return err('Школа не найдена', 404)
    s = card(r)
    s['ratings'] = ratings_for(cur, [s['id']]).get(s['id'], [])
    s['profile'] = approved_profile(cur, s['id'])
    if s['profile'] and s['profile'].get('website') and not s['website']:
        s['website'] = public_site(s['profile']['website'])
    cur.execute(f"SELECT slug FROM {SCHEMA}.pilot_cities WHERE name=%s", (s['city'],))
    c = cur.fetchone()
    s['city_slug'] = c[0] if c else None
    cur.execute(f"SELECT count(*) + 1 FROM {T} WHERE city=%s AND {PUBLIC_WHERE} AND rating_score > %s", (s['city'], s['score']))
    s['city_place'] = cur.fetchone()[0] if s['score'] > 0 else None
    cur.execute(f"SELECT {CARD_COLS} FROM {T} WHERE city=%s AND {PUBLIC_WHERE} AND id<>%s "
                f"ORDER BY rating_score DESC, random() LIMIT 6", (s['city'], s['id']))
    s['nearby'] = [card(x) for x in cur.fetchall()]
    return ok(s, cache=300)


def h_top(cur, qs):
    try:
        limit = max(10, min(int(qs.get('limit') or 100), 300))
    except ValueError:
        limit = 100
    city = (qs.get('city') or '').strip()
    where = f"{PUBLIC_WHERE} AND rating_score > 0" + (" AND city=%s" if city else '')
    args = [city] if city else []
    cur.execute(f"SELECT {CARD_COLS} FROM {T} WHERE {where} ORDER BY rating_score DESC, org_name LIMIT %s", args + [limit])
    items = [card(r) for r in cur.fetchall()]
    rt = ratings_for(cur, [i['id'] for i in items])
    for i in items:
        i['ratings'] = rt.get(i['id'], [])
    cur.execute(f"SELECT count(*) FROM {T} WHERE {PUBLIC_WHERE} AND rating_score > 0")
    rated = cur.fetchone()[0]
    cur.execute(f"SELECT count(*) FROM {T} WHERE {PUBLIC_WHERE} AND profile_verified")
    verified = cur.fetchone()[0]
    cur.execute(f"SELECT count(DISTINCT list_url) FROM {R}")
    lists = cur.fetchone()[0]
    return ok({'items': items, 'rated': rated, 'verified': verified, 'lists': lists}, cache=600)


def by_token(cur, token):
    if len(token) < 16:
        return None
    cur.execute(f"SELECT {CARD_COLS} FROM {T} WHERE profile_token=%s OR unsubscribe_token=%s", (token, token))
    r = cur.fetchone()
    return card(r) if r else None


def h_profile_form(cur, qs):
    s = by_token(cur, (qs.get('t') or '').strip())
    if not s:
        return err('Ссылка недействительна. Напишите нам — пришлём новую.', 404)
    cur.execute(f"SELECT status, website, about, achievements, methods, profiles, olympiad_winners, avg_ege, "
                f"contact_name, contact_role, contact_email, publish_consent FROM {P} WHERE institution_id=%s "
                f"ORDER BY created_at DESC LIMIT 1", (s['id'],))
    r = cur.fetchone()
    last = None
    if r:
        last = dict(zip(('status', 'website', 'about', 'achievements', 'methods', 'profiles', 'olympiad_winners',
                         'avg_ege', 'contact_name', 'contact_role', 'contact_email', 'publish_consent'), r))
        if last['avg_ege'] is not None:
            last['avg_ege'] = float(last['avg_ege'])
    s['ratings'] = ratings_for(cur, [s['id']]).get(s['id'], [])
    return ok({'school': s, 'last': last})


def clean_fields(body):
    f = {}
    for k, lim in TEXT_LIMITS.items():
        v = str(body.get(k) or '').strip()
        f[k] = v[:lim] or None
    try:
        n = int(body.get('olympiad_winners')) if str(body.get('olympiad_winners') or '').strip() else None
        f['olympiad_winners'] = n if n is not None and 0 <= n <= 10000 else None
    except (TypeError, ValueError):
        f['olympiad_winners'] = None
    try:
        e = float(str(body.get('avg_ege')).replace(',', '.')) if str(body.get('avg_ege') or '').strip() else None
        f['avg_ege'] = e if e is not None and 0 < e <= 100 else None
    except (TypeError, ValueError):
        f['avg_ege'] = None
    f['publish_consent'] = bool(body.get('publish_consent'))
    if f['website'] and not re.match(r'^https?://', f['website']):
        f['website'] = 'https://' + f['website']
    if f['contact_email'] and not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', f['contact_email']):
        return None, 'Проверьте адрес почты'
    if not (f['achievements'] or f['methods'] or f['about']):
        return None, 'Расскажите хотя бы о достижениях или методиках школы'
    if not f['publish_consent']:
        return None, 'Нужно согласие на публикацию в справочнике'
    return f, None


def save_profile(cur, iid, f, via_letter, ip):
    cur.execute(f"SELECT count(*) FROM {P} WHERE institution_id=%s AND created_at > now() - interval '1 hour'", (iid,))
    if cur.fetchone()[0] >= 3:
        return err('Анкета уже отправлена. Изменения можно прислать через час.', 429)
    cur.execute(f"UPDATE {P} SET status='replaced' WHERE institution_id=%s AND status='pending'", (iid,))
    cur.execute(f"INSERT INTO {P} (institution_id, website, about, achievements, methods, profiles, olympiad_winners, avg_ege, "
                f"contact_name, contact_role, contact_email, publish_consent, via_letter, ip) "
                f"VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (iid, f['website'], f['about'], f['achievements'], f['methods'], f['profiles'], f['olympiad_winners'],
                 f['avg_ege'], f['contact_name'], f['contact_role'], f['contact_email'], f['publish_consent'], via_letter, ip))
    pid = cur.fetchone()[0]
    cur.execute(f"UPDATE {T} SET status = CASE WHEN status IN ('new','contacted') THEN 'replied' ELSE status END, "
                f"updated_at=now() WHERE id=%s", (iid,))
    return ok({'ok': True, 'id': pid, 'message': 'Спасибо! Анкета на проверке — опубликуем на странице школы в течение 2 рабочих дней.'})


def h_profile_submit(cur, body, ip):
    s = by_token(cur, str(body.get('t') or '').strip())
    if not s:
        return err('Ссылка недействительна', 404)
    f, e = clean_fields(body)
    if e:
        return err(e)
    return save_profile(cur, s['id'], f, True, ip)


def h_claim(cur, body, ip):
    slug = str(body.get('slug') or '').strip()[:220]
    cur.execute(f"SELECT id FROM {T} WHERE slug=%s AND {PUBLIC_WHERE}", (slug,))
    r = cur.fetchone()
    if not r:
        return err('Школа не найдена', 404)
    f, e = clean_fields(body)
    if e:
        return err(e)
    if not (f['contact_name'] and f['contact_email']):
        return err('Укажите имя и почту для связи — без них не сможем проверить анкету')
    cur.execute(f"SELECT count(*) FROM {P} WHERE ip=%s AND created_at > now() - interval '1 day'", (ip,))
    if cur.fetchone()[0] >= 5:
        return err('Слишком много анкет с одного адреса. Попробуйте завтра.', 429)
    return save_profile(cur, r[0], f, False, ip)


def h_admin_profiles(cur, qs):
    status = (qs.get('status') or 'pending').strip()
    cur.execute(f"SELECT p.id, p.status, p.created_at, p.via_letter, p.website, p.about, p.achievements, p.methods, p.profiles, "
                f"p.olympiad_winners, p.avg_ege, p.contact_name, p.contact_role, p.contact_email, p.moderator_note, "
                f"e.id, e.org_name, e.city, e.slug, e.email, e.contact_name "
                f"FROM {P} p JOIN {T} e ON e.id=p.institution_id WHERE p.status=%s ORDER BY p.created_at DESC LIMIT 100", (status,))
    keys = ('id', 'status', 'created_at', 'via_letter', 'website', 'about', 'achievements', 'methods', 'profiles',
            'olympiad_winners', 'avg_ege', 'contact_name', 'contact_role', 'contact_email', 'moderator_note',
            'school_id', 'school_name', 'city', 'slug', 'school_email', 'director')
    items = [dict(zip(keys, r)) for r in cur.fetchall()]
    for i in items:
        if i['avg_ege'] is not None:
            i['avg_ege'] = float(i['avg_ege'])
        domain = (i['contact_email'] or '').split('@')[-1].lower()
        i['email_matches_school'] = bool(domain) and domain == (i['school_email'] or '').split('@')[-1].lower()
    cur.execute(f"SELECT status, count(*) FROM {P} GROUP BY status")
    counts = dict(cur.fetchall())
    return ok({'items': items, 'counts': counts})


def h_admin_review(cur, body):
    try:
        pid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Нет id')
    decision = body.get('decision')
    if decision not in ('approve', 'reject'):
        return err('decision: approve или reject')
    note = str(body.get('note') or '')[:500] or None
    cur.execute(f"UPDATE {P} SET status=%s, moderator_note=%s, reviewed_at=now() WHERE id=%s RETURNING institution_id",
                ('approved' if decision == 'approve' else 'rejected', note, pid))
    r = cur.fetchone()
    if not r:
        return err('Анкета не найдена', 404)
    iid = r[0]
    if decision == 'approve':
        cur.execute(f"UPDATE {P} SET status='replaced' WHERE institution_id=%s AND status='approved' AND id<>%s", (iid, pid))
    cur.execute(f"SELECT EXISTS (SELECT 1 FROM {P} WHERE institution_id=%s AND status='approved')", (iid,))
    cur.execute(f"UPDATE {T} SET profile_verified=%s WHERE id=%s", (cur.fetchone()[0], iid))
    recalc_scores(cur, [iid])
    return ok({'ok': True})


def h_admin_seed(cur, body):
    """Загружает отметки рейтингов RAEX. Идемпотентно."""
    values = ','.join(cur.mogrify('(%s,%s,%s,%s,%s,%s,%s,%s)', r).decode() for r in ratings_raex.ROWS)
    cur.execute(f"INSERT INTO {R} (institution_id, source, list_name, list_url, place, list_size, year, name_in_list) "
                f"SELECT v.* FROM (VALUES {values}) AS v(a,b,c,d,e,f,g,h) JOIN {T} t ON t.id=v.a "
                f"ON CONFLICT (institution_id, list_url) DO UPDATE SET place=EXCLUDED.place, list_size=EXCLUDED.list_size")
    recalc_scores(cur)
    cur.execute(f"SELECT count(*), count(DISTINCT institution_id) FROM {R}")
    n, schools = cur.fetchone()
    return ok({'ratings': n, 'schools': schools})


def h_admin_seed_slugs(cur, body):
    """Проставляет адреса страниц и сайты школ частями по 2000 (part=0..6). Идемпотентно."""
    try:
        part = int(body.get('part') or 0)
    except (TypeError, ValueError):
        part = 0
    rows = seed_slugs.ROWS[part * 2000:(part + 1) * 2000]
    if not rows:
        return ok({'done': True})
    values = ','.join(cur.mogrify('(%s,%s,%s)', r).decode() for r in rows)
    cur.execute(f"UPDATE {T} e SET slug=v.s, website=CASE WHEN coalesce(e.website,'')='' AND v.w<>'' THEN v.w ELSE e.website END "
                f"FROM (VALUES {values}) AS v(id, s, w) WHERE e.id=v.id AND (e.slug IS NULL OR e.slug=v.s)")
    return ok({'part': part, 'updated': cur.rowcount, 'next': part + 1})


def h_admin_hide(cur, body):
    try:
        iid = int(body.get('id'))
    except (TypeError, ValueError):
        return err('Нет id')
    cur.execute(f"UPDATE {T} SET hidden_in_directory=%s WHERE id=%s", (bool(body.get('hidden')), iid))
    return ok({'ok': True})


def handler(event: dict, context) -> dict:
    """Справочник школ: публичные страницы, рейтинг по открытым источникам и анкеты школ."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}
    qs = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    action = (qs.get('action') or 'cities').strip()
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        body = {}
    ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')[:64]

    public_get = {'cities': h_cities, 'list': h_list, 'school': h_school, 'top': h_top, 'profile_form': h_profile_form}
    public_post = {'profile_submit': h_profile_submit, 'claim': h_claim}
    admin = {'admin_profiles', 'admin_review', 'admin_seed', 'admin_seed_slugs', 'admin_hide'}

    if action not in public_get and action not in public_post and action not in admin:
        return err('Неизвестное действие', 404)
    if action in admin and not is_admin(headers):
        return err('Нет доступа', 403)

    conn = db()
    try:
        with conn.cursor() as cur:
            if action == 'cities':
                res = h_cities(cur)
            elif action in public_get:
                res = public_get[action](cur, qs)
            elif action in public_post:
                res = public_post[action](cur, body, ip)
            elif action == 'admin_profiles':
                res = h_admin_profiles(cur, qs)
            elif action == 'admin_review':
                res = h_admin_review(cur, body)
            elif action == 'admin_seed':
                res = h_admin_seed(cur, body)
            elif action == 'admin_seed_slugs':
                res = h_admin_seed_slugs(cur, body)
            else:
                res = h_admin_hide(cur, body)
        conn.commit()
        return res
    finally:
        conn.close()
