import Icon from "@/components/ui/icon";
import { Lesson } from "@/components/journey/journeyData";
import { MathText } from "@/lib/mathFormat";

type Phase = "theory" | "examples" | "tasks" | "done";

interface Props {
  lesson: Lesson;
  topic: string;
  phase: Phase;
}

export default function LessonViewerHeader({ lesson, topic, phase }: Props) {
  return (
    <>
      {/* Title */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{topic}</p>
          {lesson._cached && (
            <span
              className="text-green-300/90 font-medium flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 text-[10px]"
              title="Урок загружен из кэша, без обращения к ИИ"
            >
              <Icon name="Zap" size={10} /> мгновенно
            </span>
          )}
        </div>
        <h2 className="font-montserrat font-black text-2xl text-white mb-1.5"><MathText>{lesson.title}</MathText></h2>
        <p className="text-white/55 text-sm"><MathText>{lesson.subtitle}</MathText> · ≈ {lesson.duration_minutes} мин</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        <span className={`flex items-center gap-1 ${phase === "theory" ? "text-white font-bold" : "text-white/40"}`}>
          <Icon name="BookOpen" size={12} /> Теория
        </span>
        <div className="h-px flex-1 bg-white/10" />
        <span className={`flex items-center gap-1 ${phase === "examples" ? "text-white font-bold" : "text-white/40"}`}>
          <Icon name="Lightbulb" size={12} /> Примеры
        </span>
        <div className="h-px flex-1 bg-white/10" />
        <span className={`flex items-center gap-1 ${phase === "tasks" || phase === "done" ? "text-white font-bold" : "text-white/40"}`}>
          <Icon name="Target" size={12} /> Задачи
        </span>
      </div>
    </>
  );
}
