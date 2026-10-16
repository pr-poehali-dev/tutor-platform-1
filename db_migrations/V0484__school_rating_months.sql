-- Ежемесячный рейтинг школ: снимок мест на 1-е число месяца (по Москве).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_rating_months (
  month DATE NOT NULL,
  institution_id INT NOT NULL REFERENCES t_p78828167_tutor_platform_1.edu_institutions(id),
  place INT NOT NULL,
  score NUMERIC(8,2) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (month, institution_id)
);
CREATE INDEX IF NOT EXISTS school_rating_months_place_idx ON t_p78828167_tutor_platform_1.school_rating_months (month, place);