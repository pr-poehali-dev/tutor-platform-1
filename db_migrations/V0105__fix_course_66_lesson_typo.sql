-- Исправление опечатки (латиница) в названии урока курса 66.
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_title = 'Оценка ответов и борьба с галлюцинациями'
WHERE course_id = 66 AND module_index = 9 AND lesson_index = 1;
