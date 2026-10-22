-- Проверочная заявка репетитора помечается как тестовая, чтобы не попасть в работу.
UPDATE t_p78828167_tutor_platform_1.tutor_leads SET status = 'test' WHERE max_user_id = 999000111;