"""
Автономный ИИ-агент канала в мессенджере MAX.
Сам пишет посты (анонсы новых статей Ленты + еженедельный дайджест платформы)
и публикует их в канал MAX. Управляется по расписанию (cron).

Эндпоинты:
GET/POST /?action=cron            header Authorization: Bearer CRON_SECRET -> цикл автопостинга
POST     /?action=channel_webhook                                          -> автодетект chat_id канала
GET      /?action=status          header Authorization: Bearer CRON_SECRET -> диагностика
GET      /?action=ping                                                     -> health-check
"""
import json
import os
import urllib.request
import urllib.error
import urllib.parse
from datetime import date, timedelta
import psycopg2

MAX_API_BASE = "https://botapi.max.ru"
POLZA_URL = "https://api.polza.ai/api/v1/chat/completions"
POLZA_MODEL = "openai/gpt-4o-mini"
SITE_URL = "https://учисьпро.рф"
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')

CATEGORY_EMOJI = {
    'science': '🔬', 'culture': '🎭', 'education': '📚',
    'robots': '🤖', 'ai': '🧠', 'grants': '🎓',
}

MAX_ARTICLES_PER_RUN = 3  # не спамить канал за один прогон


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(data, ensure_ascii=False)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def t(name: str) -> str:
    return f'{SCHEMA}.{name}'


# ---------- MAX Bot API ----------

def max_send_to_channel(chat_id: int, text: str) -> tuple:
    """Публикация поста в канал MAX. Возвращает (ok, error)."""
    token = os.environ.get('MAX_BOT_TOKEN', '')
    if not token:
        return False, 'MAX_BOT_TOKEN not set'
    url = f"{MAX_API_BASE}/messages?chat_id={chat_id}"
    payload = json.dumps({'text': text}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, method='POST',
                                 headers={'Content-Type': 'application/json',
                                          'Authorization': token})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
        return True, None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'ignore')
        return False, f'HTTP {e.code}: {body[:300]}'
    except Exception as e:
        return False, str(e)[:300]


# ---------- ИИ-генерация текста поста ----------

def call_polza(system: str, user: str, max_tokens: int = 400) -> str:
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return ''
    payload = json.dumps({
        'model': POLZA_MODEL,
        'messages': [
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ],
        'temperature': 0.7,
        'max_tokens': max_tokens,
        'presence_penalty': 0.3,
        'frequency_penalty': 0.3,
    }).encode('utf-8')
    req = urllib.request.Request(
        POLZA_URL, data=payload, method='POST',
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            choices = data.get('choices') or []
            if choices:
                return (choices[0].get('message') or {}).get('content', '').strip()
    except Exception:
        return ''
    return ''


SMM_SYSTEM = (
    "Ты — SMM-редактор образовательной платформы УЧИСЬПРО для детей и школьников. "
    "Пишешь короткие цепляющие посты для канала в мессенджере MAX. "
    "Стиль: живой, тёплый, дружелюбный, без канцелярита и кликбейта. "
    "1–3 коротких абзаца, можно 1–3 уместных эмодзи. Без хэштегов. "
    "Не выдумывай фактов сверх данных. Пиши только на русском языке."
)


def make_article_post(title: str, summary: str, category: str, url: str) -> str:
    emoji = CATEGORY_EMOJI.get(category, '📰')
    prompt = (
        f"Напиши пост-анонс новой статьи для канала. Заголовок: «{title}». "
        f"О чём статья: {summary or title}. "
        "Сделай 2 коротких абзаца: первый — крючок-интрига, второй — приглашение прочитать. "
        "Не вставляй ссылку — её добавят отдельно. Не повторяй заголовок дословно."
    )
    body = call_polza(SMM_SYSTEM, prompt, max_tokens=320)
    if not body:
        # запасной шаблон, если ИИ недоступен
        body = (f"{title}\n\n{(summary or '').strip()}").strip()
    return f"{emoji} {body}\n\n👉 Читать: {url}"


def make_weekly_digest(titles: list) -> str:
    joined = "; ".join(titles[:6]) if titles else ""
    prompt = (
        "Напиши тёплый еженедельный пост для канала образовательной платформы УЧИСЬПРО. "
        "Коротко расскажи, что внутри платформы полезного для родителей и школьников: "
        "модуль «Малыш» (обучение чтению, аудиосказки, песни, умные игры для детей 2–6 лет), "
        "подготовка к школе и ЕГЭ, ИИ-репетиторы, бесплатная Лента образовательных новостей. "
        + (f"Из свежих тем недели: {joined}. " if joined else "")
        + "2–3 абзаца, заверши мягким приглашением зайти. Без ссылки — её добавлю отдельно."
    )
    body = call_polza(SMM_SYSTEM, prompt, max_tokens=420)
    if not body:
        body = ("🌟 Новая неделя — новый повод учиться с удовольствием!\n\n"
                "В УЧИСЬПРО есть всё: модуль «Малыш» для самых маленьких, подготовка к школе и ЕГЭ, "
                "ИИ-репетиторы и бесплатная Лента образовательных новостей.")
    return f"{body}\n\n✨ Открыть платформу: {SITE_URL}"


# ---------- chat_id канала ----------

def get_channel_id(conn) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT channel_chat_id, enabled FROM " + t('max_channel_config') + " WHERE id = 1")
        row = cur.fetchone()
    if row and row[0] and (row[1] is None or row[1]):
        return int(row[0])
    env_id = os.environ.get('MAX_CHANNEL_ID', '').strip()
    if env_id:
        try:
            cid = int(env_id)
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE " + t('max_channel_config') + " SET channel_chat_id=%s, updated_at=NOW() WHERE id=1",
                    (cid,)
                )
                conn.commit()
            return cid
        except ValueError:
            return 0
    return 0


def save_channel_id(conn, chat_id: int, title: str = None):
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE " + t('max_channel_config') + " SET channel_chat_id=%s, "
            "channel_title=COALESCE(%s, channel_title), updated_at=NOW() WHERE id=1",
            (chat_id, title)
        )
        conn.commit()


# ---------- лог постов ----------

def already_posted(conn, kind: str, ref_key: str) -> bool:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM " + t('max_channel_posts') + " WHERE kind=%s AND ref_key=%s",
            (kind, ref_key)
        )
        return cur.fetchone() is not None


def log_post(conn, kind, ref_key, article_id, chat_id, text, success, error):
    with conn.cursor() as cur:
        try:
            cur.execute(
                "INSERT INTO " + t('max_channel_posts') +
                " (kind, ref_key, article_id, channel_chat_id, text, ok, error) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT (kind, ref_key) DO NOTHING",
                (kind, ref_key, article_id, chat_id, text, success, error)
            )
            conn.commit()
        except Exception:
            conn.rollback()


# ---------- основной цикл ----------

def handle_cron(conn) -> dict:
    chat_id = get_channel_id(conn)
    if not chat_id:
        return ok({'ok': False, 'reason': 'channel_not_linked',
                   'hint': 'Добавьте бота в канал или задайте секрет MAX_CHANNEL_ID'})

    posted_articles = 0
    skipped = 0

    # 1) Анонсы новых статей Ленты
    with conn.cursor() as cur:
        cur.execute(
            "SELECT a.id, a.slug, a.title, a.summary, a.category "
            "FROM " + t('feed_articles') + " a "
            "WHERE a.status='published' AND a.published_at IS NOT NULL "
            "AND a.published_at > NOW() - INTERVAL '7 days' "
            "AND NOT EXISTS (SELECT 1 FROM " + t('max_channel_posts') + " p "
            "  WHERE p.kind='feed_article' AND p.ref_key = a.slug) "
            "ORDER BY a.published_at ASC LIMIT %s",
            (MAX_ARTICLES_PER_RUN,)
        )
        rows = cur.fetchall()

    for aid, slug, title, summary, category in rows:
        url = f"{SITE_URL}/feed/{slug}"
        text = make_article_post(title, summary, category, url)
        success, error = max_send_to_channel(chat_id, text)
        log_post(conn, 'feed_article', slug, aid, chat_id, text, success, error)
        if success:
            posted_articles += 1
        else:
            skipped += 1

    # 2) Еженедельный дайджест (по понедельникам, один раз в неделю)
    digest_posted = False
    today = date.today()
    if today.weekday() == 0:  # понедельник
        iso = today.isocalendar()
        ref = f"{iso[0]}-W{iso[1]:02d}"
        if not already_posted(conn, 'weekly_digest', ref):
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT title FROM " + t('feed_articles') + " "
                    "WHERE status='published' AND published_at > NOW() - INTERVAL '7 days' "
                    "ORDER BY published_at DESC LIMIT 6"
                )
                titles = [r[0] for r in cur.fetchall()]
            text = make_weekly_digest(titles)
            success, error = max_send_to_channel(chat_id, text)
            log_post(conn, 'weekly_digest', ref, None, chat_id, text, success, error)
            digest_posted = success

    return ok({'ok': True, 'channel_chat_id': chat_id,
               'articles_posted': posted_articles, 'skipped': skipped,
               'weekly_digest': digest_posted})


def handle_channel_webhook(conn, body: dict) -> dict:
    """Автодетект chat_id канала: когда бота добавляют в канал."""
    update_type = body.get('update_type', '')
    chat = body.get('chat') or {}
    chat_id = chat.get('chat_id') or body.get('chat_id')
    title = chat.get('title')
    # типичные события: bot_added, chat_title_changed и т.п.
    if chat_id and update_type in ('bot_added', 'chat_membership', 'bot_started') :
        save_channel_id(conn, int(chat_id), title)
        return ok({'ok': True, 'linked_chat_id': chat_id})
    # на всякий случай — если в апдейте есть канал с chat_id
    if chat_id and chat.get('type') in ('channel', 'chat'):
        save_channel_id(conn, int(chat_id), title)
        return ok({'ok': True, 'linked_chat_id': chat_id})
    return ok({'ok': True})


def handle_status(conn) -> dict:
    with conn.cursor() as cur:
        cur.execute("SELECT channel_chat_id, channel_title, enabled FROM " + t('max_channel_config') + " WHERE id=1")
        cfg = cur.fetchone()
        cur.execute("SELECT count(*) FROM " + t('max_channel_posts') + " WHERE ok=TRUE")
        posted = cur.fetchone()[0]
        cur.execute("SELECT kind, ok, created_at FROM " + t('max_channel_posts') + " ORDER BY id DESC LIMIT 5")
        recent = [{'kind': r[0], 'ok': r[1], 'at': r[2].isoformat() if r[2] else None} for r in cur.fetchall()]
    return ok({
        'channel_linked': bool(cfg and cfg[0]),
        'channel_chat_id': cfg[0] if cfg else None,
        'channel_title': cfg[1] if cfg else None,
        'enabled': cfg[2] if cfg else None,
        'total_posted': posted,
        'has_bot_token': bool(os.environ.get('MAX_BOT_TOKEN')),
        'has_polza_key': bool(os.environ.get('POLZA_API_KEY')),
        'recent': recent,
    })


def is_cron_authorized(headers: dict) -> bool:
    secret = os.environ.get('CRON_SECRET', '')
    if not secret:
        return False
    auth = headers.get('Authorization') or headers.get('authorization') or ''
    return auth == f'Bearer {secret}'


def handler(event: dict, context) -> dict:
    """ИИ-агент канала MAX: сам пишет и публикует посты (новости Ленты + дайджест)."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    headers = event.get('headers') or {}

    raw = event.get('body') or '{}'
    try:
        body = json.loads(raw) if raw else {}
    except Exception:
        body = {}

    if method == 'GET' and action in ('', 'ping'):
        return ok({'ok': True, 'service': 'max-channel-agent'})

    if action == 'channel_webhook':
        conn = get_db()
        try:
            return handle_channel_webhook(conn, body)
        finally:
            conn.close()

    if action in ('cron', 'status'):
        if not is_cron_authorized(headers):
            return err('forbidden', 403)
        conn = get_db()
        try:
            if action == 'cron':
                return handle_cron(conn)
            return handle_status(conn)
        finally:
            conn.close()

    return err('Неизвестное действие', 404)