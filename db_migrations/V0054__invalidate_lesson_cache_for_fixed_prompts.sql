-- Инвалидация кэша уроков: меняем cache_key так, чтобы старые записи
-- больше не находились при чтении (чтение идёт по точному cache_key).
-- Данные не удаляются, но уроки перегенерируются по новым правилам промптов.
UPDATE t_p78828167_tutor_platform_1.lesson_cache
SET cache_key = 'stale_v2__' || cache_key
WHERE cache_key NOT LIKE 'stale_v2__%';
