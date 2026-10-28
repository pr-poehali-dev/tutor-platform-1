UPDATE t_p78828167_tutor_platform_1.feed_articles
SET content = rtrim(content) || $x$

## Что ещё почитать

- [Как свести продажи из МойСклад и Яндекс Метрики в один отчёт](/feed/kak-svesti-prodazhi-moysklad-i-yandex-metriku-v-odin-otchet) — та же схема для интернет-магазина: визиты, заказы и конверсия сайта в продажи на одном экране
- [Новые инструменты аналитики на mat-labs.ru](/feed/mat-labs-oblachnyy-bi-konveyer-dannyh-analitika-pod-klyuch) — обзор облачного BI, конвейера данных и аналитики под ключ
$x$,
    updated_at = NOW()
WHERE slug = 'kak-za-10-minut-sobrat-otchet-iz-1s-i-crm'
  AND content NOT LIKE '%kak-svesti-prodazhi-moysklad-i-yandex-metriku-v-odin-otchet%'