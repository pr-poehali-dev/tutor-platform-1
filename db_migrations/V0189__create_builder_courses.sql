CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.builder_courses (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id integer NULL,
  topic character varying(300) NOT NULL,
  audience character varying(300) NULL,
  level character varying(60) NULL,
  lessons_count integer NOT NULL DEFAULT 0,
  modules_count integer NOT NULL DEFAULT 0,
  course_title character varying(300) NULL,
  status character varying(20) NOT NULL DEFAULT 'ready',
  is_fallback boolean NOT NULL DEFAULT false,
  ai_error text NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builder_courses_created_at
  ON t_p78828167_tutor_platform_1.builder_courses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_builder_courses_lead_id
  ON t_p78828167_tutor_platform_1.builder_courses (lead_id);