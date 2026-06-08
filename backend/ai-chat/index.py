"""
Business: Умный ИИ-преподаватель УЧИСЬПРО.
Особенности:
 - Модель gpt-4o-mini через polza.ai
 - Каскадный веб-поиск: Tavily → DuckDuckGo → Wikipedia
 - RAG: знание базы курсов, тарифов, FAQ сайта
 - Долгая память: учитывает профиль ученика (имя, возраст, цели)
 - Адаптивный режим: голос (короткие ответы) vs текст (развёрнутые)
 - Chain-of-thought для сложных задач
Args: event с httpMethod, body (teacher_id, history, message, user_profile, voice_mode); context
Returns: HTTP-ответ с JSON {reply, sources?, used_search?, used_kb?}
"""
import json
import os
import re
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

try:
    import psycopg2  # есть в окружении; используется только для rate-limit
except Exception:  # pragma: no cover
    psycopg2 = None


# Лимит сообщений ИИ-чату на один IP в час (защита от слива бюджета на API)
CHAT_RATE_PER_HOUR = 60


def check_rate_limit(ip: str) -> bool:
    """True — можно продолжать, False — лимит исчерпан. Сбои БД не блокируют чат."""
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn or not psycopg2 or not ip:
        return True
    schema = 't_p78828167_tutor_platform_1'
    hour_key = datetime.now().strftime('%Y%m%d%H')
    bucket = f"ai-chat:{ip}:{hour_key}"
    try:
        conn = psycopg2.connect(dsn)
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO {schema}.rate_limit_counter (bucket_key, hits) "
                    f"VALUES (%s, 1) "
                    f"ON CONFLICT (bucket_key) DO UPDATE SET hits = {schema}.rate_limit_counter.hits + 1 "
                    f"RETURNING hits",
                    (bucket,),
                )
                hits = cur.fetchone()[0]
                conn.commit()
                return hits <= CHAT_RATE_PER_HOUR
        finally:
            conn.close()
    except Exception as e:
        print(f"[ai-chat] rate-limit check skipped: {type(e).__name__}")
        return True


# ─────────────────────────────────────────────────────────────────────────────
# ПРОМПТЫ ЭКСПЕРТОВ — детально, с принципами и forbidden patterns
# ─────────────────────────────────────────────────────────────────────────────

TEACHER_PROMPTS = {
    'alex': (
        "Ты — Алекс, лучший преподаватель математики и информатики России (32 года). "
        "Образование: МФТИ + аспирантура МГУ. 10 лет готовишь к ЕГЭ — твои ученики поступают в МГУ, МФТИ, ВШЭ. "
        "ЗНАНИЯ: вся школьная математика 1-11 кл наизусть по учебникам Мерзляка, Макарычева, Мордковича, "
        "Атанасяна (геометрия); полный кодификатор ЕГЭ/ОГЭ ФИПИ, олимпиадная математика. "
        "Каждое определение, теорема и формула — строго по школьному стандарту ФГОС. "
        "Программирование: Python, алгоритмы, структуры данных, базы данных, основы веба и ИИ.\n\n"
        "ПРИНЦИПЫ:\n"
        "1. Объясняй через АНАЛОГИИ из жизни ученика. Не 'найдите производную', а 'представь скорость машины'.\n"
        "2. Не просто давай ответ — веди к нему. Задавай наводящие вопросы.\n"
        "3. Если задача — реши ПОШАГОВО, проговаривая каждое действие и ЗАЧЕМ оно.\n"
        "4. Если ученик ошибся — найди КОНКРЕТНОЕ место ошибки, не общее 'неправильно'.\n"
        "5. Хвали за СТРАТЕГИЮ, а не за правильность. Это формирует мышление.\n\n"
        "ЗАПРЕЩЕНО: 'Конечно!', 'Давайте разберём!', 'Это отличный вопрос!', эмодзи без причины, длинные вступления."
    ),
    'sofia': (
        "Ты — София, преподавательница английского C2 (29 лет). Жила в Лондоне 5 лет, работала переводчиком на ВВС. "
        "Знаешь IELTS, TOEFL, ЕГЭ, ОГЭ изнутри (сама сдавала, готовила к ним 200+ учеников). "
        "ЗНАНИЯ: грамматика, фонетика, разговорная речь, академический английский, бизнес-английский.\n\n"
        "ПРИНЦИПЫ:\n"
        "1. Учи через КОНТЕКСТ. Не правило → пример, а сначала ситуация → потом правило.\n"
        "2. Примеры — из реальных фильмов (Friends, Stranger Things), песен, диалогов в кафе.\n"
        "3. Слова и фразы давай так: 'lit (классно, как у молодёжи в США)'. Перевод обязателен.\n"
        "4. Если ученик ошибся — повтори правильный вариант в ответе, не указывая 'неправильно'. Это как у нативов.\n"
        "5. Поощряй риск говорить с ошибками — лучше плохо, но говорить.\n\n"
        "ЗАПРЕЩЕНО: 'Hi!', 'Great question!', сухие правила без примеров, длинные вступления."
    ),
    'dmitry': (
        "Ты — Дмитрий, к.ф-м.н., преподаватель физики, химии и биологии (35 лет). "
        "10 лет в школе при МГУ, член комиссии ФИПИ по физике. Ученики выигрывают всероссийские олимпиады. "
        "ЗНАНИЯ: вся школьная программа по учебникам Мякишева, Перышкина (физика), Габриеляна, Рудзитиса (химия), "
        "Пасечника (биология); кодификаторы ЕГЭ/ОГЭ ФИПИ, ВСОШ, экспериментальные методы. "
        "Законы, формулы, константы — строго по ФГОС, всегда с единицами СИ и условиями применимости.\n\n"
        "ПРИНЦИПЫ:\n"
        "1. Физика — про природу, не про формулы. Сначала объясни ЯВЛЕНИЕ, потом формулу.\n"
        "2. Химия — про электроны и связи, не про заучивание. Покажи логику.\n"
        "3. Биология — про связи. Любой факт связывай с другими (например, фотосинтез ↔ дыхание).\n"
        "4. Формулы пиши словами для озвучки: 'эф равно эм на а' вместо F=ma.\n"
        "5. Единицы измерения называй всегда. 'Скорость 5 — это что? 5 м/с или 5 км/ч?'\n\n"
        "ЗАПРЕЩЕНО: сухие формулы без объяснения смысла, термины без расшифровки."
    ),
    'nika': (
        "Ты — Ника, преподавательница русского языка, литературы, истории, обществознания (30 лет). "
        "Филолог МГУ, эксперт ЕГЭ по сочинениям. Ученики пишут на 22+/22 баллов.\n\n"
        "ПРИНЦИПЫ:\n"
        "1. Грамматика через МНЕМОТЕХНИКИ. 'Жи-ши пиши через И' — это не зубрёжка, а ассоциация.\n"
        "2. Литература — через эмоции героя. 'Почему Раскольников страдает?' лучше 'тема романа'.\n"
        "3. История — через причинно-следственные связи. 'Что было ДО этого, что привело?'\n"
        "4. Сочинения — учи СТРУКТУРЕ: тезис → аргумент → пример → вывод. Каждый раз так.\n"
        "5. Ошибки — конструктивно. 'Слово пишется так-то, потому что...' (правило, а не запрет).\n\n"
        "ЗАПРЕЩЕНО: занудство, шаблоны, заученные определения без объяснений."
    ),
    'fox': (
        "Ты — Няня Лиса, рыжая лисичка-наставница для родителей детей 1-6 лет. "
        "ЭКСПЕРТИЗА: Монтессори, Никитины, Доман, Железновы, нейропсихология (Семенович, Цветкова). "
        "Знаешь нормы развития ВОЗ, Эльконина, Выготского, сензитивные периоды.\n\n"
        "ПРИНЦИПЫ:\n"
        "1. Сразу ДЕЛАТЬ — каждый ответ должен содержать конкретное действие на следующие 5 минут.\n"
        "2. ЦИФРЫ — точные. 'В 2 года норма 50+ слов', 'играть 10 минут', 'до 4 раз в день'.\n"
        "3. БЕЗ страшилок и диагнозов — только конструктив. Тревожно? Направь к специалисту.\n"
        "4. Эмпатия первая, советы вторые. 'Понимаю, устаёте... вот что попробуйте'.\n"
        "5. Ребёнок младше 1 года — мягко скажи про специализацию, но дай общий совет.\n\n"
        "ЗАПРЕЩЕНО: 'каждый ребёнок индивидуален', 'обратитесь к специалисту' (без конкретики), длинные вступления, шаблоны.\n"
        "ФОРМАТ ГОЛОСА: 2-3 предложения, до 50 слов, без скобок и сложных конструкций."
    ),
}


# ─────────────────────────────────────────────────────────────────────────────
# НАУЧНАЯ СТРОГОСТЬ — применяется ко ВСЕМ ответам (особенно точные науки)
# ─────────────────────────────────────────────────────────────────────────────
SCIENTIFIC_RIGOR = (
    "НАУЧНАЯ ТОЧНОСТЬ (обязательно):\n"
    "• Опирайся СТРОГО на школьную программу РФ (ФГОС) и кодификаторы ФИПИ для ЕГЭ/ОГЭ. "
    "Не выходи за рамки школьного курса без явной просьбы.\n"
    "• Определения, формулы, законы, константы — давай ТОЧНО, как в школьных учебниках "
    "(Мерзляк, Макарычев, Атанасян — математика; Мякишев, Перышкин — физика; Габриелян, Рудзитис — химия).\n"
    "• Всегда указывай единицы измерения в СИ и условия применимости формулы (когда она верна, а когда нет).\n"
    "• НИКОГДА не выдумывай факты, числа или формулы. Если не уверен — честно скажи и предложи проверить.\n"
    "• Проверяй вычисления перед ответом: подставь результат обратно, прикинь порядок величины и знак.\n"
    "• Различай точное определение и бытовую аналогию: сначала корректная суть, потом аналогия для понимания."
)

# Диктовка математики голосом: латиница и символы — по-русски, формулы словами
MATH_VOICE_RULES = (
    "ДИКТОВКА МАТЕМАТИКИ ГОЛОСОМ (формулы и буквы читаются вслух):\n"
    "• Латинские буквы называй по-русски: x — «икс», y — «игрек», z — «зет», "
    "a — «а», b — «бэ», c — «цэ», k — «ка», n — «эн», t — «тэ», f — «эф», "
    "S — «эс», v — «вэ», h — «аш». Греческие: π — «пи», α — «альфа», β — «бета», "
    "Δ — «дельта», Σ — «сумма», λ — «лямбда», ω — «омега».\n"
    "• Степени: x² — «икс в квадрате», x³ — «икс в кубе», xⁿ — «икс в степени эн».\n"
    "• Корень: √x — «корень из икс», ∛x — «кубический корень из икс».\n"
    "• Дроби: a/b — «а делить на бэ» или «дробь а на бэ».\n"
    "• Функции: f(x) — «эф от икс», sin x — «синус икс», log — «логарифм».\n"
    "• Знаки: = «равно», ≈ «приблизительно равно», ≤ «меньше либо равно», "
    "± «плюс-минус», · и × «умножить на», ∫ «интеграл», Σ «сумма».\n"
    "• НИКОГДА не оставляй в озвучке голые символы (F=ma, x², √). "
    "Пиши словами: «эф равно эм на а», «икс в квадрате», «корень из икс»."
)


# Few-shot примеры — обучают модель правильному стилю ответов
FEW_SHOT_EXAMPLES = {
    'alex': [
        {"role": "user", "content": "Объясни, что такое производная"},
        {"role": "assistant", "content": "Производная — это скорость изменения. Представь машину: спидометр показывает, как быстро меняется расстояние. Это и есть производная пройденного пути по времени. Хочешь, разберём на конкретной функции?"},
        {"role": "user", "content": "Чему равна производная икс в квадрате?"},
        {"role": "assistant", "content": "Производная икс в квадрате равна два икс. По правилу степени: показатель два спускаем вперёд множителем, а степень уменьшаем на единицу. Хочешь, проверим это на графике?"},
    ],
    'dmitry': [
        {"role": "user", "content": "Запиши второй закон Ньютона"},
        {"role": "assistant", "content": "Эф равно эм на а: сила равна массе, умноженной на ускорение. Сила в ньютонах, масса в килограммах, ускорение в метрах на секунду в квадрате. Закон работает в инерциальной системе отсчёта."},
    ],
    'fox': [
        {"role": "user", "content": "Ребёнок 2 года не говорит, только показывает пальцем. Это норма?"},
        {"role": "assistant", "content": "Понимаю беспокойство. В 2 года норма — от 50 слов и простые фразы. Если только жесты — это повод сходить к неврологу и логопеду. Сейчас попробуйте: 2 раза в день по 5 минут читайте книгу с крупными картинками и спрашивайте «Кто это?» — ждите ответа 10 секунд."},
    ],
}


# Триггеры для веб-поиска
SEARCH_TRIGGERS = [
    'когда', 'сегодня', 'сейчас', 'этом году', 'этого года',
    'последн', 'свеж', 'новост', 'актуальн', 'недавно',
    'дата', 'число', 'график', 'расписан',
    '2024', '2025', '2026', '2027',
    'кто такой', 'кто это', 'википед',
    'найди в интернет', 'поищи', 'погугли',
    'погод', 'курс рубл', 'курс доллар',
    'кодификатор', 'фипи', 'минобр', 'постановлен',
]


# ─────────────────────────────────────────────────────────────────────────────
# БАЗА ЗНАНИЙ САЙТА (RAG) — встроенные факты об УЧИСЬПРО
# ─────────────────────────────────────────────────────────────────────────────

SITE_KNOWLEDGE = [
    {
        "topic": "tariffs",
        "triggers": ["тариф", "цена", "стоит", "стоимост", "сколько", "купить подписку", "оплатить", "оплата"],
        "content": (
            "Тарифы УЧИСЬПРО:\n"
            "• Пробный (бесплатно, 7 дней) — доступ ко всем курсам.\n"
            "• Базовый (590 ₽/мес) — все курсы школьной программы.\n"
            "• Профи (1290 ₽/мес) — всё + ИИ-преподаватель 24/7, голосовые уроки, проверка сочинений.\n"
            "• Семейный (1990 ₽/мес) — до 4 детей в одном аккаунте, родительский контроль.\n"
            "Все тарифы можно отменить в любой момент. Первый платёж не списывается, если отменить за 24 часа до конца триала."
        ),
    },
    {
        "topic": "courses_count",
        "triggers": ["сколько курсов", "какие курсы", "каталог", "перечень курсов", "какие предметы"],
        "content": (
            "УЧИСЬПРО — 39+ курсов по 13 предметам: математика, физика, химия, биология, информатика, "
            "русский язык, английский язык, литература, история, обществознание, география, логика. "
            "Классы: 1-11 + подготовка к ОГЭ и ЕГЭ. "
            "Также есть модуль «Малыш» для детей 1-6 лет (5 возрастных ступеней)."
        ),
    },
    {
        "topic": "money_back",
        "triggers": ["возврат", "вернуть деньги", "не подойдёт", "не понравится"],
        "content": (
            "Гарантия возврата 7 дней: если курс или подписка не подойдёт — вернём 100% оплаты "
            "в течение 7 дней после покупки. Без сложных форм — напиши в поддержку из личного кабинета."
        ),
    },
    {
        "topic": "ai_features",
        "triggers": ["ии", "искусственный интеллект", "робот", "бот", "голосовой", "что умеет"],
        "content": (
            "ИИ-преподаватель УЧИСЬПРО умеет: вести голосовой диалог (микрофон + озвучка), "
            "проверять задачи и сочинения, строить индивидуальный маршрут после диагностики пробелов, "
            "искать актуальные данные в интернете (Wikipedia, DuckDuckGo). "
            "Доступен 24/7 без записи и расписания."
        ),
    },
    {
        "topic": "kids_module",
        "triggers": ["малыш", "развивашк", "дошкольник", "до школы", "1 год", "2 года", "3 года", "4 года", "5 лет"],
        "content": (
            "Модуль «Малыш» для детей 1-6 лет: 5 возрастных ступеней (1-2, 2-3, 3-4, 4-5, 5-6 лет), "
            "6 направлений развития (речь, логика, моторика, окружающий мир, творчество, эмоции). "
            "22+ интерактивных занятия с ИИ-Лисой, библиотека сказок с озвучкой (Пушкин, Толстой, народные), "
            "диагностика развития за 2 минуты. По методикам Монтессори и Никитиных."
        ),
    },
    {
        "topic": "payment_security",
        "triggers": ["безопасн", "карта", "юкасса", "yookassa", "чек", "54-фз"],
        "content": (
            "Оплата через ЮKassa — это самый безопасный платёжный сервис России. "
            "Данные карты УЧИСЬПРО не видит. Чек по закону 54-ФЗ приходит на email сразу после оплаты."
        ),
    },
    {
        "topic": "exam_prep",
        "triggers": ["егэ", "огэ", "экзамен", "балл", "сдать"],
        "content": (
            "Подготовка к ЕГЭ и ОГЭ: программы по официальным кодификаторам ФИПИ. "
            "Все 19 заданий ЕГЭ профильной математики, 32 задания физики, 34 задания химии — с разбором. "
            "Тренажёры с проверкой ответов. Калькулятор баллов для прогноза результата."
        ),
    },
]


def find_kb_entries(message: str) -> list:
    """Находит релевантные записи базы знаний по триггерам в сообщении."""
    if not message:
        return []
    low = message.lower()
    matched = []
    for entry in SITE_KNOWLEDGE:
        for trig in entry["triggers"]:
            if trig in low:
                matched.append(entry)
                break
    return matched


def need_web_search(message: str) -> bool:
    """Эвристика: нужен ли веб-поиск."""
    if not message:
        return False
    low = message.lower()
    if any(t in low for t in ['поищи', 'погугли', 'найди в интернет', 'найди инфу', 'актуальн']):
        return True
    if '?' in message or any(low.startswith(w) for w in ['кто ', 'что ', 'когда ', 'где ', 'сколько ']):
        if any(t in low for t in SEARCH_TRIGGERS):
            return True
    return False


# ─────────────────────────────────────────────────────────────────────────────
USER_AGENT = 'Mozilla/5.0 (compatible; UchispriBot/1.0; +https://учисьпро.рф)'


def _http_json(url, *, method='GET', data=None, headers=None, timeout=10):
    try:
        req = urllib.request.Request(
            url,
            data=data,
            headers={'User-Agent': USER_AGENT, 'Accept': 'application/json', **(headers or {})},
            method=method,
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception:
        return None


def search_wikipedia(query, max_results=3):
    try:
        srch_url = 'https://ru.wikipedia.org/w/api.php?' + urllib.parse.urlencode({
            'action': 'query', 'list': 'search', 'srsearch': query,
            'srlimit': max_results, 'format': 'json', 'utf8': 1,
        })
        data = _http_json(srch_url, timeout=8)
        if not data:
            return None
        hits = (data.get('query') or {}).get('search') or []
        if not hits:
            return None
        results = []
        for h in hits[:max_results]:
            title = h.get('title') or ''
            ext_url = 'https://ru.wikipedia.org/w/api.php?' + urllib.parse.urlencode({
                'action': 'query', 'prop': 'extracts', 'exintro': 1, 'explaintext': 1,
                'titles': title, 'format': 'json', 'utf8': 1,
            })
            ext_data = _http_json(ext_url, timeout=8)
            pages = ((ext_data or {}).get('query') or {}).get('pages') or {}
            content = ''
            for _, page in pages.items():
                content = (page.get('extract') or '').strip()
                break
            if not content:
                content = re.sub(r'<[^>]+>', '', h.get('snippet') or '').strip()
            url_safe = urllib.parse.quote(title.replace(' ', '_'))
            results.append({
                'title': title,
                'content': content[:600],
                'url': f'https://ru.wikipedia.org/wiki/{url_safe}',
            })
        return {'results': results, 'answer': '', 'source': 'wikipedia'}
    except Exception:
        return None


def search_duckduckgo(query):
    try:
        url = 'https://api.duckduckgo.com/?' + urllib.parse.urlencode({
            'q': query, 'format': 'json', 'no_html': 1, 'skip_disambig': 1, 'kl': 'ru-ru',
        })
        data = _http_json(url, timeout=8)
        if not data:
            return None
        results = []
        answer = ''
        abstract = (data.get('AbstractText') or '').strip()
        abstract_url = data.get('AbstractURL') or ''
        abstract_source = data.get('AbstractSource') or ''
        if abstract:
            answer = abstract
            if abstract_url:
                results.append({
                    'title': abstract_source or 'DuckDuckGo',
                    'content': abstract[:600], 'url': abstract_url,
                })
        related = data.get('RelatedTopics') or []
        for r in related[:4]:
            if 'FirstURL' not in r:
                continue
            text = (r.get('Text') or '').strip()
            if not text:
                continue
            results.append({
                'title': text.split(' - ')[0][:120] or 'DuckDuckGo',
                'content': text[:400], 'url': r.get('FirstURL') or '',
            })
        if not results:
            return None
        return {'results': results, 'answer': answer, 'source': 'duckduckgo'}
    except Exception:
        return None


def search_tavily(query, api_key, max_results=4):
    try:
        payload = json.dumps({
            'api_key': api_key, 'query': query, 'search_depth': 'basic',
            'max_results': max_results, 'include_answer': True, 'topic': 'general',
        }).encode('utf-8')
        data = _http_json(
            'https://api.tavily.com/search', method='POST', data=payload,
            headers={'Content-Type': 'application/json'}, timeout=12,
        )
        if not data:
            return None
        return {**data, 'source': 'tavily'}
    except Exception:
        return None


def web_search(query):
    tavily_key = os.environ.get('TAVILY_API_KEY', '').strip()
    if tavily_key:
        result = search_tavily(query, tavily_key)
        if result and (result.get('results') or result.get('answer')):
            return result
    result = search_duckduckgo(query)
    if result and result.get('results'):
        return result
    return search_wikipedia(query)


def format_search_context(search_result):
    if not search_result:
        return '', []
    parts = []
    sources = []
    src_label = {
        'tavily': 'из интернета',
        'duckduckgo': 'из DuckDuckGo',
        'wikipedia': 'из Википедии',
    }.get(search_result.get('source', ''), 'из интернета')
    answer = search_result.get('answer')
    if answer:
        parts.append(f"Краткая сводка {src_label}: {answer}")
    results = search_result.get('results') or []
    for i, r in enumerate(results[:4]):
        title = (r.get('title') or '').strip()
        content = (r.get('content') or '').strip()[:500]
        url = r.get('url') or ''
        if title and content:
            parts.append(f"[Источник {i+1}] {title}\n{content}")
        if title and url:
            sources.append({'title': title[:120], 'url': url})
    return '\n\n'.join(parts), sources


def mathify_for_voice(text):
    """Подстраховка озвучки: превращает оставшиеся мат-символы в русские слова."""
    greek = {
        'π': ' пи ', 'Δ': ' дельта ', 'δ': ' дельта ', 'Σ': ' сумма ',
        'α': ' альфа ', 'β': ' бета ', 'γ': ' гамма ', 'λ': ' лямбда ',
        'μ': ' мю ', 'ω': ' омега ', 'φ': ' фи ', 'θ': ' тэта ', '∞': ' бесконечность ',
    }
    for sym, word in greek.items():
        text = text.replace(sym, word)
    # Степени-надстрочники
    text = re.sub(r'([A-Za-zА-Яа-я0-9\)])\s*²', r'\1 в квадрате ', text)
    text = re.sub(r'([A-Za-zА-Яа-я0-9\)])\s*³', r'\1 в кубе ', text)
    # Корни
    text = text.replace('√', ' корень из ')
    # Знаки сравнения и операции
    replacements = {
        '≈': ' приблизительно равно ', '≤': ' меньше либо равно ',
        '≥': ' больше либо равно ', '≠': ' не равно ', '±': ' плюс-минус ',
        '×': ' умножить на ', '÷': ' делить на ', '∫': ' интеграл ',
        '°': ' градусов ', '∙': ' умножить на ', '⋅': ' умножить на ',
    }
    for sym, word in replacements.items():
        text = text.replace(sym, word)
    # Простые формулы вида F=ma → словами оставляем как есть, но '=' между буквами
    text = re.sub(r'\s*=\s*', ' равно ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()


def clean_reply_for_voice(text):
    """Чистит от markdown для нормальной озвучки."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'^\s*[-•]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # Убираем дешёвые вступления
    text = re.sub(r'^(Конечно[,!]?\s*|Давайте\s+разберём!?\s*|Это\s+отличный\s+вопрос!?\s*|Хороший\s+вопрос!?\s*)', '', text, flags=re.IGNORECASE)
    # Превращаем оставшиеся мат-символы в слова для чистой озвучки
    text = mathify_for_voice(text)
    return text.strip()


def build_user_context(user_profile):
    """Формирует строку с профилем пользователя для контекста."""
    if not user_profile or not isinstance(user_profile, dict):
        return ''
    parts = []
    if user_profile.get('name'):
        parts.append(f"Имя ученика: {user_profile['name']}.")
    if user_profile.get('age'):
        parts.append(f"Возраст: {user_profile['age']} лет.")
    if user_profile.get('grade'):
        parts.append(f"Класс: {user_profile['grade']}.")
    if user_profile.get('goal'):
        parts.append(f"Цель: {user_profile['goal']}.")
    if user_profile.get('weak_topics'):
        topics = user_profile['weak_topics']
        if isinstance(topics, list) and topics:
            parts.append(f"Слабые темы: {', '.join(topics[:5])}.")
    if user_profile.get('strengths'):
        strengths = user_profile['strengths']
        if isinstance(strengths, list) and strengths:
            parts.append(f"Сильные стороны: {', '.join(strengths[:5])}.")
    return ' '.join(parts)


# ─────────────────────────────────────────────────────────────────────────────
def handler(event, context):
    """Обработчик ИИ-чата с улучшенным контекстом и поиском."""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    try:
        body_str = event.get('body', '{}')
        body = json.loads(body_str) if isinstance(body_str, str) else body_str

        teacher_id = body.get('teacher_id', 'alex')
        user_message = body.get('message', '').strip()
        history = body.get('history', [])
        subject = body.get('subject', '')
        grade = body.get('grade', '')
        course_title = body.get('course_title', '')
        # Принудительный поиск с фронта
        force_search = bool(body.get('use_search'))
        # Голосовой режим: короче ответ, без markdown
        voice_mode = bool(body.get('voice_mode', True))
        # Профиль ученика (имя, возраст, цели, слабые места)
        user_profile = body.get('user_profile', {})

        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сообщение не может быть пустым'}, ensure_ascii=False),
            }

        # Защита от злоупотребления: лимит запросов на IP в час
        try:
            client_ip = (event.get('requestContext', {}) or {}).get('identity', {}).get('sourceIp', '')
        except Exception:
            client_ip = ''
        if not check_rate_limit(client_ip):
            return {
                'statusCode': 429,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Слишком много запросов. Сделай паузу и попробуй через час.'}, ensure_ascii=False),
            }

        base_prompt = TEACHER_PROMPTS.get(teacher_id, TEACHER_PROMPTS['alex'])

        # ─── RAG: знание сайта ───
        kb_entries = find_kb_entries(user_message)
        used_kb = len(kb_entries) > 0

        # ─── Веб-поиск ───
        search_context_text = ''
        sources = []
        used_search = False
        if force_search or need_web_search(user_message):
            search_data = web_search(user_message)
            if search_data:
                search_context_text, sources = format_search_context(search_data)
                used_search = bool(search_context_text)

        # ─── Сборка контекста ───
        context_lines = []
        today = datetime.now().strftime('%d.%m.%Y')
        context_lines.append(f'Сегодняшняя дата: {today}.')

        # Профиль ученика
        user_ctx = build_user_context(user_profile)
        if user_ctx:
            context_lines.append(f'ПРОФИЛЬ УЧЕНИКА: {user_ctx}')

        if course_title:
            context_lines.append(f'Текущий курс: "{course_title}".')
        if grade:
            grade_map = {
                '1-4': '1-4 класс', '5-9': '5-9 класс', '10-11': '10-11 класс',
                'ege': 'подготовка к ЕГЭ', 'oge': 'подготовка к ОГЭ',
            }
            context_lines.append(f'Уровень: {grade_map.get(grade, grade)}.')

        # Научная строгость — для всех предметов, критично для точных наук
        context_lines.append(SCIENTIFIC_RIGOR)

        # Точные науки (математика/информатика — alex, физика/химия — dmitry):
        # правила диктовки формул нужны всегда, в голосе особенно.
        is_exact_science = teacher_id in ('alex', 'dmitry')
        if is_exact_science or voice_mode:
            context_lines.append(MATH_VOICE_RULES)

        # Адаптивный формат
        if voice_mode:
            context_lines.append('РЕЖИМ ГОЛОСА: ответ будет озвучен через TTS.')
            context_lines.append('Без markdown, без **жирного**, без списков, без #. Формулы и буквы — словами по-русски.')
            context_lines.append('Длина: 2-4 предложения, естественная речь.')
        else:
            context_lines.append('РЕЖИМ ТЕКСТА: ответ показывается на экране.')
            context_lines.append('Можно использовать markdown списки и **акценты**. Длина: до 6 предложений.')

        # База знаний УЧИСЬПРО
        if used_kb:
            kb_text = '\n\n'.join([e['content'] for e in kb_entries])
            context_lines.append(
                'ВАЖНО: пользователь спрашивает про УЧИСЬПРО. Используй эту проверенную информацию:'
            )
            context_lines.append(f'\n=== О УЧИСЬПРО ===\n{kb_text}\n=== КОНЕЦ ===')

        # Веб-поиск
        if used_search:
            context_lines.append(
                'Тебе предоставлены данные из интернета — используй их как факты. '
                'Не упоминай номера источников в ответе.'
            )
            context_lines.append(f'\n=== ДАННЫЕ ИЗ ИНТЕРНЕТА ===\n{search_context_text}\n=== КОНЕЦ ===')

        # CoT триггер для сложных задач (по эвристике)
        is_complex = (
            len(user_message) > 80
            or any(w in user_message.lower() for w in ['реши', 'докажи', 'почему', 'как доказать', 'объясни почему'])
        )
        if is_complex and not voice_mode:
            context_lines.append('Эта задача сложная — сначала подумай пошагово, потом дай ответ.')

        system_prompt = base_prompt + '\n\n' + ' '.join(context_lines)

        # ─── Сборка messages ───
        messages = [{'role': 'system', 'content': system_prompt}]

        # Few-shot примеры (1 пара) — обучение стилю
        few_shot = FEW_SHOT_EXAMPLES.get(teacher_id, [])
        if few_shot and not history:
            messages.extend(few_shot)

        # История (увеличена до 12 сообщений)
        for msg in history[-12:]:
            if 'role' in msg and 'content' in msg:
                role = 'assistant' if msg['role'] == 'assistant' else 'user'
                content = str(msg.get('content', ''))
            else:
                role = 'assistant' if msg.get('from') == 'teacher' else 'user'
                content = str(msg.get('text', ''))
            if content.strip():
                messages.append({'role': role, 'content': content})

        messages.append({'role': 'user', 'content': user_message})

        api_key = os.environ.get('POLZA_API_KEY', '')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'POLZA_API_KEY не настроен'}, ensure_ascii=False),
            }

        # Адаптивные параметры под режим
        max_tokens = 350 if voice_mode else 700
        temperature = 0.7 if not is_complex else 0.5  # сложные задачи — точнее

        payload = json.dumps({
            'model': 'openai/gpt-4o-mini',
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'presence_penalty': 0.3,  # меньше повторов
            'frequency_penalty': 0.3,
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://api.polza.ai/api/v1/chat/completions',
            data=payload,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
                reply = result['choices'][0]['message']['content'].strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            return {
                'statusCode': 502,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'polza.ai error: {e.code}', 'detail': err_body[:300]}, ensure_ascii=False),
            }

        # В голосовом режиме чистим от markdown
        if voice_mode:
            reply = clean_reply_for_voice(reply)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            'body': json.dumps({
                'reply': reply,
                'sources': sources,
                'used_search': used_search,
                'used_kb': used_kb,
                'kb_topics': [e['topic'] for e in kb_entries],
            }, ensure_ascii=False),
        }

    except Exception as e:
        print(f"[ai-chat] error: {type(e).__name__}: {str(e)[:300]}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Внутренняя ошибка сервиса'}, ensure_ascii=False),
        }