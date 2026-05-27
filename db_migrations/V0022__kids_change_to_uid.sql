-- Перевод модуля Малыш с user_id (int) на user_uid (text).
-- Таблицы ещё пустые.

ALTER TABLE kids_progress DROP CONSTRAINT IF EXISTS kids_progress_pkey;
ALTER TABLE kids_progress ADD COLUMN IF NOT EXISTS user_uid TEXT;
UPDATE kids_progress SET user_uid = COALESCE(user_uid, '') WHERE user_uid IS NULL;
ALTER TABLE kids_progress ADD CONSTRAINT kids_progress_pkey PRIMARY KEY (user_uid);

ALTER TABLE kids_parent_controls DROP CONSTRAINT IF EXISTS kids_parent_controls_pkey;
ALTER TABLE kids_parent_controls ADD COLUMN IF NOT EXISTS user_uid TEXT;
UPDATE kids_parent_controls SET user_uid = COALESCE(user_uid, '') WHERE user_uid IS NULL;
ALTER TABLE kids_parent_controls ADD CONSTRAINT kids_parent_controls_pkey PRIMARY KEY (user_uid);

DROP INDEX IF EXISTS idx_kids_screen_time_user;
ALTER TABLE kids_screen_time DROP CONSTRAINT IF EXISTS kids_screen_time_pkey;
ALTER TABLE kids_screen_time ADD COLUMN IF NOT EXISTS user_uid TEXT;
UPDATE kids_screen_time SET user_uid = COALESCE(user_uid, '') WHERE user_uid IS NULL;
ALTER TABLE kids_screen_time ADD CONSTRAINT kids_screen_time_pkey PRIMARY KEY (user_uid, day);
CREATE INDEX idx_kids_screen_time_user ON kids_screen_time(user_uid, day DESC);
