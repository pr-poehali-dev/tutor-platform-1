ALTER TABLE t_p78828167_tutor_platform_1.lesson_cache ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE t_p78828167_tutor_platform_1.lesson_cache ADD COLUMN IF NOT EXISTS critic_score INTEGER;
ALTER TABLE t_p78828167_tutor_platform_1.lesson_cache ADD COLUMN IF NOT EXISTS critic_notes TEXT;
ALTER TABLE t_p78828167_tutor_platform_1.lesson_cache ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.lesson_versions (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(96) NOT NULL,
    version INTEGER NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'candidate',
    lesson_data JSONB NOT NULL,
    critic_score INTEGER,
    critic_notes TEXT,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS lesson_versions_key ON t_p78828167_tutor_platform_1.lesson_versions (cache_key, status);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.methodist_runs (
    id SERIAL PRIMARY KEY,
    step VARCHAR(24) NOT NULL,
    cache_key VARCHAR(96),
    lesson_title VARCHAR(500),
    result VARCHAR(24),
    score_before INTEGER,
    score_after INTEGER,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS methodist_runs_created ON t_p78828167_tutor_platform_1.methodist_runs (created_at);