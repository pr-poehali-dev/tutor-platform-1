-- Таблица прогресса малыша (sync между устройствами через user_id)
CREATE TABLE IF NOT EXISTS kids_progress (
    user_id INTEGER PRIMARY KEY,
    stars INTEGER NOT NULL DEFAULT 0,
    completed_activities JSONB NOT NULL DEFAULT '[]'::jsonb,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    total_answers INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Родительский контроль: PIN, согласие 436-ФЗ, лимит экранного времени по СанПиН 2.4.3648-20.
-- СанПиН: 3-4 года = 10 мин/день, 4-5 лет = 15 мин, 5-6 лет = 20 мин, 6-7 лет = 25 мин.
CREATE TABLE IF NOT EXISTS kids_parent_controls (
    user_id INTEGER PRIMARY KEY,
    pin_hash TEXT,                                   -- SHA256 от 4-значного PIN-кода (родитель)
    consent_436fz BOOLEAN NOT NULL DEFAULT FALSE,    -- согласие родителя по 436-ФЗ
    consent_date TIMESTAMP,
    child_age_band VARCHAR(10) NOT NULL DEFAULT '4-5',  -- 1-2, 2-3, 3-4, 4-5, 5-6, 6-7
    daily_limit_minutes INTEGER NOT NULL DEFAULT 15, -- мин/день экранного времени
    bedtime_lock_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    bedtime_from TIME DEFAULT '21:00',
    bedtime_to TIME DEFAULT '07:00',
    block_purchases BOOLEAN NOT NULL DEFAULT TRUE,   -- запрет покупок без PIN
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Учёт фактически использованного экранного времени за день
CREATE TABLE IF NOT EXISTS kids_screen_time (
    user_id INTEGER NOT NULL,
    day DATE NOT NULL,
    minutes_used INTEGER NOT NULL DEFAULT 0,
    last_session_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, day)
);
CREATE INDEX IF NOT EXISTS idx_kids_screen_time_user ON kids_screen_time(user_id, day DESC);
