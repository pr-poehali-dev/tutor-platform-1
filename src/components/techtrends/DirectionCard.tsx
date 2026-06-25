import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { TrendDirection } from "./api";

interface Props {
  dir: TrendDirection;
  index: number;
}

function momentumTone(m: number): { color: string; icon: string; label: string } {
  if (m > 5) return { color: "text-emerald-300", icon: "TrendingUp", label: `+${m}%` };
  if (m < -5) return { color: "text-rose-300", icon: "TrendingDown", label: `${m}%` };
  return { color: "text-white/50", icon: "Minus", label: "стабильно" };
}

export default function DirectionCard({ dir, index }: Props) {
  const mt = momentumTone(dir.momentum);
  const isHot = index < 3 && dir.score > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-sky-500/30 hover:bg-white/[0.05] transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 flex items-center justify-center text-2xl flex-shrink-0">
          {dir.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-bold">#{index + 1}</span>
            <h3 className="font-montserrat font-bold text-white text-base truncate">{dir.name}</h3>
            {isHot && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 flex-shrink-0">
                HOT
              </span>
            )}
          </div>
          <p className="text-white/55 text-xs mt-0.5 line-clamp-2">{dir.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <Icon name="Activity" size={13} className="text-sky-300" />
          <span className="text-white/70 font-semibold">{dir.signals_7d}</span>
          <span className="text-white/40">за неделю</span>
        </div>
        <div className={`flex items-center gap-1 font-semibold ${mt.color}`}>
          <Icon name={mt.icon} size={13} />
          {mt.label}
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(3, dir.score / 2))}%` }}
        />
      </div>

      {dir.ai_insight && (
        <div className="rounded-xl bg-sky-500/[0.07] border border-sky-500/20 p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Icon name="Sparkles" size={12} className="text-sky-300" />
            <span className="text-sky-300 text-[11px] font-bold uppercase tracking-wide">ИИ-вывод</span>
          </div>
          <p className="text-white/75 text-xs leading-relaxed">{dir.ai_insight}</p>
        </div>
      )}

      {dir.last_article_slug && (
        <Link
          to={`/feed/${dir.last_article_slug}`}
          className="inline-flex items-center gap-1.5 text-sky-300 hover:text-sky-200 text-xs font-semibold"
        >
          <Icon name="FileText" size={13} />
          Читать аналитический отчёт
        </Link>
      )}
    </div>
  );
}
