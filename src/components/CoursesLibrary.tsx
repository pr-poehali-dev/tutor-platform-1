import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: "all", label: "Все предметы", emoji: "📚" },
  { id: "math", label: "Математика", emoji: "📐" },
  { id: "physics", label: "Физика", emoji: "⚡" },
  { id: "chemistry", label: "Химия", emoji: "🧪" },
  { id: "cs", label: "Информатика", emoji: "💻" },
  { id: "history", label: "История", emoji: "🏛️" },
  { id: "english", label: "Английский", emoji: "🌍" },
  { id: "russian", label: "Русский язык", emoji: "✍️" },
  { id: "biology", label: "Биология", emoji: "🧬" },
  { id: "literature", label: "Литература", emoji: "📖" },
  { id: "geography", label: "География", emoji: "🗺️" },
  { id: "society", label: "Обществознание", emoji: "⚖️" },
];

const GRADES = [
  { id: "all", label: "Все классы" },
  { id: "1-4", label: "1–4 класс" },
  { id: "5-9", label: "5–9 класс" },
  { id: "10-11", label: "10–11 класс" },
  { id: "ege", label: "ЕГЭ" },
  { id: "oge", label: "ОГЭ" },
];

const FORMAT = [
  { id: "all", label: "Любой формат" },
  { id: "online", label: "Онлайн" },
  { id: "offline", label: "Офлайн" },
  { id: "video", label: "Видеокурс" },
];

type SortKey = "popular" | "rating" | "price_asc" | "price_desc" | "new";

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "popular", label: "По популярности" },
  { id: "rating", label: "По рейтингу" },
  { id: "price_asc", label: "Цена: от низкой" },
  { id: "price_desc", label: "Цена: от высокой" },
  { id: "new", label: "Новинки" },
];

interface Course {
  id: number;
  subject: string;
  title: string;
  tutor: string;
  tutorAvatar: string;
  tutorBadge: string;
  grade: string;
  format: "online" | "offline" | "video";
  price: number;
  priceUnit: string;
  rating: number;
  reviews: number;
  students: number;
  lessons: number;
  duration: string;
  tags: string[];
  color: string;
  emoji: string;
  isNew: boolean;
  isHit: boolean;
  isSale: boolean;
  salePercent?: number;
  trialAvailable: boolean;
  description: string;
}

const COURSES: Course[] = [
  {
    id: 1,
    subject: "math",
    title: "ЕГЭ Математика: база + профиль",
    tutor: "Алексей Громов",
    tutorAvatar: "👨‍🏫",
    tutorBadge: "Топ репетитор",
    grade: "ege",
    format: "online",
    price: 2500,
    priceUnit: "за урок",
    rating: 4.97,
    reviews: 312,
    students: 1840,
    lessons: 64,
    duration: "90 мин",
    tags: ["ЕГЭ", "Профиль", "База"],
    color: "from-purple-600 to-blue-500",
    emoji: "📐",
    isNew: false,
    isHit: true,
    isSale: false,
    trialAvailable: true,
    description: "Полная подготовка к ЕГЭ с нуля до 90+ баллов. Разбор всех типов задач.",
  },
  {
    id: 2,
    subject: "english",
    title: "Английский с нуля до Upper-Intermediate",
    tutor: "Мария Соколова",
    tutorAvatar: "👩‍🏫",
    tutorBadge: "Носитель языка",
    grade: "5-9",
    format: "online",
    price: 1800,
    priceUnit: "за урок",
    rating: 4.95,
    reviews: 489,
    students: 3200,
    lessons: 96,
    duration: "60 мин",
    tags: ["Разговорный", "Грамматика", "Произношение"],
    color: "from-violet-500 to-purple-600",
    emoji: "🌍",
    isNew: false,
    isHit: true,
    isSale: true,
    salePercent: 20,
    trialAvailable: true,
    description: "Живые диалоги, реальные ситуации. Без скуки — только практика.",
  },
  {
    id: 3,
    subject: "physics",
    title: "Физика: механика и электродинамика",
    tutor: "Дмитрий Волков",
    tutorAvatar: "👨‍🔬",
    tutorBadge: "Кандидат наук",
    grade: "10-11",
    format: "video",
    price: 990,
    priceUnit: "за курс",
    rating: 4.88,
    reviews: 156,
    students: 720,
    lessons: 48,
    duration: "45 мин",
    tags: ["Теория", "Задачи", "ЕГЭ"],
    color: "from-cyan-500 to-blue-600",
    emoji: "⚡",
    isNew: false,
    isHit: false,
    isSale: false,
    trialAvailable: false,
    description: "Понятные объяснения сложных тем. Задачи олимпиадного и ЕГЭ уровня.",
  },
  {
    id: 4,
    subject: "cs",
    title: "Python для школьников: от нуля до проекта",
    tutor: "Кирилл Петров",
    tutorAvatar: "🧑‍💻",
    tutorBadge: "Senior Dev",
    grade: "5-9",
    format: "online",
    price: 2200,
    priceUnit: "за урок",
    rating: 5.0,
    reviews: 201,
    students: 1100,
    lessons: 40,
    duration: "90 мин",
    tags: ["Python", "Проекты", "Олимпиады"],
    color: "from-pink-500 to-rose-600",
    emoji: "💻",
    isNew: true,
    isHit: false,
    isSale: false,
    trialAvailable: true,
    description: "Учим программировать через реальные игры и проекты. Скучно не будет!",
  },
  {
    id: 5,
    subject: "math",
    title: "Математика 5–7 класс: уверенный старт",
    tutor: "Наталья Орлова",
    tutorAvatar: "👩‍🏫",
    tutorBadge: "Стаж 12 лет",
    grade: "5-9",
    format: "offline",
    price: 1500,
    priceUnit: "за урок",
    rating: 4.92,
    reviews: 88,
    students: 430,
    lessons: 36,
    duration: "60 мин",
    tags: ["Алгебра", "Геометрия", "Задачи"],
    color: "from-purple-600 to-blue-500",
    emoji: "📐",
    isNew: false,
    isHit: false,
    isSale: true,
    salePercent: 15,
    trialAvailable: true,
    description: "Закрываем все пробелы в знаниях. Индивидуальный темп.",
  },
  {
    id: 6,
    subject: "russian",
    title: "Русский язык: грамотность за 30 дней",
    tutor: "Светлана Ким",
    tutorAvatar: "👩‍🎓",
    tutorBadge: "Отличник года",
    grade: "5-9",
    format: "video",
    price: 790,
    priceUnit: "за курс",
    rating: 4.9,
    reviews: 267,
    students: 2100,
    lessons: 30,
    duration: "40 мин",
    tags: ["Орфография", "Пунктуация", "ОГЭ"],
    color: "from-rose-500 to-pink-600",
    emoji: "✍️",
    isNew: false,
    isHit: true,
    isSale: false,
    trialAvailable: false,
    description: "30 уроков — и никаких ошибок. Практические упражнения каждый день.",
  },
  {
    id: 7,
    subject: "chemistry",
    title: "Химия: органика для ЕГЭ",
    tutor: "Игорь Лебедев",
    tutorAvatar: "👨‍🔬",
    tutorBadge: "Призёр олимпиад",
    grade: "ege",
    format: "online",
    price: 2800,
    priceUnit: "за урок",
    rating: 4.93,
    reviews: 114,
    students: 580,
    lessons: 52,
    duration: "90 мин",
    tags: ["Органика", "Реакции", "Задачи C"],
    color: "from-green-500 to-teal-600",
    emoji: "🧪",
    isNew: false,
    isHit: false,
    isSale: false,
    trialAvailable: true,
    description: "Всё про органику: механизмы реакций, задачи части C, хитрости.",
  },
  {
    id: 8,
    subject: "history",
    title: "История России: ЕГЭ 80+ баллов",
    tutor: "Андрей Фёдоров",
    tutorAvatar: "👨‍🏫",
    tutorBadge: "Стаж 8 лет",
    grade: "ege",
    format: "online",
    price: 2000,
    priceUnit: "за урок",
    rating: 4.86,
    reviews: 178,
    students: 860,
    lessons: 58,
    duration: "75 мин",
    tags: ["Даты", "Персоналии", "Эссе"],
    color: "from-orange-500 to-amber-500",
    emoji: "🏛️",
    isNew: false,
    isHit: false,
    isSale: true,
    salePercent: 10,
    trialAvailable: true,
    description: "Систематизация всего курса истории. Мнемотехники для дат и событий.",
  },
  {
    id: 9,
    subject: "biology",
    title: "Биология: клетка и генетика для ОГЭ/ЕГЭ",
    tutor: "Ирина Белова",
    tutorAvatar: "👩‍🔬",
    tutorBadge: "Биофак МГУ",
    grade: "oge",
    format: "video",
    price: 1190,
    priceUnit: "за курс",
    rating: 4.91,
    reviews: 93,
    students: 440,
    lessons: 44,
    duration: "50 мин",
    tags: ["Клетка", "Генетика", "Эволюция"],
    color: "from-emerald-500 to-green-600",
    emoji: "🧬",
    isNew: true,
    isHit: false,
    isSale: false,
    trialAvailable: false,
    description: "Самые сложные темы биологии — объяснено простым языком.",
  },
  {
    id: 10,
    subject: "literature",
    title: "Сочинение на 10/10: структура и аргументы",
    tutor: "Елена Чернова",
    tutorAvatar: "👩‍🏫",
    tutorBadge: "Эксперт ЕГЭ",
    grade: "ege",
    format: "online",
    price: 1900,
    priceUnit: "за урок",
    rating: 4.98,
    reviews: 222,
    students: 1340,
    lessons: 24,
    duration: "60 мин",
    tags: ["Сочинение", "Аргументы", "Критерии"],
    color: "from-rose-500 to-pink-600",
    emoji: "📖",
    isNew: false,
    isHit: true,
    isSale: false,
    trialAvailable: true,
    description: "Эксперт ЕГЭ лично проверяет каждое сочинение. Максимальный балл.",
  },
  {
    id: 11,
    subject: "math",
    title: "Математика с нуля: 1–4 класс",
    tutor: "Ольга Сергеева",
    tutorAvatar: "👩‍🏫",
    tutorBadge: "Стаж 15 лет",
    grade: "1-4",
    format: "online",
    price: 1200,
    priceUnit: "за урок",
    rating: 4.96,
    reviews: 345,
    students: 2800,
    lessons: 60,
    duration: "45 мин",
    tags: ["Счёт", "Задачи", "Логика"],
    color: "from-purple-600 to-blue-500",
    emoji: "📐",
    isNew: false,
    isHit: true,
    isSale: false,
    trialAvailable: true,
    description: "Весёлые уроки с картинками и игровыми задачами для малышей.",
  },
  {
    id: 12,
    subject: "society",
    title: "Обществознание: ЕГЭ без паники",
    tutor: "Павел Морозов",
    tutorAvatar: "👨‍💼",
    tutorBadge: "Юрфак МГУ",
    grade: "ege",
    format: "video",
    price: 890,
    priceUnit: "за курс",
    rating: 4.84,
    reviews: 136,
    students: 750,
    lessons: 50,
    duration: "45 мин",
    tags: ["Право", "Экономика", "Эссе"],
    color: "from-indigo-500 to-violet-600",
    emoji: "⚖️",
    isNew: true,
    isHit: false,
    isSale: false,
    trialAvailable: false,
    description: "Системный подбор тем. Разбор всех кодификаторов ЕГЭ 2025.",
  },
];

// ─── FORMAT BADGE ─────────────────────────────────────────────────────────────
const FORMAT_CONFIG = {
  online: { label: "Онлайн", color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/25" },
  offline: { label: "Офлайн", color: "text-orange-400 bg-orange-500/15 border-orange-500/25" },
  video: { label: "Видеокурс", color: "text-green-400 bg-green-500/15 border-green-500/25" },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function CoursesLibrary() {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [trialOnly, setTrialOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...COURSES];

    if (subjectFilter !== "all") result = result.filter(c => c.subject === subjectFilter);
    if (gradeFilter !== "all") result = result.filter(c => c.grade === gradeFilter);
    if (formatFilter !== "all") result = result.filter(c => c.format === formatFilter);
    if (trialOnly) result = result.filter(c => c.trialAvailable);
    result = result.filter(c => c.price >= priceRange[0] && c.price <= priceRange[1]);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.tutor.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "price_asc") return a.price - b.price;
      if (sortKey === "price_desc") return b.price - a.price;
      if (sortKey === "new") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return b.students - a.students;
    });

    return result;
  }, [subjectFilter, gradeFilter, formatFilter, sortKey, searchQuery, priceRange, trialOnly]);

  const activeFiltersCount = [
    subjectFilter !== "all",
    gradeFilter !== "all",
    formatFilter !== "all",
    trialOnly,
    priceRange[0] > 0 || priceRange[1] < 3000,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSubjectFilter("all");
    setGradeFilter("all");
    setFormatFilter("all");
    setTrialOnly(false);
    setPriceRange([0, 3000]);
    setSearchQuery("");
  };

  return (
    <section id="library" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">Каталог</p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white">
              Библиотека <span className="gradient-text-purple">курсов</span>
            </h2>
            <p className="text-white/50 text-sm mt-2">{filtered.length} курсов по вашему запросу</p>
          </div>

          {/* Stats strip */}
          <div className="hidden md:flex gap-5">
            {[
              { val: "120+", label: "репетиторов", color: "#a855f7" },
              { val: "50+", label: "предметов", color: "#00d4ff" },
              { val: "4.9★", label: "средний рейтинг", color: "#ffd60a" },
            ].map(s => (
              <div key={s.label} className="text-right">
                <div className="font-montserrat font-black text-xl" style={{ color: s.color }}>{s.val}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search + filter toggle */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Поиск по курсам, репетиторам, темам..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <Icon name="X" size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              filtersOpen || activeFiltersCount > 0
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : "bg-card/60 border-white/10 text-white/60 hover:text-white hover:border-white/20"
            }`}
          >
            <Icon name="SlidersHorizontal" size={16} />
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {/* Sort */}
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="bg-card/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.id} value={o.id} className="bg-gray-900">{o.label}</option>
            ))}
          </select>
        </div>

        {/* Subject chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => setSubjectFilter(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                subjectFilter === s.id
                  ? "bg-purple-500/25 border border-purple-500/50 text-purple-300"
                  : "bg-white/5 border border-white/8 text-white/55 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Extended filters panel */}
        {filtersOpen && (
          <div className="bg-card/60 border border-white/10 rounded-2xl p-5 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Grade */}
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Класс / программа</p>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setGradeFilter(g.id)}
                      className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                        gradeFilter === g.id
                          ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                          : "bg-white/5 border border-white/8 text-white/55 hover:text-white"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Формат</p>
                <div className="flex flex-wrap gap-2">
                  {FORMAT.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFormatFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                        formatFilter === f.id
                          ? "bg-pink-500/20 border border-pink-500/40 text-pink-300"
                          : "bg-white/5 border border-white/8 text-white/55 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price + trial */}
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Цена за урок / курс</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-white/50 text-sm">до</span>
                  <input
                    type="range"
                    min={0}
                    max={3000}
                    step={100}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-purple-400 font-bold text-sm w-20 text-right">{priceRange[1].toLocaleString()} ₽</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setTrialOnly(!trialOnly)}
                    className={`w-10 h-5 rounded-full transition-all relative ${trialOnly ? 'bg-purple-500' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${trialOnly ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-white/60 text-sm">Только с пробным уроком</span>
                </label>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/8 flex justify-end">
                <button onClick={resetFilters} className="text-white/40 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
                  <Icon name="RotateCcw" size={13} />
                  Сбросить все фильтры
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-montserrat font-black text-xl text-white mb-2">Ничего не найдено</h3>
            <p className="text-white/50 text-sm mb-5">Попробуй изменить фильтры или поисковый запрос</p>
            <button onClick={resetFilters} className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-500/30 transition-all">
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(course => {
              const isExpanded = expandedId === course.id;
              const fmt = FORMAT_CONFIG[course.format];
              return (
                <div
                  key={course.id}
                  className={`bg-card/60 border rounded-2xl overflow-hidden card-hover transition-all duration-300 flex flex-col ${
                    isExpanded ? "border-purple-500/50 glow-purple" : "border-white/8 hover:border-white/20"
                  }`}
                >
                  {/* Top gradient bar */}
                  <div className={`h-1 bg-gradient-to-r ${course.color}`} />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {course.isHit && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/20">🔥 Хит</span>
                      )}
                      {course.isNew && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/20">✨ Новый</span>
                      )}
                      {course.isSale && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">−{course.salePercent}%</span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ml-auto ${fmt.color}`}>
                        {fmt.label}
                      </span>
                    </div>

                    {/* Title + emoji */}
                    <div className="flex gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                        {course.emoji}
                      </div>
                      <h3 className="font-montserrat font-black text-sm text-white leading-snug">{course.title}</h3>
                    </div>

                    {/* Description */}
                    <p className="text-white/50 text-xs leading-relaxed mb-3">{course.description}</p>

                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {course.tags.map(tag => (
                        <span key={tag} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-lg">{tag}</span>
                      ))}
                    </div>

                    {/* Tutor */}
                    <div className="flex items-center gap-2.5 mb-4 p-3 bg-white/4 rounded-xl border border-white/6">
                      <span className="text-2xl">{course.tutorAvatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{course.tutor}</p>
                        <p className="text-purple-400 text-xs">{course.tutorBadge}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-yellow-400 text-xs">⭐</span>
                          <span className="text-white text-xs font-bold">{course.rating}</span>
                        </div>
                        <p className="text-white/30 text-xs">{course.reviews} отзывов</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: "📚", val: course.lessons, label: "уроков" },
                        { icon: "⏱️", val: course.duration, label: "длина" },
                        { icon: "👥", val: course.students >= 1000 ? `${(course.students/1000).toFixed(1)}к` : course.students, label: "учатся" },
                      ].map(s => (
                        <div key={s.label} className="bg-white/4 rounded-xl p-2 text-center">
                          <div className="text-base">{s.icon}</div>
                          <div className="text-white text-xs font-bold">{s.val}</div>
                          <div className="text-white/30 text-xs">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Expanded: grade info */}
                    {isExpanded && (
                      <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl animate-fade-in">
                        <p className="text-purple-300 text-xs font-semibold mb-1">Программа курса</p>
                        <p className="text-white/60 text-xs">
                          Класс/уровень: <span className="text-white font-medium">{GRADES.find(g => g.id === course.grade)?.label}</span>
                        </p>
                        {course.trialAvailable && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green inline-block"></span>
                            <span className="text-neon-green text-xs">Пробный урок бесплатно</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div className="mt-auto flex items-center gap-3">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-montserrat font-black text-xl text-white">
                            {course.isSale
                              ? Math.round(course.price * (1 - (course.salePercent || 0) / 100)).toLocaleString()
                              : course.price.toLocaleString()}
                          </span>
                          <span className="text-white text-sm">₽</span>
                        </div>
                        {course.isSale && (
                          <span className="text-white/30 text-xs line-through">{course.price.toLocaleString()} ₽</span>
                        )}
                        <div className="text-white/40 text-xs">{course.priceUnit}</div>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : course.id)}
                          className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all"
                        >
                          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={14} />
                        </button>
                        <button className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                          {course.trialAvailable ? "Пробный урок" : "Записаться"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {filtered.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-white/40 text-sm mb-3">Не нашёл нужный курс?</p>
            <button className="bg-card/60 border border-white/15 text-white/70 hover:text-white hover:border-purple-500/40 text-sm font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto">
              <Icon name="MessageCircle" size={16} />
              Подобрать репетитора под задачу
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
