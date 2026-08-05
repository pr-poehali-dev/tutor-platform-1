-- Ежедневный трекер плана на 5 лет: дни открываются строго по дате, рефлексия анализируется ИИ.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.career_pro_days (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id BIGINT,
    day_date DATE NOT NULL,
    day_index INTEGER NOT NULL DEFAULT 1,
    year_index INTEGER NOT NULL DEFAULT 1,
    month_index INTEGER NOT NULL DEFAULT 1,
    focus TEXT NOT NULL DEFAULT '',
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    done_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    reflection TEXT NOT NULL DEFAULT '',
    coach_note TEXT NOT NULL DEFAULT '',
    mood VARCHAR(16) NOT NULL DEFAULT '',
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cp_days_user_date
    ON t_p78828167_tutor_platform_1.career_pro_days (user_id, day_date);
CREATE INDEX IF NOT EXISTS idx_cp_days_user_created
    ON t_p78828167_tutor_platform_1.career_pro_days (user_id, day_date DESC);

-- Планы на месяц: видны заранее (в отличие от дней).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.career_pro_months (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id BIGINT,
    year_index INTEGER NOT NULL DEFAULT 1,
    month_index INTEGER NOT NULL DEFAULT 1,
    period_key VARCHAR(16) NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    focus TEXT NOT NULL DEFAULT '',
    goals JSONB NOT NULL DEFAULT '[]'::jsonb,
    metric TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cp_months_user_period
    ON t_p78828167_tutor_platform_1.career_pro_months (user_id, period_key);