UPDATE t_p78828167_tutor_platform_1.feed_articles SET
 content = replace(content, '[[pct]]', chr(37)),
 status = 'published',
 published_at = NOW(),
 reading_time_min = 12,
 updated_at = NOW()
WHERE slug = 'granty-tehnologicheskomu-msp-2024-2026-reyting'