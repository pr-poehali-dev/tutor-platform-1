-- Добавляем поля для соблюдения законов РФ:
-- age_rating — возрастная маркировка по 436-ФЗ (0+, 6+, 12+, 16+, 18+)
-- disclaimers — обязательные юридические оговорки (инвестиции, медицина, право)
-- compliance_violations — найденные нарушения (если есть)
ALTER TABLE course_curricula
    ADD COLUMN IF NOT EXISTS age_rating VARCHAR(10) DEFAULT '12+',
    ADD COLUMN IF NOT EXISTS disclaimers JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS compliance_violations JSONB DEFAULT '[]'::jsonb;

-- Обновляем существующие записи: проставляем age_rating по grade_band
UPDATE course_curricula SET age_rating = '6+'  WHERE grade_band = '1-4';
UPDATE course_curricula SET age_rating = '12+' WHERE grade_band IN ('5-9', 'oge');
UPDATE course_curricula SET age_rating = '16+' WHERE grade_band IN ('10-11', 'ege');
UPDATE course_curricula SET age_rating = '18+' WHERE grade_band = 'adult';
