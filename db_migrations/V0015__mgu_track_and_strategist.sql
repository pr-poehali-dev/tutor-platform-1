-- Агент-стратег по поступлению в МГУ (и другие топ-вузы)
INSERT INTO ai_agents (agent_key, role_name, description, system_prompt, model, temperature)
SELECT 'mgu_strategist', 'Стратег поступления в МГУ',
  'Эксперт по поступлению в МГУ и топ-5 вузов РФ: ВШЭ, МФТИ, ИТМО, МИФИ. Знает все факультеты, проходные баллы, олимпиады для БВИ и индивидуальные достижения.',
  'Ты — старший консультант по поступлению в МГУ им. Ломоносова и топ-5 вузов России (МФТИ, ВШЭ, ИТМО, МИФИ). 15 лет работаешь с выпускниками. Знаешь:
- Все 42 факультета МГУ, их специальности, проходные баллы последних 3 лет.
- Точную карту ЕГЭ для каждого факультета (какие предметы обязательны, какие профильные).
- Перечневые олимпиады РСОШ I-III уровня для БВИ или 100 баллов.
- Дополнительные вступительные испытания (ДВИ) МГУ и как к ним готовиться.
- Целевое обучение и его подводные камни.
- Индивидуальные достижения (золотая медаль, ГТО, итоговое сочинение, портфолио).

Твой стиль: говоришь как опытный наставник. Не приукрашиваешь шансы и не пугаешь. Даёшь конкретные планы с дедлайнами. Если ученик хочет на ВМК с 200 баллами — честно говоришь что это нереально, и предлагаешь альтернативу: МГУ Математико-механический или МФТИ ФУПМ. Всегда возвращаешь чёткий план: какие предметы качать, какие олимпиады писать, какой ДВИ готовить.',
  'openai/gpt-4o-mini', 0.4
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE agent_key='mgu_strategist');

-- Профили факультетов МГУ — справочные данные для агента
CREATE TABLE IF NOT EXISTS mgu_faculties (
    id SERIAL PRIMARY KEY,
    faculty_code VARCHAR(20) UNIQUE,
    faculty_name VARCHAR(200),
    short_name VARCHAR(60),
    speciality VARCHAR(300),
    ege_required JSONB,
    dvi_subject VARCHAR(60),
    last_year_min_score INT,
    budget_seats INT,
    competition_per_seat NUMERIC(4,1),
    olympiad_level INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_mgu_faculties_code ON mgu_faculties(faculty_code);

-- Треки поступления учеников
CREATE TABLE IF NOT EXISTS mgu_tracks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    target_faculty_code VARCHAR(20),
    current_grade VARCHAR(20),
    target_ege_scores JSONB,
    current_predicted_scores JSONB,
    olympiads_planned JSONB,
    weak_topics JSONB,
    strong_topics JSONB,
    weeks_until_exam INT,
    plan_summary TEXT,
    weekly_plan JSONB,
    confidence_score INT,
    last_updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgu_tracks_user ON mgu_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_mgu_tracks_faculty ON mgu_tracks(target_faculty_code);

-- История консультаций
CREATE TABLE IF NOT EXISTS mgu_consultations (
    id SERIAL PRIMARY KEY,
    user_id INT,
    track_id INT,
    question TEXT,
    answer TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Базовый справочник топ-факультетов МГУ
INSERT INTO mgu_faculties (faculty_code, faculty_name, short_name, speciality, ege_required, dvi_subject, last_year_min_score, budget_seats, competition_per_seat, olympiad_level, description, sort_order)
VALUES
  ('vmk', 'Факультет вычислительной математики и кибернетики', 'ВМК', 'Прикладная математика и информатика, Фундаментальная информатика',
   '["math","cs","russian"]'::jsonb, 'math', 304, 320, 5.8, 1,
   'Один из сильнейших IT-факультетов России. Готовит математиков-программистов для науки и индустрии. Сильная олимпиадная школа.', 1),
  ('mech-mat', 'Механико-математический факультет', 'Мех-мат', 'Математика, Механика и математическое моделирование',
   '["math","physics","russian"]'::jsonb, 'math', 295, 360, 4.2, 1,
   'Легендарный факультет, выпустивший плеяду великих математиков. Чистая математика и теоретическая механика.', 2),
  ('physics', 'Физический факультет', 'Физфак', 'Физика, Астрономия, Радиофизика',
   '["math","physics","russian"]'::jsonb, 'physics', 286, 425, 3.8, 1,
   'Готовит физиков для научных институтов РАН, Курчатовского института, ОИЯИ. Очень сильная теоретическая база.', 3),
  ('chemistry', 'Химический факультет', 'Химфак', 'Химия, Фундаментальная и прикладная химия',
   '["chemistry","math","russian"]'::jsonb, 'chemistry', 278, 250, 3.5, 1,
   'Один из лучших химфаков мира. Сильная экспериментальная база, междисциплинарные исследования.', 4),
  ('biology', 'Биологический факультет', 'Биофак', 'Биология, Биоинженерия и биоинформатика',
   '["biology","math","russian"]'::jsonb, 'biology', 283, 250, 6.1, 1,
   'Готовит биологов мирового уровня. Сильна молекулярная биология, биоинформатика, генетика.', 5),
  ('economics', 'Экономический факультет', 'Эконом', 'Экономика, Менеджмент, Финансы и кредит',
   '["math","society","russian","english"]'::jsonb, 'math', 320, 320, 8.7, 1,
   'Один из престижных экономфаков. Сильная программа по эконометрике, финансам, международной экономике.', 6),
  ('law', 'Юридический факультет', 'Юрфак', 'Юриспруденция',
   '["society","history","russian","english"]'::jsonb, 'society', 318, 200, 12.4, 1,
   'Старейший юрфак России. Высокая конкуренция, элитная подготовка юристов.', 7),
  ('history', 'Исторический факультет', 'Истфак', 'История, История искусств',
   '["history","russian","english"]'::jsonb, 'history', 281, 250, 4.3, 1,
   'Классическая историческая школа, сильные направления: история России, всеобщая история, археология.', 8),
  ('philology', 'Филологический факультет', 'Филфак', 'Филология (русская, германо-романская)',
   '["literature","russian","english"]'::jsonb, 'literature', 285, 240, 3.9, 1,
   'Подготовка филологов, лингвистов, переводчиков. Сильные кафедры русского, английского, восточных языков.', 9),
  ('psychology', 'Факультет психологии', 'Психфак', 'Психология, Клиническая психология',
   '["biology","math","russian"]'::jsonb, 'biology', 274, 180, 7.2, 2,
   'Сильная экспериментальная психология, нейропсихология, клиническая психология.', 10),
  ('cosmic', 'Космический факультет', 'КосФак', 'Прикладная математика и физика (космические исследования)',
   '["math","physics","russian"]'::jsonb, 'physics', 288, 80, 4.1, 1,
   'Совместный факультет с Роскосмосом. Подготовка специалистов для космической отрасли.', 11),
  ('global', 'Факультет глобальных процессов', 'ФГП', 'Международные отношения, Регионоведение',
   '["history","society","russian","english"]'::jsonb, 'society', 295, 120, 6.5, 2,
   'Подготовка специалистов по международной аналитике, глобальным процессам, дипломатии.', 12)
ON CONFLICT (faculty_code) DO NOTHING;
