-- Чистка ленты от мусора, накопленного автогенерацией.
--
-- Причина уже исправлена в backend/feed-curator/index.py:
--   1) защита от дублей смотрела окно «14 дней», а пул шаблонов конечный —
--      через две недели тот же сюжет считался новым («Гранты Института
--      Конфуция» ушли в ленту 6 раз, «Чебурашка 3» — 5 раз);
--   2) резервный пул не проверял длину текста — публиковались заметки
--      по 400 знаков, которые поиск не показывает вовсе.
-- Здесь убираем последствия.
--
-- Ничего не удаляем: переводим в archived. Статьи остаются в базе,
-- их можно вернуть одним UPDATE. Ручные материалы (source_kind='manual')
-- не трогаем ни при каких условиях — это редакционные тексты.

-- 1. Дубли: оставляем самую полную версию каждого сюжета, остальные в архив.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY lower(regexp_replace(title, '[^а-яa-z0-9 ]', '', 'gi'))
           ORDER BY length(content) DESC, id ASC
         ) AS rn
  FROM t_p78828167_tutor_platform_1.feed_articles
  WHERE status = 'published'
)
UPDATE t_p78828167_tutor_platform_1.feed_articles a
SET status = 'archived'
FROM ranked r
WHERE a.id = r.id
  AND r.rn > 1
  AND a.source_kind <> 'manual';

-- 2. «Тонкий» контент от агента: короче 2500 знаков — тот же порог,
-- что теперь стоит в коде для обоих путей публикации.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET status = 'archived'
WHERE status = 'published'
  AND source_kind = 'agent'
  AND length(content) < 2500;

-- 3. Шаблоны, уже побывавшие в ленте, больше не выдаются повторно:
-- проставляем use_count там, где он обнулён, иначе новый фильтр
-- use_count = 0 снова выпустит их в эфир.
UPDATE t_p78828167_tutor_platform_1.feed_demo_pool p
SET use_count = GREATEST(p.use_count, 1),
    last_used_at = COALESCE(p.last_used_at, NOW())
WHERE EXISTS (
  SELECT 1 FROM t_p78828167_tutor_platform_1.feed_articles a
  WHERE a.ai_notes LIKE '%Шаблон: ' || p.code || '.%'
);
