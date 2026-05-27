import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { COURSES, SUBJECTS } from "@/components/courses/coursesData";
import func2url from "../../../backend/func2url.json";

const COURSE_BUILDER_URL = (func2url as Record<string, string>)["course-builder"];
const PROGRESS_KEY = "uchispro_courses_gen_progress_v2";

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
  fallback?: boolean;
  ai_error?: string;
}

interface PersistedProgress {
  queue: number[];
  done: BatchResult[];
  startedAt: number;
  total: number;
}

function loadProgress(): PersistedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveProgress(p: PersistedProgress | null) {
  try {
    if (p === null) localStorage.removeItem(PROGRESS_KEY);
    else localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch { /* noop */ }
}

/** Гарантированная генерация одного курса с ретраями и fallback на последней попытке.
 * Возвращает результат всегда — даже при тотальной недоступности ИИ (тогда generated=false). */
async function generateOneCourse(courseId: number): Promise<BatchResult> {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return { course_id: courseId, generated: false, error: "курс не найден" };

  const MAX_ATTEMPTS = 3;
  let lastError = "unknown";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Жёсткий abort через 32 сек — Cloud Function всё равно убивается на 30 сек,
    // ждать дольше бессмысленно, провоцируем переход на fallback
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 32000);

    try {
      const res = await fetch(`${COURSE_BUILDER_URL}?action=batch_generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
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
          // С первой попытки разрешаем fallback — бэк сам решит, нужен ли он
          allow_fallback: true,
        }),
      });
      clearTimeout(abortTimer);

      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        if (res.status >= 500) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        return { course_id: courseId, title: course.title, generated: false, error: lastError };
      }

      const data = await res.json();
      const first = (data.results || [])[0] as BatchResult | undefined;
      if (first) return first;
      lastError = data.error || "пустой ответ";
    } catch (e) {
      clearTimeout(abortTimer);
      const isAbort = e instanceof DOMException && e.name === "AbortError";
      lastError = isAbort ? "превышен таймаут (32с)" : (e instanceof Error ? e.message : "network error");
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }

  return { course_id: courseId, title: course.title, generated: false, error: `${lastError} (${MAX_ATTEMPTS} попыток)` };
}

export default function CoursesContent() {
  const [statuses, setStatuses] = useState<Record<number, CourseStatus>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "missing" | "ready">("missing");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  // Очередь и результаты — синхронизированы с localStorage
  const [queue, setQueue] = useState<number[]>([]);
  const [done, setDone] = useState<BatchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // refs для контроля воркера
  const runningRef = useRef(false);
  const pausedRef = useRef(false);

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
        Object.entries(data.statuses).forEach(([k, v]) => { parsed[Number(k)] = v as CourseStatus; });
        setStatuses(parsed);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ошибка загрузки");
    }
    setLoading(false);
  };

  // Восстанавливаем прогресс при заходе
  useEffect(() => {
    fetchStatuses();
    const saved = loadProgress();
    if (saved && saved.queue.length > 0) {
      setQueue(saved.queue);
      setDone(saved.done);
    }
  }, []);

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

  /** Главный воркер — берёт ID из очереди по одному и обрабатывает. Состояние persists в localStorage. */
  const processQueue = async (initialQueue: number[]) => {
    runningRef.current = true;
    pausedRef.current = false;
    setRunning(true);
    setPaused(false);

    const total = initialQueue.length + done.length;
    saveProgress({ queue: initialQueue, done, startedAt: Date.now(), total });

    let workingQueue = [...initialQueue];
    let accumDone = [...done];

    while (workingQueue.length > 0) {
      if (!runningRef.current) break;
      if (pausedRef.current) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      const nextId = workingQueue[0];
      setCurrentCourseId(nextId);

      const result = await generateOneCourse(nextId);

      accumDone = [...accumDone, result];
      workingQueue = workingQueue.slice(1);

      // СРАЗУ сохраняем — даже если потом всё упадёт, прогресс не потеряется
      saveProgress({ queue: workingQueue, done: accumDone, startedAt: Date.now(), total });
      setDone(accumDone);
      setQueue(workingQueue);

      // После каждых 3 курсов обновляем статусы
      if (accumDone.length % 3 === 0) {
        fetchStatuses();
      }

      // Небольшая пауза между запросами — не душим бэкенд
      await new Promise((r) => setTimeout(r, 800));
    }

    runningRef.current = false;
    setRunning(false);
    setCurrentCourseId(null);
    if (workingQueue.length === 0) {
      saveProgress(null);
    }
    await fetchStatuses();
  };

  const startGenerateAllMissing = () => {
    const targets = COURSES.filter((c) => !statuses[c.id]?.has_curriculum).map((c) => c.id);
    if (targets.length === 0) {
      setError("Все курсы уже сгенерированы");
      return;
    }
    setError(null);
    setDone([]);
    setQueue(targets);
    processQueue(targets);
  };

  const resumeGeneration = () => {
    if (queue.length === 0) return;
    setError(null);
    processQueue(queue);
  };

  const generateOne = (courseId: number) => {
    if (running) return;
    setError(null);
    setDone([]);
    setQueue([courseId]);
    processQueue([courseId]);
  };

  const pauseGeneration = () => { pausedRef.current = true; setPaused(true); };
  const resumePause = () => { pausedRef.current = false; setPaused(false); };
  const stopGeneration = () => {
    runningRef.current = false;
    pausedRef.current = false;
    setRunning(false);
    setPaused(false);
    setCurrentCourseId(null);
  };
  const clearProgress = () => {
    setDone([]);
    setQueue([]);
    saveProgress(null);
  };

  const progressTotal = done.length + queue.length;
  const progressDone = done.length;
  const failedItems = done.filter((d) => !d.generated && !d.skipped);

  const retryFailed = () => {
    if (failedItems.length === 0) return;
    setError(null);
    const ids = failedItems.map((f) => f.course_id);
    setDone(done.filter((d) => !ids.includes(d.course_id)));
    setQueue(ids);
    processQueue(ids);
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
          Каждый курс получает уникальную программу по ФГОС. Генерация идёт <b>по одному курсу</b>: даже если связь оборвётся — прогресс сохранится в браузере и продолжится автоматически.
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

        {/* Возобновление сохранённой сессии */}
        {!running && queue.length > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/35 rounded-2xl p-4 mb-6 flex items-center gap-3 flex-wrap">
            <Icon name="History" size={20} className="text-amber-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Найдена незавершённая сессия генерации</p>
              <p className="text-white/65 text-xs">Сделано {done.length}, осталось {queue.length} курсов. Можно продолжить.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={resumeGeneration} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                <Icon name="Play" size={12} className="inline mr-1" />
                Продолжить
              </button>
              <button onClick={clearProgress} className="bg-white/8 hover:bg-white/12 text-white/65 font-bold text-xs px-3 py-2 rounded-xl">
                Сбросить
              </button>
            </div>
          </div>
        )}

        {/* Главная кнопка / прогресс */}
        <div className="bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-purple-500/30 rounded-3xl p-5 mb-6">
          {!running && queue.length === 0 && (
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-montserrat font-black text-white text-base mb-1">Заполнить все курсы программой</p>
                <p className="text-white/65 text-xs max-w-xl">
                  Очередь обрабатывается <b>по одному курсу</b>. Прогресс сохраняется после каждого — обрыв связи или закрытие вкладки не потеряют сделанного.
                </p>
              </div>
              <button
                onClick={startGenerateAllMissing}
                disabled={stats.missing === 0}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                <Icon name="Sparkles" size={14} />
                Сгенерировать программы для {stats.missing} курсов
              </button>
            </div>
          )}

          {(running || queue.length > 0) && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div>
                  <p className="font-montserrat font-black text-white text-base">
                    {running ? (paused ? "⏸ Пауза" : "🤖 Генерирую программы...") : "Очередь готова к продолжению"}
                  </p>
                  <p className="text-white/65 text-xs">
                    Сделано {progressDone} из {progressTotal}
                    {currentCourseId && running && !paused && (
                      <> · сейчас: курс #{currentCourseId}</>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {running && !paused && (
                    <button onClick={pauseGeneration} className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/35 text-amber-200 font-bold text-xs px-3 py-2 rounded-xl">
                      <Icon name="Pause" size={12} />
                      Пауза
                    </button>
                  )}
                  {running && paused && (
                    <button onClick={resumePause} className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/35 text-emerald-200 font-bold text-xs px-3 py-2 rounded-xl">
                      <Icon name="Play" size={12} />
                      Продолжить
                    </button>
                  )}
                  {running && (
                    <button onClick={stopGeneration} className="inline-flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/35 text-rose-200 font-bold text-xs px-3 py-2 rounded-xl">
                      <Icon name="Square" size={12} />
                      Остановить
                    </button>
                  )}
                </div>
              </div>

              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                  style={{ width: `${progressTotal > 0 ? (progressDone / progressTotal) * 100 : 0}%` }}
                />
              </div>

              {failedItems.length > 0 && !running && (
                <button onClick={retryFailed} className="mt-3 inline-flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-200 font-bold text-xs px-3 py-2 rounded-xl">
                  <Icon name="RefreshCw" size={12} />
                  Повторить {failedItems.length} провалившихся курсов
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-500/15 border border-rose-500/35 rounded-xl p-3 text-rose-200 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Лента результатов */}
        {done.length > 0 && (
          <div className="bg-card/60 border border-white/10 rounded-3xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">
                Результаты ({done.length}: ✓ {done.filter(d => d.generated).length} · ⚠ {done.filter(d => d.fallback).length} fallback · ✗ {failedItems.length} ошибок · ⏭ {done.filter(d => d.skipped).length} пропущено)
              </p>
              {!running && (
                <button onClick={clearProgress} className="text-white/45 hover:text-white text-[10px] uppercase tracking-wider font-bold">
                  Очистить лог
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {done.slice().reverse().map((r, i) => (
                <div key={`${r.course_id}-${i}`} className={`flex items-center gap-2 text-xs rounded-xl p-2 ${
                  r.generated && !r.fallback ? "bg-emerald-500/10 border border-emerald-500/30" :
                  r.fallback ? "bg-amber-500/10 border border-amber-500/30" :
                  r.skipped ? "bg-white/[0.03] border border-white/8" :
                  "bg-rose-500/10 border border-rose-500/30"
                }`}>
                  <Icon
                    name={
                      r.generated && !r.fallback ? "CheckCircle2" :
                      r.fallback ? "Wand2" :
                      r.skipped ? "SkipForward" : "AlertCircle"
                    }
                    size={12}
                    className={
                      r.generated && !r.fallback ? "text-emerald-300" :
                      r.fallback ? "text-amber-300" :
                      r.skipped ? "text-white/45" : "text-rose-300"
                    }
                  />
                  <span className="text-white/85 font-bold flex-1 truncate">
                    #{r.course_id} · {r.title || `Курс ${r.course_id}`}
                  </span>
                  <span className="text-white/55 text-[10px] truncate max-w-[40%] text-right">
                    {r.generated ? `${r.total_lessons} уроков, ${r.total_modules} модулей${r.fallback ? ' · fallback' : ''}` :
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
              const subj = SUBJECTS.find((s) => s.id === c.subject);
              const isCurrent = currentCourseId === c.id;
              return (
                <div
                  key={c.id}
                  className={`bg-card/60 border rounded-2xl p-4 flex items-center gap-3 transition-all ${
                    isCurrent ? "border-purple-500/60 bg-purple-500/10 scale-[1.01]" :
                    has ? "border-emerald-500/25" : "border-amber-500/20"
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
                        disabled={running}
                        title="Пересоздать программу"
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
      </div>
    </div>
  );
}