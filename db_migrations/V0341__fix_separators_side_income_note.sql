-- Горизонтальные разделители выводятся как текст «---». Убираем их:
-- заголовки вариантов и так визуально разделяют текст.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(content, '\n+---\n+', E'\n\n', 'g')
WHERE slug = 'dopolnitelnyy-zarabotok-2026-analiticheskaya-zapiska';
