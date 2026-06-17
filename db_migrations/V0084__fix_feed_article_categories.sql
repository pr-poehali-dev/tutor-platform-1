-- Приводим категории статей к допустимым на фронте (FeedCategory):
-- курс по нейросетям -> ai, психологическая помощь -> education (нет wellbeing).
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET category = 'ai'
WHERE slug = 'besplatnyy-kurs-neyroseti-s-nulya-ot-pervogo-prompta-do-svoego-proekta';

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET category = 'education'
WHERE slug = 'besplatnaya-psihologicheskaya-pomoshch-onlayn-vy-ne-odni';
