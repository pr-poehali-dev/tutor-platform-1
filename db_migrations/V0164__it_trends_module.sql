-- Модуль аналитики IT-трендov: istochniki, signaly i napravleniya

CREATE TABLE IF NOT EXISTS it_trend_sources (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'rss',
    url VARCHAR(800) NOT NULL DEFAULT '',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    weight INTEGER NOT NULL DEFAULT 1,
    last_fetched_at TIMESTAMPTZ NULL,
    last_fetch_count INTEGER NULL,
    last_error VARCHAR(600) NULL,
    consecutive_errors INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS it_trend_signals (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NULL,
    source_code VARCHAR(60) NOT NULL DEFAULT '',
    direction_key VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL DEFAULT '',
    url VARCHAR(800) NULL,
    summary TEXT NOT NULL DEFAULT '',
    score INTEGER NOT NULL DEFAULT 1,
    dedup_key VARCHAR(800) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS it_trend_signals_dedup_uq ON it_trend_signals(dedup_key);
CREATE INDEX IF NOT EXISTS it_trend_signals_dir_idx ON it_trend_signals(direction_key, created_at DESC);

CREATE TABLE IF NOT EXISTS it_trend_directions (
    id BIGSERIAL PRIMARY KEY,
    direction_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    emoji VARCHAR(8) NOT NULL DEFAULT 'idea',
    description VARCHAR(500) NOT NULL DEFAULT '',
    category VARCHAR(40) NOT NULL DEFAULT 'general',
    signals_total INTEGER NOT NULL DEFAULT 0,
    signals_7d INTEGER NOT NULL DEFAULT 0,
    signals_30d INTEGER NOT NULL DEFAULT 0,
    score NUMERIC(10,2) NOT NULL DEFAULT 0,
    momentum NUMERIC(10,2) NOT NULL DEFAULT 0,
    rank INTEGER NULL,
    ai_insight TEXT NULL,
    last_article_slug VARCHAR(200) NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS it_trend_directions_rank_idx ON it_trend_directions(rank);

CREATE TABLE IF NOT EXISTS it_trend_runs (
    id BIGSERIAL PRIMARY KEY,
    kind VARCHAR(30) NOT NULL DEFAULT 'cron',
    status VARCHAR(20) NOT NULL DEFAULT 'ok',
    signals_collected INTEGER NOT NULL DEFAULT 0,
    articles_created INTEGER NOT NULL DEFAULT 0,
    error_message VARCHAR(600) NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ NULL
);

INSERT INTO it_trend_sources (code, name, kind, url, weight) VALUES
    ('habr-dev',     'Habr Develop',        'rss', 'https://habr.com/ru/rss/flows/develop/all/?fl=ru', 3),
    ('habr-ml',      'Habr ML',             'rss', 'https://habr.com/ru/rss/hub/machine_learning/all/?fl=ru', 3),
    ('habr-python',  'Habr Python',         'rss', 'https://habr.com/ru/rss/hub/python/all/?fl=ru', 2),
    ('habr-go',      'Habr Go',             'rss', 'https://habr.com/ru/rss/hub/go/all/?fl=ru', 2),
    ('habr-js',      'Habr JavaScript',     'rss', 'https://habr.com/ru/rss/hub/javascript/all/?fl=ru', 2),
    ('habr-devops',  'Habr DevOps',         'rss', 'https://habr.com/ru/rss/hub/devops/all/?fl=ru', 2),
    ('our-max',      'MAX channel',         'max_channel', '', 4)
ON CONFLICT (code) DO NOTHING;

INSERT INTO it_trend_directions (direction_key, name, emoji, description, category) VALUES
    ('python',      'Python',                  'py',  'Universalnyy yazyk dlya bekenda, dannyh i avtomatizacii.', 'lang'),
    ('javascript',  'JavaScript / TypeScript', 'js',  'Yazyk veba: frontend, Node.js, prilozheniya.', 'lang'),
    ('go',          'Go (Golang)',             'go',  'Bystryy yazyk dlya nagruzhennyh servisov i oblaka.', 'lang'),
    ('rust',        'Rust',                    'rs',  'Sistemnyy yazyk s bezopasnoy pamyatyu.', 'lang'),
    ('ai-ml',       'AI i ML',                 'ai',  'Neyroseti, LLM, generativnyy II.', 'ai'),
    ('data',        'Data Science',            'data','Rabota s dannymi, BigData, ML-payplayny.', 'data'),
    ('devops',      'DevOps i oblaka',         'ops', 'CI/CD, Kubernetes, konteynery.', 'devops'),
    ('web',         'Veb-razrabotka',          'web', 'Frontend, bekend, freymvorki, API.', 'web'),
    ('mobile',      'Mobilnaya razrabotka',    'mob', 'iOS, Android, kross-platforma.', 'mobile'),
    ('security',    'Kiberbezopasnost',        'sec', 'Zashchita dannyh, pentest.', 'security'),
    ('iot',         'IoT i avtomatizaciya',    'iot', 'Promyshlennaya avtomatizaciya, datchiki.', 'iot'),
    ('lowcode',     'Low-code / No-code',      'low', 'Bystraya razrabotka bez glubokogo koda.', 'web')
ON CONFLICT (direction_key) DO NOTHING;
