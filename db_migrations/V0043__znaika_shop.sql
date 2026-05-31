-- Магазин ЗНАЕК: каталог товаров
CREATE TABLE IF NOT EXISTS znaika_shop_items (
    code         VARCHAR(64) PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    icon         VARCHAR(64) NOT NULL DEFAULT 'Gift',
    kind         VARCHAR(32) NOT NULL,         -- discount_coupon | bonus_days | cosmetic
    price        INTEGER NOT NULL,             -- цена в ЗНАЙКАХ
    payload      JSONB NOT NULL DEFAULT '{}',  -- параметры (percent, days, avatar и т.п.)
    tier         VARCHAR(16) NOT NULL DEFAULT 'common',
    sort_order   INTEGER NOT NULL DEFAULT 0,
    active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Инвентарь/покупки пользователя в магазине ЗНАЕК
CREATE TABLE IF NOT EXISTS znaika_redemptions (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    item_code    VARCHAR(64) NOT NULL,
    kind         VARCHAR(32) NOT NULL,
    price        INTEGER NOT NULL,
    coupon_code  VARCHAR(32),                  -- для скидочных купонов
    payload      JSONB NOT NULL DEFAULT '{}',
    status       VARCHAR(16) NOT NULL DEFAULT 'active', -- active | used | expired
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    used_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_znaika_redemptions_user ON znaika_redemptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_znaika_redemptions_coupon ON znaika_redemptions(coupon_code) WHERE coupon_code IS NOT NULL;

-- Каталог товаров (стартовый набор)
INSERT INTO znaika_shop_items (code, title, description, icon, kind, price, payload, tier, sort_order) VALUES
('discount_5',   'Скидка 5% на подписку',  'Купон на скидку 5% при оплате любого тарифа',  'Ticket',   'discount_coupon', 500,  '{"percent": 5}',   'common', 10),
('discount_10',  'Скидка 10% на подписку', 'Купон на скидку 10% при оплате любого тарифа', 'Ticket',   'discount_coupon', 1200, '{"percent": 10}',  'rare',   20),
('discount_15',  'Скидка 15% на подписку', 'Купон на скидку 15% при оплате любого тарифа', 'TicketPercent', 'discount_coupon', 2000, '{"percent": 15}', 'epic', 30),
('bonus_7days',  '+7 дней подписки',       'Добавим 7 дней к активной подписке',           'CalendarPlus', 'bonus_days', 1500, '{"days": 7}',  'rare', 40),
('avatar_rocket','Аватар «Космонавт»',     'Эксклюзивная картинка профиля',                'Rocket',   'cosmetic', 300,  '{"avatar": "rocket"}',  'common', 50),
('avatar_crown', 'Аватар «Чемпион»',       'Золотая корона для профиля',                   'Crown',    'cosmetic', 800,  '{"avatar": "crown"}',   'epic',   60),
('frame_gold',   'Золотая рамка профиля',  'Премиальная рамка вокруг аватара',             'Sparkles', 'cosmetic', 600,  '{"frame": "gold"}',     'rare',   70)
ON CONFLICT (code) DO NOTHING;