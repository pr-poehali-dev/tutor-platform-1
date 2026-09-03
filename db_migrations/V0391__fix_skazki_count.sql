UPDATE feed_articles
SET content = replace(replace(content, '47 сказок', '43 сказки'), 'Сорок семь озвученных сказок', 'Сорок три озвученные сказки'),
    updated_at = now()
WHERE content LIKE '%47 сказок%' OR content LIKE '%Сорок семь озвученных сказок%';