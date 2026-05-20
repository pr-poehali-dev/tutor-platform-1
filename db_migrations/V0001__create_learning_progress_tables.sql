CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(64) NOT NULL UNIQUE,
    display_name VARCHAR(128),
    avatar_emoji VARCHAR(8) DEFAULT '🦁',
    total_xp INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_nickname ON t_p78828167_tutor_platform_1.users (nickname);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.journeys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.users(id),
    subject VARCHAR(32) NOT NULL,
    grade VARCHAR(16) NOT NULL,
    level_assessment VARCHAR(32),
    initial_score_percent INTEGER,
    program_data JSONB NOT NULL,
    weak_topics JSONB,
    strong_topics JSONB,
    completed_module_ids JSONB NOT NULL DEFAULT '[]',
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_journeys_user ON t_p78828167_tutor_platform_1.journeys (user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_user_subject ON t_p78828167_tutor_platform_1.journeys (user_id, subject);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.completed_tasks (
    id SERIAL PRIMARY KEY,
    journey_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.journeys(id),
    user_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.users(id),
    module_id INTEGER NOT NULL,
    topic VARCHAR(128) NOT NULL,
    task_question TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    hints_used INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_completed_tasks_journey ON t_p78828167_tutor_platform_1.completed_tasks (journey_id);
CREATE INDEX IF NOT EXISTS idx_completed_tasks_user ON t_p78828167_tutor_platform_1.completed_tasks (user_id);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.spaced_repetition (
    id SERIAL PRIMARY KEY,
    journey_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.journeys(id),
    user_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.users(id),
    module_id INTEGER NOT NULL,
    topic VARCHAR(128) NOT NULL,
    review_at DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sr_user_date ON t_p78828167_tutor_platform_1.spaced_repetition (user_id, review_at);
