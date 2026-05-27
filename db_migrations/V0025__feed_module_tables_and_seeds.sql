-- Модуль "Лента" — новости науки, культуры, образования, ИИ/роботов + UGC

-- Категории: science, culture, education, robots, ai
-- Источник: agent (RSS-агент) | user (пользователь) | manual (админ)
-- Статус: draft | pending | published | rejected

CREATE TABLE IF NOT EXISTS feed_articles (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(180) NOT NULL UNIQUE,
    title VARCHAR(400) NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    category VARCHAR(30) NOT NULL,
    cover_url VARCHAR(800),
    -- Источник
    source_kind VARCHAR(20) NOT NULL DEFAULT 'agent',
    source_name VARCHAR(160),
    source_url VARCHAR(800),
    -- Автор (если это user-submission)
    author_user_id BIGINT REFERENCES auth_users(id),
    author_display_name VARCHAR(160),
    -- Модерация и публикация
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    rejected_reason VARCHAR(500),
    moderated_by VARCHAR(80),
    moderated_at TIMESTAMPTZ,
    -- Для рекомендаций
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    reading_time_min INTEGER DEFAULT 3,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    -- AI-метаданные (после рерайта/анализа)
    ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
    ai_notes TEXT,
    -- Время
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_status_pub ON feed_articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_category ON feed_articles(category, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_author ON feed_articles(author_user_id);

-- Источники для агента (RSS / сайт)
CREATE TABLE IF NOT EXISTS feed_sources (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(30) NOT NULL,
    rss_url VARCHAR(800) NOT NULL,
    homepage VARCHAR(800),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_fetched_at TIMESTAMPTZ,
    last_fetch_count INTEGER DEFAULT 0,
    last_error VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Лайки и просмотры (для аналитики)
CREATE TABLE IF NOT EXISTS feed_reactions (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES feed_articles(id),
    user_id BIGINT REFERENCES auth_users(id),
    kind VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id, user_id, kind)
);

-- Seed: предустановленные источники (открытые RSS)
INSERT INTO feed_sources (code, name, category, rss_url, homepage) VALUES
('nplus1',         'N+1',                          'science',   'https://nplus1.ru/rss',                        'https://nplus1.ru'),
('elementy',       'Элементы большой науки',       'science',   'https://elementy.ru/rss/news',                 'https://elementy.ru'),
('naukatv',        'Наука ТВ',                     'science',   'https://naukatv.ru/rss',                       'https://naukatv.ru'),
('habr-ai',        'Хабр · ИИ',                    'ai',        'https://habr.com/ru/rss/flows/develop/articles/?fl=ru&hub=artificial_intelligence', 'https://habr.com/ru/hub/artificial_intelligence/'),
('habr-robots',    'Хабр · Робототехника',         'robots',    'https://habr.com/ru/rss/flows/develop/articles/?fl=ru&hub=robotics', 'https://habr.com/ru/hub/robotics/'),
('edu-gov',        'Министерство просвещения РФ',  'education', 'https://edu.gov.ru/press/rss',                 'https://edu.gov.ru'),
('minobrnauki',    'Минобрнауки РФ',               'education', 'https://minobrnauki.gov.ru/rss/',              'https://minobrnauki.gov.ru'),
('culture-gov',    'Министерство культуры РФ',     'culture',   'https://culture.gov.ru/rss/news/',             'https://culture.gov.ru'),
('tretyakov',      'Третьяковская галерея',        'culture',   'https://www.tretyakovgallery.ru/feed/',        'https://www.tretyakovgallery.ru'),
('roskosmos',      'Роскосмос',                    'science',   'https://www.roscosmos.ru/rss/',                'https://www.roscosmos.ru')
ON CONFLICT (code) DO NOTHING;
