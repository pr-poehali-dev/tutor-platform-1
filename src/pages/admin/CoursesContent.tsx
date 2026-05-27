import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { COURSES } from "@/components/courses/coursesData";
import StatsHeader from "./coursesContent/StatsHeader";
import GenerationControls from "./coursesContent/GenerationControls";
import ResultsLog from "./coursesContent/ResultsLog";
import CoursesList from "./coursesContent/CoursesList";
import { BatchResult, CourseStatus, FilterKind } from "./coursesContent/types";
import {
  COURSE_BUILDER_URL,
  generateOneCourse,
  loadProgress,
  saveProgress,
} from "./coursesContent/utils";

export default function CoursesContent() {
  const [statuses, setStatuses] = useState<Record<number, CourseStatus>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKind>("missing");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  // Очередь и результаты — синхронизированы с localStorage
  const [queue, setQueue] = useState<number[]>([]);
  const [done, setDone] = useState<BatchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [forceAIMode, setForceAIMode] = useState(false);

  // Fallback-курсы (которые сгенерены шаблонно, ждут ИИ-обновления)
  const [fallbackCourses, setFallbackCourses] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);

  // refs для контроля воркера
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const forceAIRef = useRef(false);

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

  const fetchFallbackList = async () => {
    try {
      const res = await fetch(`${COURSE_BUILDER_URL}?action=list_fallback`);
      const data = await res.json();
      if (data.course_ids) {
        // Берём только курсы из активного каталога (исключаем тестовые)
        const known = new Set(COURSES.map((c) => c.id));
        setFallbackCourses((data.course_ids as number[]).filter((id) => known.has(id)));
      }
    } catch { /* noop */ }
  };

  // Восстанавливаем прогресс при заходе
  useEffect(() => {
    fetchStatuses();
    fetchFallbackList();
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
    // В продаже = у курса есть программа И она НЕ шаблонная
    const onSale = COURSES.filter(
      (c) => statuses[c.id]?.has_curriculum && !fallbackCourses.includes(c.id),
    ).length;
    return { total, ready, missing: total - ready, onSale };
  }, [statuses, fallbackCourses]);

  /** Главный воркер — берёт ID из очереди по одному и обрабатывает. Состояние persists в localStorage. */
  const processQueue = async (initialQueue: number[], forceAI = false) => {
    runningRef.current = true;
    pausedRef.current = false;
    forceAIRef.current = forceAI;
    setRunning(true);
    setPaused(false);
    setForceAIMode(forceAI);

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

      const result = await generateOneCourse(nextId, forceAIRef.current);

      accumDone = [...accumDone, result];
      workingQueue = workingQueue.slice(1);

      // СРАЗУ сохраняем — даже если потом всё упадёт, прогресс не потеряется
      saveProgress({ queue: workingQueue, done: accumDone, startedAt: Date.now(), total });
      setDone(accumDone);
      setQueue(workingQueue);

      // После каждых 3 курсов обновляем статусы
      if (accumDone.length % 3 === 0) {
        fetchStatuses();
        fetchFallbackList();
      }

      // Небольшая пауза между запросами — не душим бэкенд
      await new Promise((r) => setTimeout(r, 800));
    }

    runningRef.current = false;
    forceAIRef.current = false;
    setRunning(false);
    setForceAIMode(false);
    setCurrentCourseId(null);
    if (workingQueue.length === 0) {
      saveProgress(null);
    }
    await fetchStatuses();
    await fetchFallbackList();
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
    processQueue(targets, false);
  };

  const regenerateAllFallback = () => {
    if (fallbackCourses.length === 0) {
      setError("Нет fallback-курсов для перегенерации");
      return;
    }
    setError(null);
    setDone([]);
    setQueue(fallbackCourses);
    // forceAI=true → бэк пересоздаст с нуля, без fallback (только ИИ)
    processQueue(fallbackCourses, true);
  };

  /** Обновляет все шаблонные курсы новой версией программ (с реальными темами ФГОС).
   * Не требует ИИ — записывает обновлённый шаблон, который теперь продающего качества.
   * После выполнения: все курсы с темами по ФГОС перейдут в продажу. */
  const upgradeAllFallback = () => {
    if (fallbackCourses.length === 0) {
      setError("Нет шаблонных курсов для обновления");
      return;
    }
    setError(null);
    setDone([]);
    setQueue(fallbackCourses);
    // forceAI=false → попробуем ИИ, но при ошибке запишем новый качественный шаблон
    // и снимем блок is_fallback (для предметов, у которых есть CURRICULUM_PLANS)
    processQueue(fallbackCourses, false);
  };

  const resumeGeneration = () => {
    if (queue.length === 0) return;
    setError(null);
    processQueue(queue, forceAIRef.current);
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
        <StatsHeader stats={stats} fallbackCount={fallbackCourses.length} />

        <GenerationControls
          fallbackCourses={fallbackCourses}
          running={running}
          paused={paused}
          forceAIMode={forceAIMode}
          queue={queue}
          done={done}
          currentCourseId={currentCourseId}
          stats={stats}
          error={error}
          upgradeAllFallback={upgradeAllFallback}
          regenerateAllFallback={regenerateAllFallback}
          resumeGeneration={resumeGeneration}
          clearProgress={clearProgress}
          startGenerateAllMissing={startGenerateAllMissing}
          pauseGeneration={pauseGeneration}
          resumePause={resumePause}
          stopGeneration={stopGeneration}
          retryFailed={retryFailed}
        />

        <ResultsLog done={done} running={running} clearProgress={clearProgress} />

        <CoursesList
          filtered={filtered}
          statuses={statuses}
          fallbackCourses={fallbackCourses}
          loading={loading}
          filter={filter}
          subjectFilter={subjectFilter}
          stats={stats}
          currentCourseId={currentCourseId}
          running={running}
          setFilter={setFilter}
          setSubjectFilter={setSubjectFilter}
          fetchStatuses={fetchStatuses}
          generateOne={generateOne}
        />
      </div>
    </div>
  );
}
