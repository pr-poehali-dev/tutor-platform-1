CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.course_interactive_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
    course_id INTEGER NOT NULL,
    lesson_key VARCHAR(120) NOT NULL,
    lesson_title VARCHAR(300),
    module_id INTEGER,
    kind VARCHAR(20) NOT NULL DEFAULT 'lesson',
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    score INTEGER,
    total INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, course_id, lesson_key)
);

CREATE INDEX IF NOT EXISTS idx_cip_user_course
    ON t_p78828167_tutor_platform_1.course_interactive_progress (user_id, course_id);
