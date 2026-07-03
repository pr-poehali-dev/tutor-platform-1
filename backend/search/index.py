"""
Глобальный поиск по проекту УЧИСЬПРО.

Источники:
- feed_articles  (опубликованные статьи ленты)
- course_curricula + course_lessons (курсы и темы)
- статический индекс модулей/страниц (Курсы, ЕГЭ, Выпускник, Познай себя и т.д.)

GET /?action=search&q=...&limit=20[&kind=feed|course|page]
GET /?action=suggest&q=...&limit=6        — короткие подсказки для выпадашки
"""
import json
import os
import re
from datetime import datetime
import psycopg2


def cors_headers() -> dict:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def ok(data: dict, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': cors_headers(),
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(message: str, status: int = 400) -> dict:
    return ok({'error': message}, status)


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def normalize_query(q: str) -> str:
    """Чистим запрос: убираем спецсимволы SQL LIKE и обрезаем."""
    q = (q or '').strip()
    # Экранируем спецсимволы LIKE
    q = q.replace('\\', '').replace('%', '').replace('_', ' ')
    return q[:120]


# ─── СТАТИЧЕСКИЙ ИНДЕКС СТРАНИЦ/МОДУЛЕЙ ─────────────────────────────
STATIC_INDEX = [
    {
        'kind': 'page', 'emoji': '🧠', 'title': 'Курсы УЧИСЬПРО',
        'subtitle': 'Все курсы по школьным предметам',
        'url': '/courses', 'category': 'Курсы',
        'keywords': 'курсы предметы математика физика химия биология история обществознание '
                    'информатика русский литература английский география подготовка обучение',
    },
    {
        'kind': 'page', 'emoji': '🎓', 'title': 'Сборник заданий ОГЭ и ЕГЭ',
        'subtitle': 'Банк задач с решениями',
        'url': '/exam-bank', 'category': 'ЕГЭ и ОГЭ',
        'keywords': 'егэ огэ задания задачи варианты тренировка экзамен подготовка решения банк фипи',
    },
    {
        'kind': 'page', 'emoji': '🧮', 'title': 'Калькулятор баллов ЕГЭ',
        'subtitle': 'Перевод первичных баллов во вторичные',
        'url': '/score-calculator', 'category': 'ЕГЭ и ОГЭ',
        'keywords': 'калькулятор баллы егэ перевод вторичные первичные шкала фипи',
    },
    {
        'kind': 'page', 'emoji': '⏰', 'title': 'Чек-лист «До ЕГЭ»',
        'subtitle': 'Пошаговый план выпускника 2026',
        'url': '/exam-checklist', 'category': 'Выпускник',
        'keywords': 'чеклист план егэ выпускник подготовка документы дедлайн расписание сочинение календарь',
    },
    {
        'kind': 'page', 'emoji': '🪞', 'title': 'Познай себя — профориентация',
        'subtitle': 'Тест на профессию и вуз',
        'url': '/know-yourself', 'category': 'Профориентация',
        'keywords': 'профориентация тест профессия специальность кем стать выбор пути психология способности интересы',
    },
    {
        'kind': 'page', 'emoji': '🎓', 'title': 'Выпускник — подбор вуза',
        'subtitle': 'Программа подготовки под вуз и факультет',
        'url': '/graduate', 'category': 'Выпускник',
        'keywords': 'вуз университет факультет специальность подбор поступление баллы целевой выпускник институт',
    },
    {
        'kind': 'page', 'emoji': '👑', 'title': 'МГУ-трек',
        'subtitle': 'Поступление в МГУ имени Ломоносова',
        'url': '/mgu-track', 'category': 'Выпускник',
        'keywords': 'мгу ломоносов поступление дви факультет москва университет',
    },
    {
        'kind': 'page', 'emoji': '✍️', 'title': 'Мастерская сочинений и журналистики',
        'subtitle': 'Учимся писать тексты',
        'url': '/writing-craft', 'category': 'Гуманитарное',
        'keywords': 'сочинение журналистика эссе текст письмо итоговое допуск егэ литература риторика',
    },
    {
        'kind': 'page', 'emoji': '📡', 'title': 'Лента «Хочу всё знать»',
        'subtitle': 'Наука, культура, ИИ и роботы',
        'url': '/feed', 'category': 'Лента',
        'keywords': 'лента новости наука культура ии нейросети роботы образование китай хочу всё знать',
    },
    {
        'kind': 'page', 'emoji': '👶', 'title': 'Малыш 1+',
        'subtitle': 'Развивающие занятия для самых маленьких',
        'url': '/kids', 'category': 'Дошкольное',
        'keywords': 'малыш дошкольник ребёнок 1 2 3 4 5 6 лет развитие речь азбука песенки сказки',
    },
    {
        'kind': 'page', 'emoji': '🎨', 'title': 'Рисовашка',
        'subtitle': 'Уроки рисования для детей',
        'url': '/draw', 'category': 'Творчество',
        'keywords': 'рисование рисовашка живопись арт творчество дети уроки урок краски карандаш',
    },
    {
        'kind': 'page', 'emoji': '🔢', 'title': 'Математика — задачи',
        'subtitle': 'Тематический банк задач по математике',
        'url': '/math-problems', 'category': 'Курсы',
        'keywords': 'математика алгебра геометрия задачи тренировка егэ огэ профиль база',
    },
    {
        'kind': 'page', 'emoji': '🧪', 'title': 'Химия — задачи',
        'subtitle': 'Банк задач по химии',
        'url': '/chemistry-problems', 'category': 'Курсы',
        'keywords': 'химия задачи органика неорганика реакции егэ растворы',
    },
    {
        'kind': 'page', 'emoji': '🧬', 'title': 'Биология — задачи',
        'subtitle': 'Банк задач по биологии',
        'url': '/biology-problems', 'category': 'Курсы',
        'keywords': 'биология задачи генетика анатомия экология ботаника зоология егэ',
    },
    {
        'kind': 'page', 'emoji': '👤', 'title': 'Личный кабинет',
        'subtitle': 'Прогресс и подписка',
        'url': '/cabinet', 'category': 'Профиль',
        'keywords': 'личный кабинет профиль прогресс баллы статистика подписка',
    },
    {
        'kind': 'page', 'emoji': '📄', 'title': 'Политика конфиденциальности',
        'subtitle': 'Как обрабатываются персональные данные',
        'url': '/privacy', 'category': 'Юридическое',
        'keywords': 'политика конфиденциальности персональные данные гдпр обработка',
    },
    {
        'kind': 'page', 'emoji': '📜', 'title': 'Публичная оферта',
        'subtitle': 'Договор оказания услуг',
        'url': '/offer', 'category': 'Юридическое',
        'keywords': 'оферта договор условия услуги оплата возврат',
    },
    {
        'kind': 'page', 'emoji': '📋', 'title': 'Условия использования',
        'subtitle': 'Пользовательское соглашение',
        'url': '/terms', 'category': 'Юридическое',
        'keywords': 'условия использования соглашение правила пользователь',
    },
    {
        'kind': 'page', 'emoji': '💡', 'title': 'Центр помощи и FAQ',
        'subtitle': 'Ответы на частые вопросы',
        'url': '/help', 'category': 'Поддержка',
        'keywords': 'помощь faq вопросы ответы поддержка как заниматься как оплатить вернуть деньги отменить подписку',
    },
    {
        'kind': 'page', 'emoji': '✉️', 'title': 'Контакты и обратная связь',
        'subtitle': 'Напиши нам — ответим за 24 часа',
        'url': '/contacts', 'category': 'Поддержка',
        'keywords': 'контакты обратная связь написать поддержка вопрос предложение сотрудничество пресса',
    },
    {
        'kind': 'page', 'emoji': '🎁', 'title': 'Приведи друга — реферальная программа',
        'subtitle': '+7 дней подписки за каждого друга',
        'url': '/referral', 'category': 'Подписка',
        'keywords': 'приведи друга реферал промокод бонус подписка пригласить ссылка реферальная программа',
    },
    {
        'kind': 'page', 'emoji': '⭐', 'title': 'Отзывы учеников и родителей',
        'subtitle': 'Что говорят об УЧИСЬПРО',
        'url': '/reviews', 'category': 'О проекте',
        'keywords': 'отзывы отклики мнения ученики родители учителя рейтинг звёзды оценка платформы',
    },
    {
        'kind': 'page', 'emoji': '🏆', 'title': 'Конкурсы и гранты для школьников',
        'subtitle': 'Лента грантов, олимпиад и стипендий',
        'url': '/feed?category=grants', 'category': 'Лента',
        'keywords': 'конкурсы гранты стипендии олимпиады сириус всош ломоносов школьников образование победители',
    },
]


def search_static(q_lower: str, limit: int) -> list:
    """Поиск по статическому индексу страниц/модулей."""
    if not q_lower:
        return []
    results = []
    tokens = [t for t in re.split(r'\s+', q_lower) if t]
    for item in STATIC_INDEX:
        hay = (item['title'] + ' ' + item['subtitle'] + ' ' +
               item['keywords'] + ' ' + item['category']).lower()
        # Считаем, сколько слов из запроса нашлось
        matches = sum(1 for t in tokens if t in hay)
        if matches == 0:
            continue
        # Скор: точное совпадение в title > совпадение в keywords
        title_lower = item['title'].lower()
        score = matches * 10
        if q_lower in title_lower:
            score += 50
        if title_lower.startswith(q_lower):
            score += 30
        results.append((score, item))
    results.sort(key=lambda x: -x[0])
    return [
        {
            'kind': 'page',
            'title': it['title'],
            'subtitle': it['subtitle'],
            'category': it['category'],
            'emoji': it['emoji'],
            'url': it['url'],
            'score': sc,
        }
        for sc, it in results[:limit]
    ]


def search_feed(cur, q: str, limit: int) -> list:
    """Поиск по опубликованным статьям ленты."""
    if not q:
        return []
    # ILIKE для регистронезависимого поиска. Сортируем: совпадение в title > summary > content
    like = f"%{q}%"
    cur.execute(
        """
        SELECT id, slug, title, summary, category, cover_url, source_country,
               published_at,
               CASE
                   WHEN LOWER(title) LIKE LOWER(%s) THEN 100
                   WHEN LOWER(summary) LIKE LOWER(%s) THEN 50
                   ELSE 20
               END AS score
        FROM feed_articles
        WHERE status = 'published'
          AND (LOWER(title) LIKE LOWER(%s)
               OR LOWER(summary) LIKE LOWER(%s)
               OR LOWER(content) LIKE LOWER(%s))
        ORDER BY score DESC, published_at DESC NULLS LAST
        LIMIT %s
        """,
        (like, like, like, like, like, limit)
    )
    rows = cur.fetchall()
    out = []
    for r in rows:
        out.append({
            'kind': 'feed',
            'title': r[2],
            'subtitle': (r[3] or '')[:200],
            'category': 'Лента · ' + (r[4] or ''),
            'emoji': '📡',
            'url': f'/feed/{r[1]}',
            'cover_url': r[5],
            'extra': r[6] or '',
            'published_at': r[7].isoformat() if r[7] else None,
            'score': r[8],
        })
    return out


def search_courses(cur, q: str, limit: int) -> list:
    """Поиск по курсам и темам уроков."""
    if not q:
        return []
    like = f"%{q}%"
    out = []

    # Сначала — учебные планы (курсы)
    try:
        cur.execute(
            """
            SELECT subject, grade, title, COALESCE(description,'') AS descr
            FROM course_curricula
            WHERE LOWER(title) LIKE LOWER(%s)
               OR LOWER(COALESCE(description,'')) LIKE LOWER(%s)
               OR LOWER(subject) LIKE LOWER(%s)
            ORDER BY
              CASE WHEN LOWER(title) LIKE LOWER(%s) THEN 0 ELSE 1 END,
              grade
            LIMIT %s
            """,
            (like, like, like, like, limit)
        )
        for r in cur.fetchall():
            subject, grade, title, descr = r
            out.append({
                'kind': 'course',
                'title': title,
                'subtitle': (descr or f'{subject} · {grade} класс')[:200],
                'category': f'Курс · {grade} класс',
                'emoji': '📚',
                'url': f'/courses?subject={subject}&grade={grade}',
                'score': 80,
            })
    except psycopg2.Error:
        pass

    # Затем — конкретные уроки
    try:
        cur.execute(
            """
            SELECT id, title, COALESCE(topic,'') AS topic, COALESCE(subject,'') AS subj
            FROM course_lessons
            WHERE LOWER(title) LIKE LOWER(%s)
               OR LOWER(COALESCE(topic,'')) LIKE LOWER(%s)
            ORDER BY
              CASE WHEN LOWER(title) LIKE LOWER(%s) THEN 0 ELSE 1 END
            LIMIT %s
            """,
            (like, like, like, limit)
        )
        for r in cur.fetchall():
            lid, title, topic, subj = r
            out.append({
                'kind': 'lesson',
                'title': title,
                'subtitle': (topic or subj or '')[:200],
                'category': 'Урок' + (f' · {subj}' if subj else ''),
                'emoji': '🎯',
                'url': f'/courses?lesson={lid}',
                'score': 60,
            })
    except psycopg2.Error:
        pass

    return out


def handle_search(qs: dict) -> dict:
    raw_q = qs.get('q') or ''
    q = normalize_query(raw_q)
    if len(q) < 2:
        return ok({'q': raw_q, 'items': [], 'total': 0,
                   'message': 'Минимум 2 символа'})

    limit = max(1, min(50, int(qs.get('limit') or 20)))
    kind_filter = (qs.get('kind') or '').strip()

    q_lower = q.lower()
    all_items: list = []

    # 1. Статический индекс (быстро, без DB)
    if kind_filter in ('', 'page'):
        all_items.extend(search_static(q_lower, limit=limit))

    # 2. БД-поиск
    if kind_filter in ('', 'feed', 'course', 'lesson'):
        conn = get_db()
        try:
            with conn.cursor() as cur:
                if kind_filter in ('', 'feed'):
                    all_items.extend(search_feed(cur, q, limit=limit))
                if kind_filter in ('', 'course', 'lesson'):
                    all_items.extend(search_courses(cur, q, limit=limit))
        finally:
            conn.close()

    # Сортировка по score (без kind_filter — даём смесь)
    all_items.sort(key=lambda x: -x.get('score', 0))

    # Группировка по kind для UI
    grouped: dict = {}
    for it in all_items[:limit]:
        k = it['kind']
        grouped.setdefault(k, []).append(it)

    return ok({
        'q': raw_q,
        'items': all_items[:limit],
        'grouped': grouped,
        'total': len(all_items),
    })


def handle_suggest(qs: dict) -> dict:
    """Быстрые подсказки для выпадашки. Только статические + топ лента."""
    raw_q = qs.get('q') or ''
    q = normalize_query(raw_q)
    if len(q) < 2:
        return ok({'q': raw_q, 'items': []})

    limit = max(1, min(10, int(qs.get('limit') or 6)))
    q_lower = q.lower()

    items = search_static(q_lower, limit=limit)

    # Доп. 2-3 из ленты
    if len(items) < limit:
        conn = get_db()
        try:
            with conn.cursor() as cur:
                items.extend(search_feed(cur, q, limit=limit - len(items)))
        finally:
            conn.close()

    items.sort(key=lambda x: -x.get('score', 0))
    return ok({'q': raw_q, 'items': items[:limit]})


def handler(event: dict, context) -> dict:
    """Глобальный поиск по сайту."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or 'search').strip()

    if action == 'search':
        return handle_search(qs)
    if action == 'suggest':
        return handle_suggest(qs)

    return err('Неизвестное действие', 404)