-- Карта сайта строится по списочному API, который не отдаёт текст статьи.
-- Чтобы отсеивать из неё короткие заметки, нужен надёжный признак объёма в
-- списке — им становится reading_time_min. Приводим его к фактическому тексту
-- у всех опубликованных статей, а не только у тех, где расхождение было большим.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET reading_time_min = GREATEST(1, ROUND(length(content) / 1000.0)::int),
    updated_at = now()
WHERE status = 'published'
  AND length(content) > 0
  AND reading_time_min IS DISTINCT FROM GREATEST(1, ROUND(length(content) / 1000.0)::int);
