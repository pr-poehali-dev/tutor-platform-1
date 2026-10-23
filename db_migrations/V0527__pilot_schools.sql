-- Школы, подключившиеся к пилоту сами, и ученики, пришедшие по ссылке школы.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.pilot_schools (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(12) NOT NULL UNIQUE,
  admin_key VARCHAR(40) NOT NULL,
  school_name VARCHAR(300) NOT NULL,
  contact_name VARCHAR(160) NOT NULL,
  contact_email VARCHAR(200) NULL,
  contact_phone VARCHAR(40) NULL,
  city_slug VARCHAR(60) NOT NULL,
  institution_id BIGINT NULL,
  source VARCHAR(40) NULL,
  is_test BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pilot_schools_inst ON t_p78828167_tutor_platform_1.pilot_schools (institution_id);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.pilot_school_students (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  class_label VARCHAR(20) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, user_id)
);

-- Напоминание школам, получившим первое письмо: включено по умолчанию, можно выключить.
ALTER TABLE t_p78828167_tutor_platform_1.outreach_settings ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE;