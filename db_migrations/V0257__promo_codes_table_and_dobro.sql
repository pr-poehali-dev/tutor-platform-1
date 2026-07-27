-- Промокоды-скидки на курсы и подписки (вводятся вручную при оплате).
-- Скидка считается на сервере. Промокоды можно менять/добавлять без выкатки кода.
CREATE TABLE IF NOT EXISTS promo_codes (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(40) NOT NULL,              -- сам промокод (сравнение регистронезависимое)
  percent       INT NOT NULL CHECK (percent > 0 AND percent <= 100),
  description   TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at     TIMESTAMPTZ,                        -- NULL = без ограничения снизу
  expires_at    TIMESTAMPTZ,                        -- NULL = бессрочно
  max_uses      INT,                                -- NULL = без лимита
  used_count    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_codes_code_upper ON promo_codes (UPPER(code));

-- Промокод ДОБРО: скидка 30% на все курсы и подписки до конца 2026 года.
INSERT INTO promo_codes (code, percent, description, active, expires_at)
VALUES ('ДОБРО', 30, 'Скидка 30% на все курсы и услуги до конца года', TRUE, '2026-12-31T23:59:59+03:00')
ON CONFLICT DO NOTHING;