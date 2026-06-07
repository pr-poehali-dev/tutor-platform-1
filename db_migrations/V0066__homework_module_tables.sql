-- Модуль «Домашка»: история проверок и кэш разборов (чтобы не генерировать заново)

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.homework_checks (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  mode          VARCHAR(16) NOT NULL DEFAULT 'solve',   -- 'solve' (реши задачу) | 'review' (проверь решение)
  subject       VARCHAR(40),
  grade         VARCHAR(20),
  image_url     TEXT,                                     -- ссылка на фото в S3/CDN
  image_hash    VARCHAR(64),                              -- sha256 фото (для кэша)
  result        TEXT,                                     -- разбор/проверка от ИИ
  is_correct    BOOLEAN,                                  -- для режима review: верно ли решение
  from_cache    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_checks_user
  ON t_p78828167_tutor_platform_1.homework_checks (user_id, created_at DESC);

-- Кэш разборов по хэшу фото + режиму + предмету/классу.
-- Один и тот же снимок задачи не отправляется в ИИ повторно.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.homework_cache (
  id            SERIAL PRIMARY KEY,
  cache_key     VARCHAR(120) NOT NULL UNIQUE,             -- hash:mode:subject:grade
  image_hash    VARCHAR(64) NOT NULL,
  mode          VARCHAR(16) NOT NULL,
  subject       VARCHAR(40),
  grade         VARCHAR(20),
  image_url     TEXT,
  result        TEXT NOT NULL,
  is_correct    BOOLEAN,
  hits          INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_cache_key
  ON t_p78828167_tutor_platform_1.homework_cache (cache_key);