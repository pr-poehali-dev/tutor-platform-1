"""Пилот «Малыш»: детские сады и детские дома. Загрузка базы, дособирание почты из реестра закупок (ЕИС),
рассылка — в общем дневном лимите почтового ящика вместе со школами."""
import json
import os
import re
import ssl
import time
import urllib.request
from html import unescape

import kids_letters
import outreach
import registry_kids_care
import registry_kids_kg

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')
TABLE = f'{SCHEMA}.edu_institutions'
AUDIENCES = ('kindergarten', 'care')
EIS = 'https://zakupki.gov.ru'
EMAIL_RE = re.compile(r'[\w.+\-]+@[\w\-]+(?:\.[\w\-]+)+')
# Реестр закупок блокирует частые запросы — за один вызов берём немного карточек.
ENRICH_BATCH = 6
ENRICH_MAX_ATTEMPTS = 3
TIME_BUDGET_SEC = 20


def audience_where(audience: str) -> str:
    camp = kids_letters.campaign_for(audience)
    return (f"audience='{audience}' AND email<>'' AND unsubscribed_at IS NULL AND status NOT IN ('declined','partner') "
            f"AND NOT EXISTS (SELECT 1 FROM {SCHEMA}.edu_campaign_sends s WHERE s.institution_id={TABLE}.id "
            f"AND s.campaign_code='{camp}' AND s.status='sent' AND s.is_test=FALSE) "
            f"AND (SELECT count(*) FROM {SCHEMA}.edu_campaign_sends f WHERE f.institution_id={TABLE}.id "
            f"AND f.campaign_code='{camp}' AND f.status='failed' AND f.is_test=FALSE) < {outreach.MAX_ATTEMPTS}")


def import_rows(cur, conn, rows: list) -> dict:
    """rows: [{org_name, contact_name, phone, email, city, address, segment, inn, audience, ext_ref, website}].
    Повтор не дублирует запись (ключ — ИНН + аудитория); у существующих дозаполняет пустую почту."""
    clean = []
    for r in rows:
        aud = r.get('audience')
        inn = re.sub(r'\D', '', str(r.get('inn') or ''))
        if aud not in AUDIENCES or not inn or not r.get('org_name'):
            continue
        email = str(r.get('email') or '').strip().lower()
        if email and not EMAIL_RE.fullmatch(email):
            email = ''
        clean.append((str(r['org_name'])[:300], str(r.get('contact_name') or '')[:200], str(r.get('phone') or '')[:50],
                      email[:200], str(r.get('city') or '')[:120], str(r.get('address') or '')[:400],
                      str(r.get('segment') or aud)[:30], inn, aud, str(r.get('ext_ref') or '')[:40],
                      str(r.get('website') or '')[:300]))
    if not clean:
        return {'inserted': 0, 'updated': 0, 'total': 0}
    values = ','.join(cur.mogrify('(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)', r).decode('utf-8') for r in clean)
    src = 'Единая информационная система в сфере закупок (zakupki.gov.ru), 21.10.2026'
    cur.execute(
        f"WITH v(n,d,p,e,c,a,s,i,aud,ref,w) AS (VALUES {values}) "
        f"UPDATE {TABLE} t SET email=v.e, phone=CASE WHEN t.phone='' OR t.phone IS NULL THEN v.p ELSE t.phone END, "
        f"contact_name=CASE WHEN coalesce(t.contact_name,'')='' THEN v.d ELSE t.contact_name END, updated_at=now() "
        f"FROM v WHERE t.audience=v.aud AND t.note='ИНН '||v.i AND coalesce(t.email,'')='' AND v.e<>''")
    updated = cur.rowcount
    cur.execute(
        f"WITH v(n,d,p,e,c,a,s,i,aud,ref,w) AS (VALUES {values}) "
        f"INSERT INTO {TABLE} (org_name, kind, contact_name, phone, email, city, website, status, address, segment, "
        f"source, note, unsubscribe_token, audience, ext_ref) "
        f"SELECT v.n, 'other', v.d, v.p, v.e, v.c, v.w, 'new', v.a, v.s, %s, 'ИНН '||v.i, "
        f"md5(random()::text || clock_timestamp()::text || v.n || v.i), v.aud, nullif(v.ref,'') FROM v "
        f"WHERE NOT EXISTS (SELECT 1 FROM {TABLE} x WHERE x.audience=v.aud AND x.note='ИНН '||v.i)", (src,))
    inserted = cur.rowcount
    conn.commit()
    return {'inserted': inserted, 'updated': updated, 'total': len(clean)}


REGISTRIES = {'kindergarten': registry_kids_kg, 'care': registry_kids_care}


def import_registry(cur, conn, audience: str = '') -> dict:
    """Загружает сады и детские дома из встроенного реестра. Повтор ничего не дублирует."""
    result = {'inserted': 0, 'updated': 0, 'total': 0}
    for aud, reg in REGISTRIES.items():
        if audience and audience != aud:
            continue
        keys = ('org_name', 'phone', 'email', 'city', 'address', 'segment', 'inn', 'ext_ref')
        rows = [{**dict(zip(keys, r)), 'audience': reg.AUDIENCE} for r in reg.ROWS]
        for i in range(0, len(rows), 800):
            r = import_rows(cur, conn, rows[i:i + 800])
            for k in result:
                result[k] += r[k]
    return result


def registry_size() -> int:
    return sum(len(r.ROWS) for r in REGISTRIES.values())


def _fetch(url: str) -> str:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124'})
    with urllib.request.urlopen(req, timeout=8, context=ctx) as r:
        if r.status != 200:
            return ''
        return r.read().decode('utf-8', 'ignore')


def _text(html: str) -> str:
    html = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', html, flags=re.S)
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' | ', html)))


def parse_card(html: str) -> dict:
    t = re.sub(r'(\|\s*)+', '| ', _text(html))

    def after(label):
        m = re.search(re.escape(label) + r'\s*\|\s*([^|]*)', t)
        return m.group(1).strip() if m else ''
    email = after('Контактный адрес электронной почты')
    if not EMAIL_RE.fullmatch(email or ''):
        m = EMAIL_RE.search(t)
        email = m.group(0) if m else ''
    return {'email': email.lower(), 'phone': after('Телефон')[:50], 'contact': after('Контактное лицо')[:200],
            'site': after('Адрес организации в сети Интернет')[:300]}


def enrich_batch(cur, conn) -> dict:
    """Дособирает почту для садов и детских домов без email: по одной карточке ЕИС за запрос, с паузами."""
    # Первый запуск: базы ещё нет — загружаем встроенный реестр (повторно ничего не дублируется).
    cur.execute(f"SELECT count(*) FROM {TABLE} WHERE audience IN ('kindergarten','care')")
    if cur.fetchone()[0] == 0:
        r = import_registry(cur, conn)
        return {'tried': 0, 'found': 0, 'blocked': False, 'imported': r['inserted']}
    cur.execute(f"SELECT id, ext_ref FROM {TABLE} WHERE audience IN ('kindergarten','care') AND coalesce(email,'')='' "
                f"AND ext_ref IS NOT NULL AND enrich_attempts < {ENRICH_MAX_ATTEMPTS} "
                f"ORDER BY enrich_attempts, (audience='care') DESC, id LIMIT %s", (ENRICH_BATCH,))
    rows = cur.fetchall()
    started = time.time()
    found, tried, blocked = 0, 0, False
    for rid, ref in rows:
        if time.time() - started > TIME_BUDGET_SEC:
            break
        kind, _, num = ref.partition(':')
        url = (f'{EIS}/epz/organization/view/info.html?organizationId={num}' if kind == 'o'
               else f'{EIS}/epz/organization/view223/info.html?agencyId={num}')
        try:
            html = _fetch(url)
        except Exception:
            html = ''
        if not html or 'подозрительная активность' in html:
            blocked = True
            break
        tried += 1
        c = parse_card(html)
        cur.execute(f"UPDATE {TABLE} SET enrich_attempts=enrich_attempts+1, "
                    f"email=CASE WHEN %s<>'' THEN %s ELSE email END, "
                    f"phone=CASE WHEN coalesce(phone,'')='' THEN %s ELSE phone END, "
                    f"contact_name=CASE WHEN coalesce(contact_name,'')='' THEN %s ELSE contact_name END, "
                    f"website=CASE WHEN coalesce(website,'')='' THEN %s ELSE website END, updated_at=now() WHERE id=%s",
                    (c['email'], c['email'], c['phone'], c['contact'], c['site'], rid))
        conn.commit()
        found += 1 if c['email'] else 0
        time.sleep(1.2)
    return {'tried': tried, 'found': found, 'blocked': blocked}


def settings(cur) -> bool:
    cur.execute(f'SELECT kids_enabled FROM {SCHEMA}.outreach_settings WHERE id=1')
    r = cur.fetchone()
    return bool(r and r[0])


def save_settings(cur, conn, enabled: bool) -> bool:
    cur.execute(f'UPDATE {SCHEMA}.outreach_settings SET kids_enabled=%s, updated_at=now() WHERE id=1', (bool(enabled),))
    conn.commit()
    return bool(enabled)


def overview(cur) -> dict:
    cur.execute(f"SELECT audience, city, count(*), count(*) FILTER (WHERE email<>''), "
                f"count(*) FILTER (WHERE unsubscribed_at IS NOT NULL), "
                f"count(*) FILTER (WHERE coalesce(email,'')='' AND ext_ref IS NOT NULL AND enrich_attempts < {ENRICH_MAX_ATTEMPTS}) "
                f"FROM {TABLE} WHERE audience IN ('kindergarten','care') GROUP BY 1,2 ORDER BY 1, 3 DESC")
    rows = cur.fetchall()
    cur.execute(f"SELECT campaign_code, status, count(*) FROM {SCHEMA}.edu_campaign_sends "
                f"WHERE is_test=FALSE AND campaign_code IN (%s,%s) GROUP BY 1,2",
                (kids_letters.KIDS_CAMPAIGN, kids_letters.CARE_CAMPAIGN))
    sends = {}
    for camp, st, n in cur.fetchall():
        sends.setdefault(camp, {})[st] = n
    pending = {}
    for aud in AUDIENCES:
        cur.execute(f"SELECT count(*) FROM {TABLE} WHERE {audience_where(aud)}")
        pending[aud] = cur.fetchone()[0]
    cur.execute(f"SELECT code_norm, used_count FROM {SCHEMA}.access_promo_codes WHERE code_norm IN ('МАЛЫШ','КАЖДЫЙРЕБЕНОК')")
    used = dict(cur.fetchall())
    out = {aud: {'cities': [], 'total': 0, 'with_email': 0, 'to_enrich': 0} for aud in AUDIENCES}
    for aud, city, t, e, u, enr in rows:
        o = out[aud]
        o['cities'].append({'city': city, 'total': t, 'with_email': e, 'unsubscribed': u, 'to_enrich': enr})
        o['total'] += t
        o['with_email'] += e
        o['to_enrich'] += enr
    for aud in AUDIENCES:
        s = sends.get(kids_letters.campaign_for(aud), {})
        out[aud].update({'sent': s.get('sent', 0), 'failed': s.get('failed', 0), 'pending': pending[aud]})
    out['kindergarten']['activations'] = used.get('МАЛЫШ', 0)
    out['care']['activations'] = used.get('КАЖДЫЙРЕБЕНОК', 0)
    out['enabled'] = settings(cur)
    out['registry_rows'] = registry_size()
    return out


def send_batch(cur, conn, limit: int, unsub_url, inst_by_id, ensure_token, started: float) -> dict:
    """Детские дома — первыми (их меньше, и для них доступ бессрочный), затем детские сады."""
    total = {'sent': 0, 'failed': 0, 'stop': False}
    if limit <= 0:
        return total
    smtp = None
    try:
        for aud in ('care', 'kindergarten'):
            if limit <= 0:
                break
            camp = kids_letters.campaign_for(aud)
            cur.execute(f"SELECT id FROM {TABLE} WHERE {audience_where(aud)} ORDER BY id LIMIT %s", (limit,))
            ids = [r[0] for r in cur.fetchall()]
            for rid in ids:
                if time.time() - started > TIME_BUDGET_SEC:
                    return total
                if smtp is None:
                    smtp = outreach.open_smtp()
                inst, token = inst_by_id(cur, rid)
                token = ensure_token(cur, rid, token)
                unsub = unsub_url(token)
                subject, html, text, reply = kids_letters.letter_for(inst, aud, unsub)
                try:
                    outreach.send_one(smtp, inst['email'], subject, html, text, unsub, reply)
                    cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status) "
                                f"VALUES (%s,%s,%s,'sent')", (camp, rid, inst['email']))
                    cur.execute(f"UPDATE {TABLE} SET last_mailed_at=now(), mail_count=mail_count+1, "
                                f"status=CASE WHEN status='new' THEN 'contacted' ELSE status END, updated_at=now() "
                                f"WHERE id=%s", (rid,))
                    total['sent'] += 1
                except Exception as e:
                    msg = f'{type(e).__name__}: {str(e)[:300]}'
                    cur.execute(f"INSERT INTO {SCHEMA}.edu_campaign_sends (campaign_code, institution_id, to_email, status, error) "
                                f"VALUES (%s,%s,%s,'failed',%s)", (camp, rid, inst['email'], msg))
                    total['failed'] += 1
                    if 'SMTPDataError' in msg or 'SMTPSenderRefused' in msg or 'quota' in msg.lower():
                        total['stop'] = 'spam' if outreach.is_spam_reject(msg) else 'blocked'
                        conn.commit()
                        return total
                conn.commit()
                limit -= 1
                outreach.pause()
    finally:
        if smtp is not None:
            try:
                smtp.quit()
            except Exception:
                pass
    return total


def sample(cur, audience: str):
    cur.execute(f"SELECT id FROM {TABLE} WHERE audience=%s AND email<>'' ORDER BY id LIMIT 1", (audience,))
    return cur.fetchone()


def load_json_rows(body: dict) -> list:
    rows = body.get('rows')
    if isinstance(rows, str):
        rows = json.loads(rows)
    return rows if isinstance(rows, list) else []
