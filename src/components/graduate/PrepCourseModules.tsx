import { useState } from "react";
import Icon from "@/components/ui/icon";
import { PrepProgram, PrepModule } from "./prepPrograms";

interface Props {
  program: PrepProgram;
}

const BAND_LABELS: Record<PrepModule["scoreBand"], { label: string; color: string }> = {
  base: { label: "Базовая часть", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-200" },
  advanced: { label: "Часть 2 · 70+", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-200" },
  expert: { label: "Топ-вузы · 90+", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-200" },
};

const DIFFICULTY_DOT: Record<1 | 2 | 3, string> = {
  1: "bg-emerald-400",
  2: "bg-amber-400",
  3: "bg-rose-400",
};

export default function PrepCourseModules({ program }: Props) {
  const [openId, setOpenId] = useState<string | null>(program.modules[0]?.id ?? null);

  return (
    <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="ListChecks" size={16} className="text-purple-300" />
        <span className="text-purple-300 text-[11px] uppercase tracking-wider font-bold">
          Программа · {program.modules.length} модулей
        </span>
      </div>
      <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
        Что ты изучишь
      </h2>

      <div className="space-y-2">
        {program.modules.map((mod) => {
          const open = openId === mod.id;
          const band = BAND_LABELS[mod.scoreBand];
          const totalMin = mod.topics.reduce((s, t) => s + t.estimatedMin, 0);
          const hours = Math.round(totalMin / 60);

          return (
            <div
              key={mod.id}
              className={`bg-white/[0.03] border ${open ? "border-purple-500/40" : "border-white/10"} rounded-2xl overflow-hidden transition-colors`}
            >
              <button
                onClick={() => setOpenId(open ? null : mod.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.04] transition-colors text-left"
                aria-expanded={open}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                  {mod.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-montserrat font-black text-white text-sm md:text-base leading-tight">{mod.title}</p>
                    <span className={`inline-flex items-center bg-gradient-to-r ${band.color} border text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full`}>
                      {band.label}
                    </span>
                  </div>
                  <p className="text-white/45 text-[11px] flex items-center gap-2">
                    <span className="flex items-center gap-1"><Icon name="BookOpen" size={10} /> {mod.topics.length} тем</span>
                    <span className="flex items-center gap-1"><Icon name="Clock" size={10} /> ~{hours} ч</span>
                  </p>
                </div>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-white/55 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="border-t border-white/8 p-4 space-y-2.5 bg-white/[0.02]">
                  {mod.topics.map((t, idx) => (
                    <div
                      key={t.id}
                      className="bg-white/[0.03] border border-white/8 rounded-xl p-3 md:p-4"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/65 flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-montserrat font-bold text-white text-sm leading-tight">{t.title}</p>
                            <span className="flex items-center gap-1 text-[10px] text-white/45">
                              <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[t.difficulty]}`} />
                              {t.difficulty === 1 ? "База" : t.difficulty === 2 ? "Средне" : "Сложно"}
                            </span>
                          </div>
                          {t.egeTaskNumbers.length > 0 && (
                            <p className="text-white/45 text-[11px] mb-1.5">
                              ЕГЭ-задания:{" "}
                              <span className="text-white/75 font-bold">
                                №{t.egeTaskNumbers.join(", №")}
                              </span>
                              <span className="text-white/35"> · ~{t.estimatedMin} мин</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-1 pl-8">
                        {t.learn.map((l, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-white/70 text-xs leading-relaxed">
                            <Icon name="Check" size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>
                      {t.pitfalls && t.pitfalls.length > 0 && (
                        <div className="mt-2 pl-8">
                          <p className="text-rose-300 text-[10px] uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                            <Icon name="AlertTriangle" size={10} />
                            Типовые ошибки
                          </p>
                          <ul className="space-y-0.5">
                            {t.pitfalls.map((p, i) => (
                              <li key={i} className="text-white/60 text-xs leading-relaxed">— {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
