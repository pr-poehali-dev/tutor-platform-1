-- Освобождаем sort_order 43-44 под практикум и тест модуля ТБ: сдвигаем модули 8 и 9 ещё на +2.
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET sort_order = sort_order + 2
WHERE course_id = 72 AND module_index = 9;

UPDATE t_p78828167_tutor_platform_1.course_lessons
SET sort_order = sort_order + 2
WHERE course_id = 72 AND module_index = 8;

-- Добавляем практикум и тест в модуль 7 (ТБ).
INSERT INTO t_p78828167_tutor_platform_1.course_lessons
  (course_id, module_index, module_title, module_description, lesson_index, lesson_title,
   lesson_summary, lesson_type, estimated_minutes, topics, skills_acquired, homework_description, is_preview, sort_order)
VALUES
(72,7,'Техника безопасности и охрана труда на стройке','Полный разбор ТБ: от правовой базы до действий при ЧП.',7,
 'Практикум: аудит безопасности и расследование ЧП','Проводим обход по чек-листу ОТ и ТБ; разбираем порядок действий и расследование несчастного случая.','practice',45,
 '["Аудит ОТ","Несчастный случай","Расследование","Чек-лист"]','["Аудит и реагирование"]','Проведите аудит площадки и опишите порядок действий при ЧП.',false,43),
(72,7,'Техника безопасности и охрана труда на стройке','Полный разбор ТБ: от правовой базы до действий при ЧП.',8,
 'Контрольный тест: техника безопасности','Проверяем знание охраны труда и техники безопасности на стройке.','test',25,
 '["Самопроверка","Охрана труда","ТБ"]','["Закрепление темы"]','Пройдите тест по технике безопасности.',false,44);
