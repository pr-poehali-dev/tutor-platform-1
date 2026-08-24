CREATE TABLE IF NOT EXISTS custom_course_orders (
  id             SERIAL PRIMARY KEY,
  contact_name   VARCHAR(160) NOT NULL,
  contact_email  VARCHAR(200),
  contact_phone  VARCHAR(40),
  topic          VARCHAR(300) NOT NULL,
  goal           TEXT,
  level          VARCHAR(40),
  format_pref    VARCHAR(40),
  time_per_week  VARCHAR(40),
  deadline_pref  VARCHAR(60),
  details        TEXT,
  matched        JSONB,
  price          INTEGER DEFAULT 10000,
  source         VARCHAR(60) DEFAULT 'order',
  utm            JSONB,
  status         VARCHAR(20) NOT NULL DEFAULT 'new',
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_course_orders_status ON custom_course_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_course_orders_created ON custom_course_orders(created_at DESC);
