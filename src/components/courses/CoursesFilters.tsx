import Icon from "@/components/ui/icon";
import { SUBJECTS, GRADES, FORMAT, SORT_OPTIONS, SortKey } from "./coursesData";

interface CoursesFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filtersOpen: boolean;
  setFiltersOpen: (v: boolean) => void;
  sortKey: SortKey;
  setSortKey: (v: SortKey) => void;
  subjectFilter: string;
  setSubjectFilter: (v: string) => void;
  gradeFilter: string;
  setGradeFilter: (v: string) => void;
  formatFilter: string;
  setFormatFilter: (v: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  trialOnly: boolean;
  setTrialOnly: (v: boolean) => void;
  activeFiltersCount: number;
  resetFilters: () => void;
}

export default function CoursesFilters({
  searchQuery, setSearchQuery,
  filtersOpen, setFiltersOpen,
  sortKey, setSortKey,
  subjectFilter, setSubjectFilter,
  gradeFilter, setGradeFilter,
  formatFilter, setFormatFilter,
  priceRange, setPriceRange,
  trialOnly, setTrialOnly,
  activeFiltersCount, resetFilters,
}: CoursesFiltersProps) {
  return (
    <>
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
    </>
  );
}
