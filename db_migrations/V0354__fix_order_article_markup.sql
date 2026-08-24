UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(
      regexp_replace(content, '(^|\n)# ', '\1## ', 'g'),
      '\n+---\n+', E'\n\n', 'g')
WHERE slug = 'zakaz-kursa-obuchenie-pod-zapros';

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET is_pinned = false
WHERE is_pinned = true AND slug <> 'zakaz-kursa-obuchenie-pod-zapros';
