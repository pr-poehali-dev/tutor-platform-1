-- Готовые «говорящие» ролики Ксюши: фраза → видео (lip-sync) через Polza.ai.
-- Кэшируем по ключу phrase_key, чтобы не генерировать одно и то же повторно.
CREATE TABLE IF NOT EXISTS ksusha_videos (
    id SERIAL PRIMARY KEY,
    phrase_key VARCHAR(120) NOT NULL UNIQUE,   -- короткий стабильный ключ (greeting, well_done, ...)
    phrase TEXT NOT NULL,                       -- сама фраза, которую произносит Ксюша
    emotion VARCHAR(40) DEFAULT 'idle',         -- эмоция/настроение ролика
    provider_job_id VARCHAR(200),               -- id задачи генерации в Polza.ai
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | processing | ready | failed
    video_url TEXT,                             -- итоговый CDN-URL готового видео
    error TEXT,                                 -- текст ошибки, если failed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ksusha_videos_status ON ksusha_videos(status);
