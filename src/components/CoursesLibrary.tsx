import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { COURSES, SortKey } from "./courses/coursesData";
import CoursesFilters from "./courses/CoursesFilters";
import CourseCard from "./courses/CourseCard";

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

        <CoursesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          sortKey={sortKey}
          setSortKey={setSortKey}
          subjectFilter={subjectFilter}
          setSubjectFilter={setSubjectFilter}
          gradeFilter={gradeFilter}
          setGradeFilter={setGradeFilter}
          formatFilter={formatFilter}
          setFormatFilter={setFormatFilter}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          trialOnly={trialOnly}
          setTrialOnly={setTrialOnly}
          activeFiltersCount={activeFiltersCount}
          resetFilters={resetFilters}
        />

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
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isExpanded={expandedId === course.id}
                onToggleExpand={() => setExpandedId(expandedId === course.id ? null : course.id)}
              />
            ))}
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
