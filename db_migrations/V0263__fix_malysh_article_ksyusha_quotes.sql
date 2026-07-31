UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = REPLACE(content, E'> **Ксюша малышам:** ', E'🦊 Ксюша малышам: '),
    updated_at = NOW()
WHERE id = 472;