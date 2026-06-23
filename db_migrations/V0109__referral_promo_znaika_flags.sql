-- Акция «Приведи друга» с 23.06.2026: знайки за приглашение и за покупку друга.
-- Флаги нужны, чтобы бонусы начислялись строго один раз на каждого приглашённого.
ALTER TABLE t_p78828167_tutor_platform_1.referral_invites
  ADD COLUMN IF NOT EXISTS znaika_invite_awarded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS znaika_purchase_awarded BOOLEAN NOT NULL DEFAULT FALSE;
