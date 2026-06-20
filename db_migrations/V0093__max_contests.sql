-- Конкурсы канала MAX
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_contests (
    id SERIAL PRIMARY KEY,
    week_ref TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    prize_kind TEXT NOT NULL,
    prize_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    winner_user_id BIGINT,
    winner_name TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- Активность участников конкурса (ответы боту/комментарии)
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_contest_entries (
    id SERIAL PRIMARY KEY,
    contest_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.max_contests(id),
    user_id BIGINT NOT NULL,
    user_name TEXT,
    activity_count INTEGER NOT NULL DEFAULT 1,
    last_message TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_max_contest_entries_contest
    ON t_p78828167_tutor_platform_1.max_contest_entries(contest_id, activity_count DESC);