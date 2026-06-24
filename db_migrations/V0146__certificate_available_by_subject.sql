-- Сертификаты выдаём только для курсов вне школьной программы (ФЗ-273).
-- Школьные предметы (ФГОС) — сертификат не предусмотрен.
UPDATE t_p78828167_tutor_platform_1.course_curricula
SET certificate_available = FALSE,
    updated_at = now()
WHERE subject IN ('math','physics','chemistry','biology','history','russian','literature','geography','society','english');

UPDATE t_p78828167_tutor_platform_1.course_curricula
SET certificate_available = TRUE,
    updated_at = now()
WHERE subject NOT IN ('math','physics','chemistry','biology','history','russian','literature','geography','society','english');
