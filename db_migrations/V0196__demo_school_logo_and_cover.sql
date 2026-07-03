-- Логотип демо-школы
UPDATE t_p78828167_tutor_platform_1.schools
SET brand_logo_url = 'https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/fc8ce7ff-d842-4d48-815c-bd93a620f09f.jpg',
    updated_at = now()
WHERE slug = 'shkola-primer';

-- Обложка демо-курса (в data.cover_url)
UPDATE t_p78828167_tutor_platform_1.school_courses sc
SET data = jsonb_set(sc.data, '{cover_url}',
      '"https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/a273586c-bafc-4b50-868d-8f8ec5799138.jpg"'::jsonb, true),
    updated_at = now()
FROM t_p78828167_tutor_platform_1.schools s
WHERE sc.school_id = s.id AND s.slug = 'shkola-primer'
  AND sc.title = 'Акварель с нуля: первые шедевры за 6 уроков';