-- Переключаем curriculum_designer на быструю модель Gemini Flash через polza.
-- Gemini Flash в 2-3 раза быстрее gpt-4o-mini, что критично для нашего 14-сек deadline.
UPDATE ai_agents
SET model = 'google/gemini-2.0-flash-exp',
    temperature = 0.55,
    updated_at = NOW()
WHERE agent_key = 'curriculum_designer';
