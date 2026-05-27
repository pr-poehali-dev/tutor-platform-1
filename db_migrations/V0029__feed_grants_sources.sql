-- Этап 2: источники грантов и конкурсов для ленты (без кириллических доменов)
INSERT INTO feed_sources (code, name, category, rss_url, homepage, language, country, country_flag, priority) VALUES
('rscf-grants',     'Российский научный фонд',          'grants', 'https://rscf.ru/rss/news/',                 'https://rscf.ru',                    'ru', 'Россия', '🇷🇺', 250),
('sirius-news',     'Образовательный центр Сириус',     'grants', 'https://sochisirius.ru/news.rss',           'https://sochisirius.ru',             'ru', 'Россия', '🇷🇺', 250),
('vsosh',           'Всероссийская олимпиада школьников','grants', 'https://olimpiada.ru/rss',                  'https://olimpiada.ru',               'ru', 'Россия', '🇷🇺', 240),
('lomonosov',       'Олимпиада Ломоносов МГУ',          'grants', 'https://lomonosov-msu.ru/rss/',             'https://lomonosov-msu.ru',           'ru', 'Россия', '🇷🇺', 240),
('rosmolodezh',     'Росмолодёжь · Гранты',             'grants', 'https://fadm.gov.ru/rss/news',              'https://fadm.gov.ru',                'ru', 'Россия', '🇷🇺', 230),
('china-csc',       'China Scholarship Council',         'grants', 'https://www.campuschina.org/rss.xml',       'https://www.campuschina.org',        'en', 'Китай',  '🇨🇳', 300),
('rosobr-grants',   'Министерство просвещения · Гранты','grants', 'https://edu.gov.ru/press/rss',              'https://edu.gov.ru',                 'ru', 'Россия', '🇷🇺', 230)
ON CONFLICT (code) DO NOTHING;
