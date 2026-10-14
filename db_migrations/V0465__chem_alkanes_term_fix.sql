-- Урок «Химические свойства алканов»: исправляем термин «изоморфизироваться» на «изомеризоваться».
UPDATE t_p78828167_tutor_platform_1.lesson_cache
SET lesson_data = replace(replace(lesson_data::text, 'изоморфизироваться', 'изомеризоваться'), 'изоморфизаци', 'изомеризаци')::jsonb
WHERE subject = 'chemistry' AND lesson_data::text LIKE '%изоморфиз%'