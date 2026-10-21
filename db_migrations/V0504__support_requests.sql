-- Обращения в поддержку: источник (форма/чат), страница, переписка с ИИ, отметка тестов, заметка админа, IP для защиты от спама.
ALTER TABLE t_p78828167_tutor_platform_1.feedback_requests
  ADD COLUMN IF NOT EXISTS source VARCHAR(30) NOT NULL DEFAULT 'contacts',
  ADD COLUMN IF NOT EXISTS page_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS chat_log TEXT NULL,
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ip VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS note TEXT NULL,
  ADD COLUMN IF NOT EXISTS notified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NULL;

UPDATE t_p78828167_tutor_platform_1.feedback_requests SET is_test = TRUE WHERE contact_email = 'test@example.com';

CREATE INDEX IF NOT EXISTS idx_feedback_ip_time ON t_p78828167_tutor_platform_1.feedback_requests (ip, created_at);

-- Вопросы посетителей к ИИ-поддержке: для лимитов и для отчёта «о чём спрашивают».
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.support_chat_log (
  id SERIAL PRIMARY KEY,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  page_url VARCHAR(500) NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  escalate BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_chat_ip_time ON t_p78828167_tutor_platform_1.support_chat_log (ip, created_at);

-- Состояние мониторинга: когда шёл последний обход, когда в последний раз оповещали.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.monitor_state (
  id INTEGER PRIMARY KEY,
  last_run_at TIMESTAMPTZ NULL,
  locked_until TIMESTAMPTZ NULL,
  last_summary TEXT NULL
);
INSERT INTO t_p78828167_tutor_platform_1.monitor_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;