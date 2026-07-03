-- Логотип демо-школы и обложка демо-курса (делают пример «как настоящий»).

UPDATE t_p78828167_tutor_platform_1.schools
SET brand_logo_url = 'https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/a77033da-a61e-4324-a7e4-496ad0bf48bf.jpg',
    updated_at = now()
WHERE slug = 'shkola-primer';

UPDATE t_p78828167_tutor_platform_1.school_courses sc
SET data = jsonb_set(
      sc.data,
      '{cover_url}',
      '"https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/66afe6c5-8bc2-4129-b74c-7538a75e17d1.jpg"'::jsonb,
      true
    ),
    updated_at = now()
FROM t_p78828167_tutor_platform_1.schools s
WHERE s.id = sc.school_id
  AND s.slug = 'shkola-primer'
  AND sc.title = 'Акварель с нуля: первые шедевры за 6 уроков';