-- Время чтения у части статей не соответствовало тексту: например, у разбора
-- «Ревизора» стояло 18 минут при 210 символах содержимого. Поисковик видит
-- в разметке timeRequired=PT18M и абзац текста — это расхождение бьёт по доверию
-- к разделу целиком. Пересчитываем от фактического объёма: ~1000 знаков в минуту.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET reading_time_min = GREATEST(1, ROUND(length(content) / 1000.0)::int),
    updated_at = now()
WHERE status = 'published'
  AND length(content) > 0
  AND abs(reading_time_min - GREATEST(1, ROUND(length(content) / 1000.0)::int)) >= 3;
