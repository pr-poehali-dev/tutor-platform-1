-- Сдвигаем модули 7 и 8 курса 72 вниз, освобождая место под новый модуль ТБ.
-- Делаем в обратном порядке, чтобы не словить дубликаты sort_order.
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET module_index = 9, sort_order = sort_order + 6
WHERE course_id = 72 AND module_index = 8;

UPDATE t_p78828167_tutor_platform_1.course_lessons
SET module_index = 8, sort_order = sort_order + 6
WHERE course_id = 72 AND module_index = 7;
