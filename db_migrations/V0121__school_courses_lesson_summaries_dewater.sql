-- Массовая замена шаблонных lesson_summary на осмысленные, построенные вокруг
-- реальной темы урока (lesson_title) и типа урока. Только для уроков-болванок.

-- Теория
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Разбираем тему «' || lesson_title || '»: ключевые понятия, правила и как применять их при решении задач.'
WHERE lesson_summary LIKE 'Изучаем тему%разбираем примеры, закрепляем на практике'
  AND lesson_type = 'theory';

-- Практика
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Практика по теме «' || lesson_title || '»: решаем задачи разной сложности и доводим навык до автоматизма.'
WHERE lesson_summary LIKE 'Изучаем тему%разбираем примеры, закрепляем на практике'
  AND lesson_type = 'practice';

-- Тест/контроль
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Проверочный тест по теме «' || lesson_title || '»: закрепляем материал и находим пробелы перед следующим блоком.'
WHERE lesson_summary LIKE 'Изучаем тему%разбираем примеры, закрепляем на практике'
  AND lesson_type = 'test';

-- Проект
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Итоговый проект по теме «' || lesson_title || '»: применяем изученное и собираем готовый результат.'
WHERE lesson_summary LIKE 'Изучаем тему%разбираем примеры, закрепляем на практике'
  AND lesson_type = 'project';

-- Остальные типы (если есть) — общий осмысленный вариант
UPDATE t_p78828167_tutor_platform_1.course_lessons
SET lesson_summary = 'Урок по теме «' || lesson_title || '»: разбираем суть и закрепляем на конкретных примерах.'
WHERE lesson_summary LIKE 'Изучаем тему%разбираем примеры, закрепляем на практике';
