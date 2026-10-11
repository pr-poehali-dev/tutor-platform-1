-- Оплата курса 95 по email (без входа) записалась только в intensive_access. Переносим её в course_purchases владельца email.
INSERT INTO t_p78828167_tutor_platform_1.course_purchases (user_id, course_id, amount_kopecks, payment_provider, payment_id, status, purchased_at)
SELECT u.id, 95, 499, 'yookassa', ia.payment_id, 'paid', ia.activated_at
FROM t_p78828167_tutor_platform_1.intensive_access ia
JOIN t_p78828167_tutor_platform_1.auth_users u ON lower(u.email) = lower(ia.email)
WHERE ia.track = 'course-95' AND ia.status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM t_p78828167_tutor_platform_1.course_purchases cp WHERE cp.user_id = u.id AND cp.course_id = 95 AND cp.status = 'paid');