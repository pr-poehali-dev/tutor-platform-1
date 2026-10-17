-- Ответы на задания ОГЭ/ЕГЭ из мини-приложения: «задание дня» и прогресс по темам.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.exam_task_answers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  task_id VARCHAR(80) NOT NULL,
  subject VARCHAR(30) NOT NULL,
  exam VARCHAR(30) NOT NULL,
  topic VARCHAR(200) NOT NULL,
  correct BOOLEAN NOT NULL,
  is_daily BOOLEAN NOT NULL DEFAULT FALSE,
  source VARCHAR(20) NOT NULL DEFAULT 'max',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS exam_task_answers_user_idx ON t_p78828167_tutor_platform_1.exam_task_answers (user_id, created_at DESC);