-- Редактор Ленты не рендерит заголовки первого уровня — выводит их
-- обычным текстом с решёткой. Переводим на второй уровень.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(content, '(^|\n)# ', '\1## ', 'g')
WHERE slug = 'dopolnitelnyy-zarabotok-2026-analiticheskaya-zapiska';

-- Снимаем закрепление с предыдущей статьи, чтобы новая была первой.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET is_pinned = false
WHERE slug = 'ya-dumal-eto-delaet-petrov-pochemu-zadachi-provisayut';
