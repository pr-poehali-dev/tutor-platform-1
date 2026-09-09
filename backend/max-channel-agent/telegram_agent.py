"""
Модуль Telegram-канала УЧИСЬПРО (подключён к функции max-channel-agent).
Автономный ИИ-агент Telegram-канала платформы УЧИСЬПРО.
Сам пишет посты (анонсы новых статей Ленты + еженедельный дайджест)
и публикует их в Telegram-канал. Отвечает на /start в личке.

Эндпоинты:
GET/POST /?action=cron     header Authorization: Bearer CRON_SECRET -> цикл автопостинга
GET      /?action=tick                                              -> ленивый дневной автозапуск (1 раз в сутки)
POST     /?action=webhook                                           -> вебхук бота (/start, автодетект канала)
GET      /?action=status   header Authorization: Bearer CRON_SECRET -> диагностика
GET      /?action=ping                                              -> health-check
"""
import json
import os
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta, timezone
import psycopg2

MSK = timezone(timedelta(hours=3))
POST_HOUR_FROM = 9
POST_HOUR_TO = 21

TG_API_BASE = "https://api.telegram.org"
POLZA_URL = "https://api.polza.ai/api/v1/chat/completions"
POLZA_MODEL = "openai/gpt-4o-mini"
SITE_URL = "https://учисьпро.рф"
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')

CATEGORY_EMOJI = {
    'science': '🔬', 'culture': '🎭', 'education': '📚',
    'robots': '🤖', 'ai': '🧠', 'grants': '🎓', 'business': '📈',
}

MAX_ARTICLES_PER_RUN = 2


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps(data, ensure_ascii=False)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def t(name: str) -> str:
    return f'{SCHEMA}.{name}'


def sanitize_text(text: str) -> str:
    """Убирает управляющие символы и лишние пустые строки."""
    if not text:
        return ''
    cleaned = ''.join(ch for ch in text if ch == '\n' or ord(ch) >= 32)
    lines = [' '.join(line.split()) for line in cleaned.split('\n')]
    result = '\n'.join(lines)
    while '\n\n\n' in result:
        result = result.replace('\n\n\n', '\n\n')
    return result.strip()


def html_escape(text: str) -> str:
    """Экранирует спецсимволы для parse_mode=HTML."""
    return (text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


# ---------- Telegram Bot API ----------

def tg_api(method: str, payload: dict, timeout: int = 20) -> tuple:
    """Вызов Telegram Bot API. Возвращает (ok, data_or_error)."""
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    if not token:
        return False, 'TELEGRAM_BOT_TOKEN not set'
    url = f"{TG_API_BASE}/bot{token}/{method}"
    data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        url, data=data, method='POST',
        headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode('utf-8'))
            return bool(body.get('ok')), body.get('result')
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', 'ignore')
        return False, f'HTTP {e.code}: {raw[:300]}'
    except Exception as e:
        return False, str(e)[:300]


def tg_send_to_channel(chat_id, text: str, image_url: str = '',
                       button: dict = None) -> tuple:
    """Публикует пост в канал. При наличии картинки — фото с подписью.
    Если фото не принялось, повторяет обычным текстом, чтобы пост точно вышел."""
    clean = sanitize_text(text)
    markup = None
    if button:
        markup = {'inline_keyboard': [[{'text': button['text'], 'url': button['url']}]]}

    if image_url:
        payload = {'chat_id': chat_id, 'photo': image_url,
                   'caption': clean[:1024], 'parse_mode': 'HTML'}
        if markup:
            payload['reply_markup'] = markup
        success, res = tg_api('sendPhoto', payload)
        if success:
            return True, None

    payload = {'chat_id': chat_id, 'text': clean[:4096], 'parse_mode': 'HTML',
               'disable_web_page_preview': False}
    if markup:
        payload['reply_markup'] = markup
    success, res = tg_api('sendMessage', payload)
    return (True, None) if success else (False, str(res)[:300])


def tg_send_to_user(chat_id, text: str) -> tuple:
    success, res = tg_api('sendMessage', {
        'chat_id': chat_id, 'text': sanitize_text(text)[:4096],
        'parse_mode': 'HTML', 'disable_web_page_preview': True})
    return (True, None) if success else (False, str(res)[:300])


def channel_link() -> str:
    name = os.environ.get('TELEGRAM_CHANNEL_USERNAME', '').lstrip('@')
    return f"https://t.me/{name}" if name else ''


def welcome_text() -> str:
    link = channel_link()
    parts = ["👋 Здравствуйте! Это бот платформы <b>УЧИСЬПРО</b>.\n",
             "Здесь — образовательные новости, разборы и полезные материалы "
             "для детей, родителей и взрослых.\n"]
    if link:
        parts.append(f"📢 Наш канал: {link}\n")
    parts.append(f"✨ Платформа: {SITE_URL}\n")
    parts.append("Первый урок в каждом курсе — бесплатно, без карты.")
    return '\n'.join(parts)


# ---------- Картинки ----------

IMG_STYLE = (
    "clean modern flat vector illustration, soft rounded shapes, vivid colors, "
    "educational theme, high quality, no text, no letters, no words, "
    "no captions, no typography, text-free image"
)

IMG_NEGATIVE = (
    "text, letters, words, captions, typography, inscriptions, watermark, "
    "signature, labels, numbers, logo, gibberish text, distorted letters"
)


def generate_image_bytes(scene: str) -> bytes:
    prompt = f"{scene}, {IMG_STYLE}"
    encoded = urllib.parse.quote(prompt)
    neg = urllib.parse.quote(IMG_NEGATIVE)
    seed = abs(hash(scene)) % 100000
    url = (f"https://image.pollinations.ai/prompt/{encoded}"
           f"?width=1024&height=1024&seed={seed}&nologo=true&model=flux"
           f"&negative_prompt={neg}")
    req = urllib.request.Request(
        url, headers={'User-Agent': 'Mozilla/5.0 UchisproBot/1.0',
                      'Accept': 'image/*'}, method='GET')
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return resp.read()
    except Exception:
        return b''


def upload_image_to_s3(data: bytes, key: str) -> str:
    if not data:
        return ''
    try:
        import boto3
        s3 = boto3.client(
            's3', endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
        s3.put_object(Bucket='files', Key=key, Body=data,
                      ContentType='image/png',
                      CacheControl='public, max-age=86400')
        return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    except Exception:
        return ''


def make_post_image(scene: str, ref: str) -> str:
    data = generate_image_bytes(scene)
    if not data:
        return ''
    ts = datetime.now(MSK).strftime('%Y%m%d-%H%M%S')
    safe_ref = ''.join(c for c in ref if c.isalnum() or c in '-_')[:40] or 'post'
    return upload_image_to_s3(data, f"tg-channel/{safe_ref}-{ts}.png")


# ---------- ИИ-генерация текста ----------

def call_polza(system: str, user: str, max_tokens: int = 400) -> str:
    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return ''
    payload = json.dumps({
        'model': POLZA_MODEL,
        'messages': [{'role': 'system', 'content': system},
                     {'role': 'user', 'content': user}],
        'temperature': 0.7, 'max_tokens': max_tokens,
        'presence_penalty': 0.3, 'frequency_penalty': 0.3,
    }).encode('utf-8')
    req = urllib.request.Request(
        POLZA_URL, data=payload, method='POST',
        headers={'Authorization': f'Bearer {api_key}',
                 'Content-Type': 'application/json'})
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
    "Ты — SMM-редактор образовательной платформы УЧИСЬПРО. "
    "Пишешь короткие цепляющие посты для Telegram-канала. "
    "Аудитория: родители школьников и взрослые, которые учатся для дохода. "
    "Стиль: живой, уважительный, без канцелярита и кликбейта. "
    "1–3 коротких абзаца, 1–3 уместных эмодзи. Без хэштегов. "
    "Не выдумывай фактов сверх данных. Пиши только на русском языке."
)


def make_article_post(title: str, summary: str, category: str) -> str:
    emoji = CATEGORY_EMOJI.get(category, '📰')
    prompt = (
        f"Напиши пост-анонс статьи для Telegram-канала. Заголовок: «{title}». "
        f"О чём статья: {summary or title}. "
        "Два коротких абзаца: первый — крючок-интрига, второй — приглашение прочитать. "
        "Ссылку не вставляй, её добавят кнопкой. Не повторяй заголовок дословно."
    )
    body = call_polza(SMM_SYSTEM, prompt, max_tokens=320)
    if not body:
        body = (summary or title).strip()
    return f"{emoji} <b>{html_escape(title)}</b>\n\n{html_escape(sanitize_text(body))}"


def make_weekly_digest(titles: list) -> str:
    if not titles:
        return ''
    listing = '\n'.join(f"• {html_escape(x)}" for x in titles)
    intro = call_polza(
        SMM_SYSTEM,
        "Напиши одно короткое тёплое вступление (1–2 предложения) к еженедельному "
        "дайджесту материалов образовательной платформы. Без списка, только вступление.",
        max_tokens=120)
    if not intro:
        intro = "Собрали материалы недели — выбирайте, что интересно."
    return (f"📅 <b>Дайджест недели</b>\n\n{html_escape(sanitize_text(intro))}\n\n{listing}")


# ---------- Работа с БД ----------

def get_channel_id(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT channel_chat_id, enabled FROM " + t('tg_channel_config') + " WHERE id=1")
        row = cur.fetchone()
    if row and row[1] is False:
        return None
    if row and row[0]:
        return row[0]
    env_id = os.environ.get('TELEGRAM_CHANNEL_ID', '').strip()
    if env_id:
        try:
            chat_id = int(env_id)
        except ValueError:
            return env_id or None
        with conn.cursor() as cur:
            cur.execute("UPDATE " + t('tg_channel_config') +
                        " SET channel_chat_id=%s, updated_at=NOW() WHERE id=1", (chat_id,))
            conn.commit()
        return chat_id
    return None


def save_channel_id(conn, chat_id, title: str = None):
    with conn.cursor() as cur:
        cur.execute("UPDATE " + t('tg_channel_config') +
                    " SET channel_chat_id=%s, channel_title=COALESCE(%s, channel_title), "
                    "updated_at=NOW() WHERE id=1", (chat_id, title))
        conn.commit()


def already_posted(conn, kind: str, ref_key: str) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM " + t('tg_channel_posts') +
                    " WHERE kind=%s AND ref_key=%s AND ok=TRUE", (kind, ref_key))
        return cur.fetchone() is not None


def log_post(conn, kind, ref_key, article_id, chat_id, text, success, error):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO " + t('tg_channel_posts') +
            " (kind, ref_key, article_id, channel_chat_id, text, ok, error) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s)",
            (kind, ref_key, article_id, str(chat_id) if chat_id else None,
             text[:4000], success, error))
        conn.commit()


# ---------- Основной цикл ----------

def handle_cron(conn) -> dict:
    chat_id = get_channel_id(conn)
    if not chat_id:
        return ok({'ok': False, 'reason': 'channel_not_linked',
                   'hint': 'Добавьте бота админом в канал или задайте секрет TELEGRAM_CHANNEL_ID'})

    now_msk = datetime.now(MSK)
    if not (POST_HOUR_FROM <= now_msk.hour < POST_HOUR_TO):
        return ok({'ok': True, 'skipped_quiet_hours': True,
                   'msk_hour': now_msk.hour,
                   'window': f'{POST_HOUR_FROM}:00–{POST_HOUR_TO}:00 МСК'})

    posted = 0
    failed = 0

    with conn.cursor() as cur:
        cur.execute(
            "SELECT a.id, a.slug, a.title, a.summary, a.category "
            "FROM " + t('feed_articles') + " a "
            "WHERE a.status='published' AND a.published_at IS NOT NULL "
            "AND a.published_at > NOW() - INTERVAL '7 days' "
            "AND NOT EXISTS (SELECT 1 FROM " + t('tg_channel_posts') + " p "
            "  WHERE p.kind='feed_article' AND p.ref_key = a.slug AND p.ok=TRUE) "
            "ORDER BY a.published_at ASC LIMIT %s", (MAX_ARTICLES_PER_RUN,))
        rows = cur.fetchall()

    for aid, slug, title, summary, category in rows:
        url = f"{SITE_URL}/feed/{slug}"
        text = make_article_post(title, summary, category)
        img = make_post_image(f"illustration about: {title}", f"article-{slug}")
        success, error = tg_send_to_channel(
            chat_id, text, img, button={'text': 'Читать статью', 'url': url})
        log_post(conn, 'feed_article', slug, aid, chat_id, text, success, error)
        if success:
            posted += 1
        else:
            failed += 1

    digest_posted = False
    today = now_msk.date()
    if today.weekday() == 0:
        iso = today.isocalendar()
        ref = f"{iso[0]}-W{iso[1]:02d}"
        if not already_posted(conn, 'weekly_digest', ref):
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT title FROM " + t('feed_articles') + " "
                    "WHERE status='published' AND published_at > NOW() - INTERVAL '7 days' "
                    "ORDER BY published_at DESC LIMIT 6")
                titles = [r[0] for r in cur.fetchall()]
            if titles:
                text = make_weekly_digest(titles)
                img = make_post_image("open books, new week, learning, bright", f"digest-{ref}")
                success, error = tg_send_to_channel(
                    chat_id, text, img,
                    button={'text': 'Открыть Ленту', 'url': f'{SITE_URL}/feed'})
                log_post(conn, 'weekly_digest', ref, None, chat_id, text, success, error)
                digest_posted = success

    return ok({'ok': True, 'channel_chat_id': str(chat_id),
               'articles_posted': posted, 'failed': failed,
               'weekly_digest': digest_posted})


def handle_tick(conn) -> dict:
    """Ленивый дневной автозапуск: реальный прогон не чаще раза в сутки.
    День «занимаем» только после начала окна публикаций, иначе ночной заход
    съел бы день и пост не вышел бы утром."""
    now_msk = datetime.now(MSK)
    today_msk = now_msk.date()

    if now_msk.hour < POST_HOUR_FROM:
        return ok({'ok': True, 'skipped_before_window': True,
                   'msk_hour': now_msk.hour, 'date': str(today_msk)})

    with conn.cursor() as cur:
        cur.execute(
            "UPDATE " + t('tg_channel_cron') +
            " SET last_tick_date=%s, last_tick_at=NOW() "
            "WHERE id=1 AND (last_tick_date IS NULL OR last_tick_date < %s)",
            (today_msk, today_msk))
        claimed = cur.rowcount > 0
        conn.commit()

    if not claimed:
        return ok({'ok': True, 'skipped_already_ran_today': True, 'date': str(today_msk)})

    return handle_cron(conn)


# ---------- Вебхук ----------

def already_welcomed(conn, user_id) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM " + t('tg_welcomed_users') + " WHERE user_id=%s", (user_id,))
        return cur.fetchone() is not None


def mark_welcomed(conn, user_id, user_name: str = None):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO " + t('tg_welcomed_users') + " (user_id, user_name) "
                    "VALUES (%s,%s) ON CONFLICT (user_id) DO NOTHING", (user_id, user_name))
        conn.commit()


def handle_webhook(conn, body: dict) -> dict:
    """Обрабатывает апдейты Telegram: автодетект канала и приветствие в личке."""
    post = body.get('channel_post') or body.get('edited_channel_post')
    if post:
        chat = post.get('chat') or {}
        if chat.get('type') == 'channel' and chat.get('id'):
            save_channel_id(conn, chat['id'], chat.get('title'))
            return ok({'ok': True, 'channel_detected': str(chat['id'])})

    my_member = body.get('my_chat_member')
    if my_member:
        chat = my_member.get('chat') or {}
        status = ((my_member.get('new_chat_member') or {}).get('status') or '')
        if chat.get('type') == 'channel' and status == 'administrator' and chat.get('id'):
            save_channel_id(conn, chat['id'], chat.get('title'))
            return ok({'ok': True, 'channel_linked': str(chat['id'])})

    message = body.get('message') or {}
    chat = message.get('chat') or {}
    if chat.get('type') == 'private' and chat.get('id'):
        uid = chat['id']
        if not already_welcomed(conn, uid):
            tg_send_to_user(uid, welcome_text())
            mark_welcomed(conn, uid, chat.get('username') or chat.get('first_name'))
            return ok({'ok': True, 'welcomed': str(uid)})
        text = (message.get('text') or '').strip().lower()
        if text.startswith('/start') or text.startswith('/help'):
            tg_send_to_user(uid, welcome_text())
        return ok({'ok': True, 'seen': str(uid)})

    return ok({'ok': True, 'ignored': True})


def handle_status(conn) -> dict:
    with conn.cursor() as cur:
        cur.execute("SELECT channel_chat_id, channel_title, enabled FROM "
                    + t('tg_channel_config') + " WHERE id=1")
        cfg = cur.fetchone()
        cur.execute("SELECT count(*) FROM " + t('tg_channel_posts') + " WHERE ok=TRUE")
        total = cur.fetchone()[0]
        cur.execute("SELECT kind, ok, created_at FROM " + t('tg_channel_posts')
                    + " ORDER BY id DESC LIMIT 5")
        recent = [{'kind': r[0], 'ok': r[1], 'at': r[2].isoformat()} for r in cur.fetchall()]
    return ok({
        'ok': True,
        'channel_chat_id': str(cfg[0]) if cfg and cfg[0] else None,
        'channel_title': cfg[1] if cfg else None,
        'enabled': cfg[2] if cfg else None,
        'token_set': bool(os.environ.get('TELEGRAM_BOT_TOKEN')),
        'posts_ok': total,
        'recent': recent,
    })


def handle_testpost(conn) -> dict:
    """Разовый приветственный пост в канал — проверка связи от начала до конца."""
    chat_id = get_channel_id(conn)
    if not chat_id:
        return ok({'ok': False, 'reason': 'channel_not_linked',
                   'hint': 'Добавьте бота администратором в канал'})

    text = (
        "👋 <b>Канал УЧИСЬПРО открыт</b>\n\n"
        "Здесь будут разборы, образовательные новости и полезные материалы — "
        "для родителей, школьников и взрослых, которые учатся ради дохода.\n\n"
        "Первый урок в каждом курсе бесплатный, без карты."
    )
    img = make_post_image(
        "friendly open book, graduation cap, laptop, bright educational scene",
        "hello-channel")
    success, error = tg_send_to_channel(
        chat_id, text, img, button={'text': 'Открыть платформу', 'url': SITE_URL})
    log_post(conn, 'hello', 'hello-v1', None, chat_id, text, success, error)
    return ok({'ok': success, 'channel_chat_id': str(chat_id),
               'image_attached': bool(img), 'error': error})


def is_cron_authorized(headers: dict) -> bool:
    secret = os.environ.get('CRON_SECRET', '')
    if not secret:
        return False
    got = (headers.get('authorization') or headers.get('Authorization')
           or headers.get('x-authorization') or headers.get('X-Authorization') or '')
    return got == f'Bearer {secret}'
