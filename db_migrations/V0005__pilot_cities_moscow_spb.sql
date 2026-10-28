INSERT INTO t_p78828167_tutor_platform_1.pilot_cities (slug, name, name_in, name_gen, promo_code, campaign_code, wave, active, page_slug, queue_order)
SELECT v.slug, v.name, v.name_in, v.name_gen, v.promo_code, v.campaign_code, v.wave, TRUE, v.page_slug, v.queue_order
FROM (VALUES
  ('moscow', 'Москва', 'в Москве', 'Москвы', 'МОСКВА', 'pilot_moscow_2026', 3, NULL, 30),
  ('moscow-region', 'Московская область', 'в Московской области', 'Московской области', 'МОСКВА', 'region_moscow_2026', 3, 'moscow', 40),
  ('saint-petersburg', 'Санкт-Петербург', 'в Санкт-Петербурге', 'Санкт-Петербурга', 'ПИТЕР', 'pilot_spb_2026', 3, NULL, 30),
  ('leningrad-region', 'Ленинградская область', 'в Ленинградской области', 'Ленинградской области', 'ПИТЕР', 'region_leningrad_2026', 3, 'saint-petersburg', 40)
) AS v(slug, name, name_in, name_gen, promo_code, campaign_code, wave, page_slug, queue_order)
WHERE NOT EXISTS (SELECT 1 FROM t_p78828167_tutor_platform_1.pilot_cities c WHERE c.slug = v.slug);