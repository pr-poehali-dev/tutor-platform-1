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
from datetime import date, datetime, timedelta, timezone
import psycopg2

# Окно публикаций по Москве (UTC+3): постим с 9:00 до 21:00 МСК
MSK = timezone(timedelta(hours=3))
POST_HOUR_FROM = 9
POST_HOUR_TO = 21

MAX_API_BASE = "https://botapi.max.ru"
POLZA_URL = "https://api.polza.ai/api/v1/chat/completions"
POLZA_MODEL = "openai/gpt-4o-mini"
SITE_URL = "https://учисьпро.рф"
CHANNEL_LINK = "https://max.ru/id631205241205_biz"
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p78828167_tutor_platform_1')

CATEGORY_EMOJI = {
    'science': '🔬', 'culture': '🎭', 'education': '📚',
    'robots': '🤖', 'ai': '🧠', 'grants': '🎓',
}

MAX_ARTICLES_PER_RUN = 3  # не спамить канал за один прогон

# Призы конкурсов чередуются по неделям (цикл из 3 призов)
CONTEST_PRIZES = [
    {'kind': 'znaiki', 'label': '500 знаек на счёт платформы 🪙',
     'theme': 'учебный лайфхак или интересный факт'},
    {'kind': 'course', 'label': 'любой курс платформы в подарок 🎓',
     'theme': 'идея, как сделать учёбу ребёнка интереснее'},
    {'kind': 'subscription', 'label': '2 недели премиум-доступа к платформе ✨',
     'theme': 'история успеха или цель в учёбе'},
]


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


def max_send_to_user(user_id: int, text: str) -> tuple:
    """Личное сообщение пользователю в MAX (по user_id). Возвращает (ok, error)."""
    token = os.environ.get('MAX_BOT_TOKEN', '')
    if not token:
        return False, 'MAX_BOT_TOKEN not set'
    url = f"{MAX_API_BASE}/messages?user_id={user_id}"
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


def welcome_text() -> str:
    return ("👋 Здравствуйте! Это бот платформы «Учисьпро».\n\n"
            "Подпишитесь на наш канал — там образовательные новости, идеи для учёбы "
            "и полезные материалы для детей и родителей:\n"
            f"📢 {CHANNEL_LINK}\n\n"
            f"✨ Платформа: {SITE_URL}")


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


# ---------- Конкурсы / движ ----------

def make_contest_announcement(prize_label: str, theme: str) -> str:
    prompt = (
        "Напиши задорный пост-анонс еженедельного конкурса в канале образовательной платформы УЧИСЬПРО. "
        f"Тема конкурса: участники в комментариях делятся на тему «{theme}». "
        f"Главный приз победителю за самую большую активность: {prize_label}. "
        "Объясни просто: пиши в комментариях, чем активнее участвуешь всю неделю — тем выше шанс победить. "
        "Итоги — в пятницу. 2–3 коротких абзаца, бодрый тон, 2–4 эмодзи. Без ссылок."
    )
    body = call_polza(SMM_SYSTEM, prompt, max_tokens=380)
    if not body:
        body = ("🎉 Запускаем конкурс недели!\n\n"
                f"Делитесь в комментариях на тему: {theme}. "
                "Чем активнее участвуешь всю неделю — тем выше шанс победить!\n\n"
                f"🏆 Приз: {prize_label}. Итоги — в пятницу!")
    return f"🎁 КОНКУРС НЕДЕЛИ\n\n{body}\n\n💬 Участвуй в комментариях прямо сейчас!"


def make_contest_reminder(prize_label: str) -> str:
    return ("⏳ Конкурс недели в разгаре!\n\n"
            "Ещё есть время поучаствовать — пиши в комментариях, проявляй активность. "
            f"Победителя за активность ждёт приз: {prize_label}\n\n"
            "🔥 Итоги уже в пятницу — не упусти шанс!")


def make_contest_results(winner_name: str, prize_label: str) -> str:
    who = winner_name or "наш самый активный участник"
    return ("🏆 ИТОГИ КОНКУРСА НЕДЕЛИ!\n\n"
            f"Победитель за активность — {who}! 🎉\n"
            f"Приз: {prize_label}\n\n"
            "Спасибо всем, кто участвовал! Совсем скоро — новый конкурс. "
            f"Оставайся с нами 👉 {SITE_URL}")


SEED_POSTS = [
    {
        "ref": "welcome",
        "fallback": (
            "🚀 Добро пожаловать в канал УЧИСЬПРО!\n\n"
            "Здесь — образовательные новости, лайфхаки для учёбы, разборы и конкурсы с призами 🎁 "
            "для детей, школьников и родителей.\n\n"
            f"✨ Наша платформа: {SITE_URL}"
        ),
        "prompt": (
            "Напиши тёплый приветственный пост — первый пост в новом канале образовательной платформы УЧИСЬПРО. "
            "Расскажи, что в канале будет: образовательные новости, лайфхаки по учёбе, разборы и еженедельные "
            "конкурсы с призами для детей, школьников и родителей. Пригласи остаться. 2 абзаца, тёплый тон, 2–3 эмодзи. Без ссылок."
        ),
    },
    {
        "ref": "about_platform",
        "fallback": (
            "📚 Что такое УЧИСЬПРО?\n\n"
            "Это онлайн-платформа с персональным ИИ-репетитором: голосовые уроки, "
            "адаптивные программы, подготовка к ЕГЭ и ОГЭ, а ещё модуль «Малыш» для детей 2–6 лет.\n\n"
            f"Учись когда удобно 👉 {SITE_URL}"
        ),
        "prompt": (
            "Напиши пост-знакомство с платформой УЧИСЬПРО для канала. Кратко и цепляюще: персональный ИИ-репетитор, "
            "голосовые уроки, адаптивные программы, подготовка к ЕГЭ и ОГЭ, модуль «Малыш» для детей 2–6 лет. "
            "2 коротких абзаца, дружелюбно, 2–3 эмодзи. Без ссылок."
        ),
    },
    {
        "ref": "study_tip",
        "fallback": (
            "💡 Лайфхак для учёбы: правило 25 минут\n\n"
            "Учись концентрированно 25 минут, потом 5 минут отдыхай. "
            "Такие короткие подходы помогают мозгу не уставать и лучше запоминать материал. "
            "Попробуй сегодня — и расскажи в комментариях, как зашло! 🧠"
        ),
        "prompt": (
            "Напиши полезный пост-лайфхак для учёбы школьников (например про технику Помодоро/короткие подходы "
            "или как лучше запоминать). Конкретный совет, который можно применить сегодня. В конце — мягко позови "
            "поделиться мнением в комментариях. 2 абзаца, 2–3 эмодзи. Без ссылок."
        ),
    },
]


def seed_initial_posts(conn, chat_id: int) -> dict:
    """Разовая публикация стартового набора постов + анонс первого конкурса."""
    published = []
    for post in SEED_POSTS:
        ref = post["ref"]
        if already_posted(conn, 'seed', ref):
            continue
        text = call_polza(SMM_SYSTEM, post["prompt"], max_tokens=360) or post["fallback"]
        if ref == "welcome":
            text = f"{text}\n\n📢 Подписывайся и зови друзей!"
        success, error = max_send_to_channel(chat_id, text)
        log_post(conn, 'seed', ref, None, chat_id, text, success, error)
        if success:
            published.append(ref)

    # Запускаем первый конкурс, если активного ещё нет
    contest_started = False
    if not get_active_contest(conn):
        iso = datetime.now(MSK).date().isocalendar()
        contest_started = start_contest_if_needed(conn, chat_id, f"{iso[0]}-W{iso[1]:02d}", iso[1])

    return ok({'ok': True, 'published': published, 'contest_started': contest_started})


def get_active_contest(conn):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, week_ref, prize_kind, prize_label FROM " + t('max_contests') +
            " WHERE status='active' ORDER BY id DESC LIMIT 1"
        )
        return cur.fetchone()


def start_contest_if_needed(conn, chat_id: int, week_ref: str, week_index: int) -> bool:
    """Понедельник: запускаем новый конкурс недели, если его ещё нет."""
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM " + t('max_contests') + " WHERE week_ref=%s", (week_ref,))
        if cur.fetchone():
            return False
    prize = CONTEST_PRIZES[week_index % len(CONTEST_PRIZES)]
    text = make_contest_announcement(prize['label'], prize['theme'])
    success, error = max_send_to_channel(chat_id, text)
    if not success:
        return False
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO " + t('max_contests') +
            " (week_ref, title, description, prize_kind, prize_label, status) "
            "VALUES (%s,%s,%s,%s,%s,'active') ON CONFLICT (week_ref) DO NOTHING",
            (week_ref, f"Конкурс недели {week_ref}", prize['theme'], prize['kind'], prize['label'])
        )
        conn.commit()
    log_post(conn, 'contest_start', week_ref, None, chat_id, text, True, None)
    return True


def finish_contest(conn, chat_id: int) -> bool:
    """Пятница: подводим итоги активного конкурса и объявляем победителя."""
    contest = get_active_contest(conn)
    if not contest:
        return False
    cid, week_ref, prize_kind, prize_label = contest
    with conn.cursor() as cur:
        cur.execute(
            "SELECT user_id, user_name, activity_count FROM " + t('max_contest_entries') +
            " WHERE contest_id=%s ORDER BY activity_count DESC, updated_at ASC LIMIT 1",
            (cid,)
        )
        top = cur.fetchone()
    winner_id = top[0] if top else None
    winner_name = top[1] if top else None
    text = make_contest_results(winner_name, prize_label)
    success, error = max_send_to_channel(chat_id, text)
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE " + t('max_contests') + " SET status='finished', winner_user_id=%s, "
            "winner_name=%s, finished_at=NOW() WHERE id=%s",
            (winner_id, winner_name, cid)
        )
        conn.commit()
    log_post(conn, 'contest_finish', week_ref, None, chat_id, text, success, error)
    return success


def record_contest_activity(conn, user_id: int, user_name: str, message: str):
    """Засчитываем активность пользователя в текущем конкурсе."""
    contest = get_active_contest(conn)
    if not contest:
        return
    cid = contest[0]
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO " + t('max_contest_entries') +
            " (contest_id, user_id, user_name, activity_count, last_message, updated_at) "
            "VALUES (%s,%s,%s,1,%s,NOW()) "
            "ON CONFLICT (contest_id, user_id) DO UPDATE SET "
            "activity_count = " + t('max_contest_entries') + ".activity_count + 1, "
            "user_name = COALESCE(EXCLUDED.user_name, " + t('max_contest_entries') + ".user_name), "
            "last_message = EXCLUDED.last_message, updated_at = NOW()",
            (cid, user_id, user_name, (message or '')[:500])
        )
        conn.commit()


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

    now_msk = datetime.now(MSK)
    if not (POST_HOUR_FROM <= now_msk.hour < POST_HOUR_TO):
        return ok({'ok': True, 'skipped_quiet_hours': True,
                   'msk_hour': now_msk.hour,
                   'window': f'{POST_HOUR_FROM}:00–{POST_HOUR_TO}:00 МСК'})

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
    today = now_msk.date()
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

    # 3) Движ: еженедельный конкурс с призами
    iso = today.isocalendar()
    week_ref = f"{iso[0]}-W{iso[1]:02d}"
    contest_started = False
    contest_finished = False
    contest_reminded = False
    weekday = today.weekday()

    if weekday == 0:  # понедельник — старт конкурса
        contest_started = start_contest_if_needed(conn, chat_id, week_ref, iso[1])
    elif weekday == 2:  # среда — напоминание
        contest = get_active_contest(conn)
        if contest and not already_posted(conn, 'contest_reminder', week_ref):
            text = make_contest_reminder(contest[3])
            success, _ = max_send_to_channel(chat_id, text)
            log_post(conn, 'contest_reminder', week_ref, None, chat_id, text, success, None)
            contest_reminded = success
    elif weekday == 4:  # пятница — итоги
        if not already_posted(conn, 'contest_finish', week_ref):
            contest_finished = finish_contest(conn, chat_id)

    return ok({'ok': True, 'channel_chat_id': chat_id,
               'articles_posted': posted_articles, 'skipped': skipped,
               'weekly_digest': digest_posted,
               'contest_started': contest_started,
               'contest_reminded': contest_reminded,
               'contest_finished': contest_finished})


def already_welcomed(conn, user_id: int) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM " + t('max_welcomed_users') + " WHERE user_id=%s", (user_id,))
        return cur.fetchone() is not None


def mark_welcomed(conn, user_id: int):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO " + t('max_welcomed_users') +
                    " (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING", (user_id,))
        conn.commit()


def extract_dm_user_id(body: dict) -> int:
    """Достаёт user_id из апдекта личного диалога с ботом."""
    msg = body.get('message') or {}
    sender = (msg.get('sender') or body.get('user') or body.get('from') or {})
    uid = sender.get('user_id') or body.get('user_id')
    # учитываем только личные диалоги, не каналы/группы
    chat = (msg.get('recipient') or body.get('chat') or {})
    ctype = chat.get('chat_type') or chat.get('type')
    if ctype and ctype not in ('dialog', 'private'):
        return 0
    return int(uid) if uid else 0


def extract_sender(body: dict) -> tuple:
    """Достаёт (user_id, имя, текст) отправителя из любого апдейта с сообщением."""
    msg = body.get('message') or {}
    sender = (msg.get('sender') or body.get('user') or body.get('from') or {})
    uid = sender.get('user_id') or body.get('user_id')
    name = (sender.get('name') or sender.get('first_name')
            or sender.get('username') or '')
    text = ((msg.get('body') or {}).get('text')
            or msg.get('text') or body.get('text') or '')
    return (int(uid) if uid else 0, name, text)


def handle_channel_webhook(conn, body: dict) -> dict:
    """Автодетект канала + автоприветствие + учёт активности в конкурсе."""
    update_type = body.get('update_type', '')
    chat = body.get('chat') or {}
    chat_id = chat.get('chat_id') or body.get('chat_id')
    title = chat.get('title')

    # 0) Любое сообщение от человека = активность в конкурсе
    if update_type in ('message_created', 'message_callback'):
        suid, sname, stext = extract_sender(body)
        if suid:
            record_contest_activity(conn, suid, sname, stext)

    # 1) Автоприветствие: человек написал боту или нажал «Старт»
    if update_type in ('bot_started', 'message_created', 'message_callback'):
        uid = extract_dm_user_id(body)
        if uid and not already_welcomed(conn, uid):
            success, error = max_send_to_user(uid, welcome_text())
            if success:
                mark_welcomed(conn, uid)
            return ok({'ok': success, 'welcomed_user': uid, 'error': error})

    # 2) Автодетект chat_id канала: когда бота добавляют в канал
    if chat_id and update_type in ('bot_added', 'chat_membership'):
        save_channel_id(conn, int(chat_id), title)
        return ok({'ok': True, 'linked_chat_id': chat_id})
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


def is_admin(headers: dict) -> bool:
    pin = (headers.get('X-Admin-Pin') or headers.get('x-admin-pin') or '').strip()
    return pin == os.environ.get('ADMIN_PIN', '7777')


def handle_dashboard(conn) -> dict:
    """Полная сводка для панели управления каналом."""
    with conn.cursor() as cur:
        cur.execute("SELECT channel_chat_id, channel_title, enabled FROM " + t('max_channel_config') + " WHERE id=1")
        cfg = cur.fetchone()
        cur.execute("SELECT count(*) FROM " + t('max_channel_posts') + " WHERE ok=TRUE")
        posted = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM " + t('max_welcomed_users'))
        welcomed = cur.fetchone()[0]
        cur.execute("SELECT kind, ok, created_at, ref_key FROM " + t('max_channel_posts') +
                    " ORDER BY id DESC LIMIT 8")
        recent = [{'kind': r[0], 'ok': r[1], 'at': r[2].isoformat() if r[2] else None, 'ref': r[3]}
                  for r in cur.fetchall()]
        # активный конкурс
        cur.execute("SELECT id, week_ref, prize_label, started_at FROM " + t('max_contests') +
                    " WHERE status='active' ORDER BY id DESC LIMIT 1")
        ac = cur.fetchone()
        active = None
        leaders = []
        if ac:
            cur.execute("SELECT user_name, activity_count FROM " + t('max_contest_entries') +
                        " WHERE contest_id=%s ORDER BY activity_count DESC, updated_at ASC LIMIT 5", (ac[0],))
            leaders = [{'name': r[0] or 'Участник', 'count': r[1]} for r in cur.fetchall()]
            cur.execute("SELECT count(*) FROM " + t('max_contest_entries') + " WHERE contest_id=%s", (ac[0],))
            participants = cur.fetchone()[0]
            active = {'week_ref': ac[1], 'prize_label': ac[2],
                      'started_at': ac[3].isoformat() if ac[3] else None,
                      'participants': participants, 'leaders': leaders}
        # история конкурсов
        cur.execute("SELECT week_ref, prize_label, winner_name, finished_at FROM " + t('max_contests') +
                    " WHERE status='finished' ORDER BY id DESC LIMIT 6")
        history = [{'week_ref': r[0], 'prize_label': r[1], 'winner': r[2] or '—',
                    'finished_at': r[3].isoformat() if r[3] else None} for r in cur.fetchall()]
    return ok({
        'channel_linked': bool(cfg and cfg[0]),
        'channel_title': cfg[1] if cfg else None,
        'channel_link': CHANNEL_LINK,
        'enabled': cfg[2] if cfg else None,
        'total_posted': posted,
        'welcomed_users': welcomed,
        'has_bot_token': bool(os.environ.get('MAX_BOT_TOKEN')),
        'post_window': f'{POST_HOUR_FROM}:00–{POST_HOUR_TO}:00 МСК',
        'recent': recent,
        'active_contest': active,
        'contest_history': history,
    })


def handle_admin_action(conn, action: str) -> dict:
    chat_id = get_channel_id(conn)
    if action == 'toggle':
        with conn.cursor() as cur:
            cur.execute("UPDATE " + t('max_channel_config') +
                        " SET enabled = NOT COALESCE(enabled, TRUE), updated_at=NOW() WHERE id=1 RETURNING enabled")
            new_state = cur.fetchone()[0]
            conn.commit()
        return ok({'ok': True, 'enabled': new_state})
    if not chat_id:
        return ok({'ok': False, 'reason': 'channel_not_linked'})
    if action == 'start_now':
        iso = datetime.now(MSK).date().isocalendar()
        started = start_contest_if_needed(conn, chat_id, f"{iso[0]}-W{iso[1]:02d}", iso[1])
        return ok({'ok': started, 'note': 'started' if started else 'already_running'})
    if action == 'finish_now':
        finished = finish_contest(conn, chat_id)
        return ok({'ok': finished})
    if action == 'seed_posts':
        return seed_initial_posts(conn, chat_id)
    return err('Неизвестное действие', 404)


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

    if action in ('dashboard', 'toggle', 'start_now', 'finish_now', 'seed_posts'):
        if not is_admin(headers):
            return err('forbidden', 403)
        conn = get_db()
        try:
            if action == 'dashboard':
                return handle_dashboard(conn)
            return handle_admin_action(conn, action)
        finally:
            conn.close()

    return err('Неизвестное действие', 404)