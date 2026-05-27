-- Сохранение результатов профориентационного теста "Познай себя"
CREATE TABLE IF NOT EXISTS know_yourself_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES auth_users(id),
    answers JSONB NOT NULL,
    result JSONB NOT NULL,
    top_riasec VARCHAR(3) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyr_user ON know_yourself_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyr_riasec ON know_yourself_results(top_riasec);
