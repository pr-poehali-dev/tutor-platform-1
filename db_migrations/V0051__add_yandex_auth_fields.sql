ALTER TABLE t_p78828167_tutor_platform_1.auth_users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(50);
ALTER TABLE t_p78828167_tutor_platform_1.auth_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
CREATE INDEX IF NOT EXISTS idx_auth_users_yandex_id ON t_p78828167_tutor_platform_1.auth_users(yandex_id);
