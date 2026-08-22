-- Редактор Ленты не поддерживает заголовки первого уровня и таблицы:
-- первые выводятся как обычный текст с решёткой, вторые — сплошной строкой.
-- Переводим заголовки на второй уровень, таблицу — в список.

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = regexp_replace(content, '(^|\n)# ', '\1## ', 'g')
WHERE slug IN (
  'ot-idei-do-prezentacii-razbor-biznes-proekta-na-realnyh-cifrah',
  'razgovor-kotoryy-otkladyvayut-polgoda-i-nayem-po-oshchushcheniyu'
);

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = replace(
  content,
  '| Статья | Сумма |
|---|---|
| Аренда 45 м² | 135 000 ₽ |
| Зарплаты (2 пекаря, 2 продавца) | 320 000 ₽ |
| Налоги и взносы с ФОТ | 96 000 ₽ |
| Коммунальные и вывоз | 28 000 ₽ |
| Обслуживание оборудования | 15 000 ₽ |
| Маркетинг | 30 000 ₽ |
| Прочее и резерв | 26 000 ₽ |
| **Итого** | **650 000 ₽** |',
  '- Аренда 45 м² — 135 000 ₽
- Зарплаты (2 пекаря, 2 продавца) — 320 000 ₽
- Налоги и взносы с ФОТ — 96 000 ₽
- Коммунальные и вывоз — 28 000 ₽
- Обслуживание оборудования — 15 000 ₽
- Маркетинг — 30 000 ₽
- Прочее и резерв — 26 000 ₽

**Итого: 650 000 ₽ в месяц.**'
)
WHERE slug = 'ot-idei-do-prezentacii-razbor-biznes-proekta-na-realnyh-cifrah';
