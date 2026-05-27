-- Этап 1: уведомления, рефералы, отзывы, обращения, родительская привязка
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES auth_users(id),
    kind VARCHAR(40) NOT NULL,
    title VARCHAR(300) NOT NULL,
    body TEXT,
    icon VARCHAR(40),
    url VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS referral_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES auth_users(id),
    code VARCHAR(20) NOT NULL UNIQUE,
    invited_count INTEGER NOT NULL DEFAULT 0,
    rewards_earned_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refcodes_code ON referral_codes(code);

CREATE TABLE IF NOT EXISTS referral_invites (
    id BIGSERIAL PRIMARY KEY,
    inviter_user_id BIGINT NOT NULL REFERENCES auth_users(id),
    invited_user_id BIGINT NOT NULL REFERENCES auth_users(id),
    code_used VARCHAR(20) NOT NULL,
    bonus_days_inviter INTEGER NOT NULL DEFAULT 7,
    bonus_days_invited INTEGER NOT NULL DEFAULT 7,
    status VARCHAR(20) NOT NULL DEFAULT 'registered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(invited_user_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES auth_users(id),
    author_name VARCHAR(160) NOT NULL,
    author_role VARCHAR(40) NOT NULL DEFAULT 'student',
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT NOT NULL,
    avatar_url VARCHAR(600),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    moderated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(status, created_at DESC);

CREATE TABLE IF NOT EXISTS feedback_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES auth_users(id),
    contact_name VARCHAR(160) NOT NULL,
    contact_email VARCHAR(200),
    contact_phone VARCHAR(40),
    subject VARCHAR(40) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    answer TEXT,
    answered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_requests(status, created_at DESC);

CREATE TABLE IF NOT EXISTS parent_child_links (
    id BIGSERIAL PRIMARY KEY,
    parent_user_id BIGINT NOT NULL REFERENCES auth_users(id),
    child_user_id BIGINT NOT NULL REFERENCES auth_users(id),
    child_nickname VARCHAR(160),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(parent_user_id, child_user_id)
);
