-- Статья МЦКО: ссылка на бесплатный тренажёр в формате диагностик.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = replace(content,
  E'## Чем поможет УЧИСЬПРО\n\n- ',
  E'## Чем поможет УЧИСЬПРО\n\n- [Тренажёр в формате МЦКО](/trenazher-mcko) — бесплатные варианты по математике, русскому языку, читательской и функциональной грамотности с автопроверкой и разбором каждой ошибки.\n- ')
WHERE slug = 'mcko-chto-eto-i-kak-gotovitsya' AND content NOT LIKE '%/trenazher-mcko%'