-- Сброс отметки запуска мониторинга после исправления типа даты.
UPDATE t_p78828167_tutor_platform_1.monitor_state SET last_run_at = NULL, locked_until = NULL, rotate_pos = 0 WHERE id = 1;