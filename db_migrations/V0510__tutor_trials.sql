-- Бесплатная неделя ИИ-репетитора для школьников: один раз на аккаунт, без карты.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tutor_trials (
  user_id BIGINT PRIMARY KEY REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  source VARCHAR(60) NULL,
  converted_at TIMESTAMPTZ NULL,
  reminded_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_tutor_trials_expires ON t_p78828167_tutor_platform_1.tutor_trials (expires_at);