-- Цены в старых статьях Ленты приведены к новой ценовой политике.
-- «Нейросети с нуля»: 12 900 → 5 990 ₽ (выровнено с курсом «Нейросети PRO»).
-- Промокод ДОБРО −30%: 5 990 ₽ → 4 193 ₽.
UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = replace(content, 'Нейросети — 12 900 ₽', 'Нейросети — 5 990 ₽'), updated_at = NOW()
WHERE id = 209;

UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = replace(content, 'за 12 900 ₽ — в 9 030 ₽', 'за 5 990 ₽ — в 4 193 ₽'), updated_at = NOW()
WHERE id = 632;