CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.feed_literature_reads (
    id BIGSERIAL PRIMARY KEY,
    reader_key VARCHAR(120) NOT NULL,
    article_slug VARCHAR(180) NOT NULL,
    read_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lit_reads_key_slug_date
    ON t_p78828167_tutor_platform_1.feed_literature_reads (reader_key, article_slug, read_date);

CREATE INDEX IF NOT EXISTS idx_lit_reads_key_date
    ON t_p78828167_tutor_platform_1.feed_literature_reads (reader_key, read_date);