import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  SUBJECTS,
  GRADES,
  FORMAT,
  SORT_OPTIONS,
  SortKey,
} from "@/components/courses/coursesData";
import { SUBJECTS_SEO } from "@/components/courses/subjectsSeo";
import { BADGES, BadgeFilter } from "./coursesCatalogData";

interface CoursesFiltersProps {
  query: string;
  setQuery: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  grade: string;
  setGrade: (v: string) => void;
  format: string;
  setFormat: (v: string) => void;
  badge: BadgeFilter;
  setBadge: (v: BadgeFilter) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
  filteredCount: number;
  activeFilters: number;
  resetAll: () => void;
}

export default function CoursesFilters({
  query,
  setQuery,
  subject,
  setSubject,
  grade,
  setGrade,
  format,
  setFormat,
  badge,
  setBadge,
  sort,
  setSort,
  filteredCount,
  activeFilters,
  resetAll,
}: CoursesFiltersProps) {
  return (
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
          Найдено: <span className="font-bold text-white">{filteredCount}</span>{" "}
          {filteredCount === 1 ? "курс" : filteredCount >= 2 && filteredCount <= 4 ? "курса" : "курсов"}
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
  );
}
