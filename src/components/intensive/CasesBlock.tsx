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
        3 кейса автоматизации из реальных проектов
      </h2>
      <p className="text-white/60 mb-6 max-w-2xl">
        Это не теория из учебника. На интенсиве разбираем те же связки, что уже работают в живых
        бизнесах — и адаптируем под твой проект.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {CASES.map((c) => (
          <div
            key={c.client}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name={c.icon} size={20} className="text-emerald-300" />
              </div>
              <h3 className="font-montserrat font-bold text-white text-sm leading-tight">{c.client}</h3>
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <div className="text-rose-300/80 text-[11px] font-bold uppercase tracking-wide mb-1">Было</div>
                <p className="text-white/70 text-sm">{c.task}</p>
              </div>
              <div>
                <div className="text-purple-300/80 text-[11px] font-bold uppercase tracking-wide mb-1">Решение</div>
                <p className="text-white/70 text-sm">{c.solution}</p>
              </div>
              <div>
                <div className="text-emerald-300/80 text-[11px] font-bold uppercase tracking-wide mb-1">Стало</div>
                <p className="text-white/80 text-sm">{c.result}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
              <Icon name="TrendingUp" size={15} className="text-emerald-300" />
              <span className="text-emerald-200 text-sm font-semibold">{c.metric}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
