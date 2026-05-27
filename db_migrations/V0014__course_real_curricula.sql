-- Реальные программы курсов: каждый курс получает кэшированный учебный план
-- ИИ-генерация через course-builder создаёт программу один раз и сохраняет
-- При следующих запросах отдаётся из кэша → быстро + стабильно
CREATE TABLE IF NOT EXISTS course_curricula (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL UNIQUE,
    course_title VARCHAR(300),
    subject VARCHAR(60),
    grade_band VARCHAR(20),
    total_lessons INT,
    total_modules INT,
    estimated_hours INT,
    program_description TEXT,
    learning_outcomes JSONB,
    target_audience TEXT,
    prerequisites JSONB,
    methodology TEXT,
    final_project TEXT,
    certificate_available BOOLEAN DEFAULT TRUE,
    generated_by VARCHAR(64),
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curricula_course ON course_curricula(course_id);
CREATE INDEX IF NOT EXISTS idx_curricula_subject ON course_curricula(subject, grade_band);

-- Конкретные уроки курса с темами и временем
CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    module_index INT,
    module_title VARCHAR(300),
    module_description TEXT,
    lesson_index INT,
    lesson_title VARCHAR(400),
    lesson_summary TEXT,
    lesson_type VARCHAR(40),
    estimated_minutes INT,
    topics JSONB,
    skills_acquired JSONB,
    homework_description TEXT,
    is_preview BOOLEAN DEFAULT FALSE,
    sort_order INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON course_lessons(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON course_lessons(course_id, module_index, lesson_index);

-- Прогресс ученика по реальным урокам курса
CREATE TABLE IF NOT EXISTS course_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NOT NULL,
    status VARCHAR(30) DEFAULT 'not_started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    score NUMERIC(5,2),
    time_spent_minutes INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_user_course ON course_lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON course_lesson_progress(lesson_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_progress_user_lesson ON course_lesson_progress(user_id, lesson_id);
