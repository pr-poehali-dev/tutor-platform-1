import { useState } from "react";
import Icon from "@/components/ui/icon";
import { TestQuestion, TestAnswer, SubjectChoice } from "./journeyData";

interface Props {
  questions: TestQuestion[];
  subject: SubjectChoice;
  onComplete: (answers: TestAnswer[]) => void;
}

export default function StepTest({ questions, subject, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);

  const q = questions[currentIdx];
  const progress = ((currentIdx + (showFeedback ? 1 : 0)) / questions.length) * 100;

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
  };

  const next = () => {
    const isCorrect = selected === q.correct;
    const newAnswers = [...answers, {
      topic: q.topic,
      level: q.level,
      is_correct: isCorrect,
      question: q.question,
    }];
    setAnswers(newAnswers);

    if (currentIdx + 1 >= questions.length) {
      onComplete(newAnswers);
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  const levelLabel = ["", "Знание", "Понимание", "Применение", "Анализ", "Синтез"][q.level] || "Средний";
  const levelColor = q.level <= 2 ? "#06d6a0" : q.level === 3 ? "#ffd60a" : "#f72585";

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{subject.emoji}</span>
            <div>
              <p className="text-white font-bold text-sm">Диагностика · {subject.name}</p>
              <p className="text-white/50 text-xs">Вопрос {currentIdx + 1} из {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl border" style={{ background: `${levelColor}15`, borderColor: `${levelColor}40`, color: levelColor }}>
            <Icon name="Brain" size={14} />
            <span className="text-xs font-bold">{levelLabel}</span>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${subject.accent}, ${subject.accent}aa)` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-6">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">{q.topic}</p>
        <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-6 leading-snug">
          {q.question}
        </h3>

        <div className="flex flex-col gap-3">
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === q.correct;
            const showRight = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
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
                  {showRight ? <Icon name="Check" size={14} /> :
                   showWrong ? <Icon name="X" size={14} /> :
                   String.fromCharCode(65 + idx)}
                </div>
                <span className={`text-sm ${showFeedback && !isCorrect && !isSelected ? "text-white/40" : "text-white"}`}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-5 p-4 rounded-2xl border animate-fade-in ${
            selected === q.correct
              ? "bg-green-500/10 border-green-500/30"
              : "bg-orange-500/10 border-orange-500/30"
          }`}>
            <p className={`font-bold text-sm mb-1 ${selected === q.correct ? "text-green-300" : "text-orange-300"}`}>
              {selected === q.correct ? "🎉 Верно!" : "💡 Не угадал, но ИИ запомнит"}
            </p>
            <p className="text-white/60 text-sm">{q.explanation}</p>
          </div>
        )}
      </div>

      {showFeedback && (
        <button
          onClick={next}
          className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-sm transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${subject.accent}, ${subject.accent}cc)`, boxShadow: `0 4px 24px ${subject.accent}40` }}
        >
          {currentIdx + 1 >= questions.length ? "Посмотреть результаты" : "Следующий вопрос"}
          <Icon name="ArrowRight" size={16} />
        </button>
      )}
    </div>
  );
}
