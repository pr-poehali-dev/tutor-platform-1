-- Защита авторассылки от параллельного запуска (вместо запрещённых advisory-блокировок).
ALTER TABLE t_p78828167_tutor_platform_1.outreach_settings
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ NULL;