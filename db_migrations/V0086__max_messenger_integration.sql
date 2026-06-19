-- Привязка аккаунта родителя к чату в мессенджере MAX
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_links (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
    max_chat_id BIGINT,                              -- id чата/пользователя в MAX (после привязки)
    max_user_name VARCHAR(160),                      -- отображаемое имя в MAX
    link_code VARCHAR(12) NOT NULL UNIQUE,           -- одноразовый код привязки (/start CODE)
    status VARCHAR(20) NOT NULL DEFAULT 'pending',   -- 'pending' | 'linked' | 'revoked'
    -- настройки уведомлений
    notify_daily_report BOOLEAN NOT NULL DEFAULT TRUE,   -- ежедневный отчёт о занятиях
    notify_reminders BOOLEAN NOT NULL DEFAULT TRUE,      -- напоминания при простое
    notify_achievements BOOLEAN NOT NULL DEFAULT TRUE,   -- достижения и новые ступеньки
    linked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_max_links_user ON t_p78828167_tutor_platform_1.max_links(user_id);
CREATE INDEX IF NOT EXISTS idx_max_links_chat ON t_p78828167_tutor_platform_1.max_links(max_chat_id);

-- Лог отправленных уведомлений (защита от дублей + история)
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
    max_chat_id BIGINT NOT NULL,
    kind VARCHAR(30) NOT NULL,            -- 'daily_report' | 'reminder' | 'achievement' | 'welcome'
    dedup_key VARCHAR(120),               -- ключ для защиты от повторной отправки (напр. daily_report:2026-06-19)
    text TEXT NOT NULL,
    ok BOOLEAN NOT NULL DEFAULT TRUE,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_max_notif_dedup
    ON t_p78828167_tutor_platform_1.max_notifications(user_id, dedup_key)
    WHERE dedup_key IS NOT NULL;
