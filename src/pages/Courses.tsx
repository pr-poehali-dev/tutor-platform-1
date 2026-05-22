import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import CourseCardCompact from "@/components/courses/CourseCardCompact";
import {
  COURSES,
  SUBJECTS,
  GRADES,
  FORMAT,
  SORT_OPTIONS,
  SortKey,
  getCoursePrice,
} from "@/components/courses/coursesData";
import { SUBJECTS_SEO } from "@/components/courses/subjectsSeo";

type BadgeFilter = "all" | "new" | "hit" | "sale" | "trial";

const BADGES: { id: BadgeFilter; label: string; icon: string }[] = [
  { id: "all", label: "Все", icon: "Sparkle" },
  { id: "hit", label: "Хиты", icon: "Flame" },
  { id: "new", label: "Новинки", icon: "Sparkles" },
  { id: "sale", label: "Со скидкой", icon: "Tag" },
  { id: "trial", label: "Есть пробный", icon: "Gift" },
];

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [format, setFormat] = useState("all");
  const [badge, setBadge] = useState<BadgeFilter>("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = COURSES.filter((c) => {
      if (subject !== "all" && c.subject !== subject) return false;
      if (grade !== "all" && c.grade !== grade) return false;
      if (format !== "all" && c.format !== format) return false;
      if (badge === "hit" && !c.isHit) return false;
      if (badge === "new" && !c.isNew) return false;
      if (badge === "sale" && !c.isSale) return false;
      if (badge === "trial" && !c.trialAvailable) return false;
      if (q) {
        const blob = [
          c.title,
          c.description,
          c.tutor,
          c.tutorBadge,
          ...c.tags,
        ].join(" ").toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "price_asc":
        sorted.sort((a, b) => getCoursePrice(a) - getCoursePrice(b));
        break;
      case "price_desc":
        sorted.sort((a, b) => getCoursePrice(b) - getCoursePrice(a));
        break;
      case "new":
        sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case "popular":
      default:
        sorted.sort((a, b) => b.students - a.students);
    }
    return sorted;
  }, [query, subject, grade, format, badge, sort]);

  const activeFilters =
    (subject !== "all" ? 1 : 0) +
    (grade !== "all" ? 1 : 0) +
    (format !== "all" ? 1 : 0) +
    (badge !== "all" ? 1 : 0) +
    (query ? 1 : 0);

  const resetAll = () => {
    setQuery("");
    setSubject("all");
    setGrade("all");
    setFormat("all");
    setBadge("all");
    setSort("popular");
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Каталог курсов УЧИСЬПРО — школьная программа 1–11 классов, ОГЭ и ЕГЭ"
        description="Полный каталог онлайн-курсов УЧИСЬПРО: математика, физика, русский, английский и другие предметы для 1–11 классов, подготовка к ОГЭ и ЕГЭ. Поиск, фильтры по классам и предметам."
        canonical="https://xn--h1agdcde2c.xn--p1ai/courses"
        keywords="каталог курсов, онлайн курсы школьникам, курсы 1-11 классы, подготовка к егэ курсы, подготовка к огэ курсы, математика онлайн, физика онлайн, английский онлайн"
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.12 + (i % 4) * 0.08,
            }}
          />
        ))}
      </div>

      {/* Header bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог курсов" }]} />
          </div>
          <Link
            to="/pricing"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} />
            Тарифы
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-5 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          На главную
        </Link>

        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-3.5 py-1 mb-4">
          <Icon name="Library" size={13} className="text-purple-300" />
          <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Каталог · {COURSES.length} курсов</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Все курсы <span className="gradient-text-purple">УЧИСЬПРО</span>
        </h1>
        <p className="text-white/55 text-base md:text-lg max-w-2xl">
          Школьная программа 1–11 классов и подготовка к ОГЭ/ЕГЭ. Найди свой курс — поиском, по предмету или классу.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 mt-6">
        {/* Search */}
        <div className="relative mb-5">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, теме или преподавателю..."
            className="w-full bg-white/5 border border-white/12 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white p-1.5 rounded-lg hover:bg-white/8 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        {/* Subjects chips */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Предмет</p>
            {subject !== "all" && SUBJECTS_SEO.some((s) => s.subjectId === subject) && (
              <Link
                to={`/courses/${SUBJECTS_SEO.find((s) => s.subjectId === subject)?.slug}`}
                className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200 font-medium transition-colors"
              >
                Открыть страницу предмета
                <Icon name="ArrowUpRight" size={12} />
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubject(s.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  subject === s.id
                    ? "bg-purple-500/25 border border-purple-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grades chips */}
        <div className="mb-4">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-2">Класс</p>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGrade(g.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  grade === g.id
                    ? "bg-cyan-500/25 border border-cyan-500/45 text-white"
                    : "bg-white/5 border border-white/10 text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold w-full mb-1">Особое</p>
          {BADGES.map((b) => (
            <button
              key={b.id}
              onClick={() => setBadge(b.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                badge === b.id
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-200"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={b.icon} size={12} />
              {b.label}
            </button>
          ))}
        </div>

        {/* Results bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-t border-white/8 mb-6">
          <p className="text-white/70 text-sm">
            Найдено: <span className="font-bold text-white">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "курс" : filtered.length >= 2 && filtered.length <= 4 ? "курса" : "курсов"}
            {activeFilters > 0 && (
              <button
                onClick={resetAll}
                className="ml-3 inline-flex items-center gap-1.5 text-purple-300 hover:text-purple-200 text-xs font-medium underline-offset-2 hover:underline transition-colors"
              >
                <Icon name="X" size={12} />
                Сбросить фильтры
              </button>
            )}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-white/45 text-xs">Формат:</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/85 focus:outline-none focus:border-purple-500/40"
            >
              {FORMAT.map((f) => (
                <option key={f.id} value={f.id} className="bg-background">{f.label}</option>
              ))}
            </select>
            <label className="text-white/45 text-xs ml-2">Сортировка:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/85 focus:outline-none focus:border-purple-500/40"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} className="bg-background">{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-montserrat font-black text-xl text-white mb-2">Ничего не нашлось</h3>
            <p className="text-white/55 text-sm mb-5 max-w-md mx-auto">
              Попробуй другой поисковый запрос или сбрось фильтры — у нас 39 курсов, что-то точно подойдёт.
            </p>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              <Icon name="RefreshCw" size={14} />
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((c) => (
              <CourseCardCompact key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>

      {/* SEO-перелинковка: предметные лендинги */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Предметные подборки</p>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-2">
            Курсы по предметам
          </h2>
          <p className="text-white/55 text-sm md:text-base text-center max-w-2xl mx-auto mb-8">
            Подробные страницы по каждому предмету: программа, темы, FAQ, подготовка к ЕГЭ и ОГЭ.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SUBJECTS_SEO.map((s) => (
              <Link
                key={s.slug}
                to={`/courses/${s.slug}`}
                className="group relative bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:translate-y-[-2px] transition-all"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={s.ogImage}
                    alt={`${s.name} — курсы УЧИСЬПРО`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className={`absolute top-2 right-2 w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg shadow-lg`}>
                    {s.emoji}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-montserrat font-black text-white text-sm leading-tight mb-0.5 drop-shadow-lg">{s.name}</p>
                    <p className="text-white/70 text-[10px] font-medium">
                      {COURSES.filter((c) => c.subject === s.subjectId).length} курсов
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />

      {showMobileFilters && <div onClick={() => setShowMobileFilters(false)} />}
    </div>
  );
}