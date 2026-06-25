-- Marker dlya lenivogo dnevnogo zapuska analitika trendov (ne chashche raza v sutki)
CREATE TABLE IF NOT EXISTS it_trend_cron (
    id INT PRIMARY KEY DEFAULT 1,
    last_tick_date DATE,
    last_tick_at TIMESTAMPTZ,
    CONSTRAINT it_trend_cron_single CHECK (id = 1)
);
INSERT INTO it_trend_cron (id, last_tick_date, last_tick_at)
VALUES (1, NULL, NULL) ON CONFLICT (id) DO NOTHING;
