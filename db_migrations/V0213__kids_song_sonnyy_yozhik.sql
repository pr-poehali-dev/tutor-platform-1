INSERT INTO t_p78828167_tutor_platform_1.kids_song_audio (song_id, audio_url, status, source, created_at, updated_at)
VALUES (
  'sonnyy-yozhik',
  'https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/bucket/songs/vocal-sonnyy-yozhik.mp3',
  'ready',
  'custom',
  now(), now()
)
ON CONFLICT (song_id) DO UPDATE SET
  audio_url = EXCLUDED.audio_url,
  status = 'ready',
  source = 'custom',
  updated_at = now();