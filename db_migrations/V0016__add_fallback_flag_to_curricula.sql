ALTER TABLE course_curricula ADD COLUMN IF NOT EXISTS is_fallback BOOLEAN DEFAULT FALSE;
ALTER TABLE course_curricula ADD COLUMN IF NOT EXISTS ai_error TEXT;

-- Помечаем существующие fallback-курсы (созданные через шаблонный генератор)
-- Признак: program_description содержит шаблонный текст "Систематический курс «...»"
UPDATE course_curricula
SET is_fallback = TRUE
WHERE program_description LIKE 'Систематический курс «%' AND is_fallback IS NOT TRUE;

CREATE INDEX IF NOT EXISTS idx_curricula_fallback ON course_curricula(is_fallback) WHERE is_fallback = TRUE;
