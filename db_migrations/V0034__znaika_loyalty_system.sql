-- Sistema vnutrenney valuty ZNAYKI dlya loyalnosti i geymifikatsii
-- Kurs: 1 rub = 1 ZNAYKA. Limit oplaty kursa: do 30%.

CREATE TABLE IF NOT EXISTS znaika_balances (
    user_id           BIGINT PRIMARY KEY REFERENCES auth_users(id),
    balance           INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned      INTEGER NOT NULL DEFAULT 0,
    total_spent       INTEGER NOT NULL DEFAULT 0,
    current_streak    INTEGER NOT NULL DEFAULT 0,
    longest_streak    INTEGER NOT NULL DEFAULT 0,
    last_check_in     DATE,
    level             INTEGER NOT NULL DEFAULT 1,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS znaika_transactions (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES auth_users(id),
    amount       INTEGER NOT NULL,
    kind         VARCHAR(20) NOT NULL,
    reason       VARCHAR(50) NOT NULL,
    description  TEXT,
    meta         JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_znaika_tx_user_created ON znaika_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_znaika_tx_reason       ON znaika_transactions(reason);

CREATE TABLE IF NOT EXISTS znaika_achievements (
    code         VARCHAR(50) PRIMARY KEY,
    title        VARCHAR(120) NOT NULL,
    description  TEXT NOT NULL,
    icon         VARCHAR(40) NOT NULL,
    reward       INTEGER NOT NULL DEFAULT 0,
    tier         VARCHAR(20) NOT NULL DEFAULT 'common',
    sort_order   INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS znaika_user_achievements (
    user_id          BIGINT NOT NULL REFERENCES auth_users(id),
    achievement_code VARCHAR(50) NOT NULL REFERENCES znaika_achievements(code),
    earned_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, achievement_code)
);

CREATE TABLE IF NOT EXISTS znaika_daily_limits (
    user_id     BIGINT NOT NULL REFERENCES auth_users(id),
    reason      VARCHAR(50) NOT NULL,
    day         DATE NOT NULL,
    count       INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, reason, day)
);

INSERT INTO znaika_achievements (code, title, description, icon, reward, tier, sort_order) VALUES
    ('first_steps',    'Pervye shagi',      'Zaregistrirovalsya na UCHISPRO',     'Sparkles',      100,  'common',    10),
    ('first_lesson',   'Pervyy urok',       'Proshel pervyy urok',                'BookOpen',      50,   'common',    20),
    ('streak_7',       'Nedelya v potoke',  '7 dney vhoda podryad',               'Flame',         200,  'rare',      30),
    ('streak_30',      'Marafonets',        '30 dney vhoda podryad',              'Trophy',        1000, 'epic',      40),
    ('streak_100',     'Zheleznaya volya',  '100 dney vhoda podryad',             'Crown',         5000, 'legendary', 50),
    ('lessons_10',     'Staratelnyy',       'Proshel 10 urokov',                  'GraduationCap', 150,  'common',    60),
    ('lessons_50',     'Znatok',            'Proshel 50 urokov',                  'Award',         500,  'rare',      70),
    ('lessons_100',    'Erudit',            'Proshel 100 urokov',                 'Medal',         1500, 'epic',      80),
    ('first_purchase', 'Poveril v sebya',   'Pervaya pokupka kursa',              'ShoppingBag',   300,  'rare',      90),
    ('referral_1',     'Rasskazhi drugu',   'Privel pervogo druga',               'UserPlus',      500,  'rare',     100),
    ('referral_5',     'Ambasador',         'Privel 5 druzey',                    'Users',         2500, 'epic',     110),
    ('review_1',       'Golos pravdy',      'Ostavil pervyy otzyv',               'MessageSquare', 100,  'common',   120),
    ('know_yourself',  'Poznal sebya',      'Proshel test na proforientatsiyu',   'Compass',       200,  'rare',     130),
    ('exam_master',    'Pokoritel EGE',     'Sdal probnyy EGE na 80+ ballov',     'Target',        1000, 'epic',     140)
ON CONFLICT (code) DO NOTHING;
