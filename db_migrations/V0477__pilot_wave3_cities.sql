-- Вторая волна городов (от 500 тыс. жителей, кроме Москвы и Санкт-Петербурга).
-- Тольятти и Набережные Челны уже охвачены через Самарскую область и Татарстан.
INSERT INTO t_p78828167_tutor_platform_1.pilot_cities (slug, name, name_in, name_gen, promo_code, campaign_code, wave) VALUES
 ('voronezh', 'Воронеж', 'в Воронеже', 'Воронежа', 'ВОРОНЕЖ', 'pilot_voronezh_2026', 3),
 ('perm', 'Пермь', 'в Перми', 'Перми', 'ПЕРМЬ', 'pilot_perm_2026', 3),
 ('volgograd', 'Волгоград', 'в Волгограде', 'Волгограда', 'ВОЛГОГРАД', 'pilot_volgograd_2026', 3),
 ('saratov', 'Саратов', 'в Саратове', 'Саратова', 'САРАТОВ', 'pilot_saratov_2026', 3),
 ('tyumen', 'Тюмень', 'в Тюмени', 'Тюмени', 'ТЮМЕНЬ', 'pilot_tyumen_2026', 3),
 ('makhachkala', 'Махачкала', 'в Махачкале', 'Махачкалы', 'МАХАЧКАЛА', 'pilot_makhachkala_2026', 3),
 ('barnaul', 'Барнаул', 'в Барнауле', 'Барнаула', 'БАРНАУЛ', 'pilot_barnaul_2026', 3),
 ('izhevsk', 'Ижевск', 'в Ижевске', 'Ижевска', 'ИЖЕВСК', 'pilot_izhevsk_2026', 3),
 ('khabarovsk', 'Хабаровск', 'в Хабаровске', 'Хабаровска', 'ХАБАРОВСК', 'pilot_khabarovsk_2026', 3),
 ('ulyanovsk', 'Ульяновск', 'в Ульяновске', 'Ульяновска', 'УЛЬЯНОВСК', 'pilot_ulyanovsk_2026', 3),
 ('irkutsk', 'Иркутск', 'в Иркутске', 'Иркутска', 'ИРКУТСК', 'pilot_irkutsk_2026', 3),
 ('vladivostok', 'Владивосток', 'во Владивостоке', 'Владивостока', 'ВЛАДИВОСТОК', 'pilot_vladivostok_2026', 3),
 ('yaroslavl', 'Ярославль', 'в Ярославле', 'Ярославля', 'ЯРОСЛАВЛЬ', 'pilot_yaroslavl_2026', 3),
 ('stavropol', 'Ставрополь', 'в Ставрополе', 'Ставрополя', 'СТАВРОПОЛЬ', 'pilot_stavropol_2026', 3),
 ('tomsk', 'Томск', 'в Томске', 'Томска', 'ТОМСК', 'pilot_tomsk_2026', 3),
 ('balashikha', 'Балашиха', 'в Балашихе', 'Балашихи', 'БАЛАШИХА', 'pilot_balashikha_2026', 3),
 ('kemerovo', 'Кемерово', 'в Кемерове', 'Кемерова', 'КЕМЕРОВО', 'pilot_kemerovo_2026', 3),
 ('orenburg', 'Оренбург', 'в Оренбурге', 'Оренбурга', 'ОРЕНБУРГ', 'pilot_orenburg_2026', 3),
 ('novokuznetsk', 'Новокузнецк', 'в Новокузнецке', 'Новокузнецка', 'НОВОКУЗНЕЦК', 'pilot_novokuznetsk_2026', 3),
 ('ryazan', 'Рязань', 'в Рязани', 'Рязани', 'РЯЗАНЬ', 'pilot_ryazan_2026', 3),
 ('sevastopol', 'Севастополь', 'в Севастополе', 'Севастополя', 'СЕВАСТОПОЛЬ', 'pilot_sevastopol_2026', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.access_promo_codes (code, code_norm, scope, description, expires_at)
SELECT c.promo_code, c.promo_code, 'school',
       'Пилотный проект школ ' || c.name_gen || ': бесплатный доступ к курсам раздела «Школьникам»',
       '2027-05-31 23:59:59+03'
FROM t_p78828167_tutor_platform_1.pilot_cities c
WHERE c.wave = 3
ON CONFLICT (code) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.edu_campaigns (code, title, subject)
SELECT c.campaign_code, 'Пилот УЧИСЬПРО для школ ' || c.name_gen || ' — директорам',
       'Директору школы: бесплатный доступ для учеников по промокоду ' || c.promo_code
FROM t_p78828167_tutor_platform_1.pilot_cities c WHERE c.wave = 3
ON CONFLICT (code) DO NOTHING;