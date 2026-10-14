-- Статья МЦКО: ссылки без обрамления жирным и маркированные списки вместо нумерованных (Лента не поддерживает эту разметку).
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(
  regexp_replace(
    regexp_replace(content, '\*\*(\[[^]]+\]\([^)]+\))\*\*', '\1', 'g'),
    E'\n([1-4])\\. \\*\\*Неделя', E'\n- **Неделя', 'g'),
  E'\n[1-4]\\. ', E'\n- ', 'g')
WHERE slug = 'mcko-chto-eto-i-kak-gotovitsya'