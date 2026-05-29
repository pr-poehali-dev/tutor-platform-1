-- ИИ-менеджер проекта: логи запусков и ежедневные сводки
CREATE TABLE IF NOT EXISTS pm_runs (
    id            BIGSERIAL PRIMARY KEY,
    run_type      VARCHAR(20) NOT NULL DEFAULT 'manual',   -- manual | cron
    summary       TEXT,                                    -- краткая сводка для владельца
    health_score  INTEGER,                                 -- здоровье проекта 0-100
    focus         VARCHAR(200),                            -- главный фокус на сегодня
    tasks_created INTEGER NOT NULL DEFAULT 0,
    metrics       JSONB,                                   -- снимок метрик на момент запуска
    actions       JSONB,                                   -- что сделал агент (список)
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pm_runs_created ON pm_runs(created_at DESC);
