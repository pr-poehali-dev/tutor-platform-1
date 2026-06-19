INSERT INTO t_p78828167_tutor_platform_1.max_links (user_id, link_code, status)
VALUES (1, 'TEST99', 'pending')
ON CONFLICT (user_id) DO UPDATE SET link_code='TEST99', status='pending';