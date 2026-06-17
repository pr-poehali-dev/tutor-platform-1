-- Исправление опечатки в module_title урока (course 65, module 1, lesson 4).
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET module_title = 'Знакомство с нейросетями'
WHERE course_id = 65 AND module_index = 1 AND module_title = 'Знакомthrough нейросетями';
