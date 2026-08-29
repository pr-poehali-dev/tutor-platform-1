-- Помечаем тестовый отзыв, чтобы он не выглядел как настоящая оценка ученика
UPDATE t_p78828167_tutor_platform_1.content_feedback
SET content_id = 'ТЕСТ: проверка связи (не учитывать)',
    user_comment = 'Служебная проверка работоспособности сбора оценок'
WHERE content_id = 'проверка связи';

-- Сбрасываем счётчики агента: тестовый отзыв не должен влиять на метрики
UPDATE t_p78828167_tutor_platform_1.ai_agents
SET avg_rating = 0, total_interactions = 0, success_count = 0
WHERE agent_key = 'lesson_teacher';
