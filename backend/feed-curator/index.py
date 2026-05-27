"""
ИИ-агент «Куратор Ленты» — парсит RSS-источники, рерайтит тексты через polza.ai,
сохраняет в feed_articles. Также ИИ-модератор статей читателей и cron-обработчик.

POST /?action=fetch_all     (X-Admin-Key)             — обход всех включённых источников
POST /?action=fetch_one     (X-Admin-Key)             — один источник
GET  /?action=sources       (X-Admin-Key)             — список источников и их статус
POST /?action=auto_moderate (X-Admin-Key)             — прогнать pending через ИИ-модератор
GET  /?action=cron          (Bearer CRON_SECRET)      — полный цикл: парсинг + автомодерация
GET  /?action=cron_log      (X-Admin-Key)             — последние 20 запусков cron
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


LANGUAGE_NAMES = {
    'ru': 'русский',
    'en': 'английский',
    'zh': 'китайский',
    'ja': 'японский',
    'ko': 'корейский',
    'fr': 'французский',
    'de': 'немецкий',
    'es': 'испанский',
}


def rewrite_article(title: str, summary: str, category: str,
                    language: str = 'ru', country: str = 'Россия') -> dict:
    """Делает рерайт + ПЕРЕВОД через ИИ. Финальный текст всегда на русском."""
    cat_label = {
        'science': 'наука',
        'culture': 'культура и искусство',
        'education': 'образование и школа',
        'robots': 'робототехника',
        'ai': 'искусственный интеллект и нейросети',
    }.get(category, 'наука')

    lang_name = LANGUAGE_NAMES.get(language, language)
    needs_translation = language != 'ru'

    if needs_translation:
        translation_directive = (
            f'ВАЖНО: исходный текст на языке "{lang_name}" из страны "{country}". '
            f'Сначала переведи смысл на русский, затем перепиши простым языком для школьника.\n'
            f'Все имена собственные, географические названия и термины адаптируй для русскоязычного читателя '
            f'(например, китайские города и фамилии давай в общепринятой русской транскрипции). '
            f'НЕ оставляй фрагменты на исходном языке — итог должен быть полностью на русском.\n'
        )
        # Для китайских материалов — особая бережность к контексту
        if country == 'Китай':
            translation_directive += (
                'Это материал из Китая — важный приоритетный источник. '
                'Сохрани все факты, цифры, имена учёных и названия проектов, '
                'но объясни их так, чтобы российскому школьнику было понятно. '
                'Можешь кратко пояснить географические/культурные реалии в скобках.\n'
            )
    else:
        translation_directive = ''

    prompt = (
        f'Раздел: {cat_label}. Страна источника: {country}.\n'
        f'{translation_directive}'
        f'Исходный заголовок: {title}\n'
        f'Исходное описание: {summary}\n\n'
        f'Задача: подготовить материал для школьного журнала «Хочу всё знать».\n'
        f'Итог СТРОГО НА РУССКОМ ЯЗЫКЕ — это обязательное правило.\n'
        f'Верни строго JSON без markdown:\n'
        f'{{\n'
        f'  "title": "новый заголовок на русском (до 90 символов, живой, без кликбейта)",\n'
        f'  "summary": "лид-абзац на русском 1-2 предложения (до 220 символов)",\n'
        f'  "content": "статья на русском 2-4 абзаца простым языком для школьника. '
        f'Объясни смысл, значимость, что важно знать. Никаких выдуманных цифр. '
        f'Если это материал из Китая или другой страны — упомяни этот контекст естественно в тексте.",\n'
        f'  "tags": ["3-5 тегов на русском одним словом"]\n'
        f'}}'
    )

    # Для переводов даём чуть больше токенов
    max_t = 1200 if needs_translation else 900
    raw = call_polza(prompt, max_tokens=max_t)
    if not raw:
        # Fallback: если ИИ недоступен и язык не русский — НЕ публикуем (нельзя смешивать языки)
        if needs_translation:
            return {
                'title': '',
                'summary': '',
                'content': '',
                'tags': [],
                'skip_reason': 'AI недоступен, перевод невозможен',
            }
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
        if needs_translation:
            return {'title': '', 'summary': '', 'content': '', 'tags': [],
                    'skip_reason': 'AI вернул некорректный JSON для перевода'}
        return {
            'title': title[:200],
            'summary': summary[:300] if summary else title,
            'content': raw[:25000] if raw else summary,
            'tags': [category],
        }


def process_source(cur, source_row, limit_per_source: int = 5) -> dict:
    """Обрабатывает один источник. source_row: (id, code, name, category, rss_url,
    language, country, country_flag, priority)."""
    src_id = source_row[0]
    code = source_row[1]
    name = source_row[2]
    category = source_row[3]
    rss_url = source_row[4]
    language = source_row[5] if len(source_row) > 5 else 'ru'
    country = source_row[6] if len(source_row) > 6 else 'Россия'

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
    failed_translation = 0

    for it in items[:limit_per_source]:
        if already_exists(cur, it['link']):
            skipped += 1
            continue

        rewrite = rewrite_article(it['title'], it['summary'], category,
                                  language=language, country=country)

        # Если для зарубежного материала не удалось перевести — не публикуем
        if rewrite.get('skip_reason') or not rewrite.get('title') or not rewrite.get('content'):
            failed_translation += 1
            continue

        words = len((rewrite['content'] or '').split())
        reading_time = max(2, min(20, round(words / 200))) if words else 3

        base = slugify(rewrite['title'])
        slug = unique_slug(cur, base)

        ai_notes = f'Источник: {name} ({country}). Рерайт ИИ-куратора.'
        if language != 'ru':
            ai_notes += f' Переведено с языка: {LANGUAGE_NAMES.get(language, language)}.'

        cur.execute(
            "INSERT INTO feed_articles "
            "(slug, title, summary, content, category, cover_url, source_kind, "
            "source_name, source_url, status, tags, reading_time_min, ai_processed, "
            "ai_notes, source_language, source_country, published_at) "
            "VALUES (%s,%s,%s,%s,%s,%s,'agent',%s,%s,'published',%s,%s,TRUE,%s,%s,%s,NOW())",
            (slug, rewrite['title'], rewrite['summary'], rewrite['content'],
             category, it['image'], name, it['link'],
             json.dumps(rewrite['tags']), reading_time,
             ai_notes, language, country)
        )
        created += 1

    cur.execute(
        "UPDATE feed_sources SET last_fetched_at = NOW(), last_fetch_count = %s, "
        "last_error = NULL WHERE id = %s",
        (created, src_id)
    )
    return {'source': code, 'category': category, 'country': country,
            'language': language, 'fetched': len(items),
            'created': created, 'skipped': skipped,
            'failed_translation': failed_translation}


def handle_fetch_all(headers: dict, body: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    limit_per_source = max(1, min(10, int(body.get('limit') or 3)))

    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Сортируем по priority DESC: Китай (300) → РФ (200) → Азия (150) → Запад (100)
            cur.execute(
                "SELECT id, code, name, category, rss_url, language, country, "
                "country_flag, priority FROM feed_sources "
                "WHERE enabled = TRUE ORDER BY priority DESC, id"
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
            # Группировка по странам — для UI/логов
            by_country: dict = {}
            for r in results:
                c = r.get('country') or 'Прочее'
                by_country[c] = by_country.get(c, 0) + r.get('created', 0)

            return ok({
                'ok': True,
                'sources_processed': len(results),
                'total_created': total_created,
                'by_country': by_country,
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
                "SELECT id, code, name, category, rss_url, language, country, "
                "country_flag, priority FROM feed_sources "
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
                "last_fetch_count, last_error, language, country, country_flag, priority "
                "FROM feed_sources ORDER BY priority DESC, country, name"
            )
            items = [
                {
                    'code': r[0], 'name': r[1], 'category': r[2], 'rss_url': r[3],
                    'enabled': bool(r[4]),
                    'last_fetched_at': r[5].isoformat() if r[5] else None,
                    'last_fetch_count': r[6], 'last_error': r[7],
                    'language': r[8], 'country': r[9], 'country_flag': r[10],
                    'priority': r[11],
                }
                for r in cur.fetchall()
            ]
            return ok({'items': items})
    finally:
        conn.close()


# ─── АВТОМОДЕРАЦИЯ ──────────────────────────────────────────────────

def moderate_with_ai(title: str, summary: str, content: str, category: str) -> dict:
    """ИИ-модератор: анализирует статью пользователя и выносит решение.

    Возвращает {verdict: approve|reject|flag, score: 0..100, reasoning: str}
    - approve (score >= 70): публикуем сразу
    - flag    (40-69):       откладываем для ручной проверки (остаётся pending)
    - reject  (< 40):        отклоняем с указанием причины
    """
    cat_label = {
        'science': 'наука',
        'culture': 'культура',
        'education': 'образование',
        'robots': 'робототехника',
        'ai': 'ИИ и нейросети',
    }.get(category, category)

    text_excerpt = content[:4000]

    prompt = (
        f'Проверь статью читателя для журнала «Хочу всё знать» (раздел: {cat_label}).\n'
        f'Школьная аудитория 8-11 класс.\n\n'
        f'ЗАГОЛОВОК: {title}\n'
        f'ЛИД: {summary}\n'
        f'ТЕКСТ: {text_excerpt}\n\n'
        f'Критерии оценки (по 100-балльной шкале):\n'
        f'- Соответствие категории "{cat_label}" (20 баллов)\n'
        f'- Образовательная ценность для школьника (25 баллов)\n'
        f'- Качество русского языка и грамотность (15 баллов)\n'
        f'- Достоверность фактов / отсутствие явных фейков (20 баллов)\n'
        f'- Отсутствие рекламы, оскорблений, токсичности, мата (20 баллов)\n\n'
        f'Если в тексте есть: реклама, мат, призывы к насилию, экстремизм, '
        f'ненависть к группам людей, явная дезинформация, спам — ставь reject.\n'
        f'Если статья пустая, бессмысленная или это копипаст без ценности — reject.\n\n'
        f'Верни строго JSON без markdown:\n'
        f'{{\n'
        f'  "score": число 0-100,\n'
        f'  "verdict": "approve" | "reject" | "flag",\n'
        f'  "reasoning": "1-2 предложения почему такое решение (для лога админа)"\n'
        f'}}\n'
        f'Правила: approve если score >= 70 и нет нарушений; flag если 40-69; reject если < 40 или есть нарушения.'
    )

    raw = call_polza(prompt, max_tokens=300)
    if not raw:
        # Если ИИ недоступен — оставляем на ручную модерацию
        return {
            'verdict': 'flag',
            'score': 50,
            'reasoning': 'ИИ-модератор недоступен — статья ждёт ручной проверки',
        }

    raw = re.sub(r'^```(?:json)?\s*', '', raw.strip())
    raw = re.sub(r'\s*```$', '', raw)

    try:
        parsed = json.loads(raw)
        verdict = str(parsed.get('verdict') or 'flag').lower()
        if verdict not in ('approve', 'reject', 'flag'):
            verdict = 'flag'
        score = int(parsed.get('score') or 50)
        score = max(0, min(100, score))
        reasoning = str(parsed.get('reasoning') or '')[:1000]
        return {'verdict': verdict, 'score': score, 'reasoning': reasoning}
    except (json.JSONDecodeError, ValueError, TypeError):
        return {'verdict': 'flag', 'score': 50,
                'reasoning': f'Не удалось распарсить ответ ИИ: {raw[:200]}'}


def auto_moderate_pending(cur, limit: int = 20) -> dict:
    """Прогоняет все pending-статьи через ИИ-модератора."""
    cur.execute(
        "SELECT id, title, summary, content, category FROM feed_articles "
        "WHERE status = 'pending' AND auto_moderation_at IS NULL "
        "ORDER BY created_at ASC LIMIT %s",
        (limit,)
    )
    items = cur.fetchall()

    approved = 0
    rejected = 0
    flagged = 0
    details = []

    for art_id, title, summary, content, category in items:
        decision = moderate_with_ai(title or '', summary or '', content or '', category or '')
        verdict = decision['verdict']
        score = decision['score']
        reasoning = decision['reasoning']

        if verdict == 'approve':
            cur.execute(
                "UPDATE feed_articles SET status = 'published', "
                "published_at = COALESCE(published_at, NOW()), "
                "moderated_by = 'ai-moderator', moderated_at = NOW(), "
                "auto_moderation_score = %s, auto_moderation_verdict = %s, "
                "auto_moderation_reasoning = %s, auto_moderation_at = NOW(), "
                "updated_at = NOW() WHERE id = %s",
                (score, verdict, reasoning, art_id)
            )
            approved += 1
        elif verdict == 'reject':
            cur.execute(
                "UPDATE feed_articles SET status = 'rejected', "
                "rejected_reason = %s, moderated_by = 'ai-moderator', "
                "moderated_at = NOW(), auto_moderation_score = %s, "
                "auto_moderation_verdict = %s, auto_moderation_reasoning = %s, "
                "auto_moderation_at = NOW(), updated_at = NOW() WHERE id = %s",
                (reasoning[:500], score, verdict, reasoning, art_id)
            )
            rejected += 1
        else:
            # flag — статья остаётся pending, но получает метку для админа
            cur.execute(
                "UPDATE feed_articles SET auto_moderation_score = %s, "
                "auto_moderation_verdict = %s, auto_moderation_reasoning = %s, "
                "auto_moderation_at = NOW(), updated_at = NOW() WHERE id = %s",
                (score, verdict, reasoning, art_id)
            )
            flagged += 1

        details.append({
            'id': art_id, 'title': (title or '')[:80],
            'verdict': verdict, 'score': score,
        })

    return {
        'moderated': len(items),
        'approved': approved,
        'rejected': rejected,
        'flagged': flagged,
        'details': details,
    }


def handle_auto_moderate(headers: dict, body: dict) -> dict:
    """Ручной запуск автомодерации из админки."""
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    limit = max(1, min(50, int(body.get('limit') or 20)))

    conn = get_db()
    try:
        with conn.cursor() as cur:
            result = auto_moderate_pending(cur, limit=limit)
            conn.commit()
            return ok({'ok': True, **result})
    finally:
        conn.close()


# ─── CRON ────────────────────────────────────────────────────────────

def is_cron_authorized(event: dict, headers: dict) -> bool:
    """Авторизация cron-вызова: X-Admin-Key ИЛИ x-cron-secret (vercel),
    либо параметр ?secret=ADMIN_KEY (для GET-триггеров)."""
    if is_admin(headers):
        return True
    # Vercel Cron шлёт заголовок Authorization: Bearer <CRON_SECRET>
    cron_secret = os.environ.get('CRON_SECRET', '')
    if cron_secret:
        auth = headers.get('Authorization') or headers.get('authorization') or ''
        if auth == f'Bearer {cron_secret}':
            return True
    # Fallback: ?secret в query (для cron-triggers, не умеющих заголовки)
    qs = event.get('queryStringParameters') or {}
    sec = (qs.get('secret') or '').strip()
    if ADMIN_KEY and sec == ADMIN_KEY:
        return True
    return False


def handle_cron(event: dict, headers: dict, body: dict) -> dict:
    """Полный цикл: парсинг источников + автомодерация pending.
    Вызывается по расписанию раз в 6 часов."""
    if not is_cron_authorized(event, headers):
        return err('Не авторизован для cron', 401)

    # При 45 источниках: 2 статьи/источник = ~90 новых материалов за прогон.
    # Этого достаточно для глобального охвата, не перегружая ИИ-рерайт.
    limit_per_source = max(1, min(10, int(body.get('limit') or 2)))
    moderate_limit = max(1, min(100, int(body.get('moderate_limit') or 50)))

    conn = get_db()
    fetched_total = 0
    fetch_results = []
    moderation = {'moderated': 0, 'approved': 0, 'rejected': 0, 'flagged': 0}
    cron_run_id = None
    err_msg = None

    try:
        with conn.cursor() as cur:
            # Создаём запись запуска
            cur.execute(
                "INSERT INTO feed_cron_runs (kind, status) VALUES ('auto_6h', 'running') "
                "RETURNING id"
            )
            cron_run_id = cur.fetchone()[0]
            conn.commit()

            # 1. Обход источников — приоритет: Китай (300) → РФ (200) → Азия (150) → Запад (100)
            cur.execute(
                "SELECT id, code, name, category, rss_url, language, country, "
                "country_flag, priority FROM feed_sources "
                "WHERE enabled = TRUE ORDER BY priority DESC, id"
            )
            sources = cur.fetchall()
            for s in sources:
                try:
                    res = process_source(cur, s, limit_per_source=limit_per_source)
                    conn.commit()
                    fetch_results.append(res)
                    fetched_total += res.get('created', 0)
                except (psycopg2.Error, urllib.error.URLError,
                        urllib.error.HTTPError, OSError, ValueError) as e:
                    conn.rollback()
                    fetch_results.append({'source': s[1], 'error': str(e)[:200]})

            # 2. Автомодерация всех pending (включая статьи юзеров)
            try:
                moderation = auto_moderate_pending(cur, limit=moderate_limit)
                conn.commit()
            except (psycopg2.Error, urllib.error.URLError, OSError) as e:
                conn.rollback()
                err_msg = f'auto_moderate failed: {e}'

            # 3. Финализируем запись запуска
            cur.execute(
                "UPDATE feed_cron_runs SET status = %s, fetched = %s, moderated = %s, "
                "approved = %s, rejected = %s, flagged = %s, error_message = %s, "
                "payload = %s, finished_at = NOW() WHERE id = %s",
                ('error' if err_msg else 'ok', fetched_total,
                 moderation.get('moderated', 0), moderation.get('approved', 0),
                 moderation.get('rejected', 0), moderation.get('flagged', 0),
                 err_msg,
                 json.dumps({'fetch': fetch_results,
                             'moderation_details': moderation.get('details', [])},
                            ensure_ascii=False),
                 cron_run_id)
            )
            conn.commit()

            return ok({
                'ok': True,
                'cron_run_id': cron_run_id,
                'fetched_new': fetched_total,
                'sources_processed': len(fetch_results),
                'moderation': {
                    'moderated': moderation.get('moderated', 0),
                    'approved': moderation.get('approved', 0),
                    'rejected': moderation.get('rejected', 0),
                    'flagged': moderation.get('flagged', 0),
                },
                'error': err_msg,
            })
    finally:
        conn.close()


def handle_cron_log(headers: dict) -> dict:
    if not is_admin(headers):
        return err('Требуется админский ключ', 401)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, kind, status, fetched, moderated, approved, rejected, "
                "flagged, error_message, started_at, finished_at "
                "FROM feed_cron_runs ORDER BY started_at DESC LIMIT 20"
            )
            items = [
                {
                    'id': r[0], 'kind': r[1], 'status': r[2],
                    'fetched': r[3], 'moderated': r[4],
                    'approved': r[5], 'rejected': r[6], 'flagged': r[7],
                    'error_message': r[8],
                    'started_at': r[9].isoformat() if r[9] else None,
                    'finished_at': r[10].isoformat() if r[10] else None,
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
    if action == 'auto_moderate' and method == 'POST':
        return handle_auto_moderate(headers, body)
    # cron: принимаем GET и POST — некоторые сервисы крон-триггеров умеют только GET
    if action == 'cron':
        return handle_cron(event, headers, body)
    if action == 'cron_log':
        return handle_cron_log(headers)

    return err('Неизвестное действие', 404)