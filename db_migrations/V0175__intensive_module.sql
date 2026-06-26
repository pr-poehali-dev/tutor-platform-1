-- Modul intensiva "AI-assistent / kontent-menedzher"

-- Zayavki na intensiv (lid)
CREATE TABLE IF NOT EXISTS intensive_leads (
    id BIGSERIAL PRIMARY KEY,
    track VARCHAR(60) NOT NULL DEFAULT 'ai-assistant',
    name VARCHAR(160) NOT NULL,
    contact VARCHAR(200) NOT NULL,
    contact_kind VARCHAR(20) NOT NULL DEFAULT 'unknown',
    comment VARCHAR(1000) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    source VARCHAR(80) NOT NULL DEFAULT 'landing',
    notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS intensive_leads_created_idx ON intensive_leads(created_at DESC);

-- Popytki ITI-trenazhera (dialogi s AI-klientom + feedback)
CREATE TABLE IF NOT EXISTS intensive_trainer_attempts (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(80) NOT NULL DEFAULT '',
    scenario_key VARCHAR(60) NOT NULL DEFAULT '',
    user_input TEXT NOT NULL DEFAULT '',
    ai_reply TEXT NOT NULL DEFAULT '',
    score INTEGER NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS intensive_trainer_session_idx ON intensive_trainer_attempts(session_id, created_at);

-- Sdannye domashnie zadaniya s ITI-otsenkoy
CREATE TABLE IF NOT EXISTS intensive_homework (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(80) NOT NULL DEFAULT '',
    lesson_key VARCHAR(60) NOT NULL DEFAULT '',
    submission TEXT NOT NULL DEFAULT '',
    ai_score INTEGER NULL,
    ai_feedback TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS intensive_homework_session_idx ON intensive_homework(session_id, created_at);
