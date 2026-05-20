import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Task, SubjectChoice, ProgramModule, LEARNING_PATH_URL } from "./journeyData";

interface Props {
  module: ProgramModule;
  subject: SubjectChoice;
  onModuleComplete: () => void;
  onBack: () => void;
}

export default function StepLesson({ module, subject, onModuleComplete, onBack }: Props) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [completedTaskTitles, setCompletedTaskTitles] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const loadTask = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_task",
          subject: subject.id,
          topic: module.topic,
          difficulty: module.difficulty,
          completed_tasks: completedTaskTitles,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации задания");
      setCurrentTask(data);
      setUserAnswer("");
      setSelectedOption(null);
      setShowResult(false);
      setHintsShown(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIdx]);

  const checkAnswer = () => {
    if (!currentTask) return;
    let isCorrect = false;
    if (currentTask.type === "multiple_choice") {
      isCorrect = selectedOption === Number(currentTask.correct_answer);
    } else {
      const correct = String(currentTask.correct_answer).toLowerCase().trim();
      const user = userAnswer.toLowerCase().trim();
      isCorrect = user === correct || (user.length > 3 && correct.includes(user));
    }
    if (isCorrect) setCorrectCount(c => c + 1);
    setShowResult(true);
  };

  const nextTask = () => {
    if (currentTask) {
      setCompletedTaskTitles(prev => [...prev, currentTask.question]);
    }
    if (taskIdx + 1 >= module.tasks_count) {
      // Module mastery check (Bloom: 80%+)
      const masteryPercent = ((correctCount + (showResult && isAnswerCorrect() ? 1 : 0)) / module.tasks_count) * 100;
      if (masteryPercent >= 60) {
        onModuleComplete();
      } else {
        // Retry weak parts
        setTaskIdx(taskIdx + 1);
      }
    } else {
      setTaskIdx(taskIdx + 1);
    }
  };

  const isAnswerCorrect = () => {
    if (!currentTask || !showResult) return false;
    if (currentTask.type === "multiple_choice") {
      return selectedOption === Number(currentTask.correct_answer);
    }
    const correct = String(currentTask.correct_answer).toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();
    return user === correct || (user.length > 3 && correct.includes(user));
  };

  const progress = (taskIdx / module.tasks_count) * 100;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <Icon name="ArrowLeft" size={14} />
          К программе
        </button>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-white/50">Задание {taskIdx + 1} из {module.tasks_count}</span>
          <span className="text-yellow-400 font-bold flex items-center gap-1">
            <Icon name="Zap" size={12} /> {correctCount}/{module.tasks_count}
          </span>
        </div>
      </div>

      {/* Module title + progress */}
      <div className="mb-6">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{module.topic}</p>
        <h2 className="font-montserrat font-black text-xl text-white mb-3">{module.title}</h2>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${subject.accent}, ${subject.accent}aa)` }}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-card/60 border border-white/10 rounded-3xl p-12 text-center">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-3" style={{ color: subject.accent }} />
          <p className="text-white/55 text-sm">ИИ генерирует уникальное задание...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-sm mb-4">
          ⚠️ {error}
          <button onClick={loadTask} className="block mt-2 text-white underline text-xs">Попробовать снова</button>
        </div>
      )}

      {/* Task */}
      {currentTask && !isLoading && (
        <>
          <div className="bg-card/60 border border-white/10 rounded-3xl p-6 md:p-8 mb-4">
            {currentTask.context && (
              <div className="bg-white/5 rounded-xl p-3 mb-4 text-white/70 text-sm">
                📋 {currentTask.context}
              </div>
            )}

            <h3 className="font-montserrat font-black text-lg md:text-xl text-white mb-6 leading-snug">
              {currentTask.question}
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
                        {showRight ? <Icon name="Check" size={14} /> :
                         showWrong ? <Icon name="X" size={14} /> :
                         String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm text-white">{opt}</span>
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
                  placeholder={currentTask.type === "explain" ? "Объясни своими словами..." : "Введи ответ..."}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-60"
                  rows={currentTask.type === "explain" ? 4 : 2}
                />
                {showResult && (
                  <div className={`mt-3 p-3 rounded-xl text-sm ${
                    isAnswerCorrect() ? "bg-green-500/10 text-green-300 border border-green-500/30" : "bg-orange-500/10 text-orange-300 border border-orange-500/30"
                  }`}>
                    {isAnswerCorrect() ? "🎉 Точно!" : `Правильный ответ: ${currentTask.correct_answer}`}
                  </div>
                )}
              </div>
            )}

            {/* Hints */}
            {!showResult && hintsShown < currentTask.hints.length && (
              <div className="mt-5 pt-5 border-t border-white/8">
                {currentTask.hints.slice(0, hintsShown).map((h, i) => (
                  <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-2 text-yellow-200 text-sm">
                    💡 {h}
                  </div>
                ))}
                <button
                  onClick={() => setHintsShown(hintsShown + 1)}
                  className="text-xs text-white/45 hover:text-white/70 transition-colors flex items-center gap-1.5"
                >
                  <Icon name="Lightbulb" size={13} />
                  Показать подсказку ({hintsShown + 1}/{currentTask.hints.length})
                </button>
              </div>
            )}

            {/* Explanation after answer */}
            {showResult && (
              <div className="mt-5 pt-5 border-t border-white/8">
                <p className="text-white/45 text-xs font-semibold uppercase tracking-widest mb-2">📚 Разбор</p>
                <p className="text-white/75 text-sm leading-relaxed mb-3">{currentTask.explanation}</p>
                {currentTask.fun_fact && (
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-cyan-200 text-xs">
                    🌟 А ты знал? {currentTask.fun_fact}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={
                (currentTask.type === "multiple_choice" && selectedOption === null) ||
                (currentTask.type !== "multiple_choice" && !userAnswer.trim())
              }
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-all disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${subject.accent}, ${subject.accent}cc)`, boxShadow: `0 4px 24px ${subject.accent}40` }}
            >
              <Icon name="Check" size={16} />
              Проверить ответ
            </button>
          ) : (
            <button
              onClick={nextTask}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(135deg, ${subject.accent}, ${subject.accent}cc)`, boxShadow: `0 4px 24px ${subject.accent}40` }}
            >
              {taskIdx + 1 >= module.tasks_count ? "Завершить модуль" : "Следующее задание"}
              <Icon name="ArrowRight" size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
