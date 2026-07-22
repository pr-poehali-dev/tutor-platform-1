-- Поле для видео в статьях ленты (рекламные/пояснительные ролики).
ALTER TABLE t_p78828167_tutor_platform_1.feed_articles
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(800);
