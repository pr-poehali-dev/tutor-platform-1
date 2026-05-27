import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { PrepProgram } from "./prepPrograms";

interface Props {
  program: PrepProgram;
  weeksToExam: number;
}

interface WeekPlanItem {
  weekFrom: number;
  weekTo: number;
  moduleTitle: string;
  moduleEmoji: string;
  topics: string[];
}

/**
 * Распределяет модули курса по неделям до даты ЕГЭ.
 * Делит общее время равномерно и резервирует последние 4 недели на пробники.
 */
export default function PrepCourseWeekPlan({ program, weeksToExam }: Props) {
  const plan = useMemo<WeekPlanItem[]>(() => {
    const reservedForMock = 4; // последние 4 недели — пробные ЕГЭ
    const studyWeeks = Math.max(8, weeksToExam - reservedForMock);
    const totalMinutes = program.modules.reduce(
      (sum, m) => sum + m.topics.reduce((s, t) => s + t.estimatedMin, 0),
      0,
    );
    const minutesPerWeek = totalMinutes / studyWeeks;

    let cursor = 1;
    const items: WeekPlanItem[] = [];
    for (const mod of program.modules) {
      const modMinutes = mod.topics.reduce((s, t) => s + t.estimatedMin, 0);
      const span = Math.max(1, Math.round(modMinutes / minutesPerWeek));
      items.push({
        weekFrom: cursor,
        weekTo: Math.min(cursor + span - 1, studyWeeks),
        moduleTitle: mod.title,
        moduleEmoji: mod.emoji,
        topics: mod.topics.map((t) => t.title),
      });
      cursor += span;
    }
    return items;
  }, [program, weeksToExam]);

  return (
    <section className="bg-card border border-white/10 rounded-3xl p-5 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="CalendarDays" size={16} className="text-purple-300" />
        <span className="text-purple-300 text-[11px] uppercase tracking-wider font-bold">Календарный план</span>
      </div>
      <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-4">
        План подготовки по неделям
      </h2>

      <div className="relative space-y-3">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-purple-500/40 via-pink-500/30 to-rose-500/40" />

        {plan.map((item, i) => (
          <div key={i} className="relative pl-10">
            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-base shadow-lg shadow-purple-500/30">
              {item.moduleEmoji}
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 md:p-4 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <p className="font-montserrat font-black text-white text-sm md:text-base">{item.moduleTitle}</p>
                <span className="inline-flex items-center gap-1 bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <Icon name="Clock" size={9} />
                  Недели {item.weekFrom}{item.weekFrom === item.weekTo ? "" : `–${item.weekTo}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.topics.slice(0, 4).map((t) => (
                  <span key={t} className="text-[11px] text-white/65 bg-white/[0.04] border border-white/8 rounded-full px-2 py-0.5">
                    {t}
                  </span>
                ))}
                {item.topics.length > 4 && (
                  <span className="text-[11px] text-white/40 px-2 py-0.5">
                    + {item.topics.length - 4} ещё
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Последний блок: пробные ЕГЭ */}
        <div className="relative pl-10">
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-base shadow-lg shadow-emerald-500/30">
            🎯
          </div>
          <div className="bg-gradient-to-br from-emerald-500/12 to-teal-500/12 border border-emerald-500/30 rounded-2xl p-3 md:p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <p className="font-montserrat font-black text-white text-sm md:text-base">
                Пробные ЕГЭ и финальная отработка
              </p>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                <Icon name="Clock" size={9} />
                Последние 4 недели
              </span>
            </div>
            <p className="text-white/65 text-xs leading-relaxed">
              4 пробных ЕГЭ в формате ФИПИ, разбор ошибок с ИИ-репетитором, отработка слабых тем и тайминг.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
