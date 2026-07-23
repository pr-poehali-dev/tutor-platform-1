-- Заявки раздела «Профориентация PRO»: индивидуальный ИИ-курс под человека.
-- Человек проходит чек-лист → ИИ генерирует план → оставляет заявку на оплату (от 10 000 ₽).
CREATE TABLE IF NOT EXISTS career_pro_leads (
  id            SERIAL PRIMARY KEY,
  contact_name  VARCHAR(160) NOT NULL,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(40),
  goal          VARCHAR(500),          -- главная цель/кем хочет стать
  answers       JSONB,                 -- ответы чек-листа
  plan          JSONB,                 -- сгенерированный ИИ план курса
  plan_title    VARCHAR(300),          -- название индивидуального курса
  price         INTEGER,               -- предложенная цена, ₽
  message       TEXT,
  source        VARCHAR(60) DEFAULT 'career-pro',
  utm           JSONB,
  status        VARCHAR(20) NOT NULL DEFAULT 'new',  -- new | contacted | won | lost
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_pro_leads_status ON career_pro_leads(status);
CREATE INDEX IF NOT EXISTS idx_career_pro_leads_created ON career_pro_leads(created_at DESC);