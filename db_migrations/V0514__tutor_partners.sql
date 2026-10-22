-- База репетиторов-партнёров: найденные в VK, через Яндекс, в каталогах каналов, и пришедшие сами.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tutor_partners (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(30) NOT NULL,
  kind VARCHAR(20) NOT NULL DEFAULT 'person',
  name VARCHAR(300) NULL,
  subject VARCHAR(200) NULL,
  city VARCHAR(120) NULL,
  url VARCHAR(600) NOT NULL,
  snippet TEXT NULL,
  phone VARCHAR(60) NULL,
  email VARCHAR(200) NULL,
  messenger VARCHAR(300) NULL,
  write_url VARCHAR(600) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'found',
  draft TEXT NULL,
  notes TEXT NULL,
  search_query VARCHAR(300) NULL,
  contacted_at TIMESTAMPTZ NULL,
  next_step_at DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tutor_partners_url UNIQUE (url)
);
CREATE INDEX IF NOT EXISTS idx_tutor_partners_status ON t_p78828167_tutor_platform_1.tutor_partners (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tutor_partner_events (
  id BIGSERIAL PRIMARY KEY,
  partner_id BIGINT NOT NULL REFERENCES t_p78828167_tutor_platform_1.tutor_partners(id),
  kind VARCHAR(30) NOT NULL,
  text TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tutor_partner_events_partner ON t_p78828167_tutor_platform_1.tutor_partner_events (partner_id, created_at DESC);