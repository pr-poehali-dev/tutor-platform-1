-- Авторассылка 24/7: отметка последнего шага (видно, работает ли планировщик ночью) и лимит под правила Яндекса.
ALTER TABLE t_p78828167_tutor_platform_1.outreach_settings
  ADD COLUMN IF NOT EXISTS last_tick_at TIMESTAMPTZ NULL;

UPDATE t_p78828167_tutor_platform_1.outreach_settings SET daily_limit = 250, updated_at = now() WHERE id = 1;