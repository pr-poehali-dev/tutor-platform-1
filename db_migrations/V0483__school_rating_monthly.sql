-- Ежемесячный рейтинг школ: выпуск на каждый месяц и места школ в нём (для архива и динамики).
CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_rating_editions (
  id SERIAL PRIMARY KEY,
  period DATE NOT NULL UNIQUE,
  schools INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.school_rating_snapshots (
  id SERIAL PRIMARY KEY,
  edition_id INT NOT NULL REFERENCES t_p78828167_tutor_platform_1.school_rating_editions(id),
  institution_id INT NOT NULL REFERENCES t_p78828167_tutor_platform_1.edu_institutions(id),
  place INT NOT NULL,
  city_place INT NOT NULL,
  score NUMERIC(8,2) NOT NULL,
  prev_place INT NULL,
  UNIQUE (edition_id, institution_id)
);
CREATE INDEX IF NOT EXISTS school_rating_snapshots_ed_place_idx ON t_p78828167_tutor_platform_1.school_rating_snapshots (edition_id, place);
CREATE INDEX IF NOT EXISTS school_rating_snapshots_inst_idx ON t_p78828167_tutor_platform_1.school_rating_snapshots (institution_id);