import Icon from "@/components/ui/icon";
import { BatchResult, Stats } from "./types";

interface Props {
  fallbackCourses: number[];
  running: boolean;
  paused: boolean;
  forceAIMode: boolean;
  queue: number[];
  done: BatchResult[];
  currentCourseId: number | null;
  stats: Stats;
  error: string | null;
  upgradeAllFallback: () => void;
  regenerateAllFallback: () => void;
  resumeGeneration: () => void;
  clearProgress: () => void;
  startGenerateAllMissing: () => void;
  pauseGeneration: () => void;
  resumePause: () => void;
  stopGeneration: () => void;
  retryFailed: () => void;
}

export default function GenerationControls({
  fallbackCourses,
  running,
  paused,
  forceAIMode,
  queue,
  done,
  currentCourseId,
  stats,
  error,
  upgradeAllFallback,
  regenerateAllFallback,
  resumeGeneration,
  clearProgress,
  startGenerateAllMissing,
  pauseGeneration,
  resumePause,
  stopGeneration,
  retryFailed,
}: Props) {
  const progressTotal = done.length + queue.length;
  const progressDone = done.length;
  const failedItems = done.filter((d) => !d.generated && !d.skipped);

  return (
    <>
      {/* Перегенерация fallback-курсов: 2 кнопки */}
      {fallbackCourses.length > 0 && !running && (
        <div className="bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border-2 border-emerald-500/40 rounded-3xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/25 flex items-center justify-center flex-shrink-0">
              <Icon name="Rocket" size={18} className="text-emerald-200" />
            </div>
            <div className="flex-1">
              <p className="font-montserrat font-black text-white text-base mb-0.5">
                Запусти {fallbackCourses.length} курсов в продажу за 1 клик
              </p>
              <p className="text-white/65 text-xs max-w-2xl">
                Шаблонные программы получили качественный апгрейд — теперь это реальные темы по ФГОС с разбором, практикой и проектами. Жми «Обновить» — все {fallbackCourses.length} курсов мгновенно станут продающими. Если хочешь идеальное качество — попробуй «Через ИИ» (но требует время и удачу с polza).
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={upgradeAllFallback}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-sm px-5 py-3 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/25"
            >
              <Icon name="Zap" size={16} />
              Обновить {fallbackCourses.length} курсов и запустить в продажу
            </button>
            <button
              onClick={regenerateAllFallback}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm px-4 py-3 rounded-xl"
              title="Только ИИ, без шаблонного fallback. Дольше, может не успеть."
            >
              <Icon name="Sparkles" size={14} />
              Через ИИ
            </button>
          </div>
        </div>
      )}

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
                <p className="font-montserrat font-black text-white text-base flex items-center gap-2 flex-wrap">
                  {running ? (paused ? "⏸ Пауза" : "🤖 Генерирую программы...") : "Очередь готова к продолжению"}
                  {forceAIMode && (
                    <span className="inline-flex items-center gap-1 bg-amber-500/25 border border-amber-500/45 text-amber-100 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      <Icon name="Wand2" size={10} />
                      Режим ИИ (без fallback)
                    </span>
                  )}
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
    </>
  );
}
