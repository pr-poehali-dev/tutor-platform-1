CREATE TABLE IF NOT EXISTS t_p78828167_tutor_platform_1.kids_song_audio (
  song_id      varchar(80) PRIMARY KEY,
  audio_url    varchar(800) NOT NULL,
  status       varchar(20) NOT NULL DEFAULT 'ready',
  media_id     varchar(120) NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);