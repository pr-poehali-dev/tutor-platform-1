-- Раздел «Финансовый консультант»: ИИ-финансист анализирует бизнес по реальным цифрам.
-- Собственник вводит финпоказатели → ИИ даёт честную оценку устойчивости, находит скрытые
-- возможности, предупреждает о рисках, предлагает пути финансирования (инвестиции, гранты, кредиты, оптимизация).
-- + живой ИИ-финансист в дневнике (после оплаты).

CREATE TABLE IF NOT EXISTS fin_advisor_leads (
  id            SERIAL PRIMARY KEY,
  contact_name  VARCHAR(160) NOT NULL,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(40),
  goal          VARCHAR(500),          -- главный финансовый запрос собственника
  answers       JSONB,                 -- введённые финпоказатели
  plan          JSONB,                 -- сгенерированный финансовый анализ
  plan_title    VARCHAR(300),          -- заголовок анализа
  price         INTEGER,               -- предложенная цена сопровождения, ₽
  message       TEXT,
  source        VARCHAR(60) DEFAULT 'fin-advisor',
  utm           JSONB,
  status        VARCHAR(20) NOT NULL DEFAULT 'new',  -- new | contacted | won | lost
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fin_advisor_leads_status ON fin_advisor_leads(status);
CREATE INDEX IF NOT EXISTS idx_fin_advisor_leads_created ON fin_advisor_leads(created_at DESC);

-- Сохранённый в личном кабинете финансовый анализ + план оздоровления + прогресс по шагам.
CREATE TABLE IF NOT EXISTS fin_advisor_reports (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  goal        VARCHAR(500),
  direction   VARCHAR(300),           -- краткий вердикт (устойчивость)
  plan        JSONB NOT NULL,         -- полный финансовый анализ
  progress    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fin_advisor_reports_user ON fin_advisor_reports(user_id);

-- Дневник финансового наставника-консультанта: честный, непредвзятый диалог по финансам бизнеса.
CREATE TABLE IF NOT EXISTS fin_advisor_journal (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  role        VARCHAR(10) NOT NULL,   -- user | coach
  content     TEXT NOT NULL,
  mood        VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fin_advisor_journal_user ON fin_advisor_journal(user_id, created_at);