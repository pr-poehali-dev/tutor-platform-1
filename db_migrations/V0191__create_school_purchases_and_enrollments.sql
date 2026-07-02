-- Этап 3: оплата курсов школы. Покупки + доступ (enrollment).

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_course_purchases (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  school_course_id integer NOT NULL REFERENCES t_p78828167_tutor_platform_1.school_courses(id),
  school_id integer NOT NULL REFERENCES t_p78828167_tutor_platform_1.schools(id),
  buyer_user_id bigint NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  buyer_email character varying(200) NULL,
  amount_kopecks integer NOT NULL DEFAULT 0,
  platform_fee_kopecks integer NOT NULL DEFAULT 0,
  payment_id character varying(100) NULL,
  status character varying(20) NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  paid_at timestamp with time zone NULL
);

CREATE INDEX IF NOT EXISTS idx_scp_buyer
  ON t_p78828167_tutor_platform_1.school_course_purchases (buyer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_scp_course
  ON t_p78828167_tutor_platform_1.school_course_purchases (school_course_id, status);
CREATE INDEX IF NOT EXISTS idx_scp_payment
  ON t_p78828167_tutor_platform_1.school_course_purchases (payment_id);

-- Доступ ученика к курсу школы (Этап 2: ученики)
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_enrollments (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  school_course_id integer NOT NULL REFERENCES t_p78828167_tutor_platform_1.school_courses(id),
  school_id integer NOT NULL REFERENCES t_p78828167_tutor_platform_1.schools(id),
  student_user_id bigint NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  student_email character varying(200) NULL,
  source character varying(30) NOT NULL DEFAULT 'purchase',
  status character varying(20) NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_enroll_unique
  ON t_p78828167_tutor_platform_1.school_enrollments (school_course_id, student_user_id)
  WHERE student_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enroll_student
  ON t_p78828167_tutor_platform_1.school_enrollments (student_user_id, status);