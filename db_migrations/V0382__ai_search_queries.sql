CREATE TABLE IF NOT EXISTS ai_search_queries (
    id BIGSERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    source VARCHAR(30) NOT NULL,
    found_count INTEGER NOT NULL DEFAULT 0,
    picked_ids TEXT,
    user_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_search_queries_created ON ai_search_queries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_source ON ai_search_queries (source);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_empty ON ai_search_queries (found_count) WHERE found_count = 0;