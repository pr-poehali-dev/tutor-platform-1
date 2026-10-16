-- Регионы вокруг городов пилота: промокод и страница областного центра, отдельная кампания писем.
ALTER TABLE t_p78828167_tutor_platform_1.pilot_cities
  ADD COLUMN IF NOT EXISTS page_slug VARCHAR(60) NULL;

UPDATE t_p78828167_tutor_platform_1.pilot_cities SET page_slug = 'samara' WHERE slug = 'samara-region';

INSERT INTO t_p78828167_tutor_platform_1.pilot_cities (slug, name, name_in, name_gen, promo_code, campaign_code, wave, page_slug) VALUES
 ('sverdlovsk-region', 'Свердловская область', 'в Свердловской области', 'Свердловской области', 'ЕКАТЕРИНБУРГ', 'region_sverdlovsk_2026', 2, 'ekaterinburg'),
 ('novosibirsk-region', 'Новосибирская область', 'в Новосибирской области', 'Новосибирской области', 'НОВОСИБИРСК', 'region_novosibirsk_2026', 2, 'novosibirsk'),
 ('tatarstan', 'Республика Татарстан', 'в Республике Татарстан', 'Республики Татарстан', 'КАЗАНЬ', 'region_tatarstan_2026', 2, 'kazan'),
 ('nizhegorod-region', 'Нижегородская область', 'в Нижегородской области', 'Нижегородской области', 'НИЖНИЙ НОВГОРОД', 'region_nizhegorod_2026', 2, 'nizhniy-novgorod'),
 ('krasnoyarsk-region', 'Красноярский край', 'в Красноярском крае', 'Красноярского края', 'КРАСНОЯРСК', 'region_krasnoyarsk_2026', 2, 'krasnoyarsk'),
 ('chelyabinsk-region', 'Челябинская область', 'в Челябинской области', 'Челябинской области', 'ЧЕЛЯБИНСК', 'region_chelyabinsk_2026', 2, 'chelyabinsk'),
 ('bashkortostan', 'Республика Башкортостан', 'в Республике Башкортостан', 'Республики Башкортостан', 'УФА', 'region_bashkortostan_2026', 2, 'ufa'),
 ('krasnodar-region', 'Краснодарский край', 'в Краснодарском крае', 'Краснодарского края', 'КРАСНОДАР', 'region_krasnodar_2026', 2, 'krasnodar'),
 ('rostov-region', 'Ростовская область', 'в Ростовской области', 'Ростовской области', 'РОСТОВ-НА-ДОНУ', 'region_rostov_2026', 2, 'rostov-na-donu'),
 ('omsk-region', 'Омская область', 'в Омской области', 'Омской области', 'ОМСК', 'region_omsk_2026', 2, 'omsk')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.edu_campaigns (code, title, subject)
SELECT c.campaign_code, 'Пилот УЧИСЬПРО для школ: ' || c.name || ' — директорам',
       'Директору школы: бесплатный доступ для учеников по промокоду ' || c.promo_code
FROM t_p78828167_tutor_platform_1.pilot_cities c WHERE c.wave = 2
ON CONFLICT (code) DO NOTHING;