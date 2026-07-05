-- Заявки школ на вывод средств
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_payout_requests (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.schools(id),
    amount_kopecks INTEGER NOT NULL DEFAULT 0,
    requisites TEXT NULL,
    comment TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    admin_note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_req_school ON t_p78828167_tutor_platform_1.school_payout_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_payout_req_status ON t_p78828167_tutor_platform_1.school_payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_req_created ON t_p78828167_tutor_platform_1.school_payout_requests(created_at DESC);