-- Восстанавливаем работу модуля «УЧИСЬПРО Малыш»: сохранение прогресса/настроек/экранного времени
-- ломалось из-за лишней колонки user_id NOT NULL без DEFAULT. Код идентифицирует ребёнка по user_uid (PK).
-- Задаём DEFAULT 0, чтобы вставки без явного user_id проходили (значение подставится автоматически).
ALTER TABLE t_p78828167_tutor_platform_1.kids_progress ALTER COLUMN user_id SET DEFAULT 0;
ALTER TABLE t_p78828167_tutor_platform_1.kids_parent_controls ALTER COLUMN user_id SET DEFAULT 0;
ALTER TABLE t_p78828167_tutor_platform_1.kids_screen_time ALTER COLUMN user_id SET DEFAULT 0;