UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(
      regexp_replace(content, '(^|\n)# ', '\1## ', 'g'),
      '\n+---\n+', E'\n\n', 'g')
WHERE slug = 'rynok-truda-2026-razbor-hh-superjob-rabota-ru';

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET is_pinned = false
WHERE is_pinned = true
  AND slug <> 'rynok-truda-2026-razbor-hh-superjob-rabota-ru';
