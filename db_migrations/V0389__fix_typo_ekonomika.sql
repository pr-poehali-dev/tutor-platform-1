UPDATE feed_articles
SET content = replace(content, 'physика', 'физика'),
    updated_at = now()
WHERE slug = 'ekonomika-repetitorstva-pochemu-chas-stoit-1500';