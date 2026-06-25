-- Katalog IT-kanalov MAX (dlya otobrazheniya na sayte) + novye RSS-istochniki

CREATE TABLE IF NOT EXISTS it_max_channels (
    id BIGSERIAL PRIMARY KEY,
    handle VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    max_url VARCHAR(300) NOT NULL,
    direction_key VARCHAR(50) NOT NULL DEFAULT 'web',
    topic VARCHAR(200) NOT NULL DEFAULT '',
    emoji VARCHAR(8) NOT NULL DEFAULT 'tv',
    rss_source_code VARCHAR(60) NULL,
    sort_order INTEGER NOT NULL DEFAULT 100,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO it_max_channels (handle, name, max_url, direction_key, topic, sort_order, rss_source_code) VALUES
    ('neirosety',       'Neyroseti',        'https://max.ru/neirosety',       'ai-ml',    'II i neyroseti',              10, 'hinews'),
    ('nsis_cybersec',   'NSIS CyberSec',    'https://max.ru/nsis_cybersec',   'security', 'Kiberbezopasnost',            20, 'xakep'),
    ('backend_it',      'Backend IT',       'https://max.ru/backend_it',      'python',   'Bekend-razrabotka',           30, 'habr-python'),
    ('pythontest_it',   'Python Test',      'https://max.ru/pythontest_it',   'python',   'Python i sobesedovaniya',     40, 'habr-python'),
    ('d_code',          'D Code',           'https://max.ru/d_code',          'web',      'Programmirovanie i kod',      50, 'habr-dev'),
    ('developer_shelf', 'Developer Shelf',  'https://max.ru/developer_shelf', 'web',      'Razrabotka i instrumenty',    60, 'habr-dev'),
    ('archivator_it',   'Archivator IT',    'https://max.ru/archivator_it',   'web',      'IT-novosti i podborki',       70, 'habr-dev'),
    ('aliexpress_prg',  'AliExpress PRG',   'https://max.ru/aliexpress_prg',  'web',      'Programmirovanie',            80, 'habr-dev'),
    ('iphonesru',       'iPhones.ru',       'https://max.ru/iphonesru',       'mobile',   'Apple i gadzhety',            90, 'iphonesru'),
    ('iguides',         'iGuides',          'https://max.ru/iguides',         'mobile',   'Tehnologii i gadzhety',      100, 'iguides'),
    ('rozetked',        'Rozetked',         'https://max.ru/Rozetked',        'mobile',   'Tehnologii i gadzhety',      110, 'rozetked'),
    ('wylsacomred',     'Wylsacom Red',     'https://max.ru/WylsacomRed',     'mobile',   'Tehno-novosti',              120, 'iphonesru')
ON CONFLICT (handle) DO NOTHING;

-- Novye RSS-istochniki (analogi MAX-kanalov, u kotoryh est sayty)
INSERT INTO it_trend_sources (code, name, kind, url, weight) VALUES
    ('iphonesru', 'iPhones.ru',    'rss', 'https://www.iphones.ru/feed', 2),
    ('iguides',   'iGuides',       'rss', 'https://www.iguides.ru/rss/all/', 2),
    ('rozetked',  'Rozetked',      'rss', 'https://rozetked.me/rss', 2),
    ('xakep',     'Xakep',         'rss', 'https://xakep.ru/feed/', 3),
    ('hinews',    'Hi-News',       'rss', 'https://hi-news.ru/feed', 2)
ON CONFLICT (code) DO NOTHING;
