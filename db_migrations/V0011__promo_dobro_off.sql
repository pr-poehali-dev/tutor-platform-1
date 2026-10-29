UPDATE t_p78828167_tutor_platform_1.promo_codes
SET active = FALSE,
    expires_at = LEAST(COALESCE(expires_at, NOW()), NOW()),
    description = description || ' — отключён 29.10.2026: заменён акцией «Больше курсов — больше скидка»'
WHERE code = 'ДОБРО';