import Icon from "@/components/ui/icon";
import { Lesson } from "@/components/journey/journeyData";
import { MathText } from "@/lib/mathFormat";

type Phase = "theory" | "examples" | "tasks" | "done";

interface Props {
  lesson: Lesson;
  theoryIdx: number;
  setTheoryIdx: (idx: number) => void;
  setPhase: (p: Phase) => void;
  accent: string;
}

export default function LessonViewerTheory({ lesson, theoryIdx, setTheoryIdx, setPhase, accent }: Props) {
  if (lesson.theory_blocks.length === 0) return null;
  const block = lesson.theory_blocks[theoryIdx];
  const isFirst = theoryIdx === 0;
  const isLast = theoryIdx === lesson.theory_blocks.length - 1;

  return (
    <div className="animate-fade-in">
      {isFirst && lesson.objectives?.length > 0 && (
        <div className="mb-5 bg-white/4 border border-white/8 rounded-2xl p-4">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Цели урока</p>
          <ul className="space-y-1.5">
            {lesson.objectives.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                <span style={{ color: accent }} className="font-bold mt-0.5">✓</span>
                <MathText>{o}</MathText>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
          {theoryIdx + 1}
        </div>
        <h3 className="font-montserrat font-black text-lg text-white"><MathText>{block.heading}</MathText></h3>
      </div>
      <p className="text-white/80 text-[15px] leading-relaxed whitespace-pre-line mb-4"><MathText>{block.content}</MathText></p>

      {block.key_points?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Запомни</p>
          <ul className="space-y-1.5">
            {block.key_points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
                <Icon name="Sparkle" size={12} style={{ color: accent }} className="mt-1 flex-shrink-0" />
                <MathText>{p}</MathText>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setTheoryIdx(theoryIdx - 1)} disabled={isFirst} className="text-white/50 hover:text-white text-sm flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Icon name="ArrowLeft" size={14} /> Назад
        </button>
        <span className="text-white/40 text-xs">{theoryIdx + 1} из {lesson.theory_blocks.length}</span>
        <button
          onClick={() => isLast ? setPhase("examples") : setTheoryIdx(theoryIdx + 1)}
          className="text-white font-bold px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition-all flex items-center gap-2"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          {isLast ? "К примерам" : "Дальше"} <Icon name="ArrowRight" size={14} />
        </button>
      </div>
    </div>
  );
}
