import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  topic: string;
  accent?: string;
  /** Ожидаемое время генерации в секундах (по умолчанию 12 сек) */
  estimateSeconds?: number;
  /** Заголовок (по умолчанию «ИИ-методист готовит урок») */
  title?: string;
}

const STAGES = [
  { from: 0, label: "Изучаю тему и подбираю объяснения" },
  { from: 25, label: "Пишу теорию простым языком" },
  { from: 55, label: "Подбираю примеры из жизни" },
  { from: 80, label: "Финальная сборка урока" },
  { from: 95, label: "Почти готово…" },
];

/**
 * Реалистичный прогресс-индикатор для долгой ИИ-генерации.
 * Анимирует прогресс по логарифмической кривой: быстро в начале, медленно к концу,
 * никогда не доходит до 100% (это сделает родительский компонент, когда придёт ответ).
 */
export default function LessonLoadingProgress({
  topic,
  accent = "#a855f7",
  estimateSeconds = 12,
  title = "ИИ-методист готовит урок",
}: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 200);
    return () => clearInterval(id);
  }, []);

  // Логарифмическая кривая: t/(t+k) — никогда не достигает 100%
  // При elapsed = estimateSeconds → прогресс ~85%
  // При elapsed = 2*estimateSeconds → прогресс ~92%
  const k = estimateSeconds * 0.18;
  const rawProgress = (elapsed / (elapsed + k)) * 100;
  const progress = Math.min(rawProgress, 97);

  const remaining = Math.max(0, Math.ceil(estimateSeconds - elapsed));
  const isLate = elapsed > estimateSeconds;

  const currentStage = [...STAGES].reverse().find((s) => progress >= s.from) || STAGES[0];

  return (
    <div className="bg-card/60 border border-white/10 rounded-3xl p-8 md:p-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
        >
          <Icon name="Sparkles" size={22} className="text-white animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-lg mb-0.5">{title}</p>
          <p className="text-white/55 text-sm">Тема: «{topic}»</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-montserrat font-black tabular-nums" style={{ color: accent }}>
            {isLate ? "<5" : remaining}
            <span className="text-sm text-white/40 font-medium ml-1">сек</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/35 font-bold">осталось</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out relative"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            }}
          >
            {/* shimmer */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-white/55 flex items-center gap-1.5">
            <Icon name="Loader2" size={11} className="animate-spin" style={{ color: accent }} />
            {currentStage.label}
          </span>
          <span className="text-white/40 tabular-nums">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-3.5 mt-5">
        <p className="text-white/60 text-xs leading-relaxed">
          💡 <span className="text-white/80 font-medium">Пока ждёшь:</span>{" "}
          {isLate
            ? "генерация чуть дольше обычного, потерпи — у ИИ-методиста могут быть наплывы. Сейчас закончит."
            : "после теории и примеров ИИ догрузит 5 задач для самопроверки в фоне — к ним ты перейдёшь без ожидания."}
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
