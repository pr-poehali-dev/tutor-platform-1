-- Марафон скорочтения: участники, прогресс по дням, замеры скорости, напоминания.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.marathon_participants (
  id            BIGSERIAL PRIMARY KEY,
  track         VARCHAR(20)  NOT NULL,
  email         VARCHAR(320) NOT NULL,
  name          VARCHAR(120) NOT NULL DEFAULT '',
  access_token  VARCHAR(64)  NOT NULL UNIQUE,
  source        VARCHAR(120) NOT NULL DEFAULT '',
  max_link_code VARCHAR(12)  NULL UNIQUE,
  max_chat_id   BIGINT       NULL,
  started_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_days JSONB       NOT NULL DEFAULT '[]'::jsonb,
  homework      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  reminders_sent JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (track, email)
);
CREATE INDEX IF NOT EXISTS idx_marathon_started ON t_p78828167_tutor_platform_1.marathon_participants (started_at);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.reading_tests (
  id            BIGSERIAL PRIMARY KEY,
  participant_id BIGINT      NULL,
  visitor_id    VARCHAR(64)  NOT NULL DEFAULT '',
  grade         VARCHAR(10)  NOT NULL DEFAULT '',
  words         INTEGER      NOT NULL,
  seconds       NUMERIC(8,2) NOT NULL,
  wpm           INTEGER      NOT NULL,
  comprehension INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reading_tests_participant ON t_p78828167_tutor_platform_1.reading_tests (participant_id);

INSERT INTO t_p78828167_tutor_platform_1.promo_codes (code, percent, description, active)
SELECT 'MARAFON30', 30, 'Скидка участникам марафона скорочтения', TRUE
WHERE NOT EXISTS (SELECT 1 FROM t_p78828167_tutor_platform_1.promo_codes WHERE UPPER(code) = 'MARAFON30');