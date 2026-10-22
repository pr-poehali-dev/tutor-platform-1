-- Конструктор тренажёров: сами тренажёры (сцена + сценарий в JSON) и прохождения учеников.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.sim_trainers (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(40) NOT NULL UNIQUE,
  edit_key VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category VARCHAR(20) NOT NULL DEFAULT 'other',
  audience VARCHAR(60) NULL,
  grade VARCHAR(100) NULL,
  data JSONB NOT NULL,
  author_name VARCHAR(160) NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.sim_runs (
  id BIGSERIAL PRIMARY KEY,
  trainer_slug VARCHAR(40) NOT NULL,
  student_name VARCHAR(120) NULL,
  group_code VARCHAR(40) NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  duration_sec INTEGER NOT NULL,
  mistakes JSONB NULL,
  hints INTEGER NOT NULL DEFAULT 0,
  step_times JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sim_runs_slug ON t_p78828167_tutor_platform_1.sim_runs (trainer_slug, created_at DESC);