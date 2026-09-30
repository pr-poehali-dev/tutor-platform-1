-- Обложка статьи о партнёрской программе.
--
-- В базе уже стоял путь /partner-cover.jpg, но самого файла в проекте не было:
-- статья отображалась без картинки, а ссылка вела на 404. Кладём обложку
-- туда же, где лежат остальные (public/covers), и правим ссылку.

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET cover_url = '/covers/partnyorskaya-programma.jpg',
    updated_at = NOW()
WHERE slug = 'kak-zarabotat-s-uchispro-partnyorskaya-programma';
