-- База учреждений: поля для школ и рассылки директорам (пилот Самары).
ALTER TABLE t_p78828167_tutor_platform_1.edu_institutions
  ADD COLUMN IF NOT EXISTS address VARCHAR(400) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS segment VARCHAR(30) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source VARCHAR(300) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS last_mailed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS mail_count INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_edu_unsub_token ON t_p78828167_tutor_platform_1.edu_institutions (unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_edu_city ON t_p78828167_tutor_platform_1.edu_institutions (city);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.edu_campaigns (
  id SERIAL PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  subject VARCHAR(300) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.edu_campaign_sends (
  id BIGSERIAL PRIMARY KEY,
  campaign_code VARCHAR(60) NOT NULL,
  institution_id BIGINT NULL,
  to_email VARCHAR(320) NOT NULL,
  status VARCHAR(20) NOT NULL,
  error TEXT NULL,
  is_test BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_edu_sends_campaign ON t_p78828167_tutor_platform_1.edu_campaign_sends (campaign_code, institution_id);

INSERT INTO t_p78828167_tutor_platform_1.edu_campaigns (code, title, subject)
VALUES ('samara_pilot_2026', 'Пилот УЧИСЬПРО для школ Самары — директорам',
        'Бесплатный ИИ-помощник для учеников вашей школы — пилотный проект в Самаре')
ON CONFLICT (code) DO NOTHING;