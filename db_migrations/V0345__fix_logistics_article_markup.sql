-- Подстраховка от дефектов редактора Ленты: H1 не рендерится, «---» видно как текст.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(
      regexp_replace(content, '(^|\n)# ', '\1## ', 'g'),
      '\n+---\n+', E'\n\n', 'g')
WHERE slug = 'chto-gruzoperevozki-govoryat-ob-ekonomike-2026';

-- Закреплённой оставляем только новую статью.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET is_pinned = false
WHERE is_pinned = true
  AND slug <> 'chto-gruzoperevozki-govoryat-ob-ekonomike-2026';
