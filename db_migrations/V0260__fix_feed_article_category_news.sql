-- Фикс: категория 'news' не поддерживается фронтом (роняет ленту). Ставим 'education'.
UPDATE feed_articles
SET category = 'education', updated_at = NOW()
WHERE slug = 'promokody-na-uchispro-i-dobro-skidka-30-na-vse-do-konca-goda'