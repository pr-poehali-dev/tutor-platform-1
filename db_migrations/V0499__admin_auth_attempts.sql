-- Защита входа в админку от подбора PIN: неудачные попытки по IP.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.admin_auth_attempts (
  id SERIAL PRIMARY KEY,
  ip VARCHAR(64) NOT NULL,
  ok BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_auth_ip_time ON t_p78828167_tutor_platform_1.admin_auth_attempts (ip, created_at);