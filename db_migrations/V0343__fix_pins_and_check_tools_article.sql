-- Закреплённой держим только новую статью про инструменты.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET is_pinned = false
WHERE slug = 'dopolnitelnyy-zarabotok-2026-analiticheskaya-zapiska';

-- Подстраховка от дефектов разметки редактора Ленты.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(
      regexp_replace(content, '(^|\n)# ', '\1## ', 'g'),
      '\n+---\n+', E'\n\n', 'g')
WHERE slug = 'pyat-instrumentov-dlya-predprinimatelya-na-realnyh-primerah';
