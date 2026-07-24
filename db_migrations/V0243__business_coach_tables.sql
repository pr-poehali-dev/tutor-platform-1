-- Раздел «Бизнес-тренер и коуч»: индивидуальная ИИ-программа развития предпринимателя/руководителя.
-- По образцу «Профориентация PRO»: чек-лист → ИИ-план развития + 5-летняя стратегия роста → заявка + живой наставник-коуч.

CREATE TABLE IF NOT EXISTS business_coach_leads (
  id            SERIAL PRIMARY KEY,
  contact_name  VARCHAR(160) NOT NULL,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(40),
  goal          VARCHAR(500),          -- главная бизнес-цель
  answers       JSONB,                 -- ответы чек-листа
  plan          JSONB,                 -- сгенерированный ИИ план развития
  plan_title    VARCHAR(300),          -- название индивидуальной программы
  price         INTEGER,               -- предложенная цена, ₽
  message       TEXT,
  source        VARCHAR(60) DEFAULT 'business-coach',
  utm           JSONB,
  status        VARCHAR(20) NOT NULL DEFAULT 'new',  -- new | contacted | won | lost
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_business_coach_leads_status ON business_coach_leads(status);
CREATE INDEX IF NOT EXISTS idx_business_coach_leads_created ON business_coach_leads(created_at DESC);

-- Сохранённый в личном кабинете план развития + 5-летняя стратегия + прогресс.
CREATE TABLE IF NOT EXISTS business_coach_plans (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  goal        VARCHAR(500),
  direction   VARCHAR(300),
  plan        JSONB NOT NULL,
  progress    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_business_coach_plans_user ON business_coach_plans(user_id);

-- Дневник бизнес-наставника-коуча: диалог с жёстким, но справедливым коучем по бизнесу.
CREATE TABLE IF NOT EXISTS business_coach_journal (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  role        VARCHAR(10) NOT NULL,   -- user | coach
  content     TEXT NOT NULL,
  mood        VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_business_coach_journal_user ON business_coach_journal(user_id, created_at);