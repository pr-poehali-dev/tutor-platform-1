-- Реестр выплат школам: фиксируем факт выплаты доли школы за период
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_payouts (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.schools(id),
    amount_kopecks INTEGER NOT NULL DEFAULT 0,
    sales_count INTEGER NOT NULL DEFAULT 0,
    period_from TIMESTAMPTZ NULL,
    period_to TIMESTAMPTZ NULL,
    method VARCHAR(60) NULL,
    note TEXT NULL,
    created_by VARCHAR(80) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_payouts_school ON t_p78828167_tutor_platform_1.school_payouts(school_id);
CREATE INDEX IF NOT EXISTS idx_school_payouts_created ON t_p78828167_tutor_platform_1.school_payouts(created_at DESC);