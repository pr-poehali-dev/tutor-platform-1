-- Email+password auth migration
ALTER TABLE t_p78828167_tutor_platform_1.auth_users ALTER COLUMN phone SET DEFAULT '';

UPDATE t_p78828167_tutor_platform_1.auth_users SET phone='' WHERE phone IS NULL;

ALTER TABLE t_p78828167_tutor_platform_1.auth_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_lower_idx
    ON t_p78828167_tutor_platform_1.auth_users (LOWER(email))
    WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS auth_users_phone_uniq_idx
    ON t_p78828167_tutor_platform_1.auth_users (phone)
    WHERE phone IS NOT NULL AND phone != '';