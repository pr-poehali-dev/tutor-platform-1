-- Демо-школа как рабочий шаблон/пример конструктора онлайн-школ.
-- Идемпотентно: повторный запуск не создаёт дублей.

-- 1. Демо-владелец школы
INSERT INTO t_p78828167_tutor_platform_1.auth_users (phone, name, email, created_at)
SELECT '', 'Демо-школа УЧИСЬПРО', 'demo-school@uchisipro.ru', now()
WHERE NOT EXISTS (
  SELECT 1 FROM t_p78828167_tutor_platform_1.auth_users WHERE email='demo-school@uchisipro.ru'
);

-- 2. Сама школа с брендом и включённым ИИ-наставником
INSERT INTO t_p78828167_tutor_platform_1.schools
  (owner_user_id, name, slug, description, brand_color,
   payments_enabled, platform_fee_percent, ai_teacher_enabled, ai_teacher_persona,
   builder_access, status, created_at, updated_at)
SELECT
  u.id,
  'Школа «Пример»',
  'shkola-primer',
  'Демонстрационная онлайн-школа: показывает, как выглядит готовый курс, страница продажи и ИИ-наставник.',
  '#7c3aed',
  true, 8.0, true,
  'Ты — дружелюбный и терпеливый наставник по акварельной живописи. Объясняешь просто, поддерживаешь новичков, даёшь конкретные советы по технике и разбираешь типичные ошибки.',
  true, 'active', now(), now()
FROM t_p78828167_tutor_platform_1.auth_users u
WHERE u.email='demo-school@uchisipro.ru'
  AND NOT EXISTS (
    SELECT 1 FROM t_p78828167_tutor_platform_1.schools WHERE slug='shkola-primer'
  );

-- 3. Опубликованный демо-курс с полной программой
INSERT INTO t_p78828167_tutor_platform_1.school_courses
  (school_id, title, topic, lessons_count, modules_count, price_kopecks, is_published, status, data, created_at, updated_at)
SELECT
  s.id,
  'Акварель с нуля: первые шедевры за 6 уроков',
  'Акварельная живопись для начинающих',
  6, 2, 290000, true, 'ready',
  '{
    "course_title": "Акварель с нуля: первые шедевры за 6 уроков",
    "tagline": "Научитесь писать акварелью красиво и без страха чистого листа",
    "description": "Практический курс для новичков без художественного опыта. За 6 уроков вы освоите базовые техники акварели, поймёте, как смешивать цвета и работать с водой, и напишете свои первые полноценные работы.",
    "target_audience": "взрослые новички без опыта рисования",
    "estimated_hours": 12,
    "outcomes": [
      "Уверенно работать с акварельными красками, кистями и бумагой",
      "Смешивать цвета и получать нужные оттенки",
      "Владеть техниками по-сырому и лессировки",
      "Написать пейзаж и натюрморт с нуля",
      "Избавиться от страха чистого листа"
    ],
    "modules": [
      {
        "title": "Основы акварели",
        "lessons": [
          {
            "type": "theory",
            "title": "Материалы: краски, кисти, бумага",
            "summary": ["Какие краски выбрать новичку", "Виды кистей и бумаги", "Как организовать рабочее место"],
            "task": "Соберите базовый набор и подготовьте рабочее место",
            "quiz": {"q": "Какая бумага лучше подходит для акварели?", "correct": 1, "options": ["Офисная", "Плотная акварельная (от 200 г/м²)", "Калька"]}
          },
          {
            "type": "theory",
            "title": "Вода и цвет: как ведёт себя акварель",
            "summary": ["Соотношение воды и пигмента", "Прозрачность и слои", "Первые мазки"],
            "task": "Сделайте растяжку одного цвета от насыщенного к светлому",
            "quiz": {"q": "Что делает акварель светлее?", "correct": 0, "options": ["Больше воды", "Больше пигмента", "Другая кисть"]}
          },
          {
            "type": "practice",
            "title": "Смешивание цветов",
            "summary": ["Основные и составные цвета", "Тёплые и холодные оттенки", "Создание палитры"],
            "task": "Нарисуйте цветовой круг из основных цветов",
            "quiz": {"q": "Какие цвета основные?", "correct": 2, "options": ["Зелёный, оранжевый, фиолетовый", "Чёрный и белый", "Красный, жёлтый, синий"]}
          }
        ]
      },
      {
        "title": "Первые работы",
        "lessons": [
          {
            "type": "practice",
            "title": "Техника по-сырому",
            "summary": ["Работа по влажной бумаге", "Мягкие переходы", "Небо и вода"],
            "task": "Напишите простое небо на закате техникой по-сырому",
            "quiz": {"q": "Техника по-сырому — это письмо по...", "correct": 1, "options": ["Сухой бумаге", "Влажной бумаге", "Картону"]}
          },
          {
            "type": "practice",
            "title": "Пейзаж шаг за шагом",
            "summary": ["Композиция пейзажа", "Планы и глубина", "Детали в конце"],
            "task": "Напишите простой пейзаж с деревом и полем",
            "quiz": {"q": "С чего начинают акварельный пейзаж?", "correct": 0, "options": ["Со светлых больших заливок", "С мелких деталей", "С подписи"]}
          },
          {
            "type": "project",
            "title": "Итоговый проект: ваша картина",
            "summary": ["Выбор сюжета", "Применение всех техник", "Оформление работы"],
            "task": "Напишите завершённую работу и поделитесь ею с наставником",
            "quiz": {"q": "Что важно в итоговой работе?", "correct": 2, "options": ["Скорость", "Дорогие краски", "Применение изученных техник"]}
          }
        ]
      }
    ],
    "business": {
      "usp": "От страха чистого листа до готовой картины за 6 практических уроков с ИИ-наставником 24/7.",
      "price_recommendation": "2500–3500 рублей за курс для начинающих",
      "channels": ["Instagram и Pinterest", "Тематические сообщества по рисованию", "Таргетированная реклама"]
    },
    "marketing": {
      "headlines": ["Начните рисовать акварелью уже сегодня", "6 уроков — и вы пишете свои первые картины", "Акварель без таланта: получится у каждого"],
      "social_posts": ["Всегда хотели рисовать, но боялись начать? Наш курс акварели для новичков создан именно для вас!", "6 уроков, ИИ-наставник и первые работы уже на этой неделе. Присоединяйтесь!"],
      "email_sequence": [
        {"subject": "Добро пожаловать на курс акварели!", "goal": "Поприветствовать и настроить на обучение"},
        {"subject": "Ваш первый мазок", "goal": "Замотивировать начать первый урок"},
        {"subject": "Почему практика решает всё", "goal": "Удержать и вовлечь в регулярную практику"}
      ]
    }
  }'::jsonb,
  now(), now()
FROM t_p78828167_tutor_platform_1.schools s
WHERE s.slug='shkola-primer'
  AND NOT EXISTS (
    SELECT 1 FROM t_p78828167_tutor_platform_1.school_courses sc
    WHERE sc.school_id=s.id AND sc.title='Акварель с нуля: первые шедевры за 6 уроков'
  );

-- 4. Демо-ученик (приглашён вручную) — показывает вкладку «Ученики»
INSERT INTO t_p78828167_tutor_platform_1.school_enrollments
  (school_course_id, school_id, student_user_id, student_email, source, status, created_at)
SELECT sc.id, sc.school_id, NULL, 'student-demo@uchisipro.ru', 'invite', 'active', now()
FROM t_p78828167_tutor_platform_1.school_courses sc
JOIN t_p78828167_tutor_platform_1.schools s ON s.id=sc.school_id
WHERE s.slug='shkola-primer' AND sc.title='Акварель с нуля: первые шедевры за 6 уроков'
  AND NOT EXISTS (
    SELECT 1 FROM t_p78828167_tutor_platform_1.school_enrollments e
    WHERE e.school_course_id=sc.id AND lower(e.student_email)='student-demo@uchisipro.ru'
  );