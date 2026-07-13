ALTER TABLE t_p78828167_tutor_platform_1.kids_song_audio
  ADD COLUMN IF NOT EXISTS source varchar(16) NOT NULL DEFAULT 'suno';

-- Ранее сохранённые файлы voice-*.wav — это озвучки Няни Лисы (не polza.ai).
UPDATE t_p78828167_tutor_platform_1.kids_song_audio
  SET source = 'voice'
  WHERE audio_url LIKE '%/voice-%';