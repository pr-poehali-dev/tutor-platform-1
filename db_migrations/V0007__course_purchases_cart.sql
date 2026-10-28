ALTER TABLE t_p78828167_tutor_platform_1.course_purchases ADD COLUMN IF NOT EXISTS cart_id VARCHAR(40) NULL;
ALTER TABLE t_p78828167_tutor_platform_1.course_purchases ADD COLUMN IF NOT EXISTS base_kopecks INTEGER NULL;
CREATE INDEX IF NOT EXISTS idx_course_purchases_cart ON t_p78828167_tutor_platform_1.course_purchases (cart_id);