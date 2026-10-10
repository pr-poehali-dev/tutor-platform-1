UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(content, E'\\n\\*([^*\\n]+)\\*\\s*$', E'\n**\\1**')
WHERE slug LIKE 'proekt-2036-chast-%';