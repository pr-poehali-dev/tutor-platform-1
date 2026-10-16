-- Города пилотного проекта для школ: страница /pilot/{slug}, промокод = название города.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.pilot_cities (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  name_in VARCHAR(100) NOT NULL,
  name_gen VARCHAR(100) NOT NULL,
  promo_code VARCHAR(40) NOT NULL,
  campaign_code VARCHAR(60) NOT NULL,
  wave SMALLINT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Нормализованный код: только буквы/цифры в верхнем регистре, Ё→Е.
-- «Нижний Новгород», «нижний-новгород», «НИЖНИЙНОВГОРОД» → одно и то же.
ALTER TABLE t_p78828167_tutor_platform_1.access_promo_codes
  ADD COLUMN IF NOT EXISTS code_norm VARCHAR(60) NULL;
UPDATE t_p78828167_tutor_platform_1.access_promo_codes
  SET code_norm = regexp_replace(replace(upper(code), 'Ё', 'Е'), '[^А-ЯA-Z0-9]', '', 'g')
  WHERE code_norm IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_promo_code_norm
  ON t_p78828167_tutor_platform_1.access_promo_codes (code_norm);

-- Ежедневный лимит авторассылки (по московской дате).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.outreach_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  auto_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  daily_limit INTEGER NOT NULL DEFAULT 200,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO t_p78828167_tutor_platform_1.outreach_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.pilot_cities (slug, name, name_in, name_gen, promo_code, campaign_code, wave) VALUES
 ('samara', 'Самара', 'в Самаре', 'Самары', 'САМАРА', 'samara_pilot_2026', 0),
 ('novosibirsk', 'Новосибирск', 'в Новосибирске', 'Новосибирска', 'НОВОСИБИРСК', 'pilot_novosibirsk_2026', 1),
 ('ekaterinburg', 'Екатеринбург', 'в Екатеринбурге', 'Екатеринбурга', 'ЕКАТЕРИНБУРГ', 'pilot_ekaterinburg_2026', 1),
 ('kazan', 'Казань', 'в Казани', 'Казани', 'КАЗАНЬ', 'pilot_kazan_2026', 1),
 ('nizhniy-novgorod', 'Нижний Новгород', 'в Нижнем Новгороде', 'Нижнего Новгорода', 'НИЖНИЙ НОВГОРОД', 'pilot_nizhniy_novgorod_2026', 1),
 ('krasnoyarsk', 'Красноярск', 'в Красноярске', 'Красноярска', 'КРАСНОЯРСК', 'pilot_krasnoyarsk_2026', 1),
 ('chelyabinsk', 'Челябинск', 'в Челябинске', 'Челябинска', 'ЧЕЛЯБИНСК', 'pilot_chelyabinsk_2026', 1),
 ('ufa', 'Уфа', 'в Уфе', 'Уфы', 'УФА', 'pilot_ufa_2026', 1),
 ('krasnodar', 'Краснодар', 'в Краснодаре', 'Краснодара', 'КРАСНОДАР', 'pilot_krasnodar_2026', 1),
 ('rostov-na-donu', 'Ростов-на-Дону', 'в Ростове-на-Дону', 'Ростова-на-Дону', 'РОСТОВ-НА-ДОНУ', 'pilot_rostov_2026', 1),
 ('omsk', 'Омск', 'в Омске', 'Омска', 'ОМСК', 'pilot_omsk_2026', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.access_promo_codes (code, code_norm, scope, description, expires_at)
SELECT c.promo_code,
       regexp_replace(replace(upper(c.promo_code), 'Ё', 'Е'), '[^А-ЯA-Z0-9]', '', 'g'),
       'school',
       'Пилотный проект школ ' || c.name_gen || ': бесплатный доступ к курсам раздела «Школьникам»',
       '2027-05-31 23:59:59+03'
FROM t_p78828167_tutor_platform_1.pilot_cities c
WHERE c.slug <> 'samara'
ON CONFLICT (code) DO NOTHING;

INSERT INTO t_p78828167_tutor_platform_1.edu_campaigns (code, title, subject)
SELECT c.campaign_code, 'Пилот УЧИСЬПРО для школ ' || c.name_gen || ' — директорам',
       'Директору школы: бесплатный доступ для учеников по промокоду ' || c.promo_code
FROM t_p78828167_tutor_platform_1.pilot_cities c
ON CONFLICT (code) DO NOTHING;