-- Покупки отдельных курсов (разовая оплата)
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.course_purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id INTEGER NOT NULL,
    amount_kopecks INTEGER NOT NULL DEFAULT 0,
    payment_provider VARCHAR(40),
    payment_id VARCHAR(120),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    purchased_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_purchases_user
    ON t_p78828167_tutor_platform_1.course_purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_payment
    ON t_p78828167_tutor_platform_1.course_purchases (payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_purchases_user_course_paid
    ON t_p78828167_tutor_platform_1.course_purchases (user_id, course_id)
    WHERE status = 'paid';