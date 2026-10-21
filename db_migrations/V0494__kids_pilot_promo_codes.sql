-- Пилот детских садов: «Малыш» бесплатно до 31.05.2027 по промокоду МАЛЫШ.
INSERT INTO t_p78828167_tutor_platform_1.access_promo_codes (code, code_norm, scope, description, expires_at)
VALUES ('МАЛЫШ', 'МАЛЫШ', 'kids', 'Пилотный проект детских садов: бесплатный доступ к разделу «Малыш» до 31.05.2027', '2027-05-31 23:59:59+03')
ON CONFLICT (code) DO NOTHING;

-- Детские дома, интернаты и центры содействия семейному устройству: «Малыш» и «Школьникам» бесплатно без срока.
INSERT INTO t_p78828167_tutor_platform_1.access_promo_codes (code, code_norm, scope, description, expires_at)
VALUES ('КАЖДЫЙ РЕБЁНОК', 'КАЖДЫЙРЕБЕНОК', 'care', 'Детские дома и интернаты: «Малыш» и все курсы «Школьникам» бесплатно без ограничения срока', '2099-12-31 23:59:59+03')
ON CONFLICT (code) DO NOTHING;