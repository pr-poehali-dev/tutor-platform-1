-- Подписчики бота MAX на «задание дня» и настройки бота (выключатель рассылки, текст приветствия).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_bot_subscribers (
  max_user_id BIGINT PRIMARY KEY,
  chat_id BIGINT NULL,
  name VARCHAR(200) NULL,
  daily_task BOOLEAN NOT NULL DEFAULT TRUE,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ NULL,
  last_sent_on DATE NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS max_bot_subscribers_daily_idx ON t_p78828167_tutor_platform_1.max_bot_subscribers (daily_task, blocked, last_sent_on);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_bot_settings (
  id INT PRIMARY KEY DEFAULT 1,
  daily_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  welcome_text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT max_bot_settings_single CHECK (id = 1)
);
INSERT INTO t_p78828167_tutor_platform_1.max_bot_settings (id, daily_enabled, welcome_text)
VALUES (1, TRUE, 'Привет! Я бот УЧИСЬПРО.

Здесь ИИ-репетитор по всем школьным предметам: объяснит тему, разберёт домашку по фото и поможет готовиться к ОГЭ и ЕГЭ. Регистрироваться не нужно — просто нажмите «Открыть УЧИСЬПРО».

Каждый день в 17:00 я присылаю одно задание ОГЭ/ЕГЭ — 5 минут на тренировку. Отписаться можно кнопкой под любым заданием.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.max_bot_daily_log (
  id BIGSERIAL PRIMARY KEY,
  sent_on DATE NOT NULL,
  task_id VARCHAR(80) NOT NULL,
  sent INT NOT NULL DEFAULT 0,
  failed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);