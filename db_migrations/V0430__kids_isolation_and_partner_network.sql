-- ЧАСТЬ 1. Изоляция модуля «Малыш» + бесплатный триал 90 дней.
--
-- Было: доступ к детскому разделу давала ЛЮБАЯ активная подписка платформы
-- (has_subscription), и наоборот — подписка «Малыш» открывала школьные курсы.
-- Модули пересекались, продавать их отдельно было невозможно.
-- Стало: детский раздел открывает только план 'kids' (или его триал).

-- Триал «Малыша»: 3 месяца бесплатно, без карты. Одна запись на пользователя.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.kids_trials (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL UNIQUE
                REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  converted_at  TIMESTAMPTZ NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kids_trials_expires
  ON t_p78828167_tutor_platform_1.kids_trials(expires_at);

-- ЧАСТЬ 2. Партнёрская программа сетевого типа (3 линии).
--
-- Существующая механика «+7 дней и ЗНАЙКИ за друга» остаётся для всех
-- пользователей как дружеская. Денежные проценты — отдельный слой:
-- их получают только те, кто активировал статус Партнёра.

-- Анкета партнёра. Дерево строится по полю parent_partner_id.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.partners (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              BIGINT NOT NULL UNIQUE
                       REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  -- Кто пригласил партнёра. NULL — пришёл сам, вершина ветки.
  parent_partner_id    BIGINT NULL
                       REFERENCES t_p78828167_tutor_platform_1.partners(id),
  status               VARCHAR(20) NOT NULL DEFAULT 'active',
  -- Денежный баланс в копейках: комиссии копятся тут, выводятся по заявке.
  balance_kopecks      BIGINT NOT NULL DEFAULT 0,
  total_earned_kopecks BIGINT NOT NULL DEFAULT 0,
  -- Реквизиты для выплаты (карта или телефон СБП), заполняет сам партнёр.
  payout_method        VARCHAR(20) NULL,
  payout_details       VARCHAR(200) NULL,
  activated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_partners_parent
  ON t_p78828167_tutor_platform_1.partners(parent_partner_id);

-- Начисления комиссий. Одна строка = одна выплата одному партнёру
-- с одного платежа. По линиям 1/2/3 создаётся до трёх строк.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.partner_commissions (
  id              BIGSERIAL PRIMARY KEY,
  partner_id      BIGINT NOT NULL
                  REFERENCES t_p78828167_tutor_platform_1.partners(id),
  -- Чей платёж породил комиссию.
  source_user_id  BIGINT NOT NULL
                  REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  -- Линия: 1 — личное приглашение, 2 — приглашённый приглашённого, 3 — третий уровень.
  line            SMALLINT NOT NULL CHECK (line BETWEEN 1 AND 3),
  percent         NUMERIC(5,2) NOT NULL,
  base_kopecks    BIGINT NOT NULL,
  amount_kopecks  BIGINT NOT NULL,
  source_kind     VARCHAR(20) NOT NULL,
  source_id       BIGINT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'accrued',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pc_partner ON t_p78828167_tutor_platform_1.partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_pc_source ON t_p78828167_tutor_platform_1.partner_commissions(source_kind, source_id);
-- Защита от двойного начисления: один платёж — одна комиссия на линию.
CREATE UNIQUE INDEX IF NOT EXISTS uq_pc_once
  ON t_p78828167_tutor_platform_1.partner_commissions(source_kind, source_id, line)
  WHERE source_id IS NOT NULL;

-- Заявки на вывод. Минимум 1000 ₽, обработка вручную через админку.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.partner_payouts (
  id              BIGSERIAL PRIMARY KEY,
  partner_id      BIGINT NOT NULL
                  REFERENCES t_p78828167_tutor_platform_1.partners(id),
  amount_kopecks  BIGINT NOT NULL,
  method          VARCHAR(20) NULL,
  details         VARCHAR(200) NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'requested',
  admin_note      TEXT NULL,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at    TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_pp_partner ON t_p78828167_tutor_platform_1.partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_pp_status ON t_p78828167_tutor_platform_1.partner_payouts(status);
