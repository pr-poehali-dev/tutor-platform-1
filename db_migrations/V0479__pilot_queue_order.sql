-- Отдельный порядок очереди рассылки: вторая волна городов (21 город) — перед регионами.
ALTER TABLE t_p78828167_tutor_platform_1.pilot_cities
  ADD COLUMN IF NOT EXISTS queue_order INT NOT NULL DEFAULT 100;

UPDATE t_p78828167_tutor_platform_1.pilot_cities SET queue_order = CASE wave
  WHEN 0 THEN 10
  WHEN 1 THEN 20
  WHEN 3 THEN 30
  WHEN 2 THEN 40
  ELSE 100 END;