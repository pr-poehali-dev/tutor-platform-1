CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_welcomed_users (
    user_id BIGINT PRIMARY KEY,
    welcomed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);