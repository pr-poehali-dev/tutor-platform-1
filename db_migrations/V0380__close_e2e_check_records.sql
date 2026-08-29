-- Закрываем служебные записи сквозной проверки, чтобы они не выглядели
-- как реальные покупки и не мешали отчётности по продажам.
UPDATE t_p78828167_tutor_platform_1.intensive_access
SET status = 'canceled'
WHERE access_token = 'e2e-check-token-20260829';

UPDATE t_p78828167_tutor_platform_1.orders
SET status = 'canceled',
    user_name = 'СЛУЖЕБНАЯ ПРОВЕРКА (не клиент)'
WHERE order_number IN ('YK-20260829-85E6F354', 'YK-20260829-57C26477');
