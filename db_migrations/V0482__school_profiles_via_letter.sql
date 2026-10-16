ALTER TABLE t_p78828167_tutor_platform_1.school_profiles
  ADD COLUMN IF NOT EXISTS via_letter BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ip VARCHAR(64) NULL;
CREATE INDEX IF NOT EXISTS school_profiles_status_idx ON t_p78828167_tutor_platform_1.school_profiles (status, created_at DESC);