CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.edu_institutions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    org_name VARCHAR(300) NOT NULL DEFAULT '',
    kind VARCHAR(20) NOT NULL DEFAULT 'online_school',
    contact_name VARCHAR(200) NOT NULL DEFAULT '',
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(200) NOT NULL DEFAULT '',
    city VARCHAR(120) NOT NULL DEFAULT '',
    website VARCHAR(300) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edu_institutions_kind ON t_p78828167_tutor_platform_1.edu_institutions(kind);
CREATE INDEX IF NOT EXISTS idx_edu_institutions_status ON t_p78828167_tutor_platform_1.edu_institutions(status);
CREATE INDEX IF NOT EXISTS idx_edu_institutions_created ON t_p78828167_tutor_platform_1.edu_institutions(created_at DESC);