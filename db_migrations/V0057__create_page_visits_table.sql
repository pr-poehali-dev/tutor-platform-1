CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.page_visits (
    id BIGSERIAL PRIMARY KEY,
    visitor_id VARCHAR(64) NOT NULL,
    user_uid VARCHAR(64) NULL,
    path TEXT NOT NULL,
    referrer TEXT NULL,
    user_agent TEXT NULL,
    ip VARCHAR(50) NULL,
    is_new_visitor BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON t_p78828167_tutor_platform_1.page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor ON t_p78828167_tutor_platform_1.page_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON t_p78828167_tutor_platform_1.page_visits(path);