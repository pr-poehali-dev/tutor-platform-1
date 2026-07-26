-- Закреплённым оставляем только свежий анонс новых опций «Оркестратора»
UPDATE feed_articles SET is_pinned = FALSE, updated_at = NOW()
WHERE is_pinned = TRUE
  AND slug <> 'orkestrator-ii-assistenty-i-planirovshchik-kogo-mozhno-ne-nanimat'