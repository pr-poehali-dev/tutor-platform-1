-- Профориентация PRO: личный 5-летний план успеха и дневник-коуч.

-- 5-летний план успеха пользователя (генерируется ИИ, сохраняется для авторизованного).
-- Хранит сам план (JSONB по годам, контрольные точки, система оценки) и отметки прогресса.
CREATE TABLE IF NOT EXISTS career_pro_plans (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  goal        VARCHAR(500),
  direction   VARCHAR(300),          -- рекомендованное направление
  plan        JSONB NOT NULL,        -- 5-летний план: годы, контрольные точки, метрики
  progress    JSONB DEFAULT '{}'::jsonb,  -- {checkpoint_id: {done: bool, note, updated_at}}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_career_pro_plans_user ON career_pro_plans(user_id);

-- Дневник-коуч: диалог человека с жёстким, но справедливым наставником-психологом.
-- role: 'user' (запись/вопрос человека) | 'coach' (ответ наставника).
CREATE TABLE IF NOT EXISTS career_pro_journal (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  role        VARCHAR(10) NOT NULL,   -- user | coach
  content     TEXT NOT NULL,
  mood        VARCHAR(20),            -- настроение записи (опционально)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_career_pro_journal_user ON career_pro_journal(user_id, created_at);