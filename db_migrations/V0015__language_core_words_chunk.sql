ALTER TABLE t_p78828167_tutor_platform_1.language_core_words ADD COLUMN IF NOT EXISTS chunk SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE t_p78828167_tutor_platform_1.language_core_words DROP CONSTRAINT IF EXISTS language_core_words_lang_day_key;
CREATE UNIQUE INDEX IF NOT EXISTS language_core_words_lang_day_chunk ON t_p78828167_tutor_platform_1.language_core_words (lang, day, chunk);