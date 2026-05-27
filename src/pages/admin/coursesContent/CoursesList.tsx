import Icon from "@/components/ui/icon";
import { COURSES, SUBJECTS } from "@/components/courses/coursesData";
import { CourseStatus, FilterKind, Stats } from "./types";

interface Props {
  filtered: typeof COURSES;
  statuses: Record<number, CourseStatus>;
  fallbackCourses: number[];
  loading: boolean;
  filter: FilterKind;
  subjectFilter: string;
  stats: Stats;
  currentCourseId: number | null;
  running: boolean;
  setFilter: (f: FilterKind) => void;
  setSubjectFilter: (s: string) => void;
  fetchStatuses: () => void;
  generateOne: (courseId: number) => void;
}

export default function CoursesList({
  filtered,
  statuses,
  fallbackCourses,
  loading,
  filter,
  subjectFilter,
  stats,
  currentCourseId,
  running,
  setFilter,
  setSubjectFilter,
  fetchStatuses,
  generateOne,
}: Props) {
  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {[
            { id: "missing", label: `Без программы (${stats.missing})` },
            { id: "ready", label: `Готовые (${stats.ready})` },
            { id: "all", label: `Все (${stats.total})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterKind)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === f.id ? "bg-purple-500/25 text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="bg-white/5 border border-white/12 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/50"
        >
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id} className="bg-background">
              {s.emoji} {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={fetchStatuses}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 text-xs px-3 py-2 rounded-xl"
        >
          <Icon name="RefreshCw" size={11} className={loading ? "animate-spin" : ""} />
          Обновить статусы
        </button>
      </div>

      {/* Таблица курсов */}
      {loading && filtered.length === 0 ? (
        <div className="text-center py-12 text-white/45">
          <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-3" />
          <p className="text-sm">Загружаю статусы...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/45 bg-card/40 rounded-3xl">
          <Icon name="Inbox" size={32} className="mx-auto mb-3" />
          <p className="text-sm">Курсов с такими фильтрами нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const status = statuses[c.id];
            const has = status?.has_curriculum;
            const isFallback = fallbackCourses.includes(c.id);
            const subj = SUBJECTS.find((s) => s.id === c.subject);
            const isCurrent = currentCourseId === c.id;
            return (
              <div
                key={c.id}
                className={`bg-card/60 border rounded-2xl p-4 flex items-center gap-3 transition-all ${
                  isCurrent ? "border-purple-500/60 bg-purple-500/10 scale-[1.01]" :
                  isFallback ? "border-amber-500/35 bg-amber-500/[0.04]" :
                  has ? "border-emerald-500/25" : "border-rose-500/25"
                }`}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-white/5 relative">
                  {c.emoji}
                  {isCurrent && (
                    <Icon name="Loader2" size={20} className="animate-spin text-purple-300 absolute" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="text-white text-sm font-bold truncate">{c.title}</h3>
                    <span className="text-[10px] bg-white/10 text-white/65 px-1.5 py-0.5 rounded font-bold">#{c.id}</span>
                    {isFallback && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold px-1.5 py-0.5 rounded">
                        <Icon name="Wand2" size={8} />
                        шаблон
                      </span>
                    )}
                  </div>
                  <p className="text-white/55 text-[11px]">
                    {subj?.label} · {c.grade} · {c.lessons} уроков обещано
                    {has && status.total_lessons !== undefined && (
                      <span className={isFallback ? "text-amber-300" : "text-emerald-300"}> · {status.total_lessons} в БД, {status.total_modules} модулей, ~{status.estimated_hours}ч</span>
                    )}
                  </p>
                </div>
                {has ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isFallback ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200"}`}>
                      v{status.version}
                    </span>
                    <button
                      onClick={() => generateOne(c.id)}
                      disabled={running}
                      title={isFallback ? "Перегенерировать через ИИ" : "Пересоздать программу"}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/65 disabled:opacity-50"
                    >
                      <Icon name="RefreshCw" size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => generateOne(c.id)}
                    disabled={running}
                    className="inline-flex items-center gap-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-200 text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50 flex-shrink-0"
                  >
                    <Icon name="Wand2" size={12} />
                    Сгенерировать
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
