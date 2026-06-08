-- Лёгкий счётчик запросов для защиты дорогих ИИ-эндпоинтов от злоупотребления
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.rate_limit_counter (
  bucket_key  VARCHAR(120) PRIMARY KEY,   -- например 'ai-chat:<ip>:<час>'
  hits        INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_window
  ON t_p78828167_tutor_platform_1.rate_limit_counter (window_start);