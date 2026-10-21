-- Аудитория учреждения: школы (как было), детские сады, детские дома и интернаты.
ALTER TABLE t_p78828167_tutor_platform_1.edu_institutions ADD COLUMN IF NOT EXISTS audience VARCHAR(20) NOT NULL DEFAULT 'school';
-- Ссылка на карточку в реестре закупок (ЕИС) — по ней сервер дособирает почту и телефон.
ALTER TABLE t_p78828167_tutor_platform_1.edu_institutions ADD COLUMN IF NOT EXISTS ext_ref VARCHAR(40) NULL;
ALTER TABLE t_p78828167_tutor_platform_1.edu_institutions ADD COLUMN IF NOT EXISTS enrich_attempts SMALLINT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_edu_inst_audience ON t_p78828167_tutor_platform_1.edu_institutions (audience, city);

-- Рассылка «Малыша» включается отдельно от школьной.
ALTER TABLE t_p78828167_tutor_platform_1.outreach_settings ADD COLUMN IF NOT EXISTS kids_enabled BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO t_p78828167_tutor_platform_1.edu_campaigns (code, title, subject) VALUES
 ('kids_pilot_2026', 'Пилот «Малыш» для детских садов', 'Заведующему детским садом: «Малыш» бесплатно для семей воспитанников по промокоду МАЛЫШ'),
 ('care_2026', 'Программа «Каждый ребёнок» для детских домов и интернатов', 'Бесплатное обучение для ваших воспитанников — без срока и без оплаты')
ON CONFLICT (code) DO NOTHING;