-- Вход из мини-приложения MAX: пользователь MAX привязывается к аккаунту сайта.
ALTER TABLE t_p78828167_tutor_platform_1.auth_users
  ADD COLUMN IF NOT EXISTS max_user_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS grade VARCHAR(10) NULL;
CREATE UNIQUE INDEX IF NOT EXISTS auth_users_max_user_id_uq ON t_p78828167_tutor_platform_1.auth_users (max_user_id);

-- Журнал открытий мини-приложения (для статистики этапа 5).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_app_opens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  platform VARCHAR(20) NULL,
  start_param VARCHAR(200) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS max_app_opens_created_idx ON t_p78828167_tutor_platform_1.max_app_opens (created_at);
CREATE INDEX IF NOT EXISTS max_app_opens_user_idx ON t_p78828167_tutor_platform_1.max_app_opens (user_id, created_at);