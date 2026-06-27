import Icon from "@/components/ui/icon";
import { CASES } from "./data";

export default function CasesBlock() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-3">
        <Icon name="CheckCircle2" size={14} className="text-emerald-300" />
        <span className="text-emerald-300 text-xs font-bold uppercase tracking-wide">Реальная практика</span>
      </div>
      <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
        3 истории, как ИИ ускорил рутинную работу
      </h2>
      <p className="text-white/60 mb-6 max-w-2xl">
        Это не теория. На курсе разбираем те же приёмы и промпты, что уже экономят людям часы
        каждый день — и адаптируем под твои задачи.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {CASES.map((c) => (
          <div
            key={c.client}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name={c.icon} size={20} className="text-cyan-300" />
              </div>
              <h3 className="font-montserrat font-bold text-white text-sm leading-tight">{c.client}</h3>
            </div>

            <p className="text-white/55 text-sm mb-3">{c.task}</p>
            <p className="text-white/70 text-sm mb-4">
              <span className="text-cyan-300 font-semibold">Решение: </span>{c.solution}
            </p>

            {/* До / После */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4 mt-auto">
              <div className="rounded-xl bg-rose-500/[0.08] border border-rose-500/20 p-3">
                <div className="text-rose-300/80 text-[10px] font-bold uppercase tracking-wide mb-1">Было</div>
                <p className="text-white/75 text-xs leading-snug">{c.before}</p>
              </div>
              <Icon name="ArrowRight" size={16} className="text-white/30" />
              <div className="rounded-xl bg-emerald-500/[0.08] border border-emerald-500/25 p-3">
                <div className="text-emerald-300/80 text-[10px] font-bold uppercase tracking-wide mb-1">Стало</div>
                <p className="text-white/85 text-xs leading-snug">{c.after}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <Icon name="TrendingUp" size={16} className="text-emerald-300" />
              <span className="text-emerald-200 text-base font-black">{c.metric}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
