UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = REPLACE(content, E'а не «official» названия букв', E'а не «взрослые» названия букв'),
    updated_at = NOW()
WHERE id = 472;