import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import CourseCardCompact from "@/components/courses/CourseCardCompact";
import FreeCoursesBlock from "@/components/courses/FreeCoursesBlock";
import useReadyCourses from "@/hooks/useReadyCourses";
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

type BadgeFilter = "all" | "free" | "new" | "hit" | "sale" | "trial";

const BADGES: { id: BadgeFilter; label: string; icon: string }[] = [
  { id: "all", label: "Все", icon: "Sparkle" },
  { id: "free", label: "Бесплатные", icon: "Gift" },
  { id: "hit", label: "Хиты", icon: "Flame" },
  { id: "new", label: "Новинки", icon: "Sparkles" },
  { id: "sale", label: "Со скидкой", icon: "Tag" },
  { id: "trial", label: "Есть пробный", icon: "Star" },
];

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

// JSON-LD: каталог курсов как ItemList со вложенными Course schema.org
// Это даёт rich snippets в Google: список курсов с рейтингом, провайдером, описанием
const COURSES_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Каталог онлайн-курсов УЧИСЬПРО",
    description: "Полный каталог онлайн-курсов для школьников 1–11 классов и подготовки к ОГЭ/ЕГЭ",
    numberOfItems: COURSES.length,
    itemListElement: COURSES.slice(0, 20).map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Course",
        "@id": `${SITE_URL}/course-checkout/${c.id}`,
        name: c.title,
        description: c.description,
        url: `${SITE_URL}/course-checkout/${c.id}`,
        provider: {
          "@type": "EducationalOrganization",
          name: "УЧИСЬПРО",
          sameAs: SITE_URL,
        },
        educationalLevel:
          c.grade === "ege" ? "ЕГЭ" :
          c.grade === "oge" ? "ОГЭ" :
          c.grade === "1-4" ? "1–4 класс" :
          c.grade === "5-9" ? "5–9 класс" :
          c.grade === "10-11" ? "10–11 класс" : c.grade,
        teaches: c.tags.join(", "),
        inLanguage: "ru-RU",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: c.rating,
          reviewCount: c.reviews,
          bestRating: 5,
          worstRating: 1,
        },
        offers: {
          "@type": "Offer",
          price: getCoursePrice(c),
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          category: c.trialAvailable ? "Подписка с пробным периодом" : "Подписка",
          url: `${SITE_URL}/course-checkout/${c.id}`,
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: c.format === "online" ? "online" : c.format === "offline" ? "onsite" : "online",
          courseWorkload: `PT${c.lessons * 30}M`,
        },
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Каталог курсов", item: `${SITE_URL}/courses` },
    ],
  },
];

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const initialBadge: BadgeFilter =
    searchParams.get("badge") === "free" ? "free" : "all";
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [format, setFormat] = useState("all");
  const [badge, setBadge] = useState<BadgeFilter>(initialBadge);
  const [sort, setSort] = useState<SortKey>("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Только курсы с реальной (НЕ шаблонной) программой — нельзя продавать продукт без качества
  const { readyIds, loaded: readyLoaded } = useReadyCourses();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = COURSES.filter((c) => {
      // Главный фильтр: курсы без реальной программы НЕ показываем
      if (!readyIds.has(c.id)) return false;
      if (subject !== "all" && c.subject !== subject) return false;
      if (grade !== "all" && c.grade !== grade) return false;
      if (format !== "all" && c.format !== format) return false;
      if (badge === "free" && !c.freeForever) return false;
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
  }, [query, subject, grade, format, badge, sort, readyIds]);

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
        jsonLd={COURSES_JSON_LD}
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
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" aria-label="Шапка сайта">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="На главную УЧИСЬПРО">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог курсов" }]} />
          </div>
          <Link
            to="/pricing"
            aria-label="Посмотреть тарифы"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} aria-hidden="true" />
            Тарифы
          </Link>
        </nav>
      </header>

      <main>
      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-4" aria-labelledby="courses-hero-title">
        <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-5 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          На главную
        </Link>

        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-3.5 py-1 mb-4">
          <Icon name="Library" size={13} className="text-purple-300" />
          <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Каталог · {COURSES.length} курсов</span>
        </div>
        <h1 id="courses-hero-title" className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
          Все курсы <span className="gradient-text-purple">УЧИСЬПРО</span>
        </h1>
        <p className="text-white/55 text-base md:text-lg max-w-2xl">
          Школьная программа 1–11 классов и подготовка к ОГЭ/ЕГЭ. Найди свой курс — поиском, по предмету или классу.
        </p>
      </section>

      {/* Бесплатные курсы — показываем, пока пользователь не начал искать/фильтровать */}
      {badge === "all" && subject === "all" && grade === "all" && format === "all" && !query && (
        <FreeCoursesBlock compact />
      )}

      {/* Search + Filters */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 mt-6" aria-label="Поиск и фильтрация курсов">
        {/* Search */}
        <div className="relative mb-5">
          <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, теме или преподавателю..."
            aria-label="Поиск курсов"
            className="w-full bg-white/5 border border-white/12 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Очистить поиск"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white p-1.5 rounded-lg hover:bg-white/8 transition-colors"
            >
              <Icon name="X" size={16} aria-hidden="true" />
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
      </section>

      {/* Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16" aria-label="Результаты поиска курсов">
        {!readyLoaded ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center" role="status">
            <Icon name="Loader2" size={28} className="animate-spin text-purple-300 mx-auto mb-3" />
            <p className="text-white/55 text-sm">Загружаем актуальный каталог...</p>
          </div>
        ) : readyIds.size === 0 ? (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/[0.05] p-12 text-center" role="status">
            <div className="text-6xl mb-4" aria-hidden="true">🚀</div>
            <h3 className="font-montserrat font-black text-xl text-white mb-2">Курсы готовятся к запуску</h3>
            <p className="text-white/65 text-sm mb-5 max-w-md mx-auto">
              Сейчас наши методисты собирают финальные программы. Подпишись на уведомления — пришлём, как только первые курсы выйдут.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center" role="status">
            <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
            <h3 className="font-montserrat font-black text-xl text-white mb-2">Ничего не нашлось</h3>
            <p className="text-white/55 text-sm mb-5 max-w-md mx-auto">
              Попробуй другой поисковый запрос или сбрось фильтры.
            </p>
            <button
              onClick={resetAll}
              aria-label="Сбросить все фильтры"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity"
            >
              <Icon name="RefreshCw" size={14} aria-hidden="true" />
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 list-none p-0 m-0">
            {filtered.map((c) => (
              <li key={c.id}>
                <CourseCardCompact course={c} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SEO-перелинковка: предметные лендинги */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16" aria-labelledby="subjects-heading">
        <article className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
          <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Предметные подборки</p>
          <h2 id="subjects-heading" className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-2">
            Курсы по предметам
          </h2>
          <p className="text-white/55 text-sm md:text-base text-center max-w-2xl mx-auto mb-8">
            Подробные страницы по каждому предмету: программа, темы, FAQ, подготовка к ЕГЭ и ОГЭ.
          </p>
          <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" aria-label="Каталог предметов">
            {SUBJECTS_SEO.map((s) => (
              <Link
                key={s.slug}
                to={`/courses/${s.slug}`}
                aria-label={`Открыть страницу предмета: ${s.name}`}
                className="group relative bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:translate-y-[-2px] transition-all"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={s.ogImage}
                    alt={`${s.name} — курсы УЧИСЬПРО`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden="true" />
                  <div className={`absolute top-2 right-2 w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg shadow-lg`} aria-hidden="true">
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
          </nav>
        </article>
      </section>
      </main>

      <SiteFooter />

      {showMobileFilters && <div onClick={() => setShowMobileFilters(false)} />}
    </div>
  );
}