-- Modul Otdela marketinga

-- Zadachi mezhdu otdelami (marketing -> sales i v obratnuyu)
CREATE TABLE IF NOT EXISTS marketing_tasks (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    assigned_to   VARCHAR(20) NOT NULL DEFAULT 'sales',
    created_by    VARCHAR(20) NOT NULL DEFAULT 'marketing',
    priority      VARCHAR(10) NOT NULL DEFAULT 'medium',
    status        VARCHAR(20) NOT NULL DEFAULT 'todo',
    segment_code  VARCHAR(50),
    target_metric VARCHAR(50),
    target_value  NUMERIC(12,2),
    due_date      DATE,
    completed_at  TIMESTAMPTZ,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_status   ON marketing_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_assigned ON marketing_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_mkt_tasks_created  ON marketing_tasks(created_at DESC);

-- Klientskie segmenty (RFM, VIP, spyaschie i t.p.)
CREATE TABLE IF NOT EXISTS marketing_segments (
    code         VARCHAR(50) PRIMARY KEY,
    title        VARCHAR(120) NOT NULL,
    description  TEXT,
    rule_json    JSONB,
    color        VARCHAR(20) DEFAULT 'purple',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sohranennye strategii i ai-otchety
CREATE TABLE IF NOT EXISTS marketing_strategies (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    period_days  INTEGER NOT NULL DEFAULT 30,
    generated_by VARCHAR(20) NOT NULL DEFAULT 'algo',
    swot         JSONB,
    funnel       JSONB,
    cohorts      JSONB,
    channels     JSONB,
    rfm          JSONB,
    ideas        JSONB,
    plan         JSONB,
    raw_text     TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mkt_strategies_created ON marketing_strategies(created_at DESC);

-- Bazovye segmenty
INSERT INTO marketing_segments (code, title, description, rule_json, color) VALUES
    ('vip',      'VIP-pokupateli',     'Bolee 2 pokupok, sredniy chek vyshe srednego',
     '{"min_orders": 2, "min_aov": 2000}'::jsonb, 'amber'),
    ('regulars', 'Postoyannye',        'Pokupali 1-2 raza, aktivny v poslednie 30 dney',
     '{"min_orders": 1, "last_login_days": 30}'::jsonb, 'emerald'),
    ('sleeping', 'Spyashchie',         'Pokupali, no ne zahodili 30+ dney',
     '{"min_orders": 1, "last_login_days_min": 30}'::jsonb, 'rose'),
    ('hot_lead', 'Goryachie lidy',     'Zarestrirovalis, no ne kupili. Aktivny 7 dney',
     '{"max_orders": 0, "last_login_days": 7}'::jsonb, 'purple'),
    ('cold',     'Holodnye',           'Nikogda ne zahodili posle registracii',
     '{"max_orders": 0, "never_logged_in": true}'::jsonb, 'gray')
ON CONFLICT (code) DO NOTHING;
