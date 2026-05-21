import Icon from "@/components/ui/icon";
import { Lesson } from "../journeyData";

interface Props {
  lesson: Lesson;
  exampleIdx: number;
  setExampleIdx: (idx: number) => void;
  revealedSteps: number;
  setRevealedSteps: (n: number) => void;
  onGoBackToTheory: () => void;
  onGoToTasks: () => void;
  accent: string;
}

export default function LessonExamplesPhase({
  lesson,
  exampleIdx,
  setExampleIdx,
  revealedSteps,
  setRevealedSteps,
  onGoBackToTheory,
  onGoToTasks,
  accent,
}: Props) {
  if (lesson.examples.length === 0) return null;

  const ex = lesson.examples[exampleIdx];
  const isFirst = exampleIdx === 0;
  const isLast = exampleIdx === lesson.examples.length - 1;
  const allRevealed = revealedSteps >= ex.solution_steps.length;

  return (
    <div className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
        >
          <Icon name="Lightbulb" size={16} />
        </div>
        <h3 className="font-montserrat font-black text-lg md:text-xl text-white">{ex.title}</h3>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Задача</p>
        <p className="text-white/85 text-[15px] leading-relaxed">{ex.problem}</p>
      </div>

      <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Решение по шагам</p>
      <div className="flex flex-col gap-2 mb-4">
        {ex.solution_steps.slice(0, revealedSteps).map((step, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/4 border border-white/8 rounded-xl p-3 animate-fade-in">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: accent }}
            >
              {i + 1}
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      {!allRevealed && (
        <button
          onClick={() => setRevealedSteps(revealedSteps + 1)}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-white/80 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <Icon name="ChevronDown" size={14} />
          {revealedSteps === 0 ? "Показать первый шаг" : `Показать шаг ${revealedSteps + 1}`}
        </button>
      )}

      {allRevealed && (
        <>
          <div
            className="rounded-2xl p-4 mb-3"
            style={{ background: `${accent}15`, border: `1px solid ${accent}40` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: accent }}>Ответ</p>
            <p className="text-white font-bold text-base">{ex.answer}</p>
          </div>
          {ex.note && (
            <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-2xl p-3 mb-2">
              <p className="text-yellow-200/90 text-xs leading-relaxed">💡 {ex.note}</p>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => {
            if (isFirst) {
              onGoBackToTheory();
            } else {
              setExampleIdx(exampleIdx - 1);
              setRevealedSteps(0);
            }
          }}
          className="text-white/50 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
        >
          <Icon name="ArrowLeft" size={14} /> {isFirst ? "К теории" : "Назад"}
        </button>
        <span className="text-white/40 text-xs">
          Пример {exampleIdx + 1} из {lesson.examples.length}
        </span>
        {isLast ? (
          <button
            onClick={onGoToTasks}
            disabled={!allRevealed}
            className="text-white font-bold px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            К задачам <Icon name="ArrowRight" size={14} />
          </button>
        ) : (
          <button
            onClick={() => { setExampleIdx(exampleIdx + 1); setRevealedSteps(0); }}
            disabled={!allRevealed}
            className="text-white font-bold px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            Следующий <Icon name="ArrowRight" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
