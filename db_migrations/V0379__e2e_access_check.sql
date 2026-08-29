-- Служебная проверка выдачи доступа после оплаты (сквозной тест).
-- Имитируем то, что делает webhook ЮKassa при успешном платеже,
-- чтобы убедиться: покупатель курса получает доступ по своей почте.
INSERT INTO t_p78828167_tutor_platform_1.intensive_access
  (email, name, track, access_token, order_number, payment_id, amount, status, activated_at)
VALUES
  ('e2e-1788026318@uchispro.ru', 'СЛУЖЕБНАЯ ПРОВЕРКА (не клиент)', 'course-1',
   'e2e-check-token-20260829', 'YK-20260829-85E6F354',
   '3225318f-000f-5001-9000-18dc08ce4abd', 1290.00, 'paid', NOW());
