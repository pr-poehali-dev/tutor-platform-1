UPDATE t_p78828167_tutor_platform_1.feed_articles
SET status = 'archived', updated_at = NOW()
WHERE slug LIKE 'promokody-na-%-i-dobro-skidka-30-na-vse-do-konca-goda' AND status = 'published';