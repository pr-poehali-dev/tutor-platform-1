UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(
      regexp_replace(
        regexp_replace(content, '<details>\s*\n<summary>(.*?)</summary>', E':::spoiler \\1', 'g'),
        '</details>', ':::', 'g'),
      '\n{3,}', E'\n\n', 'g'),
    updated_at = now()
WHERE slug = 'test-na-ponimanie-obyasni-rebenku-za-10-minut';
