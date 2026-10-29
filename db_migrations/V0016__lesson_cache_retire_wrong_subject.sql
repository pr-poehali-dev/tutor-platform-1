UPDATE t_p78828167_tutor_platform_1.lesson_cache
SET subject = 'x_retired', cache_key = 'retired_' || id
WHERE subject = 'Математика'
   OR (subject = 'math' AND id IN (6, 25, 36, 83, 84, 85, 86, 87, 88, 89, 90, 91, 122, 123, 133, 134));