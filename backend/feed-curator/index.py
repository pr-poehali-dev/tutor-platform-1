"""
ИИ-агент «Куратор Ленты» — парсит RSS-источники, рерайтит тексты через polza.ai,
сохраняет в feed_articles со статусом 'published' (агент сам себе модератор).

POST /?action=fetch_all     (X-Admin-Key) body:{limit?:int}     — обход всех включённых источников
POST /?action=fetch_one     (X-Admin-Key) body:{source_code}    — один источник
GET  /?action=sources       (X-Admin-Key)                       — список источников и их статус
"""
import json
import os
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone
from xml.etree import ElementTree as ET
import psycopg2


ADMIN_KEY = os.environ.get('ADMIN_KEY', '')
POLZA_API_KEY = os.environ.get('POLZA_API_KEY', '')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'gpt-4o-mini'
ALLOWED_CATEGORIES = {'science', 'culture', 'education', 'robots', 'ai'}


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def is_admin(headers: dict) -> bool:
    key = (headers.get('X-Admin-Key') or headers.get('x-admin-key') or '').strip()
    return bool(ADMIN_KEY) and key == ADMIN_KEY


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def slugify(text: str) -> str:
    rus = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
    eng = ['a','b','v','g','d','e','yo','zh','z','i','y','k','l','m','n','o',
           'p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya']
    out = []
    for ch in text.lower():
        if ch in rus:
            out.append(eng[rus.index(ch)])
        elif ch.isalnum() or ch == ' ':
            out.append(ch)
        else:
            out.append(' ')
    s = ''.join(out)
    s = re.sub(r'\s+', '-', s.strip())
    s = re.sub(r'-+', '-', s)
    return s[:140] or 'article'


def unique_slug(cur, base: str) -> str:
    s = base
    i = 2
    while True:
        cur.execute("SELECT 1 FROM feed_articles WHERE slug = %s LIMIT 1", (s,))
        if not cur.fetchone():
            return s
        s = f"{base}-{i}"
        i += 1


def fetch_url(url: str, timeout: int = 12) -> bytes:
    """HTTP GET с User-Agent."""
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'UchisProBot/1.0 (+https://xn--h1agdcde2c.xn--p1ai)'}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def strip_html(html: str) -> str:
    """Убирает HTML-теги, нормализует пробелы."""
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&nbsp;|&laquo;|&raquo;|&mdash;|&ndash;|&quot;|&amp;|&lt;|&gt;', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_rss(xml_bytes: bytes, limit: int = 8) -> list:
    """Парсит RSS/Atom. Возвращает [{title, link, summary, image, pub_date}]."""
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return []

    items = []

    # RSS 2.0: rss > channel > item
    for it in root.iter('item'):
        title = (it.findtext('title') or '').strip()
        link = (it.findtext('link') or '').strip()
        desc = (it.findtext('description') or '').strip()
        pub = (it.findtext('pubDate') or '').strip()

        # Картинка: enclosure или media:content
        image = None
        for enc in it.iter():
            tag = enc.tag.split('}')[-1] if '}' in enc.tag else enc.tag
            if tag in ('enclosure', 'content', 'thumbnail'):
                url_attr = enc.attrib.get('url') or enc.attrib.get('href')
                t = enc.attrib.get('type') or ''
                if url_attr and (t.startswith('image/') or url_attr.lower().endswith(('.jpg', '.png', '.webp', '.jpeg'))):
                    image = url_attr
                    break

        if title and link:
            items.append({
                'title': title,
                'link': link,
                'summary': strip_html(desc)[:1200],
                'image': image,
                'pub_date': pub,
            })
        if len(items) >= limit:
            break

    # Atom: feed > entry
    if not items:
        ns = '{http://www.w3.org/2005/Atom}'
        for it in root.iter(ns + 'entry'):
            title_el = it.find(ns + 'title')
            link_el = it.find(ns + 'link')
            summary_el = it.find(ns + 'summary')
            title = (title_el.text or '').strip() if title_el is not None else ''
            link = link_el.attrib.get('href') if link_el is not None else ''
            summary = strip_html(summary_el.text or '')[:1200] if summary_el is not None else ''
            if title and link:
                items.append({'title': title, 'link': link, 'summary': summary,
                              'image': None, 'pub_date': ''})
            if len(items) >= limit:
                break

    return items


def already_exists(cur, source_url: str) -> bool:
    cur.execute(
        "SELECT 1 FROM feed_articles WHERE source_url = %s LIMIT 1",
        (source_url,)
    )
    return cur.fetchone() is not None


def call_polza(prompt: str, max_tokens: int = 800) -> str | None:
    """Вызов polza.ai для рерайта. Возвращает текст или None при ошибке."""
    if not POLZA_API_KEY:
        return None
    payload = {
        'model': POLZA_MODEL,
        'messages': [
            {'role': 'system',
             'content': 'Ты — редактор детского научно-популярного журнала «Хочу всё знать». '
                        'Пишешь живо, понятно школьнику 8-11 класса, без канцелярита. '
                        'Никогда не выдумывай факты. Отвечай только русским языком.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.5,
        'max_tokens': max_tokens,
    }
    req = urllib.request.Request(
        POLZA_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {POLZA_API_KEY}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=22) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            choices = data.get('choices') or []
            if choices:
                return (choices[0].get('message') or {}).get('content', '').strip()
    except urllib.error.HTTPError:
        return None
    except urllib.error.URLError:
        return None
    except json.JSONDecodeError:
        return None
    except OSError:
        return None
    return None


def rewrite_article(title: str, summary: str, category: str) -> dict:
    """Делает рерайт через ИИ. Возвращает {title, summary, content, tags, reading_time}."""
    cat_label = {
        'science': 'наука',
        'culture': 'культура и искусство',
        'education': 'образование и школа',
        'robots': 'робототехника',
        'ai': 'искусственный интеллект и нейросети',
    }.get(category, 'наука')

    prompt = (
        f'Раздел: {cat_label}.\n'
        f'Исходный заголовок: {title}\n'
        f'Исходное описание: {summary}\n\n'
        f'Задача: переписать для школьного журнала «Хочу всё знать».\n'
        f'Верни строго JSON без markdown:\n'
        f'{{\n'
        f'  "title": "новый заголовок (до 90 символов, живой, без кликбейта)",\n'
        f'  "summary": "лид-абзац 1-2 предложения (до 220 символов)",\n'
        f'  "content": "статья 2-4 абзаца простым языком для школьника. Объясни смысл, '
        f'значимость, что важно знать. Никаких выдуманных цифр.",\n'
        f'  "tags": ["3-5 тегов одним словом"]\n'
        f'}}'
    )

    raw = call_polza(prompt, max_tokens=900)
    if not raw:
        # Fallback — используем оригинальные тексты
        return {
            'title': title[:200],
            'summary': summary[:300] if summary else title,
            'content': summary or title,
            'tags': [category],
        }

    # Чистим markdown-обёртки
    raw = re.sub(r'^```(?:json)?\s*', '', raw.strip())
    raw = re.sub(r'\s*```$', '', raw)

    try:
        parsed = json.loads(raw)
        return {
            'title': str(parsed.get('title') or title)[:380],
            'summary': str(parsed.get('summary') or '')[:900],
            'content': str(parsed.get('content') or '')[:25000],
            'tags': [str(t)[:30] for t in (parsed.get('tags') or [])][:8],
        }
    except json.JSONDecodeError:
        return {
            'title': title[:200],
            'summary': summary[:300] if summary else title,
            'content': raw[:25000] if raw else summary,
            'tags': [category],
        }


def process_source(cur, source_row, limit_per_source: int = 5) -> dict:
    """Обрабатывает один источник. source_row: (id, code, name, category, rss_url)."""
    src_id, code, name, category, rss_url = source_row
    if category not in ALLOWED_CATEGORIES:
        return {'source': code, 'error': f'bad category {category}'}

    try:
        xml = fetch_url(rss_url)
    except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
        cur.execute(
            "UPDATE feed_sources SET last_error = %s, last_fetched_at = NOW() WHERE id = %s",
            (str(e)[:480], src_id)
        )
        return {'source': code, 'error': f'fetch: {e}', 'created': 0}

    items = parse_rss(xml, limit=limit_per_source * 2)
    created = 0
    skipped = 0

    for it in items[:limit_per_source]:
        if already_exists(cur, it['link']):
            skipped += 1
            continue

        rewrite = rewrite_article(it['title'], it['summary'], category)
        words = len((rewrite['content'] or '').split())
        reading_time = max(2, min(20, round(words / 200))) if words else 3

        base = slugify(rewrite['title'])
        slug = unique_slug(cur, base)

        cur.execute(
            "INSERT INTO feed_articles "
            "(slug, title, summary, content, category, cover_url, source_kind, "
            "source_name, source_url, status, tags, reading_time_min, ai_processed, "
            "ai_notes, published_at) "
            "VALUES (%s,%s,%s,%s,%s,%s,'agent',%s,%s,'published',%s,%s,TRUE,%s,NOW())",
            (slug, rewrite['title'], rewrite['summary'], rewrite['content'],
             category, it['image'], name, it['link'],
             json.dumps(rewrite['tags']), reading_time,
             f'Источник: {name}. Рерайт ИИ-куратора.')
        )
        created += 1

    cur.execute(
        "UPDATE feed_sources SET last_fetched_at = NOW(), last_fetch_count = %s, "
        "last_error = NULL WHERE id = %s",
        (created, src_id)
    )
    return {'source': code, 'category': category, 'fetched': len(items),
            'created': created, 'skipped': skipped}


def handle_fetch_all(headers: dict, body: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    limit_per_source = max(1, min(10, int(body.get('limit') or 3)))

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, code, name, category, rss_url FROM feed_sources "
                "WHERE enabled = TRUE ORDER BY id"
            )
            sources = cur.fetchall()

            results = []
            for s in sources:
                try:
                    res = process_source(cur, s, limit_per_source=limit_per_source)
                    conn.commit()
                    results.append(res)
                except (psycopg2.Error, urllib.error.URLError,
                        urllib.error.HTTPError, OSError, ValueError) as e:
                    conn.rollback()
                    results.append({'source': s[1], 'error': str(e)[:200]})

            total_created = sum(r.get('created', 0) for r in results)
            return ok({
                'ok': True,
                'sources_processed': len(results),
                'total_created': total_created,
                'results': results,
            })
    finally:
        conn.close()


def handle_fetch_one(headers: dict, body: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    code = (body.get('source_code') or '').strip()
    if not code:
        return err('source_code обязателен', 400)
    limit_per_source = max(1, min(10, int(body.get('limit') or 5)))

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, code, name, category, rss_url FROM feed_sources "
                "WHERE code = %s AND enabled = TRUE LIMIT 1",
                (code,)
            )
            row = cur.fetchone()
            if not row:
                return err('Источник не найден или выключен', 404)
            res = process_source(cur, row, limit_per_source=limit_per_source)
            conn.commit()
            return ok({'ok': True, 'result': res})
    finally:
        conn.close()


def handle_sources(headers: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT code, name, category, rss_url, enabled, last_fetched_at, "
                "last_fetch_count, last_error FROM feed_sources ORDER BY category, name"
            )
            items = [
                {
                    'code': r[0], 'name': r[1], 'category': r[2], 'rss_url': r[3],
                    'enabled': bool(r[4]),
                    'last_fetched_at': r[5].isoformat() if r[5] else None,
                    'last_fetch_count': r[6], 'last_error': r[7],
                }
                for r in cur.fetchall()
            ]
            return ok({'items': items})
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    """ИИ-агент: парсинг RSS и рерайт статей."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'sources').strip()
    headers = event.get('headers') or {}

    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except (json.JSONDecodeError, TypeError):
        body = {}

    if action == 'fetch_all' and method == 'POST':
        return handle_fetch_all(headers, body)
    if action == 'fetch_one' and method == 'POST':
        return handle_fetch_one(headers, body)
    if action == 'sources':
        return handle_sources(headers)

    return err('Неизвестное действие', 404)