-- Почтовая система: журнал отправок и токены восстановления пароля.

-- Журнал писем. Нужен, чтобы видеть, что реально ушло клиенту, не слать
-- дубли и разбираться, если человек говорит «письмо не пришло».
CREATE TABLE IF NOT EXISTS email_log (
  id            BIGSERIAL PRIMARY KEY,
  to_email      VARCHAR(320) NOT NULL,
  kind          VARCHAR(40)  NOT NULL,
  subject       VARCHAR(400) NOT NULL DEFAULT '',
  status        VARCHAR(20)  NOT NULL DEFAULT 'sent',
  error         TEXT         NULL,
  user_id       BIGINT       NULL,
  order_id      INTEGER      NULL,
  meta          JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_kind    ON email_log (kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_to      ON email_log (to_email);

-- Токены восстановления пароля. Храним ТОЛЬКО хеш токена: если база утечёт,
-- по ней нельзя будет войти в чужой аккаунт.
CREATE TABLE IF NOT EXISTS password_resets (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT       NOT NULL,
  token_hash  VARCHAR(64)  NOT NULL,
  expires_at  TIMESTAMPTZ  NOT NULL,
  used_at     TIMESTAMPTZ  NULL,
  request_ip  VARCHAR(64)  NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pwreset_token ON password_resets (token_hash);
CREATE INDEX IF NOT EXISTS idx_pwreset_user  ON password_resets (user_id, created_at DESC);

-- Отметка о напоминании по брошенному заказу: шлём его один раз и только
-- по-настоящему брошенным заказам, а не всем подряд.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS abandon_mailed_at TIMESTAMP NULL;

-- Согласие на письма. По умолчанию TRUE для сервисных писем (пароль, чек),
-- но даёт возможность отписаться от маркетинговых.
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS welcome_mailed_at TIMESTAMPTZ NULL;