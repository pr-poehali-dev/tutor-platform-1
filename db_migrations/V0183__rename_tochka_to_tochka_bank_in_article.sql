UPDATE feed_articles
SET
  summary = REPLACE(summary, 'на примере банка Точка', 'на примере Точка Банк'),
  content = REPLACE(
              REPLACE(content, 'партнёрство УЧИСЬПРО и банка Точка. Точка — банк, который изначально создавался', 'партнёрство УЧИСЬПРО и Точка Банк. Точка Банк изначально создавался'),
              'За вами стоит банк', 'За вами стоит Точка Банк')
WHERE slug = 'partnyorskie-programmy-s-bankom-tochka';