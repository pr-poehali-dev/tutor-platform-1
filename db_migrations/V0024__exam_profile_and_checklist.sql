-- Профиль выпускника для чек-листа «До ЕГЭ»: какие предметы сдаёт, целевой балл, целевой вуз
CREATE TABLE IF NOT EXISTS exam_profile (
    user_id BIGINT PRIMARY KEY REFERENCES auth_users(id),
    -- Год сдачи ЕГЭ (например 2026)
    exam_year INTEGER NOT NULL DEFAULT 2026,
    -- Массив предметов, которые сдаёт (subject codes из graduateData: math_prof, physics, ...)
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Целевой суммарный балл (например 280)
    target_score INTEGER DEFAULT 0,
    -- Целевой вуз и факультет (id из graduateData)
    target_university_id VARCHAR(60),
    target_faculty_id VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Статус по каждому пункту чек-листа: задача_id -> {done, note, completed_at}
CREATE TABLE IF NOT EXISTS exam_checklist_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES auth_users(id),
    -- Уникальный id пункта чек-листа (заранее предопределённый, напр. "doc-passport", "subj-math-pract")
    task_id VARCHAR(80) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_ecp_user ON exam_checklist_progress(user_id);
