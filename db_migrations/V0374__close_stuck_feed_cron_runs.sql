-- Закрываем зависшие прогоны: функция обрывалась по таймауту,
-- запись навсегда оставалась в статусе 'running' и искажала статистику.
UPDATE t_p78828167_tutor_platform_1.feed_cron_runs
SET status = 'timeout',
    error_message = COALESCE(error_message, 'Прогон оборван по таймауту платформы'),
    finished_at = COALESCE(finished_at, started_at)
WHERE status = 'running'
  AND started_at < NOW() - INTERVAL '10 minutes';
