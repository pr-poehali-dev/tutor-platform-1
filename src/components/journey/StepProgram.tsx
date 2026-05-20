import Icon from "@/components/ui/icon";
import { Program, SubjectChoice, ProgramModule } from "./journeyData";

interface Props {
  program: Program;
  subject: SubjectChoice;
  onStartModule: (module: ProgramModule) => void;
  completedModuleIds: number[];
}

export default function StepProgram({ program, subject, onStartModule, completedModuleIds }: Props) {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Map" size={14} className="text-purple-300" />
          <span className="text-sm text-purple-300 font-medium">Шаг 3 из 4 · Твой маршрут</span>
        </div>
        <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-3">
          {program.program_title}
        </h2>
        <p className="text-white/55 max-w-xl mx-auto">
          ИИ применил методику <span className="text-purple-300">Mastery Learning</span> и {" "}
          <span className="text-cyan-300">Spaced Repetition</span> — будем закреплять темы с интервалами
        </p>
      </div>

      {/* Program meta */}
      <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl mx-auto">
        {[
          { val: program.total_modules, label: "модулей", color: subject.accent },
          { val: `~${program.estimated_days}`, label: "дней", color: "#06d6a0" },
          { val: completedModuleIds.length, label: "пройдено", color: "#ffd60a" },
        ].map(s => (
          <div key={s.label} className="bg-card/60 border border-white/10 rounded-2xl p-4 text-center">
            <div className="font-montserrat font-black text-2xl mb-1" style={{ color: s.color }}>{s.val}</div>
            <div className="text-white/40 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Modules timeline */}
      <div className="relative mb-8">
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500/40 via-cyan-500/40 to-pink-500/40" />

        <div className="flex flex-col gap-4">
          {program.modules.map((m, i) => {
            const isCompleted = completedModuleIds.includes(m.id);
            const isLocked = i > 0 && !completedModuleIds.includes(program.modules[i - 1].id);
            const isActive = !isLocked && !isCompleted;

            return (
              <div
                key={m.id}
                className={`relative pl-16 transition-all ${isLocked ? "opacity-40" : ""}`}
              >
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
                    <div className="flex-1">
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

                  <p className="text-white/55 text-sm mb-4">{m.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {m.skills.map(skill => (
                      <span key={skill} className="text-xs text-white/45 bg-white/5 px-2 py-1 rounded-lg">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Icon name="ListChecks" size={13} /> {m.tasks_count} заданий
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="Clock" size={13} /> ~{m.estimated_minutes} мин
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="RefreshCw" size={13} /> повтор через {m.repeat_after_days.join(", ")} дн
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
