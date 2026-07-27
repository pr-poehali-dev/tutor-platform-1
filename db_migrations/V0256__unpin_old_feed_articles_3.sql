-- Закреплённым оставляем только свежий анонс словаря жестов
UPDATE feed_articles SET is_pinned = FALSE, updated_at = NOW()
WHERE is_pinned = TRUE
  AND slug <> 'slovar-zhestovogo-yazyka-rzhya-nashli-slovo-uvideli-zhest'