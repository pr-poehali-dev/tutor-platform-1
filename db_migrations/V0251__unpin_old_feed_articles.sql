-- Оставляем закреплённым в ленте только свежий анонс «Оркестратора»
UPDATE feed_articles SET is_pinned = FALSE, updated_at = NOW()
WHERE is_pinned = TRUE
  AND slug <> 'orkestrator-onboarding-i-koordinaciya-udalennyh-komand-s-ii'