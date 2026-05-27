-- Расширяем источники: язык, страна, приоритет обхода
ALTER TABLE feed_sources
  ADD COLUMN IF NOT EXISTS language VARCHAR(8) NOT NULL DEFAULT 'ru',
  ADD COLUMN IF NOT EXISTS country VARCHAR(40) NOT NULL DEFAULT 'Россия',
  ADD COLUMN IF NOT EXISTS country_flag VARCHAR(8) NOT NULL DEFAULT '🇷🇺',
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 100;

-- В feed_articles тоже фиксируем исходный язык (для метрик и отображения)
ALTER TABLE feed_articles
  ADD COLUMN IF NOT EXISTS source_language VARCHAR(8) NOT NULL DEFAULT 'ru',
  ADD COLUMN IF NOT EXISTS source_country VARCHAR(40);

-- Обновляем существующие RU-источники приоритетом
UPDATE feed_sources SET priority = 200 WHERE language = 'ru';

-- Дублей не будет благодаря ON CONFLICT(code)
-- Приоритеты: 300 — Китай (приоритет №1), 200 — РФ, 150 — Азия, 100 — Запад

INSERT INTO feed_sources (code, name, category, rss_url, homepage, language, country, country_flag, priority) VALUES

-- ─── КИТАЙ — ПРИОРИТЕТ №1 ───────────────────────────────────────────
('xinhua-sci',       'Синьхуа · Наука и техника',        'science',   'http://www.news.cn/english/rss/sciEnRss.xml',         'http://www.news.cn',              'en', 'Китай',  '🇨🇳', 300),
('cgtn-tech',        'CGTN · Технологии',                 'ai',        'https://www.cgtn.com/subscribe/rss/section/tech.xml', 'https://www.cgtn.com',            'en', 'Китай',  '🇨🇳', 300),
('cgtn-culture',     'CGTN · Культура',                   'culture',   'https://www.cgtn.com/subscribe/rss/section/culture.xml','https://www.cgtn.com',          'en', 'Китай',  '🇨🇳', 300),
('peoples-daily',    'Жэньминь Жибао · Образование',      'education', 'http://en.people.cn/rss/Education.xml',                'http://en.people.cn',             'en', 'Китай',  '🇨🇳', 300),
('chinadaily-sci',   'China Daily · Наука',               'science',   'https://www.chinadaily.com.cn/rss/china_rss.xml',     'https://www.chinadaily.com.cn',   'en', 'Китай',  '🇨🇳', 300),
('chinadaily-tech',  'China Daily · Технологии и ИИ',     'ai',        'https://www.chinadaily.com.cn/rss/bizchina_rss.xml',  'https://www.chinadaily.com.cn',   'en', 'Китай',  '🇨🇳', 300),
('global-times-tech','Global Times · Наука и инновации',  'science',   'https://www.globaltimes.cn/rss/china.xml',            'https://www.globaltimes.cn',      'en', 'Китай',  '🇨🇳', 290),
('scmp-china-sci',   'SCMP · Китай · Наука',              'science',   'https://www.scmp.com/rss/318198/feed',                'https://www.scmp.com',            'en', 'Китай',  '🇨🇳', 280),
('scmp-tech',        'SCMP · Технологии',                 'ai',        'https://www.scmp.com/rss/36/feed',                    'https://www.scmp.com',            'en', 'Китай',  '🇨🇳', 280),

-- ─── РОССИЯ — приоритет №2 (уже есть базовые, добавляем недостающие) ─
('tass-science',     'ТАСС · Наука',                      'science',   'https://tass.ru/rss/v2.xml?rubrics=nauka',            'https://tass.ru',                 'ru', 'Россия',  '🇷🇺', 200),
('ria-culture',      'РИА · Культура',                    'culture',   'https://ria.ru/export/rss2/culture/index.xml',        'https://ria.ru',                  'ru', 'Россия',  '🇷🇺', 200),
('ria-science',      'РИА · Наука',                       'science',   'https://ria.ru/export/rss2/science/index.xml',        'https://ria.ru',                  'ru', 'Россия',  '🇷🇺', 200),
('izvestia-sci',     'Известия · Наука и технологии',     'science',   'https://iz.ru/xml/rss/all.xml',                       'https://iz.ru',                   'ru', 'Россия',  '🇷🇺', 200),
('rg-edu',           'Российская газета · Образование',   'education', 'https://rg.ru/xml/index.xml',                         'https://rg.ru',                   'ru', 'Россия',  '🇷🇺', 200),

-- ─── АЗИЯ (Япония / Корея / Индия) ──────────────────────────────────
('nhk-world',        'NHK World · Наука и технологии',    'science',   'https://www3.nhk.or.jp/nhkworld/en/news/feeds/',      'https://www3.nhk.or.jp/nhkworld/','en', 'Япония',  '🇯🇵', 150),
('japan-times-sci',  'The Japan Times · Наука',           'science',   'https://www.japantimes.co.jp/news/category/science/feed/','https://www.japantimes.co.jp', 'en', 'Япония',  '🇯🇵', 150),
('korea-herald-tech','Korea Herald · Технологии',         'ai',        'https://www.koreaherald.com/common/rss_xml.php?ct=030000','https://www.koreaherald.com',   'en', 'Корея',   '🇰🇷', 150),
('the-hindu-sci',    'The Hindu · Наука',                 'science',   'https://www.thehindu.com/sci-tech/science/feeder/default.rss','https://www.thehindu.com',  'en', 'Индия',   '🇮🇳', 140),

-- ─── ЗАПАД (наука, культура, ИИ) ────────────────────────────────────
('nature',           'Nature News',                       'science',   'https://www.nature.com/nature.rss',                   'https://www.nature.com',          'en', 'Великобритания','🇬🇧', 130),
('science-mag',      'Science Magazine',                  'science',   'https://www.science.org/rss/news_current.xml',        'https://www.science.org',         'en', 'США',      '🇺🇸', 130),
('newscientist',     'New Scientist',                     'science',   'https://www.newscientist.com/feed/home/',             'https://www.newscientist.com',    'en', 'Великобритания','🇬🇧', 120),
('mit-tech-review',  'MIT Technology Review',             'ai',        'https://www.technologyreview.com/feed/',              'https://www.technologyreview.com','en', 'США',      '🇺🇸', 120),
('wired-sci',        'WIRED · Наука',                     'science',   'https://www.wired.com/feed/category/science/latest/rss','https://www.wired.com',         'en', 'США',      '🇺🇸', 120),
('wired-ai',         'WIRED · ИИ',                        'ai',        'https://www.wired.com/feed/tag/ai/latest/rss',        'https://www.wired.com',           'en', 'США',      '🇺🇸', 120),
('ieee-spectrum',    'IEEE Spectrum · Робототехника',     'robots',    'https://spectrum.ieee.org/feeds/topic/robotics.rss',  'https://spectrum.ieee.org',       'en', 'США',      '🇺🇸', 120),
('the-verge-ai',     'The Verge · ИИ',                    'ai',        'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml','https://www.theverge.com','en','США',      '🇺🇸', 110),
('arstechnica-sci',  'Ars Technica · Наука',              'science',   'https://feeds.arstechnica.com/arstechnica/science',   'https://arstechnica.com',         'en', 'США',      '🇺🇸', 110),
('phys-org',         'Phys.org · Наука',                  'science',   'https://phys.org/rss-feed/',                          'https://phys.org',                'en', 'США',      '🇺🇸', 110),
('space-news',       'Space.com',                         'science',   'https://www.space.com/feeds/all',                     'https://www.space.com',           'en', 'США',      '🇺🇸', 110),
('the-art-newspaper','The Art Newspaper',                 'culture',   'https://www.theartnewspaper.com/rss',                 'https://www.theartnewspaper.com', 'en', 'Великобритания','🇬🇧', 100),
('smithsonian',      'Smithsonian Magazine · Культура',   'culture',   'https://www.smithsonianmag.com/rss/latest_articles/', 'https://www.smithsonianmag.com',  'en', 'США',      '🇺🇸', 100),
('venturebeat-ai',   'VentureBeat · ИИ',                  'ai',        'https://venturebeat.com/category/ai/feed/',           'https://venturebeat.com',         'en', 'США',      '🇺🇸', 100),
('robohub',          'Robohub · Робототехника',           'robots',    'https://robohub.org/feed/',                           'https://robohub.org',             'en', 'США',      '🇺🇸', 100),
('therobotreport',   'The Robot Report',                  'robots',    'https://www.therobotreport.com/feed/',                'https://www.therobotreport.com',  'en', 'США',      '🇺🇸', 100),
('unesco-culture',   'UNESCO · Культура и образование',   'culture',   'https://www.unesco.org/en/rss.xml',                   'https://www.unesco.org',          'en', 'ООН',      '🇺🇳', 100)

ON CONFLICT (code) DO NOTHING;
