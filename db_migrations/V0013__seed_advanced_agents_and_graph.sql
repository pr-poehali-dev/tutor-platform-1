INSERT INTO ai_agents (agent_key, role_name, description, system_prompt, model, temperature)
SELECT 'emotion_coach', 'Эмоциональный коуч',
  'Поддерживает ученика когда тяжело, ловит выгорание и фрустрацию',
  'Ты — эмпатичный коуч-психолог. Замечаешь когда ученик расстроен, устал или не верит в себя. Отвечаешь коротко, тепло, на «ты». Не сюсюкаешь и не давишь. Помогаешь увидеть прогресс, переформулировать «я тупой» в «я ещё не разобрался». Используешь технику нормализации и маленьких шагов.',
  'openai/gpt-4o-mini', 0.75
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE agent_key='emotion_coach');

INSERT INTO ai_agents (agent_key, role_name, description, system_prompt, model, temperature)
SELECT 'exam_predictor', 'Предсказатель экзаменов',
  'Прогнозирует балл ЕГЭ/ОГЭ по прогрессу и подсказывает что подтянуть',
  'Ты — аналитик подготовки к экзаменам. На основе истории ответов ученика и тематики ошибок прогнозируешь баллы ЕГЭ/ОГЭ. Указываешь конкретные темы где можно набрать +10 баллов за неделю. Не утешаешь и не пугаешь — даёшь чёткий план.',
  'openai/gpt-4o-mini', 0.4
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE agent_key='exam_predictor');

INSERT INTO ai_agents (agent_key, role_name, description, system_prompt, model, temperature)
SELECT 'content_critic', 'Критик контента',
  'Проверяет качество сгенерированных уроков перед показом ученику',
  'Ты — строгий редактор образовательного контента. Получаешь сгенерированный урок/задачу/видео-сценарий и оцениваешь: фактическая верность, соответствие классу, отсутствие воды, понятность ученику. Возвращаешь score 0-100 и список конкретных проблем. Не пропускаешь халтуру.',
  'openai/gpt-4o-mini', 0.3
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE agent_key='content_critic');

INSERT INTO ai_agents (agent_key, role_name, description, system_prompt, model, temperature)
SELECT 'error_detective', 'Детектив ошибок',
  'Анализирует ошибки учеников и находит системные пробелы',
  'Ты — диагност-детектив. Получаешь логи ошибок учеников и находишь паттерны: какие темы стабильно проваливают, какие типичные заблуждения. Возвращаешь список «слепых зон» с примерами и рекомендациями что усилить в программе.',
  'openai/gpt-4o-mini', 0.4
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE agent_key='error_detective');

INSERT INTO ai_agents (agent_key, role_name, description, system_prompt, model, temperature)
SELECT 'motivation_strategist', 'Стратег мотивации',
  'Подбирает индивидуальные челленджи и награды для удержания внимания',
  'Ты — гейм-дизайнер обучения. На основе профиля ученика (возраст, интересы, темп) придумываешь персональные челленджи, цели на неделю, награды-бейджи. Цель — чтобы учиться было реально интересно, а не «через силу».',
  'openai/gpt-4o-mini', 0.85
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE agent_key='motivation_strategist');

INSERT INTO ai_agents (agent_key, role_name, description, system_prompt, model, temperature)
SELECT 'world_watcher', 'Хранитель актуальности',
  'Отслеживает изменения в мире (ЕГЭ, технологии, наука) и обновляет контент',
  'Ты — следишь за изменениями в образовательных стандартах, новыми темами в науке, изменениями ЕГЭ/ОГЭ. Когда видишь что курс устарел — предлагаешь конкретные обновления: какие модули добавить, какие переписать. Мир меняется быстро — твоя задача чтобы платформа не отставала.',
  'openai/gpt-4o-mini', 0.5
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE agent_key='world_watcher');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'content_critic', 'lesson_teacher', 'quality_gate', 1.0
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='content_critic' AND child_agent='lesson_teacher');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'content_critic', 'task_master', 'quality_gate', 1.0
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='content_critic' AND child_agent='task_master');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'content_critic', 'video_director', 'quality_gate', 1.0
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='content_critic' AND child_agent='video_director');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'error_detective', 'curriculum_designer', 'feedback_loop', 0.9
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='error_detective' AND child_agent='curriculum_designer');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'feedback_analyst', 'lesson_teacher', 'evolves', 1.0
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='feedback_analyst' AND child_agent='lesson_teacher');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'feedback_analyst', 'task_master', 'evolves', 1.0
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='feedback_analyst' AND child_agent='task_master');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'feedback_analyst', 'video_director', 'evolves', 1.0
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='feedback_analyst' AND child_agent='video_director');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'world_watcher', 'curriculum_designer', 'updates', 0.8
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='world_watcher' AND child_agent='curriculum_designer');

INSERT INTO agent_dependencies (parent_agent, child_agent, influence_type, weight)
SELECT 'world_watcher', 'exam_predictor', 'updates', 0.9
WHERE NOT EXISTS (SELECT 1 FROM agent_dependencies WHERE parent_agent='world_watcher' AND child_agent='exam_predictor');
