-- Инвалидация старых кэшированных уроков:
-- расширяем поле cache_key и помечаем существующие записи префиксом 'inv_'.
ALTER TABLE t_p78828167_tutor_platform_1.lesson_cache ALTER COLUMN cache_key TYPE varchar(96);
UPDATE t_p78828167_tutor_platform_1.lesson_cache
SET cache_key = 'inv_' || cache_key
WHERE cache_key NOT LIKE 'inv_%';