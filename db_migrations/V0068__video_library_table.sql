-- Библиотека готовых обучающих роликов студии (собранные MP4 + раскадровка)
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.video_library (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER,
  title         VARCHAR(300) NOT NULL,
  topic         VARCHAR(300),
  subject       VARCHAR(60),
  age_group     VARCHAR(60),
  style         VARCHAR(40),
  voice_id      VARCHAR(40),
  duration_sec  INTEGER NOT NULL DEFAULT 0,
  scenes_count  INTEGER NOT NULL DEFAULT 0,
  cover_url     TEXT,                                   -- обложка (первый кадр)
  video_url     TEXT,                                   -- ссылка на готовый MP4 в S3/CDN
  storyboard    JSONB NOT NULL DEFAULT '[]'::jsonb,     -- сцены (narration, image_url, длительность)
  status        VARCHAR(20) NOT NULL DEFAULT 'draft',   -- 'draft' | 'published'
  views         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_library_user
  ON t_p78828167_tutor_platform_1.video_library (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_library_status
  ON t_p78828167_tutor_platform_1.video_library (status, created_at DESC);