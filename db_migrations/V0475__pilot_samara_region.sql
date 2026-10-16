-- Самарская область (кроме г. Самары): тот же промокод САМАРА и страница /samara, отдельная кампания писем.
INSERT INTO t_p78828167_tutor_platform_1.pilot_cities (slug, name, name_in, name_gen, promo_code, campaign_code, wave)
VALUES ('samara-region', 'Самарская область', 'в Самарской области', 'Самарской области', 'САМАРА', 'samara_region_2026', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.edu_campaigns (code, title, subject)
VALUES ('samara_region_2026', 'Пилот УЧИСЬПРО для школ Самарской области — директорам',
        'Директору школы: бесплатный доступ для учеников по промокоду САМАРА')
ON CONFLICT (code) DO NOTHING;