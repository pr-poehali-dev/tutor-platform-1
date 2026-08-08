UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = REPLACE(content, '](/mini-course)', '](/mini-course/ai-money-start)'),
    updated_at = now()
WHERE slug = 'mini-kurs-pervye-5000-na-neirosetyah';