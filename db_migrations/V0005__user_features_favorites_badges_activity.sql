-- Избранные курсы, история просмотров, мои курсы (с прогрессом), бейджи, активность

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.user_favorites (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(64) NOT NULL,
    course_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_uid, course_id)
);
CREATE INDEX IF NOT EXISTS idx_fav_user ON t_p78828167_tutor_platform_1.user_favorites(user_uid);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.user_course_history (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(64) NOT NULL,
    course_id INTEGER NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_uid, course_id)
);
CREATE INDEX IF NOT EXISTS idx_hist_user_viewed ON t_p78828167_tutor_platform_1.user_course_history(user_uid, viewed_at DESC);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.user_my_courses (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(64) NOT NULL,
    course_id INTEGER NOT NULL,
    subject VARCHAR(32) NOT NULL,
    grade VARCHAR(16) NOT NULL,
    course_title VARCHAR(500) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    progress_percent INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMP NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE (user_uid, course_id)
);
CREATE INDEX IF NOT EXISTS idx_my_user_act ON t_p78828167_tutor_platform_1.user_my_courses(user_uid, last_activity_at DESC);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.user_badges (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(64) NOT NULL,
    badge_id VARCHAR(64) NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_uid, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_badges_user ON t_p78828167_tutor_platform_1.user_badges(user_uid);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.user_activity_log (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(64) NOT NULL,
    activity_date DATE NOT NULL,
    minutes_spent INTEGER NOT NULL DEFAULT 0,
    lessons_completed INTEGER NOT NULL DEFAULT 0,
    tasks_solved INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_uid, activity_date)
);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON t_p78828167_tutor_platform_1.user_activity_log(user_uid, activity_date DESC);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.user_stats (
    user_uid VARCHAR(64) PRIMARY KEY,
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    lessons_completed INTEGER NOT NULL DEFAULT 0,
    tasks_solved INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);