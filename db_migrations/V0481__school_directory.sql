-- Справочник школ: публичная страница школы, отметки открытых рейтингов, анкеты школ о достижениях.
ALTER TABLE t_p78828167_tutor_platform_1.edu_institutions
  ADD COLUMN IF NOT EXISTS slug VARCHAR(220) NULL,
  ADD COLUMN IF NOT EXISTS profile_token VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS rating_score NUMERIC(8,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hidden_in_directory BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS edu_institutions_slug_uq ON t_p78828167_tutor_platform_1.edu_institutions (slug);
CREATE UNIQUE INDEX IF NOT EXISTS edu_institutions_profile_token_uq ON t_p78828167_tutor_platform_1.edu_institutions (profile_token);
CREATE INDEX IF NOT EXISTS edu_institutions_city_score_idx ON t_p78828167_tutor_platform_1.edu_institutions (city, rating_score DESC);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_ratings (
  id SERIAL PRIMARY KEY,
  institution_id INT NOT NULL REFERENCES t_p78828167_tutor_platform_1.edu_institutions(id),
  source VARCHAR(40) NOT NULL,
  list_name VARCHAR(300) NOT NULL,
  list_url VARCHAR(400) NOT NULL,
  place INT NOT NULL,
  list_size INT NOT NULL,
  year INT NOT NULL,
  name_in_list VARCHAR(400) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (institution_id, list_url)
);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_profiles (
  id SERIAL PRIMARY KEY,
  institution_id INT NOT NULL REFERENCES t_p78828167_tutor_platform_1.edu_institutions(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  website VARCHAR(300) NULL,
  about TEXT NULL,
  achievements TEXT NULL,
  methods TEXT NULL,
  profiles TEXT NULL,
  olympiad_winners INT NULL,
  avg_ege NUMERIC(5,1) NULL,
  contact_name VARCHAR(200) NULL,
  contact_role VARCHAR(200) NULL,
  contact_email VARCHAR(200) NULL,
  publish_consent BOOLEAN NOT NULL DEFAULT FALSE,
  moderator_note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS school_profiles_inst_idx ON t_p78828167_tutor_platform_1.school_profiles (institution_id, status);

-- Вторая волна: кампания «Расскажите о школе», включается автоматически, когда очередь первой волны пуста.
ALTER TABLE t_p78828167_tutor_platform_1.outreach_settings
  ADD COLUMN IF NOT EXISTS wave2_enabled BOOLEAN NOT NULL DEFAULT TRUE;