CREATE TABLE IF NOT EXISTS ai_search_queries (
    id BIGSERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    source VARCHAR(30) NOT NULL DEFAULT 'search',
    found_count INTEGER NOT NULL DEFAULT 0,
    picked_ids TEXT,
    user_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_search_queries_created ON ai_search_queries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_found ON ai_search_queries (found_count);

CREATE TABLE IF NOT EXISTS custom_course_orders (
    id BIGSERIAL PRIMARY KEY,
    contact_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    topic TEXT NOT NULL,
    goal TEXT,
    level VARCHAR(100),
    format_pref VARCHAR(100),
    time_per_week VARCHAR(100),
    deadline_pref VARCHAR(100),
    details TEXT,
    matched JSONB,
    price INTEGER NOT NULL DEFAULT 10000,
    utm JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_course_orders_created ON custom_course_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_course_orders_status ON custom_course_orders (status);