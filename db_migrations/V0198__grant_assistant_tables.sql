-- ИИ-помощник по грантам и конкурсам: заявки и оплаты за подготовку.
-- Модель: пользователь описывает грант/проект -> ИИ готовит бесплатный черновик (preview),
-- полный пакет (текст, смета, календарный план, проверка) открывается после оплаты.

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.grant_applications (
  id                SERIAL PRIMARY KEY,
  user_id           bigint NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  contact_email     varchar(200) NULL,

  -- Входные данные от пользователя
  grant_name        varchar(400) NOT NULL,          -- название гранта/конкурса
  organization      varchar(400) NULL,              -- заявитель (НКО, ИП, физлицо, компания)
  project_title     varchar(400) NULL,
  project_idea      text NOT NULL,                  -- суть проекта
  grant_amount      varchar(80) NULL,               -- запрашиваемая сумма
  region            varchar(200) NULL,
  deadline          varchar(120) NULL,
  extra             text NULL,                       -- доп. требования/критерии площадки

  -- Результат ИИ
  preview_data      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- бесплатная часть (актуальность, цели, оценка шансов)
  full_data         jsonb NULL,                          -- полный пакет (после оплаты)

  is_paid           boolean NOT NULL DEFAULT false,
  price_kopecks     integer NOT NULL DEFAULT 0,
  status            varchar(20) NOT NULL DEFAULT 'draft', -- draft|generated|paid|failed
  ai_error          text NULL,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grant_apps_user
  ON t_p78828167_tutor_platform_1.grant_applications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grant_apps_created
  ON t_p78828167_tutor_platform_1.grant_applications (created_at DESC);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.grant_payments (
  id             SERIAL PRIMARY KEY,
  application_id integer NOT NULL REFERENCES t_p78828167_tutor_platform_1.grant_applications(id),
  user_id        bigint NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  amount_kopecks integer NOT NULL DEFAULT 0,
  payment_id     varchar(100) NULL,
  status         varchar(20) NOT NULL DEFAULT 'pending', -- pending|paid|canceled
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  paid_at        timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_grant_payments_app
  ON t_p78828167_tutor_platform_1.grant_payments (application_id);
CREATE INDEX IF NOT EXISTS idx_grant_payments_user
  ON t_p78828167_tutor_platform_1.grant_payments (user_id, status);