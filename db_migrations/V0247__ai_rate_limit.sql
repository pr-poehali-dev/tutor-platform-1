-- Простой rate-limiting для дорогих ИИ-эндпоинтов (защита от абуза анонимными запросами).
-- Считаем количество вызовов по ключу (обычно IP) в скользящем окне.
CREATE TABLE IF NOT EXISTS ai_rate_limit (
  bucket_key  VARCHAR(120) NOT NULL,   -- напр. 'fin-advisor:generate:<ip>'
  ts          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_rate_limit_key_ts ON ai_rate_limit(bucket_key, ts);