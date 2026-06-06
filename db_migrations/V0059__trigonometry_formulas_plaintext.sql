-- Переписываем формулы курса 56 под формат рендера mathFormat (степени ^, индексы, √, π) без LaTeX/$.

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Переводим градусы в радианы и обратно по формуле: α(рад) = (π/180°)·α(град). Запоминаем ключевые углы: π/6, π/4, π/3, π/2.',
 topics = '["радианная мера","π радиан = 180°","перевод единиц"]'::jsonb
WHERE course_id=56 AND lesson_index=2;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Строим единичную окружность радиуса 1. Разбираем 4 четверти и знаки координат в каждой. Любая точка круга — это (cos α; sin α).'
WHERE course_id=56 AND lesson_index=3;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Определяем функции через единичную окружность: sin α — ордината, cos α — абсцисса, tg α = sin α / cos α, ctg α = cos α / sin α.'
WHERE course_id=56 AND lesson_index=5;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Выводим и запоминаем таблицу: например sin 30° = 1/2, cos 45° = √2/2, tg 60° = √3.'
WHERE course_id=56 AND lesson_index=6;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Правило «все студенты тангенса косинуса»: в I четверти всё положительно, во II — только sin, в III — только tg и ctg, в IV — только cos.'
WHERE course_id=56 AND lesson_index=7;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Главная формула тригонометрии: sin^2 α + cos^2 α = 1. Выводим её прямо из теоремы Пифагора на единичной окружности.',
 topics = '["sin^2 α + cos^2 α = 1","вывод из теоремы Пифагора"]'::jsonb
WHERE course_id=56 AND lesson_index=10;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Формулы 1 + tg^2 α = 1/cos^2 α и 1 + ctg^2 α = 1/sin^2 α, а также tg α · ctg α = 1.'
WHERE course_id=56 AND lesson_index=11;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Учимся упрощать громоздкие выражения вида (sin^2 α)/(1 − cos α), сводя их к простому виду.'
WHERE course_id=56 AND lesson_index=12;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Функция cos — чётная: cos(−α) = cos α, а sin — нечётная: sin(−α) = −sin α. Период sin и cos равен 2π, у tg — π.',
 topics = '["чётность","нечётность","период 2π"]'::jsonb
WHERE course_id=56 AND lesson_index=14;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Правило «лошадки»: при углах π ± α функция не меняется, при π/2 ± α — меняется на кофункцию. Пример: sin(π/2 + α) = cos α.'
WHERE course_id=56 AND lesson_index=15;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Ключевые формулы: sin(α ± β) = sin α · cos β ± cos α · sin β и cos(α ± β) = cos α · cos β ∓ sin α · sin β.'
WHERE course_id=56 AND lesson_index=16;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Выводим из формул сложения: sin 2α = 2·sin α·cos α, cos 2α = cos^2 α − sin^2 α.',
 topics = '["двойной угол","sin 2α","cos 2α"]'::jsonb
WHERE course_id=56 AND lesson_index=17;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Формулы понижения степени: sin^2 α = (1 − cos 2α)/2, cos^2 α = (1 + cos 2α)/2.'
WHERE course_id=56 AND lesson_index=18;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Обратные функции: arcsin x, arccos x, arctg x и их области значений. Пример: arcsin(1/2) = π/6.'
WHERE course_id=56 AND lesson_index=21;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Общее решение: cos x = a ⇒ x = ±arccos a + 2πn, n ∈ Z. Частные случаи для a = 0, 1, −1.',
 topics = '["cos x = a","общая формула корней"]'::jsonb
WHERE course_id=56 AND lesson_index=22;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Общее решение: sin x = a ⇒ x = (−1)^n · arcsin a + πn, n ∈ Z.',
 topics = '["sin x = a","общая формула корней"]'::jsonb
WHERE course_id=56 AND lesson_index=23;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Общее решение: tg x = a ⇒ x = arctg a + πn, n ∈ Z.',
 topics = '["tg x = a","период π"]'::jsonb
WHERE course_id=56 AND lesson_index=24;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Замена t = sin x или t = cos x превращает уравнение вида 2·sin^2 x − 3·sin x + 1 = 0 в квадратное.'
WHERE course_id=56 AND lesson_index=25;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Уравнения вида a·sin x + b·cos x = 0 делим на cos x и сводим к tg x.'
WHERE course_id=56 AND lesson_index=26;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'Строим синусоиду и косинусоиду, разбираем амплитуду, период 2π и сдвиг. График y = cos x — это синусоида, сдвинутая на π/2.'
WHERE course_id=56 AND lesson_index=28;

UPDATE t_p78828167_tutor_platform_1.course_lessons SET
 lesson_summary = 'График тангенса с асимптотами. Преобразования: y = A·sin(kx + φ) — растяжение, сжатие и сдвиг.'
WHERE course_id=56 AND lesson_index=29;

UPDATE t_p78828167_tutor_platform_1.course_curricula SET
 program_description = 'Полный курс школьной тригонометрии: от понятия угла и единичной окружности до отбора корней в задаче 13 профильного ЕГЭ. Каждая формула выводится наглядно. Главное тождество sin^2 α + cos^2 α = 1 и все формулы записаны в привычном школьном виде.'
WHERE course_id=56;