-- Журнал здоровья всех бэкенд-функций (пинг каждые 5 минут)
CREATE TABLE IF NOT EXISTS backend_health_log (
    id BIGSERIAL PRIMARY KEY,
    function_name VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL,
    http_code INTEGER,
    latency_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_health_func_time ON backend_health_log(function_name, checked_at DESC);

-- Свежий статус функций (одна запись на функцию, апдейтим)
CREATE TABLE IF NOT EXISTS backend_health_status (
    function_name VARCHAR(80) PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    last_ok_at TIMESTAMPTZ,
    last_fail_at TIMESTAMPTZ,
    last_error TEXT,
    last_latency_ms INTEGER,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Бэкапы критичных таблиц (raw JSON в S3, ссылка в БД)
CREATE TABLE IF NOT EXISTS daily_backups (
    id BIGSERIAL PRIMARY KEY,
    backup_date DATE NOT NULL,
    table_name VARCHAR(120) NOT NULL,
    s3_url VARCHAR(800) NOT NULL,
    row_count INTEGER NOT NULL,
    bytes_size BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ok',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(backup_date, table_name)
);
CREATE INDEX IF NOT EXISTS idx_backups_date ON daily_backups(backup_date DESC);

-- Общие системные алерты (источник: health-guardian, db-backup, и т.п.)
CREATE TABLE IF NOT EXISTS system_alerts (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(40) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    title VARCHAR(300) NOT NULL,
    body TEXT,
    metadata JSONB,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sysalerts_unresolved ON system_alerts(resolved_at, created_at DESC);
