CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.auth_login_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip VARCHAR(64) NOT NULL DEFAULT '',
    email VARCHAR(320) NOT NULL DEFAULT '',
    action VARCHAR(32) NOT NULL DEFAULT 'login',
    success BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time
    ON t_p78828167_tutor_platform_1.auth_login_attempts (ip, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time
    ON t_p78828167_tutor_platform_1.auth_login_attempts (email, created_at);