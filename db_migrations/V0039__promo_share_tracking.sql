-- Трекинг репостов и переходов по публичным промо-ссылкам (акция ДОБРО и др.)
CREATE TABLE IF NOT EXISTS promo_shares (
    id          BIGSERIAL PRIMARY KEY,
    promo       VARCHAR(40) NOT NULL DEFAULT 'dobro',
    event       VARCHAR(20) NOT NULL,          -- 'share' (клик по кнопке) | 'visit' (переход по ссылке)
    channel     VARCHAR(20),                   -- vk | tg | wa | copy | direct
    ref_code    VARCHAR(40),                   -- реф-код источника, если есть
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_promo_shares_promo ON promo_shares(promo, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promo_shares_channel ON promo_shares(channel);
