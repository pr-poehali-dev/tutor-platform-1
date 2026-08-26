UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = replace(content, '[Посмотреть программу курса](/course/48)', '[Посмотреть программу курса](/course-checkout/48)'),
    updated_at = now()
WHERE slug = 'reyting-biznes-shkol-2026-za-chto-platyat-milliony';
