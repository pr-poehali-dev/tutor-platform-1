-- Этап 1: кабинет школы. Задел под этапы 2-6 заложен полями заранее.

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.schools (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_user_id bigint NOT NULL REFERENCES t_p78828167_tutor_platform_1.auth_users(id),
  name character varying(200) NOT NULL DEFAULT 'Моя школа',
  slug character varying(80) NULL,
  description text NULL,

  -- Этап 4: брендинг / white-label
  brand_logo_url text NULL,
  brand_color character varying(20) NULL,

  -- Этап 5: свой домен
  custom_domain character varying(200) NULL,
  domain_verified boolean NOT NULL DEFAULT false,

  -- Этап 3: приём оплат
  payments_enabled boolean NOT NULL DEFAULT false,
  platform_fee_percent numeric(5,2) NOT NULL DEFAULT 8.0,

  -- Этап 6: ИИ-преподаватель школы
  ai_teacher_enabled boolean NOT NULL DEFAULT false,
  ai_teacher_persona text NULL,

  status character varying(20) NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_owner
  ON t_p78828167_tutor_platform_1.schools (owner_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_slug
  ON t_p78828167_tutor_platform_1.schools (slug) WHERE slug IS NOT NULL;

-- Курсы школы. Хранят снимок сгенерированного курса + редактируемые поля.
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_courses (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  school_id integer NOT NULL REFERENCES t_p78828167_tutor_platform_1.schools(id),
  builder_course_id integer NULL REFERENCES t_p78828167_tutor_platform_1.builder_courses(id),
  title character varying(300) NOT NULL,
  topic character varying(300) NULL,
  lessons_count integer NOT NULL DEFAULT 0,
  modules_count integer NOT NULL DEFAULT 0,

  -- Этап 3: цена курса для учеников (в копейках)
  price_kopecks integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,

  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status character varying(20) NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_courses_school
  ON t_p78828167_tutor_platform_1.school_courses (school_id, created_at DESC);

-- Связь исходной генерации со школой (для аналитики воронки конструктора)
ALTER TABLE t_p78828167_tutor_platform_1.builder_courses
  ADD COLUMN IF NOT EXISTS school_id integer NULL;