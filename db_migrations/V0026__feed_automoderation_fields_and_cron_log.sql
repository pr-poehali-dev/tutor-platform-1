-- Поля для решения ИИ-модератора по каждой статье
ALTER TABLE feed_articles
  ADD COLUMN IF NOT EXISTS auto_moderation_score INTEGER,
  ADD COLUMN IF NOT EXISTS auto_moderation_verdict VARCHAR(20),
  ADD COLUMN IF NOT EXISTS auto_moderation_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS auto_moderation_at TIMESTAMPTZ;

-- Журнал запусков cron / автомодерации (для мониторинга)
CREATE TABLE IF NOT EXISTS feed_cron_runs (
    id BIGSERIAL PRIMARY KEY,
    kind VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ok',
    fetched INTEGER NOT NULL DEFAULT 0,
    moderated INTEGER NOT NULL DEFAULT 0,
    approved INTEGER NOT NULL DEFAULT 0,
    rejected INTEGER NOT NULL DEFAULT 0,
    flagged INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    payload JSONB,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fcr_started ON feed_cron_runs(started_at DESC);
