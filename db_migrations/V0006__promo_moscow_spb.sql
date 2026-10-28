INSERT INTO t_p78828167_tutor_platform_1.access_promo_codes (code, scope, description, active, expires_at, code_norm)
SELECT v.code, 'school', v.descr, TRUE, '2027-05-31T20:59:59+00:00', v.code
FROM (VALUES
  ('МОСКВА', 'Пилотный проект школ Москвы и Московской области: бесплатный доступ к курсам раздела «Школьникам»'),
  ('ПИТЕР', 'Пилотный проект школ Санкт-Петербурга и Ленинградской области: бесплатный доступ к курсам раздела «Школьникам»')
) AS v(code, descr)
WHERE NOT EXISTS (SELECT 1 FROM t_p78828167_tutor_platform_1.access_promo_codes p WHERE upper(p.code) = v.code);