-- Закреплённым оставляем только свежий анонс промокодов
UPDATE feed_articles SET is_pinned = FALSE, updated_at = NOW()
WHERE is_pinned = TRUE
  AND slug <> 'promokody-na-uchispro-i-dobro-skidka-30-na-vse-do-konca-goda'