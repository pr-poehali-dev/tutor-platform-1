-- CRM-база маленьких онлайн-школ и репетиторских центров — потенциальных клиентов
-- для услуг платформы (ИИ-платформа/LMS, конструктор курсов, ИИ-репетитор, контент).
-- status: воронка продаж; note: заметки менеджера; services_offered: что предлагаем.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_prospects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    segment VARCHAR(40) NOT NULL DEFAULT 'other',
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    city VARCHAR(120),
    size_hint VARCHAR(40),                 -- примерный размер: micro/small/medium
    contact_hint VARCHAR(300),             -- где искать контакт (сайт, соцсеть)
    site VARCHAR(400),
    fit_reason VARCHAR(400),               -- почему подходит под наши услуги
    services_offered JSONB NOT NULL DEFAULT '[]'::jsonb, -- какие услуги отмечены
    status VARCHAR(20) NOT NULL DEFAULT 'new',           -- new/contacted/negotiation/client/rejected
    note TEXT,
    emoji VARCHAR(8) DEFAULT '🏫',
    color VARCHAR(60) DEFAULT 'from-purple-500 to-cyan-500',
    is_seed BOOLEAN NOT NULL DEFAULT FALSE,             -- пример из стартовой базы
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_prospects_status
    ON t_p78828167_tutor_platform_1.school_prospects (status);
CREATE INDEX IF NOT EXISTS idx_school_prospects_segment
    ON t_p78828167_tutor_platform_1.school_prospects (segment);
