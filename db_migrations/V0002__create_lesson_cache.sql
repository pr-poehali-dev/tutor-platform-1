CREATE TABLE IF NOT EXISTS lesson_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(64) NOT NULL UNIQUE,
    subject VARCHAR(32) NOT NULL,
    grade VARCHAR(16) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    difficulty VARCHAR(32) NOT NULL,
    lesson_title VARCHAR(500) NOT NULL DEFAULT '',
    lesson_data JSONB NOT NULL,
    hit_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_cache_key ON lesson_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_lesson_cache_subject_topic ON lesson_cache(subject, topic);