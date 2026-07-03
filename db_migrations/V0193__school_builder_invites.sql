-- Доступ в конструктор школ по персональному приглашению под email.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_builder_invites (
  id            SERIAL PRIMARY KEY,
  email         varchar(200) NOT NULL,
  token         varchar(80)  NOT NULL UNIQUE,
  lead_id       integer NULL,                 -- связь с partner_leads, если выдано из заявки
  status        varchar(20) DEFAULT 'pending', -- pending | accepted | revoked
  accepted_user_id bigint NULL,               -- кто активировал (auth_users.id)
  note          text NULL,
  created_at    timestamptz DEFAULT now(),
  accepted_at   timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sbi_email_active
  ON t_p78828167_tutor_platform_1.school_builder_invites (lower(email))
  WHERE status <> 'revoked';

CREATE INDEX IF NOT EXISTS idx_sbi_token
  ON t_p78828167_tutor_platform_1.school_builder_invites (token);

-- Флаг подтверждённого доступа к конструктору у пользователя школы.
ALTER TABLE t_p78828167_tutor_platform_1.schools
  ADD COLUMN IF NOT EXISTS builder_access boolean NOT NULL DEFAULT false;

-- Существующие школы (созданные до системы приглашений) сохраняют доступ.
UPDATE t_p78828167_tutor_platform_1.schools SET builder_access = true WHERE builder_access = false;