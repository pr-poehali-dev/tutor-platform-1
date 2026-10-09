-- Промокоды, которые открывают доступ к разделу (а не дают скидку).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.access_promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  scope VARCHAR(20) NOT NULL,
  description TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Выданные по промокоду доступы: один на пользователя и раздел.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.access_grants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  scope VARCHAR(20) NOT NULL,
  promo_code_id INTEGER NOT NULL REFERENCES t_p78828167_tutor_platform_1.access_promo_codes(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, scope)
);

-- Пилот школ Самары: бесплатные курсы раздела «Школьникам» до 31.05.2027 включительно (МСК).
INSERT INTO t_p78828167_tutor_platform_1.access_promo_codes (code, scope, description, expires_at)
VALUES ('САМАРА', 'school', 'Пилотный проект школ Самары: бесплатный доступ к курсам раздела «Школьникам»', '2027-05-31 23:59:59+03');