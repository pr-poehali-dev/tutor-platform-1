UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = replace(content, E'<details>\n<summary>Показать разбор\n', E':::spoiler Показать разбор\n'),
    updated_at = now()
WHERE slug = 'test-na-ponimanie-obyasni-rebenku-za-10-minut';
