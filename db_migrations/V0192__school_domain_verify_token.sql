-- Этап 5: свой домен школы. Токен для DNS-верификации владения доменом.
ALTER TABLE t_p78828167_tutor_platform_1.schools
  ADD COLUMN IF NOT EXISTS domain_verify_token character varying(80) NULL,
  ADD COLUMN IF NOT EXISTS domain_added_at timestamp with time zone NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_custom_domain
  ON t_p78828167_tutor_platform_1.schools (lower(custom_domain))
  WHERE custom_domain IS NOT NULL;