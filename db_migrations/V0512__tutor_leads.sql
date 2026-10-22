-- Репетиторы, пришедшие через бота MAX (из каналов-каталогов репетиторов).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tutor_leads (
  id BIGSERIAL PRIMARY KEY,
  max_user_id BIGINT NOT NULL UNIQUE,
  name VARCHAR(200) NULL,
  username VARCHAR(100) NULL,
  source VARCHAR(60) NULL,
  subject VARCHAR(120) NULL,
  experience VARCHAR(60) NULL,
  interest VARCHAR(60) NULL,
  contact VARCHAR(200) NULL,
  step VARCHAR(30) NOT NULL DEFAULT 'subject',
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tutor_leads_status ON t_p78828167_tutor_platform_1.tutor_leads (status, created_at);