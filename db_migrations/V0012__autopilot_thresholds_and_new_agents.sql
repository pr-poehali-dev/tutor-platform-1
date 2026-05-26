ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS auto_evolve_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS min_rating_threshold NUMERIC(3,2) DEFAULT 3.80;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS min_feedback_for_evolve INT DEFAULT 5;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS cooldown_hours INT DEFAULT 6;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS last_check_at TIMESTAMP;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS health_score NUMERIC(5,2) DEFAULT 100.00;

CREATE TABLE IF NOT EXISTS ai_autopilot_runs (
    id SERIAL PRIMARY KEY,
    run_type VARCHAR(40),
    agents_checked INT DEFAULT 0,
    agents_evolved INT DEFAULT 0,
    agents_healthy INT DEFAULT 0,
    agents_skipped INT DEFAULT 0,
    duration_ms INT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_autopilot_runs_created ON ai_autopilot_runs(created_at DESC);

CREATE TABLE IF NOT EXISTS student_errors (
    id SERIAL PRIMARY KEY,
    user_id INT,
    subject VARCHAR(60),
    topic VARCHAR(200),
    grade VARCHAR(20),
    question TEXT,
    correct_answer TEXT,
    student_answer TEXT,
    error_pattern VARCHAR(80),
    explanation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_errors_topic ON student_errors(subject, topic);
CREATE INDEX IF NOT EXISTS idx_student_errors_pattern ON student_errors(error_pattern);
CREATE INDEX IF NOT EXISTS idx_student_errors_created ON student_errors(created_at DESC);

CREATE TABLE IF NOT EXISTS agent_dependencies (
    id SERIAL PRIMARY KEY,
    parent_agent VARCHAR(64),
    child_agent VARCHAR(64),
    influence_type VARCHAR(40),
    weight NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW()
);
