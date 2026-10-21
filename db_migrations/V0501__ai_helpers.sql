-- Конструктор «Свой ИИ-помощник за вечер»: помощники пользователей, вопросы их клиентов, счётчики ответов.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.ai_helpers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL DEFAULT '',
  role VARCHAR(200) NOT NULL DEFAULT '',
  template VARCHAR(40) NOT NULL DEFAULT 'custom',
  greeting TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL DEFAULT '',
  knowledge TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  tone VARCHAR(20) NOT NULL DEFAULT 'friendly',
  color VARCHAR(20) NOT NULL DEFAULT '#7c3aed',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  pro_until TIMESTAMPTZ NULL,
  answers_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_helpers_user ON t_p78828167_tutor_platform_1.ai_helpers (user_id);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.ai_helper_questions (
  id SERIAL PRIMARY KEY,
  helper_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  found BOOLEAN NOT NULL DEFAULT TRUE,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  is_owner_test BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_helper_q_helper_time ON t_p78828167_tutor_platform_1.ai_helper_questions (helper_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_helper_q_ip_time ON t_p78828167_tutor_platform_1.ai_helper_questions (ip, created_at);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.ai_helper_payments (
  id SERIAL PRIMARY KEY,
  helper_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  payment_id VARCHAR(80) NOT NULL DEFAULT '',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ NULL
);