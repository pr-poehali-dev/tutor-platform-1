import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Program, SubjectChoice, ProgramModule, ModuleLesson } from "./journeyData";

interface Props {
  program: Program;
  subject: SubjectChoice;
  onStartModule: (module: ProgramModule) => void;
  completedModuleIds: number[];
}

const LESSON_TYPE_META: Record<ModuleLesson["type"], { icon: string; label: string; color: string }> = {
  theory: { icon: "BookOpen", label: "Теория", color: "#8b5cf6" },
  video: { icon: "Play", label: "Видео-разбор", color: "#ec4899" },
  practice: { icon: "PenLine", label: "Практика", color: "#06d6a0" },
  test: { icon: "ClipboardCheck", label: "Контрольный тест", color: "#ffd60a" },
};

export default function StepProgram({ program, subject, onStartModule, completedModuleIds }: Props) {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Map" size={14} className="text-purple-300" />
          <span className="text-sm text-purple-300 font-medium">Шаг 3 из 4 · Твоя программа</span>
        </div>
        <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-3">
          {program.program_title}
        </h2>
        {program.program_description && (
          <p className="text-white/70 max-w-2xl mx-auto text-base leading-relaxed">
            {program.program_description}
          </p>
        )}
      </div>

      {/* Program meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-2xl mx-auto">
        {[
          { val: program.total_modules, label: "модулей", color: subject.accent, icon: "Layers" },
          { val: `~${program.estimated_days}`, label: "дней", color: "#06d6a0", icon: "Calendar" },
          { val: program.estimated_hours_total ? `~${program.estimated_hours_total}ч` : "—", label: "всего обучения", color: "#ec4899", icon: "Clock" },
          { val: completedModuleIds.length, label: "пройдено", color: "#ffd60a", icon: "CheckCircle2" },
        ].map((s) => (
          <div key={s.label} className="bg-card/60 border border-white/10 rounded-2xl p-3 text-center">
            <Icon name={s.icon} size={14} className="mx-auto mb-1" style={{ color: s.color }} />
            <div className="font-montserrat font-black text-xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Методика — как мы учим */}
      {program.methodology && (
        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/25 flex items-center justify-center">
              <Icon name="Brain" size={16} className="text-purple-200" />
            </div>
            <h3 className="font-montserrat font-black text-base text-white">Как мы учим именно тебя</h3>
          </div>
          <p className="text-white/75 text-sm leading-relaxed mb-3">{program.methodology}</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-white/8 text-white/85 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
              <Icon name="Target" size={10} /> Mastery Learning · 80%+
            </span>
            <span className="inline-flex items-center gap-1 bg-white/8 text-white/85 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
              <Icon name="RefreshCw" size={10} /> Spaced Repetition · 1·3·7 дней
            </span>
            <span className="inline-flex items-center gap-1 bg-white/8 text-white/85 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
              <Icon name="TrendingUp" size={10} /> Scaffolding · от простого к сложному
            </span>
          </div>
        </div>
      )}

      {/* Расписание */}
      {program.weekly_schedule && (
        <div className="bg-card/60 border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Icon name="CalendarClock" size={18} className="text-cyan-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-0.5">Рекомендуемое расписание</p>
            <p className="text-white text-sm">
              <span className="font-bold">{program.weekly_schedule.days_per_week} дней в неделю</span> по{" "}
              <span className="font-bold">{program.weekly_schedule.minutes_per_day} минут</span>
              {program.weekly_schedule.best_time && ` · ${program.weekly_schedule.best_time}`}
            </p>
          </div>
        </div>
      )}

      {/* Modules timeline */}
      <div className="relative mb-8">
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500/40 via-cyan-500/40 to-pink-500/40" />

        <div className="flex flex-col gap-4">
          {program.modules.map((m, i) => {
            const isCompleted = completedModuleIds.includes(m.id);
            const isLocked = i > 0 && !completedModuleIds.includes(program.modules[i - 1].id);
            const isActive = !isLocked && !isCompleted;
            const isExpanded = expandedModule === m.id;
            const milestoneAfter = program.milestones?.find((ms) => ms.after_module === m.id);

            return (
              <div key={m.id}>
                <div className={`relative pl-16 transition-all ${isLocked ? "opacity-40" : ""}`}>
                  {/* Step circle */}
                  <div
                    className="absolute left-0 top-2 w-12 h-12 rounded-full flex items-center justify-center font-montserrat font-black text-base z-10 border-4 border-background"
                    style={{
                      background: isCompleted ? "linear-gradient(135deg, #06d6a0, #00d4ff)" :
                                isActive ? `linear-gradient(135deg, ${subject.accent}, ${subject.accent}aa)` :
                                "rgba(255,255,255,0.1)",
                      boxShadow: isActive ? `0 0 20px ${subject.accent}80` : "none",
                    }}
                  >
                    {isCompleted ? <Icon name="Check" size={20} className="text-white" /> :
                     isLocked ? <Icon name="Lock" size={16} className="text-white/40" /> :
                     <span className="text-white">{m.id}</span>}
                  </div>

                  {/* Module card */}
                  <div className={`bg-card/60 border rounded-2xl p-5 transition-all ${
                    isActive ? "border-white/20" : "border-white/8"
                  }`}
                    style={isActive ? { boxShadow: `0 0 0 1px ${subject.accent}40` } : {}}
                  >
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{m.topic}</p>
                        <h3 className="font-montserrat font-black text-lg text-white">{m.title}</h3>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                        m.difficulty === "лёгкий" ? "bg-green-500/15 text-green-300" :
                        m.difficulty === "средний" ? "bg-yellow-500/15 text-yellow-300" :
                        "bg-red-500/15 text-red-300"
                      }`}>
                        {m.difficulty}
                      </span>
                    </div>

                    {/* Цель модуля — главное, что получит ученик */}
                    {m.goal && (
                      <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 mb-3 flex items-start gap-2">
                        <Icon name="Target" size={12} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                        <p className="text-emerald-100 text-xs font-medium">
                          <span className="text-emerald-300 font-bold">Цель:</span> {m.goal}
                        </p>
                      </div>
                    )}

                    <p className="text-white/55 text-sm mb-4">{m.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {m.skills.map((skill) => (
                        <span key={skill} className="text-xs text-white/45 bg-white/5 px-2 py-1 rounded-lg">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>

                    {/* Поурочная структура (раскрывается) */}
                    {m.lessons && m.lessons.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedModule(isExpanded ? null : m.id)}
                          className="w-full inline-flex items-center justify-between text-xs text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 rounded-xl px-3 py-2 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Icon name="ListTree" size={12} />
                            {m.lessons.length} {m.lessons.length === 1 ? "урок" : "урока в модуле"}
                          </span>
                          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={12} />
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 pl-1">
                            {m.lessons.map((lesson) => {
                              const meta = LESSON_TYPE_META[lesson.type] || LESSON_TYPE_META.theory;
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-start gap-2.5 bg-white/[0.03] border border-white/8 rounded-xl p-2.5"
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${meta.color}22` }}
                                  >
                                    <Icon name={meta.icon} size={12} style={{ color: meta.color }} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                                        {meta.label}
                                      </span>
                                      <span className="text-white/45 text-[10px]">~{lesson.estimated_minutes} мин</span>
                                      {lesson.passing_score && (
                                        <span className="text-white/45 text-[10px]">проходной балл {lesson.passing_score}%</span>
                                      )}
                                    </div>
                                    <p className="text-white text-xs font-semibold mt-0.5">{lesson.title}</p>
                                    <p className="text-white/55 text-[11px] mt-0.5">{lesson.summary}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={11} /> ~{m.estimated_minutes} мин
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="RefreshCw" size={11} /> повтор {m.repeat_after_days.join("·")} д
                        </span>
                      </div>
                      {!isLocked && (
                        <button
                          onClick={() => onStartModule(m)}
                          className="text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5"
                          style={{ background: isCompleted ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg, ${subject.accent}, ${subject.accent}cc)` }}
                        >
                          {isCompleted ? (
                            <>
                              <Icon name="RotateCcw" size={12} />
                              Повторить
                            </>
                          ) : (
                            <>
                              <Icon name="Play" size={12} />
                              Начать модуль
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Веха-достижение между модулями */}
                {milestoneAfter && (
                  <div className="relative pl-16 mt-3">
                    <div className="absolute left-2.5 top-1.5 w-7 h-7 rounded-full bg-amber-500/25 border-2 border-amber-500/50 flex items-center justify-center">
                      <Icon name="Trophy" size={12} className="text-amber-300" />
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
                      <p className="text-amber-200 text-[10px] uppercase tracking-wider font-bold mb-0.5">Веха после модуля {milestoneAfter.after_module}</p>
                      <p className="text-amber-100 text-xs font-medium">🎯 {milestoneAfter.achievement}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-card/60 border border-white/10 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center">💡</div>
          <h3 className="font-montserrat font-black text-base text-white">Советы от методиста</h3>
        </div>
        <div className="flex flex-col gap-2">
          {program.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-white/65 text-sm">
              <span style={{ color: subject.accent }}>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
