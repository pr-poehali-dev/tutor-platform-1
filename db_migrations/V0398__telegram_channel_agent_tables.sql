CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tg_channel_config (
  id smallint PRIMARY KEY DEFAULT 1,
  channel_chat_id bigint,
  channel_title text,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tg_channel_config_single CHECK (id = 1)
);

INSERT INTO t_p78828167_tutor_platform_1.tg_channel_config (id, enabled)
VALUES (1, true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tg_channel_cron (
  id smallint PRIMARY KEY DEFAULT 1,
  last_tick_date date,
  last_tick_at timestamptz,
  CONSTRAINT tg_channel_cron_single CHECK (id = 1)
);

INSERT INTO t_p78828167_tutor_platform_1.tg_channel_cron (id)
VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tg_channel_posts (
  id bigserial PRIMARY KEY,
  kind varchar(30) NOT NULL,
  ref_key varchar(160),
  article_id bigint,
  channel_chat_id bigint,
  text text NOT NULL,
  ok boolean NOT NULL DEFAULT true,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tg_channel_posts_kind_ref
  ON t_p78828167_tutor_platform_1.tg_channel_posts (kind, ref_key);

CREATE INDEX IF NOT EXISTS idx_tg_channel_posts_created
  ON t_p78828167_tutor_platform_1.tg_channel_posts (created_at DESC);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.tg_welcomed_users (
  user_id bigint PRIMARY KEY,
  user_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);