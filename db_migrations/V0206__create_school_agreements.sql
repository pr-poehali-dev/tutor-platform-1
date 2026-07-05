-- Акцепт оферты (договора оказания услуг) автором школы
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_agreements (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.schools(id),
    accepted_user_id BIGINT NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
    doc_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    accepted_ip VARCHAR(60) NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_school_agreements_unique
    ON t_p78828167_tutor_platform_1.school_agreements(school_id, doc_version);