import Icon from "@/components/ui/icon";
import { Lesson, ProgramModule } from "../journeyData";

type Phase = "theory" | "examples" | "tasks";

interface Props {
  module: ProgramModule;
  lesson: Lesson;
  phase: Phase;
  theoryIdx: number;
  exampleIdx: number;
  taskIdx: number;
  totalTasks: number;
  correctCount: number;
  accent: string;
  onBack: () => void;
}

export default function LessonHeader({
  module,
  lesson,
  phase,
  theoryIdx,
  exampleIdx,
  taskIdx,
  totalTasks,
  correctCount,
  accent,
  onBack,
}: Props) {
  const phaseProgress =
    phase === "theory" ? ((theoryIdx + 1) / lesson.theory_blocks.length) * 33 :
    phase === "examples" ? 33 + ((exampleIdx + 1) / lesson.examples.length) * 33 :
    66 + ((taskIdx) / totalTasks) * 34;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <Icon name="ArrowLeft" size={14} />
          К программе
        </button>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-white/50">≈ {lesson.duration_minutes} мин</span>
          {phase === "tasks" && (
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              <Icon name="Zap" size={12} /> {correctCount}/{totalTasks}
            </span>
          )}
        </div>
      </div>

      {/* Lesson header */}
      <div className="mb-5">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{module.topic}</p>
        <h2 className="font-montserrat font-black text-2xl text-white mb-1.5">{lesson.title}</h2>
        <p className="text-white/55 text-sm">{lesson.subtitle}</p>
      </div>

      {/* Progress strip */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className={`flex items-center gap-1 ${phase === "theory" ? "text-white font-bold" : "text-white/40"}`}>
            <Icon name="BookOpen" size={12} /> Теория
          </span>
          <div className="h-px flex-1 bg-white/10" />
          <span className={`flex items-center gap-1 ${phase === "examples" ? "text-white font-bold" : "text-white/40"}`}>
            <Icon name="Lightbulb" size={12} /> Примеры
          </span>
          <div className="h-px flex-1 bg-white/10" />
          <span className={`flex items-center gap-1 ${phase === "tasks" ? "text-white font-bold" : "text-white/40"}`}>
            <Icon name="Target" size={12} /> Задачи
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${phaseProgress}%`, background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
          />
        </div>
      </div>
    </>
  );
}
