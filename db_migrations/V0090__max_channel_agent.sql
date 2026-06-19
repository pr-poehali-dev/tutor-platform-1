-- Лог постов ИИ-агента в канал MAX (история + защита от дублей)
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_channel_posts (
    id BIGSERIAL PRIMARY KEY,
    kind VARCHAR(30) NOT NULL,            -- 'feed_article' | 'weekly_digest' | 'feature'
    ref_key VARCHAR(160),                 -- ключ дедупликации (напр. article:slug или digest:2026-W25)
    article_id BIGINT,                    -- если пост про статью ленты
    channel_chat_id BIGINT,               -- куда отправлено
    text TEXT NOT NULL,
    ok BOOLEAN NOT NULL DEFAULT TRUE,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_max_channel_dedup
    ON t_p78828167_tutor_platform_1.max_channel_posts(kind, ref_key)
    WHERE ref_key IS NOT NULL;

-- Настройки/состояние канала (chat_id, автодетект, вкл/выкл)
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_channel_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    channel_chat_id BIGINT,               -- chat_id канала (автодетект или из секрета)
    channel_title VARCHAR(200),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT max_channel_config_singleton CHECK (id = 1)
);

INSERT INTO t_p78828167_tutor_platform_1.max_channel_config (id, enabled)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;
