"""
ИИ-аналитик IT-трендов. Собирает сигналы из открытых IT-источников (RSS Хабра и др.)
и сообщений нашего канала MAX, агрегирует рейтинг перспективных направлений
программирования, генерирует аналитические статьи в Ленту (категория 'tech').

GET  /?action=directions   — публичный рейтинг направлений (для дашборда сайта)
GET  /?action=dashboard    — расширенная сводка (метрики + последние сигналы)
GET  /?action=sources_status — состояние источников (включён/ошибки/последний сбор)
GET  /?action=resync       — публичный резервный сбор (реанимация + collect, rate-limit 30 мин)
GET  /?action=cron         (Bearer CRON_SECRET) — полный цикл: collect + aggregate + статья
POST /?action=collect      (X-Admin-Key) — собрать сигналы из источников
POST /?action=aggregate    (X-Admin-Key) — пересчитать рейтинг и ИИ-инсайты
POST /?action=generate_article (X-Admin-Key) — статья по топ-направлению в Ленту
GET  /?action=ping         — health-check
"""
import json
import os
import re
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from xml.etree import ElementTree as ET
import psycopg2

ADMIN_KEY = os.environ.get('ADMIN_KEY', '')
CRON_SECRET = os.environ.get('CRON_SECRET', '')
POLZA_API_KEY = os.environ.get('POLZA_API_KEY', '')
POLZA_URL = 'https://api.polza.ai/api/v1/chat/completions'
POLZA_MODEL = 'gpt-4o-mini'
MAX_BOT_TOKEN = os.environ.get('MAX_BOT_TOKEN', '')
MAX_CHANNEL_ID = os.environ.get('MAX_CHANNEL_ID', '')
MAX_API = 'https://botapi.max.ru'

# Ключевые слова для классификации сигнала по направлению.
DIRECTION_KEYWORDS = {
    'python':     ['python', 'питон', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
    'javascript': ['javascript', 'js ', 'typescript', 'react', 'vue', 'angular', 'node', 'next.js', 'фронтенд'],
    'go':         ['golang', ' go ', 'goroutine'],
    'rust':       ['rust', 'раст ', 'cargo'],
    'ai-ml':      ['нейросет', 'машинн', 'machine learning', 'ml ', 'llm', 'gpt', 'искусственн', 'deep learning', 'трансформер'],
    'data':       ['данны', 'data science', 'аналитик', 'bigdata', 'big data', 'sql', 'spark', 'clickhouse'],
    'devops':     ['devops', 'kubernetes', 'k8s', 'docker', 'ci/cd', 'контейнер', 'облак', 'terraform'],
    'web':        ['веб-разработ', 'frontend', 'backend', 'http', 'api ', 'браузер', 'css', 'html'],
    'mobile':     ['android', 'ios', 'swift', 'kotlin', 'flutter', 'мобильн', 'react native'],
    'security':   ['безопасност', 'security', 'уязвимост', 'пентест', 'хакер', 'шифрован', 'cve'],
    'iot':        ['iot', 'интернет вещей', 'микроконтроллер', 'arduino', 'автоматизаци', 'датчик', 'промышленн'],
    'lowcode':    ['low-code', 'no-code', 'lowcode', 'nocode', 'без кода'],
}


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, Authorization',
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


def is_cron(headers: dict) -> bool:
    auth = (headers.get('Authorization') or headers.get('authorization')
            or headers.get('X-Authorization') or headers.get('x-authorization') or '')
    token = auth.replace('Bearer ', '').strip()
    return bool(CRON_SECRET) and token == CRON_SECRET


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
    s = re.sub(r'\s+', '-', ''.join(out).strip())
    s = re.sub(r'-+', '-', s)
    return s[:140] or 'tech-trend'


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
    req = urllib.request.Request(
        url, headers={'User-Agent': 'UchisProTrends/1.0 (+https://xn--h1agdcde2c.xn--p1ai)'})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def strip_html(html: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', html or '')
    text = re.sub(r'&[a-z]+;', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


def parse_rss(xml_bytes: bytes, limit: int = 12) -> list:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return []
    items = []
    for it in root.iter('item'):
        title = (it.findtext('title') or '').strip()
        link = (it.findtext('link') or '').strip()
        desc = (it.findtext('description') or '').strip()
        if title and link:
            items.append({'title': title, 'link': link, 'summary': strip_html(desc)[:1000]})
        if len(items) >= limit:
            break
    return items


def classify_direction(text: str):
    """Возвращает ключ направления по ключевым словам или None."""
    low = ' ' + text.lower() + ' '
    best = None
    best_hits = 0
    for key, words in DIRECTION_KEYWORDS.items():
        hits = sum(1 for w in words if w in low)
        if hits > best_hits:
            best_hits = hits
            best = key
    return best if best_hits > 0 else None


LAST_POLZA_ERROR = ''


def call_polza(prompt: str, system: str, max_tokens: int = 1100,
               temperature: float = 0.6, retries: int = 2):
    """Вызов polza.ai с ретраями на временные сбои (503/таймаут).
    Между попытками короткая пауза — провайдер часто оживает за 1-2 секунды."""
    global LAST_POLZA_ERROR
    if not POLZA_API_KEY:
        LAST_POLZA_ERROR = 'нет POLZA_API_KEY'
        return None
    payload = {
        'model': POLZA_MODEL,
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': prompt},
        ],
        'temperature': temperature,
        'max_tokens': max_tokens,
    }
    body_bytes = json.dumps(payload).encode('utf-8')
    for attempt in range(retries + 1):
        req = urllib.request.Request(
            POLZA_URL, data=body_bytes,
            headers={'Authorization': f'Bearer {POLZA_API_KEY}', 'Content-Type': 'application/json'},
            method='POST')
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                choices = data.get('choices') or []
                if choices:
                    content = (choices[0].get('message') or {}).get('content', '').strip()
                    if content:
                        return content
                    LAST_POLZA_ERROR = 'пустой content в ответе'
                else:
                    LAST_POLZA_ERROR = f'нет choices: {str(data)[:150]}'
        except urllib.error.HTTPError as e:
            body = ''
            try:
                body = e.read().decode('utf-8')[:150]
            except Exception:
                pass
            LAST_POLZA_ERROR = f'HTTP {e.code}: {body}'
            # 5xx — временный сбой, имеет смысл повторить; 4xx — нет
            if e.code < 500:
                return None
        except urllib.error.URLError as e:
            LAST_POLZA_ERROR = f'URLError: {str(e.reason)[:120]}'
        except (json.JSONDecodeError, OSError) as e:
            LAST_POLZA_ERROR = f'{type(e).__name__}: {str(e)[:120]}'
        if attempt < retries:
            time.sleep(1.5)
    return None


def fetch_max_messages(limit: int = 30) -> list:
    """Читает последние сообщения нашего канала MAX (куда добавлен бот)."""
    if not MAX_BOT_TOKEN or not MAX_CHANNEL_ID:
        return []
    url = f'{MAX_API}/messages?chat_id={MAX_CHANNEL_ID}&count={limit}'
    try:
        req = urllib.request.Request(url, headers={'Authorization': MAX_BOT_TOKEN})
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, OSError):
        return []
    out = []
    for m in (data.get('messages') or []):
        body = m.get('body') or {}
        text = body.get('text') or ''
        mid = body.get('mid') or m.get('timestamp') or ''
        if text:
            out.append({'title': text[:200], 'summary': text[:600], 'mid': str(mid)})
    return out


def collect_signals(cur, limit_per_source: int = 10) -> int:
    """Обходит источники, классифицирует и сохраняет сигналы. Возвращает число новых."""
    cur.execute("SELECT id, code, name, kind, url, weight FROM it_trend_sources WHERE enabled = TRUE")
    sources = cur.fetchall()
    created = 0
    for src_id, code, name, kind, url, weight in sources:
        items = []
        if kind == 'rss' and url:
            try:
                items = parse_rss(fetch_url(url), limit=limit_per_source)
                cur.execute(
                    "UPDATE it_trend_sources SET last_fetched_at = NOW(), last_fetch_count = %s, "
                    "last_error = NULL, consecutive_errors = 0 WHERE id = %s",
                    (len(items), src_id))
            except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
                cur.execute(
                    "UPDATE it_trend_sources SET last_error = %s, last_fetched_at = NOW(), "
                    "consecutive_errors = consecutive_errors + 1, "
                    "enabled = CASE WHEN consecutive_errors + 1 >= 6 THEN FALSE ELSE enabled END "
                    "WHERE id = %s", (str(e)[:480], src_id))
                continue
        elif kind == 'max_channel':
            msgs = fetch_max_messages(limit=30)
            items = [{'title': m['title'], 'link': None, 'summary': m['summary'],
                      'mid': m['mid']} for m in msgs]

        for it in items:
            text = f"{it.get('title','')} {it.get('summary','')}"
            direction = classify_direction(text)
            if not direction:
                continue
            dedup = it.get('link') or f"{code}:{it.get('mid','')}:{slugify(it.get('title',''))[:60]}"
            cur.execute("SELECT 1 FROM it_trend_signals WHERE dedup_key = %s LIMIT 1", (dedup,))
            if cur.fetchone():
                continue
            cur.execute(
                "INSERT INTO it_trend_signals (source_id, source_code, direction_key, title, url, "
                "summary, score, dedup_key) VALUES (%s,%s,%s,%s,%s,%s,%s,%s) "
                "ON CONFLICT (dedup_key) DO NOTHING",
                (src_id, code, direction, it.get('title', '')[:500], it.get('link'),
                 it.get('summary', '')[:1000], weight, dedup[:800]))
            created += 1
    return created


def aggregate_directions(cur, with_ai: bool = True) -> int:
    """Пересчитывает метрики, рейтинг, momentum и ИИ-инсайты направлений."""
    cur.execute("SELECT id, direction_key, name, description FROM it_trend_directions")
    dirs = cur.fetchall()
    rows = []
    for did, key, name, desc in dirs:
        cur.execute(
            "SELECT "
            "COALESCE(SUM(score),0), "
            "COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN score ELSE 0 END),0), "
            "COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN score ELSE 0 END),0), "
            "COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' THEN score ELSE 0 END),0) "
            "FROM it_trend_signals WHERE direction_key = %s", (key,))
        total, s7, s30, prev7 = cur.fetchone()
        # score: свежесть в приоритете
        score = round(float(s7) * 3 + float(s30) * 1.5 + float(total) * 0.5, 2)
        if prev7 and prev7 > 0:
            momentum = round((float(s7) - float(prev7)) / float(prev7) * 100, 1)
        else:
            momentum = 100.0 if s7 > 0 else 0.0
        rows.append({'id': did, 'key': key, 'name': name, 'desc': desc,
                     'total': total, 's7': s7, 's30': s30, 'score': score, 'momentum': momentum})

    rows.sort(key=lambda r: r['score'], reverse=True)
    for rank, r in enumerate(rows, start=1):
        insight = None
        # ИИ-инсайты только для топ-5 направлений — экономим время и токены.
        if with_ai and r['score'] > 0 and rank <= 5:
            insight = build_insight(r)
        if insight:
            cur.execute(
                "UPDATE it_trend_directions SET signals_total=%s, signals_7d=%s, signals_30d=%s, "
                "score=%s, momentum=%s, rank=%s, ai_insight=%s, updated_at=NOW() WHERE id=%s",
                (r['total'], r['s7'], r['s30'], r['score'], r['momentum'], rank, insight, r['id']))
        else:
            cur.execute(
                "UPDATE it_trend_directions SET signals_total=%s, signals_7d=%s, signals_30d=%s, "
                "score=%s, momentum=%s, rank=%s, updated_at=NOW() WHERE id=%s",
                (r['total'], r['s7'], r['s30'], r['score'], r['momentum'], rank, r['id']))
    return len(rows)


def build_insight(r: dict):
    trend = 'растёт' if r['momentum'] > 5 else ('стабильно' if r['momentum'] >= -5 else 'снижается')
    prompt = (
        f"Направление: {r['name']}. {r['desc']}\n"
        f"Сигналов за 7 дней: {r['s7']}, за 30 дней: {r['s30']}, динамика: {r['momentum']}% ({trend}).\n"
        f"Дай краткий вывод (1-2 предложения) о перспективности этого направления для "
        f"изучения и карьеры в России: где применяется, стоит ли вкладываться. "
        f"Без воды, конкретно. Только русский язык."
    )
    return call_polza(prompt, "Ты — IT-аналитик. Оцениваешь перспективность технологий честно и конкретно.",
                      max_tokens=200, temperature=0.5)


# Эталонный системный промпт: задаёт «личность» аналитика и стандарт качества.
ANALYST_SYSTEM = (
    "Ты — главный IT-аналитик образовательной платформы УЧИСЬПРО. "
    "Твой стиль: умный, честный, с собственной аргументированной позицией. "
    "Ты не пересказываешь новости — ты ОСМЫСЛЯЕШЬ их и формируешь личное экспертное мнение. "
    "Пишешь живым русским языком для умного школьника и студента: без воды, штампов и канцелярита. "
    "Главное правило: никогда не выдумывай конкретные цифры и факты, которых нет в данных. "
    "Если данных мало — честно скажи об этом и рассуждай аккуратно."
)


def generate_trend_article(cur) -> dict:
    """Эталонный конвейер: Сбор фактуры → Анализ контекста → Своё мнение → Статья.
    Пишет авторский аналитический материал по топ-направлению в feed_articles."""
    # ── Шаг 1. Сбор: топ-направление + полный рейтинг как контекст ──
    cur.execute(
        "SELECT direction_key, name, emoji, description, signals_7d, signals_30d, score, momentum, rank "
        "FROM it_trend_directions WHERE signals_30d > 0 ORDER BY score DESC LIMIT 1")
    row = cur.fetchone()
    if not row:
        return {'created': False, 'reason': 'нет данных для статьи'}
    key, name, emoji, desc, s7, s30, score, momentum, rank = row

    # Фактура: свежие публикации по теме
    cur.execute(
        "SELECT title FROM it_trend_signals WHERE direction_key = %s "
        "ORDER BY created_at DESC LIMIT 8", (key,))
    facts = [r[0] for r in cur.fetchall()]
    facts_text = '\n'.join(f"- {t}" for t in facts) or '- (свежих публикаций мало)'

    # ── Шаг 2. Анализ контекста: как направление выглядит на фоне других ──
    cur.execute(
        "SELECT name, signals_7d, momentum FROM it_trend_directions "
        "WHERE signals_30d > 0 AND direction_key != %s ORDER BY score DESC LIMIT 4", (key,))
    rivals = cur.fetchall()
    rivals_text = '\n'.join(
        f"- {rn}: {r7} сигналов/нед, динамика {rm}%" for rn, r7, rm in rivals
    ) or '- (других активных направлений пока нет)'

    trend = 'уверенно растёт' if momentum > 5 else ('держится стабильно' if momentum >= -5 else 'теряет обороты')

    # ── Шаг 3+4. Своё мнение → Статья. Промпт требует авторской позиции и прогноза. ──
    prompt = (
        f"НАПРАВЛЕНИЕ ДЛЯ РАЗБОРА: «{name}» (место в рейтинге трендов: #{rank}).\n"
        f"Суть направления: {desc}\n\n"
        f"ДАННЫЕ НАШЕЙ АНАЛИТИКИ:\n"
        f"- сигналов за неделю: {s7}, за месяц: {s30}\n"
        f"- динамика интереса: {momentum}% ({trend})\n\n"
        f"СВЕЖАЯ ФАКТУРА (реальные публикации из IT-источников):\n{facts_text}\n\n"
        f"КОНТЕКСТ — конкурирующие направления в рейтинге:\n{rivals_text}\n\n"
        f"ЗАДАЧА. Напиши ОРИГИНАЛЬНУЮ авторскую аналитическую статью. Не пересказ новостей, "
        f"а осмысление. Обязательная структура внутри content (раздели абзацами):\n"
        f"1) «Что происходит» — суть момента простыми словами, опираясь на фактуру.\n"
        f"2) «Почему это важно» — связь с реальным бизнесом, промышленностью, экономикой РФ.\n"
        f"3) «Мнение редакции УЧИСЬПРО» — ТВОЯ личная аргументированная позиция: перегрет тренд "
        f"или недооценён, чего ждать дальше (прогноз), на фоне конкурентов из контекста.\n"
        f"4) «Что делать школьнику/студенту» — конкретный честный совет: стоит ли вкладываться и с чего начать.\n\n"
        f"Верни СТРОГО JSON без markdown:\n"
        f'{{"title":"цепляющий заголовок до 90 символов, без кликбейта",'
        f'"summary":"лид-абзац до 220 символов, который интригует",'
        f'"content":"4-6 содержательных абзацев живым языком, с явной авторской позицией и прогнозом",'
        f'"verdict":"одно предложение — главный вывод-мнение редакции",'
        f'"tags":["4-6 тегов одним словом"]}}'
    )
    raw = call_polza(prompt, ANALYST_SYSTEM, max_tokens=1200, temperature=0.72)
    if not raw:
        return {'created': False, 'reason': f'ИИ недоступен ({LAST_POLZA_ERROR})'}
    raw = re.sub(r'^```(?:json)?\s*', '', raw.strip())
    raw = re.sub(r'\s*```$', '', raw)
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        # Резерв: вытаскиваем JSON-объект из текста, если ИИ добавил пояснения вокруг
        m = re.search(r'\{.*\}', raw, flags=re.DOTALL)
        if not m:
            return {'created': False, 'reason': f'ИИ вернул не-JSON: {raw[:120]}'}
        try:
            parsed = json.loads(m.group(0))
        except json.JSONDecodeError:
            return {'created': False, 'reason': f'JSON не распарсился: {raw[:120]}'}

    title = str(parsed.get('title') or f'Тренд: {name}')[:380]
    summary = str(parsed.get('summary') or '')[:900]
    content = str(parsed.get('content') or '')[:25000]
    verdict = str(parsed.get('verdict') or '').strip()
    tags = [str(t)[:30] for t in (parsed.get('tags') or [])][:8]
    if not content:
        return {'created': False, 'reason': 'пустой контент'}

    # Вердикт-мнение выносим в начало статьи как акцент авторской позиции.
    if verdict:
        content = f"💡 Мнение редакции: {verdict}\n\n{content}"

    words = len(content.split())
    reading_time = max(2, min(20, round(words / 200)))
    slug = unique_slug(cur, slugify(title))

    cur.execute(
        "INSERT INTO feed_articles (slug, title, summary, content, category, source_kind, "
        "source_name, status, tags, reading_time_min, ai_processed, ai_notes, "
        "source_language, published_at) "
        "VALUES (%s,%s,%s,%s,'tech','agent',%s,'published',%s,%s,TRUE,%s,'ru',NOW())",
        (slug, title, summary, content, 'ИИ-аналитик трендов',
         json.dumps(tags, ensure_ascii=False), reading_time,
         f'Аналитический отчёт по направлению «{name}». Сгенерировано ИИ-аналитиком трендов.'))
    cur.execute("UPDATE it_trend_directions SET last_article_slug = %s WHERE direction_key = %s",
                (slug, key))
    return {'created': True, 'slug': slug, 'title': title, 'direction': name}


def list_directions(cur) -> list:
    cur.execute(
        "SELECT direction_key, name, emoji, description, category, signals_total, signals_7d, "
        "signals_30d, score, momentum, rank, ai_insight, last_article_slug, updated_at "
        "FROM it_trend_directions ORDER BY COALESCE(rank, 999), score DESC")
    out = []
    for r in cur.fetchall():
        out.append({
            'key': r[0], 'name': r[1], 'emoji': r[2], 'description': r[3], 'category': r[4],
            'signals_total': r[5], 'signals_7d': r[6], 'signals_30d': r[7],
            'score': float(r[8]), 'momentum': float(r[9]), 'rank': r[10],
            'ai_insight': r[11], 'last_article_slug': r[12], 'updated_at': r[13],
        })
    return out


def list_max_channels(cur) -> list:
    """Каталог IT-каналов MAX с привязкой к направлениям."""
    cur.execute(
        "SELECT handle, name, max_url, direction_key, topic, emoji "
        "FROM it_max_channels WHERE enabled = TRUE ORDER BY sort_order, id")
    return [{'handle': r[0], 'name': r[1], 'max_url': r[2], 'direction': r[3],
             'topic': r[4], 'emoji': r[5]} for r in cur.fetchall()]


def revive_stale_sources(cur) -> int:
    """Возвращает в строй источники, отключённые из-за временных ошибок.
    RSS-ленты периодически падают (5xx/таймаут) и накапливают ошибки до авто-отключения.
    Раз в прогон даём им второй шанс: сбрасываем счётчик ошибок и включаем снова,
    если с последней ошибки прошло больше суток. Возвращает число реанимированных."""
    cur.execute(
        "UPDATE it_trend_sources SET enabled = TRUE, consecutive_errors = 0 "
        "WHERE enabled = FALSE AND kind = 'rss' "
        "AND (last_fetched_at IS NULL OR last_fetched_at < NOW() - INTERVAL '1 day')")
    return cur.rowcount


def handle_cron(cur) -> dict:
    """Эталонный конвейер. Сбор сигналов выполняется ВСЕГДА (он быстрый — RSS),
    затем быстрая агрегация, и только потом — статья в Ленту по остаточному принципу
    и своему лимиту (не чаще раза в 2 дня). Так рейтинг всегда обновляется свежими данными."""
    cur.execute("INSERT INTO it_trend_runs (kind, status) VALUES ('cron','running') RETURNING id")
    run_id = cur.fetchone()[0]

    # ── Фаза 0. Реанимация источников, отключённых из-за временных сбоев ──
    revived = revive_stale_sources(cur)

    # ── Фаза 1. Сбор сигналов + быстрая агрегация (всегда) ──
    collected = collect_signals(cur)
    aggregate_directions(cur, with_ai=False)

    # ── Фаза 2. Статья в Ленту — не чаще раза в 2 дня, после сбора ──
    article_created = 0
    article_info = None
    skip_reason = None
    cur.execute(
        "SELECT 1 FROM feed_articles WHERE category='tech' AND source_kind='agent' "
        "AND published_at >= NOW() - INTERVAL '2 days' LIMIT 1")
    need_article = cur.fetchone() is None

    if need_article:
        res = generate_trend_article(cur)
        if res.get('created'):
            article_created = 1
            article_info = res
        else:
            skip_reason = res.get('reason')
    else:
        skip_reason = 'свежая статья уже есть (лимит 2 дня)'

    cur.execute(
        "UPDATE it_trend_runs SET status='ok', signals_collected=%s, articles_created=%s, "
        "error_message=%s, finished_at=NOW() WHERE id=%s",
        (collected, article_created, (skip_reason or '')[:500], run_id))
    return {'ok': True, 'signals_collected': collected, 'sources_revived': revived,
            'articles_created': article_created, 'article': article_info,
            'skip_reason': skip_reason}


def handle_tick(cur) -> dict:
    """Ленивый дневной автозапуск без внешнего планировщика.
    Полный цикл выполняется НЕ ЧАЩЕ одного раза в сутки (по дате МСК).
    Атомарно «занимаем» сегодняшний день — защита от гонки при заходе нескольких юзеров."""
    from datetime import timedelta
    now_msk = datetime.now(timezone.utc) + timedelta(hours=3)
    today_msk = now_msk.date()
    cur.execute(
        "UPDATE it_trend_cron SET last_tick_date=%s, last_tick_at=NOW() "
        "WHERE id=1 AND (last_tick_date IS NULL OR last_tick_date < %s)",
        (today_msk, today_msk))
    claimed = cur.rowcount > 0
    if not claimed:
        return {'ok': True, 'skipped_already_ran_today': True, 'date': str(today_msk)}
    return handle_cron(cur)


def handle_seed_if_empty(cur) -> dict:
    """Публичный авто-посев: если сигналов ещё нет — собирает данные.
    Защита от частых запусков через журнал it_trend_runs (не чаще раза в 30 минут)."""
    cur.execute("SELECT COUNT(*) FROM it_trend_signals")
    if cur.fetchone()[0] > 0:
        return {'ok': True, 'skipped': True, 'reason': 'данные уже есть'}
    cur.execute(
        "SELECT 1 FROM it_trend_runs WHERE kind='seed' "
        "AND started_at >= NOW() - INTERVAL '30 minutes' LIMIT 1")
    if cur.fetchone():
        return {'ok': True, 'skipped': True, 'reason': 'недавно уже запускали'}
    cur.execute("INSERT INTO it_trend_runs (kind, status) VALUES ('seed','running') RETURNING id")
    run_id = cur.fetchone()[0]
    collected = collect_signals(cur)
    # Без ИИ — чтобы уложиться в таймаут. Инсайты подтянет cron-прогон.
    aggregate_directions(cur, with_ai=False)
    cur.execute(
        "UPDATE it_trend_runs SET status='ok', signals_collected=%s, finished_at=NOW() WHERE id=%s",
        (collected, run_id))
    return {'ok': True, 'auto_seeded': True, 'signals_collected': collected}


def handler(event: dict, context) -> dict:
    """ИИ-аналитик IT-трендов: сбор сигналов, рейтинг направлений, статьи в Ленту."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'directions')
    headers = event.get('headers') or {}

    if action == 'ping':
        return ok({'ok': True, 'service': 'it-trends-analyst'})

    conn = get_db()
    conn.autocommit = False
    try:
        cur = conn.cursor()

        if action == 'directions':
            data = list_directions(cur)
            conn.commit()
            return ok({'directions': data, 'count': len(data)})

        if action == 'channels':
            data = list_max_channels(cur)
            conn.commit()
            return ok({'channels': data, 'count': len(data)})

        if action == 'dashboard':
            dirs = list_directions(cur)
            channels = list_max_channels(cur)
            cur.execute("SELECT COUNT(*), COALESCE(MAX(created_at), NOW()) FROM it_trend_signals")
            total_signals, last_signal = cur.fetchone()
            cur.execute(
                "SELECT title, direction_key, source_code, created_at FROM it_trend_signals "
                "ORDER BY created_at DESC LIMIT 15")
            recent = [{'title': t, 'direction': d, 'source': s, 'at': a}
                      for t, d, s, a in cur.fetchall()]
            cur.execute(
                "SELECT kind, status, signals_collected, articles_created, started_at "
                "FROM it_trend_runs ORDER BY started_at DESC LIMIT 1")
            lr = cur.fetchone()
            last_run = ({'kind': lr[0], 'status': lr[1], 'signals': lr[2],
                         'articles': lr[3], 'at': lr[4]} if lr else None)
            conn.commit()
            return ok({'directions': dirs, 'channels': channels,
                       'total_signals': total_signals,
                       'last_signal_at': last_signal, 'recent_signals': recent,
                       'last_run': last_run})

        if action == 'sources_status':
            cur.execute(
                "SELECT code, name, kind, enabled, consecutive_errors, last_fetch_count, "
                "last_fetched_at, last_error FROM it_trend_sources ORDER BY enabled DESC, code")
            srcs = [{'code': r[0], 'name': r[1], 'kind': r[2], 'enabled': r[3],
                     'consecutive_errors': r[4], 'last_fetch_count': r[5],
                     'last_fetched_at': r[6], 'last_error': r[7]} for r in cur.fetchall()]
            conn.commit()
            return ok({'sources': srcs, 'count': len(srcs)})

        if action == 'seed_if_empty':
            res = handle_seed_if_empty(cur)
            conn.commit()
            return ok(res)

        if action == 'resync':
            # Публичный резервный сбор: реанимируем источники, собираем сигналы
            # и пересчитываем рейтинг. Rate-limit — не чаще раза в 30 минут.
            cur.execute(
                "SELECT 1 FROM it_trend_runs WHERE kind='resync' "
                "AND started_at >= NOW() - INTERVAL '30 minutes' LIMIT 1")
            if cur.fetchone():
                conn.commit()
                return ok({'ok': True, 'skipped': True, 'reason': 'недавно уже синхронизировали'})
            cur.execute("INSERT INTO it_trend_runs (kind, status) VALUES ('resync','running') RETURNING id")
            run_id = cur.fetchone()[0]
            revived = revive_stale_sources(cur)
            collected = collect_signals(cur)
            aggregate_directions(cur, with_ai=False)
            cur.execute(
                "UPDATE it_trend_runs SET status='ok', signals_collected=%s, finished_at=NOW() WHERE id=%s",
                (collected, run_id))
            conn.commit()
            return ok({'ok': True, 'sources_revived': revived, 'signals_collected': collected})

        if action == 'tick':
            res = handle_tick(cur)
            conn.commit()
            return ok(res)

        if action == 'cron':
            if not is_cron(headers):
                return err('unauthorized', 401)
            res = handle_cron(cur)
            conn.commit()
            return ok(res)

        if action in ('collect', 'aggregate', 'generate_article'):
            if not is_admin(headers):
                return err('unauthorized', 401)
            if action == 'collect':
                n = collect_signals(cur)
                conn.commit()
                return ok({'ok': True, 'signals_collected': n})
            if action == 'aggregate':
                n = aggregate_directions(cur, with_ai=True)
                conn.commit()
                return ok({'ok': True, 'directions_updated': n})
            res = generate_trend_article(cur)
            conn.commit()
            return ok(res)

        return err('unknown action', 404)
    except Exception as e:
        conn.rollback()
        return err(f'internal: {str(e)[:300]}', 500)
    finally:
        conn.close()