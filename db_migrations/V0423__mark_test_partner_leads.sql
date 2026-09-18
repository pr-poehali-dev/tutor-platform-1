-- 17 из 20 заявок в partner_leads — наши собственные проверки доставки
-- уведомлений в MAX (school@example.com, «Проверка доставки», «Тест Юра»).
-- Из-за них казалось, что заявок много, хотя живых всего три.
--
-- Физически не удаляем: заявки связаны с выданными приглашениями
-- (school_builder_invites.lead_id), и удаление оборвало бы эту связь.
-- Вместо этого помечаем флагом — списки по умолчанию их не показывают,
-- но при необходимости служебные можно посмотреть отдельно.

ALTER TABLE t_p78828167_tutor_platform_1.partner_leads
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE t_p78828167_tutor_platform_1.partner_leads
SET is_test = TRUE,
    updated_at = now()
WHERE contact_email ILIKE '%@example.com'
   OR contact_email ILIKE '%@test.%'
   OR contact_name ILIKE 'тест%'
   OR contact_name ILIKE '%проверка%'
   OR company ILIKE '%проверка%'
   OR company ILIKE '%диагностика%';

-- Приглашения в конструктор, выданные на служебные заявки, тоже служебные.
ALTER TABLE t_p78828167_tutor_platform_1.school_builder_invites
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE t_p78828167_tutor_platform_1.school_builder_invites i
SET is_test = TRUE
FROM t_p78828167_tutor_platform_1.partner_leads l
WHERE i.lead_id = l.id AND l.is_test = TRUE;

UPDATE t_p78828167_tutor_platform_1.school_builder_invites
SET is_test = TRUE
WHERE email ILIKE '%@example.com';

-- Быстрый отбор живых заявок в админке.
CREATE INDEX IF NOT EXISTS idx_partner_leads_real
  ON t_p78828167_tutor_platform_1.partner_leads (created_at DESC)
  WHERE is_test = FALSE;
