-- B2B-заявки на конструктор онлайн-школ (white-label платформа).
-- Лиды со страницы /for-business.
CREATE TABLE IF NOT EXISTS partner_leads (
  id            SERIAL PRIMARY KEY,
  contact_name  VARCHAR(160) NOT NULL,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(40),
  company       VARCHAR(200),
  audience_type VARCHAR(40),          -- author | school | business | edu
  topic         VARCHAR(500),         -- о чём хотят делать курсы
  students_est  VARCHAR(40),          -- ожидаемое число учеников (диапазон)
  message       TEXT,
  plan_interest VARCHAR(40),          -- start | pro | scale
  source        VARCHAR(60) DEFAULT 'for-business',
  utm           JSONB,
  status        VARCHAR(20) NOT NULL DEFAULT 'new',  -- new | contacted | qualified | won | lost
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_leads_status ON partner_leads(status);
CREATE INDEX IF NOT EXISTS idx_partner_leads_created ON partner_leads(created_at DESC);
