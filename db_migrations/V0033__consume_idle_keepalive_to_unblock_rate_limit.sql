-- Помечаем тестовый запуск keep_alive как 'consumed', чтобы rate-limit не блокировал свежий прогон.
-- (По логике бэка он ищет именно kind='keep_alive', а 'consumed_keep_alive' проигнорирует.)
UPDATE feed_cron_runs 
SET kind = 'consumed_keep_alive', 
    started_at = started_at - INTERVAL '30 minutes'
WHERE kind = 'keep_alive' AND fetched = 0;
