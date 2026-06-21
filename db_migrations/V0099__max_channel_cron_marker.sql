CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_channel_cron (
    id INT PRIMARY KEY DEFAULT 1,
    last_tick_date DATE,
    last_tick_at TIMESTAMPTZ,
    CONSTRAINT max_channel_cron_single CHECK (id = 1)
);

INSERT INTO t_p78828167_tutor_platform_1.max_channel_cron (id, last_tick_date, last_tick_at)
VALUES (1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;