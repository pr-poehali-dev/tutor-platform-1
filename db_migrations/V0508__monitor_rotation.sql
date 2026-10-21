-- Мониторинг проверяет второстепенные функции по очереди: позиция очереди хранится здесь.
ALTER TABLE t_p78828167_tutor_platform_1.monitor_state ADD COLUMN IF NOT EXISTS rotate_pos INTEGER NOT NULL DEFAULT 0;
UPDATE t_p78828167_tutor_platform_1.monitor_state SET last_run_at = NULL, locked_until = NULL WHERE id = 1;