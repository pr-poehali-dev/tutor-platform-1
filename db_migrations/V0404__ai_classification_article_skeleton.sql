INSERT INTO t_p78828167_tutor_platform_1.feed_articles
(slug, title, summary, content, category, cover_url, source_kind, source_name,
 author_display_name, status, tags, reading_time_min, ai_processed, published_at,
 auto_moderation_verdict, auto_moderation_score)
SELECT
 'klassifikaciya-neyrosetey-2026',
 'Моделей стало слишком много: рабочая классификация нейросетей 2026 и что изменила GPT-6 Astra',
 $s$Рейтинги «топ-10 нейросетей» устаревают за месяц и не отвечают на главный вопрос — какую модель брать под свою задачу. Разбираем нейросети по четырём осям классификации, честно сравниваем флагманы после выхода GPT-6 Astra 3 сентября, объясняем, почему побеждает не самая умная модель, а самая уместная — и куда движется специализация.$s$,
 $art$Черновик.$art$,
 'ai',
 'https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/10a80b5f-cd41-4cac-98ff-67efcdbcc0e7.jpg',
 'editorial', 'УЧИСЬПРО', 'Редакция УЧИСЬПРО', 'draft',
 '["нейросети","GPT-6","классификация ИИ","выбор модели","ИИ-агенты","рассуждающие модели","GigaChat","YandexGPT","тренды ИИ","промпт-инжиниринг"]'::jsonb,
 13, true, now(), 'approved', 97
WHERE NOT EXISTS (
  SELECT 1 FROM t_p78828167_tutor_platform_1.feed_articles
  WHERE slug = 'klassifikaciya-neyrosetey-2026'
);