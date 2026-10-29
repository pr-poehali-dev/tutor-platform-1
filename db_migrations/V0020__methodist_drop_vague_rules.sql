UPDATE t_p78828167_tutor_platform_1.ai_knowledge_base SET pattern_type = 'rule_rejected'
WHERE agent_key = 'lesson_teacher' AND pattern_type = 'rule' AND subject = 'marketing'
  AND content LIKE 'Каждый этап урока должен содержать%';