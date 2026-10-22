-- Связь карточки репетитора с его чатом в боте MAX: таким можно писать прямо из админки.
ALTER TABLE t_p78828167_tutor_platform_1.tutor_partners ADD COLUMN IF NOT EXISTS max_user_id BIGINT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_tutor_partners_max_uid ON t_p78828167_tutor_platform_1.tutor_partners (max_user_id) WHERE max_user_id IS NOT NULL;