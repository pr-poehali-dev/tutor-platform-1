-- Учёт сообщений ИИ-ассистентам в «Оркестраторе» (для лимита бесплатных сообщений)
CREATE TABLE IF NOT EXISTS orch_assistant_usage (
  id          SERIAL PRIMARY KEY,
  ident       VARCHAR(120) NOT NULL,   -- user:<id> или ip:<addr>
  assistant   VARCHAR(40),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orch_assistant_usage_ident ON orch_assistant_usage(ident, created_at);