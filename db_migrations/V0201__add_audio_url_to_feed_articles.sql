ALTER TABLE t_p78828167_tutor_platform_1.feed_articles
ADD COLUMN IF NOT EXISTS audio_url character varying(800) NULL;

COMMENT ON COLUMN t_p78828167_tutor_platform_1.feed_articles.audio_url IS 'URL озвучки статьи (mp3 в S3). Если задан — на странице статьи показывается аудио-плеер.';