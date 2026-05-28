-- Chat owner <-> marketing AI
CREATE TABLE IF NOT EXISTS marketing_chat (
    id          BIGSERIAL PRIMARY KEY,
    role        VARCHAR(20) NOT NULL,
    content     TEXT NOT NULL,
    meta        JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_marketing_chat_created ON marketing_chat(created_at DESC);
