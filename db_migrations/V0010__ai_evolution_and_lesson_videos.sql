CREATE TABLE IF NOT EXISTS ai_agents (
    id SERIAL PRIMARY KEY,
    agent_key VARCHAR(64) UNIQUE NOT NULL,
    role_name VARCHAR(120) NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    version INT DEFAULT 1,
    model VARCHAR(80) DEFAULT 'openai/gpt-4o-mini',
    temperature NUMERIC(3,2) DEFAULT 0.7,
    total_interactions INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    avg_rating NUMERIC(4,2) DEFAULT 0,
    last_evolved_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_key ON ai_agents(agent_key);

CREATE TABLE IF NOT EXISTS ai_evolution_log (
    id SERIAL PRIMARY KEY,
    agent_id INT REFERENCES ai_agents(id),
    agent_key VARCHAR(64),
    from_version INT,
    to_version INT,
    change_type VARCHAR(40),
    reason TEXT,
    diff_summary TEXT,
    prev_prompt TEXT,
    new_prompt TEXT,
    metrics_before JSONB,
    metrics_after JSONB,
    triggered_by VARCHAR(40) DEFAULT 'auto',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_evolution_agent ON ai_evolution_log(agent_key);
CREATE INDEX IF NOT EXISTS idx_ai_evolution_created ON ai_evolution_log(created_at DESC);

CREATE TABLE IF NOT EXISTS content_feedback (
    id SERIAL PRIMARY KEY,
    user_id INT,
    agent_key VARCHAR(64),
    content_type VARCHAR(40),
    content_id VARCHAR(120),
    rating SMALLINT,
    is_helpful BOOLEAN,
    user_comment TEXT,
    context_subject VARCHAR(60),
    context_grade VARCHAR(20),
    context_topic VARCHAR(200),
    raw_content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_agent ON content_feedback(agent_key);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON content_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON content_feedback(created_at DESC);

CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id SERIAL PRIMARY KEY,
    agent_key VARCHAR(64) NOT NULL,
    subject VARCHAR(60),
    topic VARCHAR(200),
    grade VARCHAR(20),
    pattern_type VARCHAR(40),
    content TEXT NOT NULL,
    success_score NUMERIC(4,2) DEFAULT 5.0,
    use_count INT DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_agent_subject ON ai_knowledge_base(agent_key, subject, topic);
CREATE INDEX IF NOT EXISTS idx_kb_score ON ai_knowledge_base(success_score DESC);

CREATE TABLE IF NOT EXISTS lesson_videos (
    id SERIAL PRIMARY KEY,
    user_id INT,
    subject VARCHAR(60),
    topic VARCHAR(200),
    grade VARCHAR(20),
    module_id VARCHAR(60),
    lesson_id VARCHAR(60),
    title VARCHAR(300),
    storyboard JSONB,
    scenes_rendered INT DEFAULT 0,
    total_scenes INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'pending',
    voice_id VARCHAR(40) DEFAULT 'nika',
    style VARCHAR(40) DEFAULT 'realistic',
    duration_sec INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_videos_topic ON lesson_videos(subject, topic, grade);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_user ON lesson_videos(user_id);
