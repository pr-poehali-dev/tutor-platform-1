-- Закрепление статей вверху ленты.
ALTER TABLE t_p78828167_tutor_platform_1.feed_articles
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- Закрепляем статью про видео-ведущих (свежая новинка).
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET is_pinned = TRUE
WHERE slug = 'zhivye-video-vedushchie-v-kursah-uchispro';
