import Icon from "@/components/ui/icon";
import { BatchResult } from "./types";

interface Props {
  done: BatchResult[];
  running: boolean;
  clearProgress: () => void;
}

export default function ResultsLog({ done, running, clearProgress }: Props) {
  if (done.length === 0) return null;
  const failedItems = done.filter((d) => !d.generated && !d.skipped);

  return (
    <div className="bg-card/60 border border-white/10 rounded-3xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">
          Результаты ({done.length}: ✓ {done.filter(d => d.generated && !d.fallback).length} ИИ · 🪄 {done.filter(d => d.fallback && !d.warning).length} шаблон · ⚠ {done.filter(d => d.warning).length} ИИ не успел · ✗ {failedItems.length} ошибок · ⏭ {done.filter(d => d.skipped).length} пропущено)
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
            <span className="text-white/55 text-[10px] truncate max-w-[45%] text-right" title={r.ai_error || r.error || ''}>
              {r.generated ? (
                r.warning
                  ? `${r.total_lessons} ур · ⚠ ИИ не успел, шаблон`
                  : r.fallback
                    ? `${r.total_lessons} ур · шаблон (ИИ занят)`
                    : `${r.total_lessons} уроков, ${r.total_modules} модулей`
              ) : r.skipped ? r.reason : r.error}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
