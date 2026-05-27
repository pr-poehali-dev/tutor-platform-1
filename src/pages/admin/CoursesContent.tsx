import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { COURSES, SUBJECTS } from "@/components/courses/coursesData";
import func2url from "../../../backend/func2url.json";

const COURSE_BUILDER_URL = (func2url as Record<string, string>)["course-builder"];

interface CourseStatus {
  has_curriculum: boolean;
  total_lessons?: number;
  total_modules?: number;
  estimated_hours?: number;
  version?: number;
  updated_at?: string;
}

interface BatchResult {
  course_id: number;
  title?: string;
  generated?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  total_lessons?: number;
  total_modules?: number;
  version?: number;
}

export default function CoursesContent() {
  const [statuses, setStatuses] = useState<Record<number, CourseStatus>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "missing" | "ready">("missing");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const ids = COURSES.map((c) => c.id);
      const res = await fetch(`${COURSE_BUILDER_URL}?action=status_all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_ids: ids }),
      });
      const data = await res.json();
      if (data.statuses) {
        const parsed: Record<number, CourseStatus> = {};
        Object.entries(data.statuses).forEach(([k, v]) => {
          parsed[Number(k)] = v as CourseStatus;
        });
        setStatuses(parsed);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ошибка загрузки");
    }
    setLoading(false);
  };

  useEffect(() => { fetchStatuses(); }, []);

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      if (subjectFilter !== "all" && c.subject !== subjectFilter) return false;
      const has = statuses[c.id]?.has_curriculum;
      if (filter === "missing" && has) return false;
      if (filter === "ready" && !has) return false;
      return true;
    });
  }, [statuses, filter, subjectFilter]);

  const stats = useMemo(() => {
    const total = COURSES.length;
    const ready = COURSES.filter((c) => statuses[c.id]?.has_curriculum).length;
    return { total, ready, missing: total - ready };
  }, [statuses]);

  const generateOne = async (courseId: number) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;
    setBatchRunning(true);
    setError(null);
    try {
      const res = await fetch(`${COURSE_BUILDER_URL}?action=batch_generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: [{
            id: course.id,
            title: course.title,
            subject: course.subject,
            grade: course.grade,
            lessons: course.lessons,
            duration: course.duration,
            description: course.description,
            format: course.format,
          }],
          limit: 1,
        }),
      });
      const data = await res.json();
      if (data.results) setBatchResults(data.results);
      await fetchStatuses();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ошибка");
    }
    setBatchRunning(false);
  };

  const generateAllMissing = async () => {
    const targets = COURSES.filter((c) => !statuses[c.id]?.has_curriculum);
    if (targets.length === 0) {
      setError("Все курсы уже сгенерированы");
      return;
    }
    setBatchRunning(true);
    setError(null);
    setBatchResults([]);
    setBatchProgress({ done: 0, total: targets.length });

    const BATCH_SIZE = 3; // по 3 курса за запрос — балансируем нагрузку и таймаут
    let processed = 0;
    const allResults: BatchResult[] = [];

    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const chunk = targets.slice(i, i + BATCH_SIZE);
      try {
        const res = await fetch(`${COURSE_BUILDER_URL}?action=batch_generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courses: chunk.map((c) => ({
              id: c.id,
              title: c.title,
              subject: c.subject,
              grade: c.grade,
              lessons: c.lessons,
              duration: c.duration,
              description: c.description,
              format: c.format,
            })),
            limit: BATCH_SIZE,
          }),
        });
        const data = await res.json();
        if (data.results) {
          allResults.push(...data.results);
          setBatchResults([...allResults]);
        }
      } catch {
        chunk.forEach((c) => allResults.push({ course_id: c.id, title: c.title, generated: false, error: "network" }));
        setBatchResults([...allResults]);
      }
      processed += chunk.length;
      setBatchProgress({ done: processed, total: targets.length });
      await fetchStatuses();
    }

    setBatchRunning(false);
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo title="Контент курсов — УЧИСЬПРО (админ)" description="Управление программами курсов." noindex />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <span className="text-xs text-white/45 uppercase tracking-wider font-semibold">Админ · Контент курсов</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 rounded-full px-4 py-1.5 mb-4">
          <Icon name="BookOpenCheck" size={14} className="text-emerald-300" />
          <span className="text-sm text-emerald-200 font-bold uppercase tracking-wider">Контент курсов</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3">
          Программы <span className="gradient-text-purple">{COURSES.length} курсов</span>
        </h1>
        <p className="text-white/65 text-base md:text-lg max-w-3xl mb-8">
          Каждый курс должен иметь свою программу с реальными уроками по ФГОС. ИИ-методист «Архитектор программы» построит её за 30-60 секунд для каждого.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card/60 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl font-montserrat font-black text-white">{stats.total}</div>
            <div className="text-white/45 text-[10px] uppercase tracking-wider font-bold">всего курсов</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
            <div className="text-3xl font-montserrat font-black text-emerald-300">{stats.ready}</div>
            <div className="text-emerald-200/65 text-[10px] uppercase tracking-wider font-bold">с программой</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
            <div className="text-3xl font-montserrat font-black text-amber-300">{stats.missing}</div>
            <div className="text-amber-200/65 text-[10px] uppercase tracking-wider font-bold">без программы</div>
          </div>
        </div>

        {/* Главная кнопка */}
        <div className="bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-purple-500/30 rounded-3xl p-5 mb-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-montserrat font-black text-white text-base mb-1">Заполнить все курсы программой</p>
              <p className="text-white/65 text-xs max-w-xl">
                ИИ-методист построит реальные программы для {stats.missing} курсов с темами по ФГОС, типами уроков и навыками. ≈30-60 сек на курс.
              </p>
            </div>
            <button
              onClick={generateAllMissing}
              disabled={batchRunning || stats.missing === 0}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {batchRunning ? (
                <>
                  <Icon name="Loader2" size={14} className="animate-spin" />
                  Генерирую... {batchProgress && `${batchProgress.done}/${batchProgress.total}`}
                </>
              ) : (
                <>
                  <Icon name="Sparkles" size={14} />
                  Сгенерировать программы для {stats.missing} курсов
                </>
              )}
            </button>
          </div>
          {batchProgress && batchRunning && (
            <div className="mt-3 h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/35 rounded-xl p-3 text-rose-200 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Последние результаты batch */}
        {batchResults.length > 0 && (
          <div className="bg-card/60 border border-white/10 rounded-3xl p-4 mb-6">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-2">Результаты последнего запуска</p>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {batchResults.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs rounded-xl p-2 ${
                  r.generated ? "bg-emerald-500/10 border border-emerald-500/30" :
                  r.skipped ? "bg-white/[0.03] border border-white/8" :
                  "bg-rose-500/10 border border-rose-500/30"
                }`}>
                  <Icon
                    name={r.generated ? "CheckCircle2" : r.skipped ? "SkipForward" : "AlertCircle"}
                    size={12}
                    className={r.generated ? "text-emerald-300" : r.skipped ? "text-white/45" : "text-rose-300"}
                  />
                  <span className="text-white/85 font-bold flex-1 truncate">{r.title || `Курс ${r.course_id}`}</span>
                  <span className="text-white/55 text-[10px]">
                    {r.generated ? `${r.total_lessons} уроков, ${r.total_modules} модулей` :
                     r.skipped ? r.reason :
                     r.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
                onClick={() => setFilter(f.id as "all" | "missing" | "ready")}
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
            disabled={loading || batchRunning}
            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/75 text-xs px-3 py-2 rounded-xl"
          >
            <Icon name="RefreshCw" size={11} className={loading ? "animate-spin" : ""} />
            Обновить
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
              const subj = SUBJECTS.find((s) => s.id === c.subject);
              return (
                <div
                  key={c.id}
                  className={`bg-card/60 border rounded-2xl p-4 flex items-center gap-3 ${
                    has ? "border-emerald-500/25" : "border-amber-500/20"
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-white/5">
                    {c.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-white text-sm font-bold truncate">{c.title}</h3>
                      <span className="text-[10px] bg-white/10 text-white/65 px-1.5 py-0.5 rounded font-bold">#{c.id}</span>
                    </div>
                    <p className="text-white/55 text-[11px]">
                      {subj?.label} · {c.grade} · {c.lessons} уроков обещано
                      {has && status.total_lessons !== undefined && (
                        <span className="text-emerald-300"> · {status.total_lessons} в БД, {status.total_modules} модулей, ~{status.estimated_hours}ч</span>
                      )}
                    </p>
                  </div>
                  {has ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-200 font-bold px-2 py-1 rounded-lg">
                        v{status.version}
                      </span>
                      <button
                        onClick={() => generateOne(c.id)}
                        disabled={batchRunning}
                        title="Пересоздать программу"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/65 disabled:opacity-50"
                      >
                        <Icon name="RefreshCw" size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateOne(c.id)}
                      disabled={batchRunning}
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
      </div>
    </div>
  );
}
