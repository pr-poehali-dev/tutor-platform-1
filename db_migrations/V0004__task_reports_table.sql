-- Таблица для жалоб пользователей на некорректные задачи
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.task_reports (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(32) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    grade VARCHAR(16) NOT NULL,
    lesson_title VARCHAR(500) DEFAULT '',
    task_id VARCHAR(32) DEFAULT '',
    task_type VARCHAR(32) DEFAULT '',
    question TEXT NOT NULL,
    options_json JSONB,
    correct_answer TEXT,
    user_reason VARCHAR(64) NOT NULL,
    user_comment TEXT DEFAULT '',
    user_answer TEXT DEFAULT '',
    status VARCHAR(16) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_reports_status ON t_p78828167_tutor_platform_1.task_reports(status);
CREATE INDEX IF NOT EXISTS idx_task_reports_created ON t_p78828167_tutor_platform_1.task_reports(created_at DESC);