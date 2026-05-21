import Icon from "@/components/ui/icon";
import { Lesson, Task } from "@/components/journey/journeyData";
import { MathText } from "@/lib/mathFormat";

interface Props {
  lesson: Lesson;
  currentTask: Task;
  taskIdx: number;
  selectedOption: number | null;
  setSelectedOption: (v: number | null) => void;
  userAnswer: string;
  setUserAnswer: (v: string) => void;
  showResult: boolean;
  hintsShown: number;
  setHintsShown: (n: number) => void;
  isAnswerCorrect: () => boolean;
  checkAnswer: () => void;
  nextTask: () => void;
  accent: string;
}

export default function LessonViewerTasks({
  lesson,
  currentTask,
  taskIdx,
  selectedOption,
  setSelectedOption,
  userAnswer,
  setUserAnswer,
  showResult,
  hintsShown,
  setHintsShown,
  isAnswerCorrect,
  checkAnswer,
  nextTask,
  accent,
}: Props) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-white/50">Задача {taskIdx + 1} из {lesson.tasks.length}</span>
        <span className="font-bold px-3 py-1 rounded-full" style={{ background: `${accent}15`, color: accent }}>
          {currentTask.type === "multiple_choice" ? "Выбери ответ" : currentTask.type === "input" ? "Введи ответ" : "Объясни"}
        </span>
      </div>

      <h3 className="font-montserrat font-black text-lg text-white mb-6 leading-snug">
        <MathText>{currentTask.question}</MathText>
      </h3>

      {currentTask.type === "multiple_choice" ? (
        <div className="flex flex-col gap-2.5">
          {currentTask.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const correctIdx = Number(currentTask.correct_answer);
            const showRight = showResult && idx === correctIdx;
            const showWrong = showResult && isSelected && idx !== correctIdx;
            return (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedOption(idx)}
                disabled={showResult}
                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  showRight ? "border-green-500/60 bg-green-500/10" :
                  showWrong ? "border-red-500/60 bg-red-500/10" :
                  isSelected ? "border-purple-500/60 bg-purple-500/10" :
                  "border-white/10 bg-white/4 hover:border-white/25"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  showRight ? "bg-green-500 text-white" :
                  showWrong ? "bg-red-500 text-white" :
                  isSelected ? "bg-purple-500 text-white" :
                  "bg-white/10 text-white/60"
                }`}>
                  {showRight ? <Icon name="Check" size={14} /> : showWrong ? <Icon name="X" size={14} /> : String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm text-white"><MathText>{opt}</MathText></span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            disabled={showResult}
            placeholder="Введи ответ..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-60"
            rows={2}
          />
          {showResult && (
            <div className={`mt-3 p-3 rounded-xl border text-sm ${isAnswerCorrect() ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
              <strong>Правильный ответ:</strong> <MathText>{String(currentTask.correct_answer)}</MathText>
            </div>
          )}
        </div>
      )}

      {!showResult && hintsShown < currentTask.hints.length && (
        <button onClick={() => setHintsShown(hintsShown + 1)} className="mt-4 text-purple-300 hover:text-purple-200 text-xs flex items-center gap-1.5 transition-colors">
          <Icon name="Lightbulb" size={12} /> Показать подсказку ({hintsShown + 1}/{currentTask.hints.length})
        </button>
      )}
      {hintsShown > 0 && (
        <div className="mt-3 space-y-2">
          {currentTask.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-3 text-purple-200 text-xs">💡 <MathText>{h}</MathText></div>
          ))}
        </div>
      )}

      {showResult && (
        <div className={`mt-5 p-4 rounded-2xl border ${isAnswerCorrect() ? "border-green-500/40 bg-green-500/8" : "border-red-500/40 bg-red-500/8"}`}>
          <p className={`font-bold mb-2 flex items-center gap-2 ${isAnswerCorrect() ? "text-green-300" : "text-red-300"}`}>
            <Icon name={isAnswerCorrect() ? "Check" : "X"} size={16} />
            {isAnswerCorrect() ? "Верно!" : "Не совсем"}
          </p>
          <p className="text-white/75 text-sm leading-relaxed"><MathText>{currentTask.explanation}</MathText></p>
          {currentTask.fun_fact && (
            <p className="text-white/45 text-xs mt-3 italic border-t border-white/10 pt-3">💡 <MathText>{currentTask.fun_fact}</MathText></p>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={currentTask.type === "multiple_choice" ? selectedOption === null : !userAnswer.trim()}
            className="text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            Проверить
          </button>
        ) : (
          <button
            onClick={nextTask}
            className="text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-all flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            {taskIdx + 1 >= lesson.tasks.length ? "Завершить урок" : "Следующая задача"}
            <Icon name="ArrowRight" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

interface DoneProps {
  lesson: Lesson;
  correctCount: number;
  accent: string;
  onRetry: () => void;
  onClose: () => void;
}

export function LessonViewerDone({ lesson, correctCount, accent, onRetry, onClose }: DoneProps) {
  return (
    <div className="text-center py-6 animate-fade-in">
      <div className="text-6xl mb-3">🎯</div>
      <h3 className="font-montserrat font-black text-2xl text-white mb-2">Урок пройден!</h3>
      <p className="text-white/70 mb-4">Правильных ответов: <span className="font-bold text-white">{correctCount} из {lesson.tasks.length}</span></p>

      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 text-left mb-4">
        <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Резюме</p>
        <p className="text-white/80 text-sm leading-relaxed"><MathText>{lesson.summary}</MathText></p>
      </div>

      {lesson.common_mistakes?.length > 0 && (
        <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-2xl p-4 text-left mb-5">
          <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-2">Чтобы не ошибиться в следующий раз</p>
          <ul className="space-y-1.5">
            {lesson.common_mistakes.map((m, i) => (
              <li key={i} className="text-yellow-100/85 text-sm">• <MathText>{m}</MathText></li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button onClick={onRetry} className="bg-white/8 hover:bg-white/12 border border-white/10 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2">
          <Icon name="RotateCcw" size={14} /> Пройти ещё раз
        </button>
        <button
          onClick={onClose}
          className="text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-all"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
