ALTER TABLE t_p78828167_tutor_platform_1.partner_leads
  ADD COLUMN IF NOT EXISTS note text NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_partner_leads_status
  ON t_p78828167_tutor_platform_1.partner_leads (status);

CREATE INDEX IF NOT EXISTS idx_partner_leads_created_at
  ON t_p78828167_tutor_platform_1.partner_leads (created_at DESC);