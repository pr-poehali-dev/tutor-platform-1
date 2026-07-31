import Icon from "@/components/ui/icon";
import { Graduate } from "./graduatesData";

interface Props {
  graduate: Graduate;
}

export default function GraduateCard({ graduate: g }: Props) {
  const avatar = g.initials.replace(/[^А-ЯA-Z]/g, "");
  const pct = Math.max(6, Math.min(100, Math.round((g.after / (g.after || 1)) * 100)));
  const beforePct = g.after > 0 ? Math.min(100, Math.round((g.before / g.after) * 100)) : 0;

  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex flex-col hover:bg-white/[0.05] hover:border-white/20 transition-all">
      {/* Шапка: аватар + имя */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.accent} flex items-center justify-center font-montserrat font-black text-white text-base flex-shrink-0`}
        >
          {avatar}
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold leading-tight">{g.name}</p>
          <p className="text-white/45 text-xs mt-0.5">{g.meta}</p>
        </div>
      </div>

      {/* Курс */}
      <div className="inline-flex items-center gap-1.5 self-start bg-purple-500/12 border border-purple-500/25 rounded-full px-3 py-1 mb-4">
        <Icon name="GraduationCap" size={13} className="text-purple-200" />
        <span className="text-purple-100 text-xs font-bold">{g.course}</span>
      </div>

      {/* До → после */}
      <div className="rounded-2xl bg-black/20 border border-white/8 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs">{g.subject}</span>
          <span className="text-white/40 text-[11px]">{g.scale}</span>
        </div>
        <div className="flex items-end gap-3">
          <div className="text-center">
            <p className="font-montserrat font-black text-2xl text-white/40 leading-none">{g.before}</p>
            <p className="text-white/35 text-[10px] mt-1 uppercase tracking-wide">было</p>
          </div>
          <div className="flex-1 pb-1">
            <div className="relative h-2.5 rounded-full bg-white/8 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${g.accent}`}
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/15"
                style={{ width: `${beforePct}%` }}
              />
            </div>
            <div className="flex justify-center mt-1.5">
              <Icon name="ArrowRight" size={14} className="text-white/40" />
            </div>
          </div>
          <div className="text-center">
            <p
              className={`font-montserrat font-black text-3xl bg-gradient-to-br ${g.accent} bg-clip-text text-transparent leading-none`}
            >
              {g.after}
            </p>
            <p className="text-emerald-300/80 text-[10px] mt-1 uppercase tracking-wide font-bold">стало</p>
          </div>
        </div>
      </div>

      {/* История */}
      <p className="text-white/75 text-sm leading-relaxed flex-1">«{g.quote}»</p>

      {/* Итог-бейдж */}
      <div className="mt-4 inline-flex self-start items-center gap-1.5 bg-emerald-500/12 border border-emerald-500/25 rounded-full px-3 py-1.5">
        <Icon name="Trophy" size={13} className="text-emerald-300" />
        <span className="text-emerald-200 text-xs font-bold">{g.result}</span>
      </div>
    </div>
  );
}
