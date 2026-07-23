-- Добавляем в статью-анонс ссылку на B2B-страницу корпоративного обучения.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = content || E'\n\nПодробнее о направлении и заявка для компаний — на странице «Корпоративное обучение»: /corporate'
WHERE slug = 'korporativnoe-obuchenie-master-produkta'
  AND content NOT LIKE '%/corporate%';
