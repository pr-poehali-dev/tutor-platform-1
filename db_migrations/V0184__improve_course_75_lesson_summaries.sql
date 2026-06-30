-- Курс 75 «Запуск бизнеса с нуля»: заменяем шаблонные описания уроков на осмысленные.
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Разбираем «' || lesson_title || '»: ключевые понятия, нормы и практические примеры из российской практики бизнеса.'
WHERE course_id = 75 AND lesson_type = 'theory';

UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Практическая отработка темы «' || lesson_title || '»: пошаговый разбор на реальном кейсе с ИИ-наставником.'
WHERE course_id = 75 AND lesson_type = 'practice';

UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Закрепляем тему «' || lesson_title || '»: проверочный тест и разбор типичных ошибок предпринимателя.'
WHERE course_id = 75 AND lesson_type = 'test';

UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Итоговая работа по теме «' || lesson_title || '»: собираем готовый результат для своего бизнеса.'
WHERE course_id = 75 AND lesson_type = 'project';
