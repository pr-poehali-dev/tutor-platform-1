UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(
      regexp_replace(content, '(^|\n)# ', '\1## ', 'g'),
      '\n+---\n+', E'\n\n', 'g')
WHERE slug = 'potrebitelskiy-spros-2026-zarplaty-rastut-pokupat-perestali';

-- Первые две части цикла получают ссылку на продолжение.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = content || E'\n\n**Продолжение разбора:** [рынок труда](/feed/rynok-truda-2026-razbor-hh-superjob-rabota-ru) и [потребительский спрос](/feed/potrebitelskiy-spros-2026-zarplaty-rastut-pokupat-perestali) — три части одной картины.'
WHERE slug = 'chto-gruzoperevozki-govoryat-ob-ekonomike-2026'
  AND content NOT LIKE '%Продолжение разбора:%';

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = content || E'\n\n**Другие части разбора:** [грузоперевозки](/feed/chto-gruzoperevozki-govoryat-ob-ekonomike-2026) и [потребительский спрос](/feed/potrebitelskiy-spros-2026-zarplaty-rastut-pokupat-perestali).'
WHERE slug = 'rynok-truda-2026-razbor-hh-superjob-rabota-ru'
  AND content NOT LIKE '%Другие части разбора:%';

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET is_pinned = false
WHERE is_pinned = true
  AND slug <> 'potrebitelskiy-spros-2026-zarplaty-rastut-pokupat-perestali';
