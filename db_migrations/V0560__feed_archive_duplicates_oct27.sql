-- Убираем дубли из Ленты: оставляем самую полную версию, остальные в архив (не удаляем).

-- 1. Автоновости из резервного пула: один шаблон публиковался по 2–6 раз
-- с разными заголовками после ИИ-рерайта, поэтому прошлая чистка по заголовкам их не поймала.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY substring(ai_notes from 'Шаблон: ([^.]+)\.')
           ORDER BY length(content) DESC, id ASC
         ) AS rn
  FROM t_p78828167_tutor_platform_1.feed_articles
  WHERE status = 'published' AND ai_notes LIKE '%Шаблон:%'
)
UPDATE t_p78828167_tutor_platform_1.feed_articles a
SET status = 'archived', updated_at = NOW(), rejected_reason = 'Дубль: тот же шаблон уже опубликован'
FROM ranked r
WHERE a.id = r.id AND r.rn > 1;

-- 2. Повторы одной темы и редакционные статьи, дублирующие более полные материалы.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET status = 'archived', updated_at = NOW(), rejected_reason = 'Дубль: тема раскрыта в более полной статье'
WHERE status = 'published' AND slug IN (
  'mat-labs-razdel-biznes-analitika-vozmozhnosti',
  'konstruktor-onlajn-shkol-na-ii',
  'kak-sozdat-onlayn-shkolu-s-ii-za-vecher',
  'chto-mozhno-poluchit-besplatno-uchispro',
  'mat-labs-razrabotchik-platformy-uchispro'
);

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET status = 'archived', updated_at = NOW(), rejected_reason = 'Дубль: тема раскрыта в более полной статье'
WHERE status = 'published' AND id IN (751, 765)
  AND ai_notes LIKE 'Аналитический отчёт по направлению «ИИ и машинное обучение»%';