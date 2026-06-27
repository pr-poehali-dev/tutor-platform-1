CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.intensive_access (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(200) NOT NULL,
    name VARCHAR(160) NOT NULL DEFAULT '',
    track VARCHAR(60) NOT NULL DEFAULT 'automation',
    access_token VARCHAR(80) NOT NULL UNIQUE,
    order_number VARCHAR(80),
    payment_id VARCHAR(120),
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_intensive_access_email
    ON t_p78828167_tutor_platform_1.intensive_access (lower(email));
CREATE INDEX IF NOT EXISTS idx_intensive_access_payment
    ON t_p78828167_tutor_platform_1.intensive_access (payment_id);