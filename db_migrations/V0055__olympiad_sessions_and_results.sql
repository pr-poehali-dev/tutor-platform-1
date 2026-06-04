-- Олимпиада: серверные сессии (с правильными ответами, скрытыми от клиента) и результаты для лидерборда

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.olympiad_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_token TEXT NOT NULL UNIQUE,
    user_id BIGINT,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    questions JSONB NOT NULL,           -- список задач с правильными ответами (только на сервере)
    total_questions INT NOT NULL,
    current_index INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    mistakes INT NOT NULL DEFAULT 0,
    znaiki_earned INT NOT NULL DEFAULT 0,
    perfect BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'active',  -- active | finished
    grand_prize_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_olympiad_sessions_user
    ON t_p78828167_tutor_platform_1.olympiad_sessions (user_id);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.olympiad_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    display_name TEXT NOT NULL DEFAULT 'Ученик',
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    score INT NOT NULL DEFAULT 0,         -- очки рейтинга
    correct_count INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    znaiki_earned INT NOT NULL DEFAULT 0,
    perfect BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_olympiad_results_score
    ON t_p78828167_tutor_platform_1.olympiad_results (score DESC, created_at DESC);
