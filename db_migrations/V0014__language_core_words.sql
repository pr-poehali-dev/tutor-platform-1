CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.language_core_words (
    id SERIAL PRIMARY KEY,
    lang VARCHAR(8) NOT NULL,
    day SMALLINT NOT NULL,
    words JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (lang, day)
);