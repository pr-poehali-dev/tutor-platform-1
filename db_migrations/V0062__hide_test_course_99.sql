-- Технический мусор: курс id=99 "Тест короткий" не входит в каталог.
-- Помечаем как fallback, чтобы он гарантированно исключался из всех ready-выборок и витрин.
UPDATE t_p78828167_tutor_platform_1.course_curricula
SET is_fallback = TRUE
WHERE course_id = 99;