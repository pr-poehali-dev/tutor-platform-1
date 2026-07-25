-- Модуль «Оркестратор»: конструктор онбординга и координации удалённых команд.
-- Руководитель вводит роль+проект → ИИ собирает трек адаптации (матрица навыков, онбординг,
-- микрозадачи с критериями, входной контроль, карта рисков). PRO-доступ (9203) открывает
-- рабочий дашборд: проекты, исполнители, задачи со статусами, карточки качества, метрики.

-- Заявки на пилот (публично, без авторизации)
CREATE TABLE IF NOT EXISTS orch_leads (
  id            SERIAL PRIMARY KEY,
  contact_name  VARCHAR(160) NOT NULL,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(40),
  company       VARCHAR(200),
  role_title    VARCHAR(200),
  project_brief VARCHAR(1000),
  track         JSONB,
  track_title   VARCHAR(300),
  message       TEXT,
  source        VARCHAR(60) DEFAULT 'orchestrator',
  utm           JSONB,
  status        VARCHAR(20) NOT NULL DEFAULT 'new',
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orch_leads_created ON orch_leads(created_at DESC);

-- Проекты руководителя (личный кабинет, PRO)
CREATE TABLE IF NOT EXISTS orch_projects (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  name        VARCHAR(300) NOT NULL,
  role_title  VARCHAR(200),
  brief       VARCHAR(1000),
  track       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orch_projects_user ON orch_projects(user_id);

-- Исполнители в проекте
CREATE TABLE IF NOT EXISTS orch_performers (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER NOT NULL,
  user_id       BIGINT NOT NULL,
  name          VARCHAR(200) NOT NULL,
  contact       VARCHAR(200),
  screening     VARCHAR(20) DEFAULT 'pending',
  quality_avg   NUMERIC(3,1),
  speed_avg     NUMERIC(3,1),
  comm_avg      NUMERIC(3,1),
  deadline_avg  NUMERIC(3,1),
  risk_level    VARCHAR(20) DEFAULT 'low',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orch_performers_project ON orch_performers(project_id);
CREATE INDEX IF NOT EXISTS idx_orch_performers_user ON orch_performers(user_id);

-- Микрозадачи с критериями «готово» и статусами
CREATE TABLE IF NOT EXISTS orch_tasks (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER NOT NULL,
  performer_id  INTEGER,
  user_id       BIGINT NOT NULL,
  title         VARCHAR(400) NOT NULL,
  done_criteria VARCHAR(1000),
  deliverable   VARCHAR(300),
  due_date      DATE,
  status        VARCHAR(20) NOT NULL DEFAULT 'todo',
  revisions     INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orch_tasks_project ON orch_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_orch_tasks_performer ON orch_tasks(performer_id);

-- Карточки качества (фидбек руководителя по задаче/исполнителю)
CREATE TABLE IF NOT EXISTS orch_feedback (
  id            SERIAL PRIMARY KEY,
  performer_id  INTEGER NOT NULL,
  task_id       INTEGER,
  user_id       BIGINT NOT NULL,
  quality       SMALLINT,
  speed         SMALLINT,
  communication SMALLINT,
  deadline      SMALLINT,
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orch_feedback_performer ON orch_feedback(performer_id);