CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.grants_registry (
  id                SERIAL PRIMARY KEY,
  slug              varchar(160) NOT NULL UNIQUE,
  name              varchar(400) NOT NULL,
  organizer         varchar(300) NOT NULL,
  description       text NOT NULL DEFAULT '',
  category          varchar(80) NOT NULL DEFAULT 'other',
  region            varchar(200) NULL,
  amount_min        bigint NULL,
  amount_max        bigint NULL,
  amount_text       varchar(160) NULL,
  starts_on         date NULL,
  deadline_on       date NULL,
  results_on        date NULL,
  official_url      varchar(600) NOT NULL,
  source_verified   boolean NOT NULL DEFAULT true,
  is_published      boolean NOT NULL DEFAULT true,
  verified_at       date NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grants_registry_deadline
  ON t_p78828167_tutor_platform_1.grants_registry (deadline_on);
CREATE INDEX IF NOT EXISTS idx_grants_registry_published
  ON t_p78828167_tutor_platform_1.grants_registry (is_published);
