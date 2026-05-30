-- Удаляем избыточный UNIQUE constraint на phone в auth_users.
-- Он запрещал двум пользователям иметь пустой phone (''),
-- из-за чего вторая регистрация падала с unique constraint violation.
-- Корректный частичный уникальный индекс auth_users_phone_uniq_idx
-- (WHERE phone IS NOT NULL AND phone <> '') остаётся и работает.
ALTER TABLE t_p78828167_tutor_platform_1.auth_users DROP CONSTRAINT IF EXISTS auth_users_phone_key CASCADE;