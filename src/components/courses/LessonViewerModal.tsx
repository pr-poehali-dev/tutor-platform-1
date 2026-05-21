import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { LEARNING_PATH_URL, Lesson, Task } from "@/components/journey/journeyData";

interface Props {
  open: boolean;
  onClose: () => void;
  subjectId: string;          // math/physics/english/russian/...
  topic: string;              // тема урока
  grade: string;              // 5-9 / 10-11 / ege / oge / 1-4
  lessonTitle: string;        // название урока из программы курса
  accent?: string;
}

const SUPPORTED_SUBJECTS = ["math", "physics", "english", "russian"];

const mapSubject = (s: string): string => {
  if (SUPPORTED_SUBJECTS.includes(s)) return s;
  if (s === "literature") return "russian";
  if (s === "chemistry" || s === "biology" || s === "cs") return "physics";
  return "math";
};

const mapGrade = (g: string): string => {
  if (["5-9", "10-11", "ege"].includes(g)) return g;
  if (g === "oge") return "5-9";
  if (g === "1-4") return "5-9";
  return "5-9";
};

type Phase = "theory" | "examples" | "tasks" | "done";

export default function LessonViewerModal({ open, onClose, subjectId, topic, grade, lessonTitle, accent = "#a855f7" }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("theory");
  const [theoryIdx, setTheoryIdx] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const [taskIdx, setTaskIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      loadLesson();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, topic, lessonTitle]);

  const loadLesson = async () => {
    setIsLoading(true);
    setError(null);
    setLesson(null);
    setPhase("theory");
    setTheoryIdx(0);
    setExampleIdx(0);
    setRevealedSteps(0);
    setTaskIdx(0);
    setShowResult(false);
    setSelectedOption(null);
    setUserAnswer("");
    setHintsShown(0);
    setCorrectCount(0);
    try {
      const res = await fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_lesson",
          subject: mapSubject(subjectId),
          topic,
          grade: mapGrade(grade),
          difficulty: "средний",
          lesson_title: lessonTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации урока");
      setLesson(data as Lesson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const currentTask: Task | null = lesson && phase === "tasks" ? lesson.tasks[taskIdx] : null;

  const isAnswerCorrect = () => {
    if (!currentTask || !showResult) return false;
    if (currentTask.type === "multiple_choice") return selectedOption === Number(currentTask.correct_answer);
    const correct = String(currentTask.correct_answer).toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();
    return user === correct || (user.length > 3 && correct.includes(user));
  };

  const checkAnswer = () => {
    if (!currentTask) return;
    const correct = isAnswerCorrect() || (
      currentTask.type === "multiple_choice"
        ? selectedOption === Number(currentTask.correct_answer)
        : String(currentTask.correct_answer).toLowerCase().trim() === userAnswer.toLowerCase().trim()
    );
    if (correct) setCorrectCount(c => c + 1);
    setShowResult(true);
  };

  const nextTask = () => {
    if (!lesson) return;
    if (taskIdx + 1 >= lesson.tasks.length) {
      setPhase("done");
      return;
    }
    setTaskIdx(taskIdx + 1);
    setUserAnswer("");
    setSelectedOption(null);
    setShowResult(false);
    setHintsShown(0);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-white/10 rounded-none md:rounded-3xl w-full max-w-3xl my-0 md:my-8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }} />

        <button
          onClick={onClose}
          className="absolute right-4 top-6 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <Icon name="X" size={18} />
        </button>

        <div className="p-6 md:p-8 max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16">
              <Icon name="Loader2" size={36} className="animate-spin mx-auto mb-3" style={{ color: accent }} />
              <p className="text-white font-bold mb-1">ИИ-методист готовит урок</p>
              <p className="text-white/55 text-sm">Подбираю теорию, примеры и задачи по теме «{topic}»</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300 text-sm">
              ⚠️ {error}
              <button onClick={loadLesson} className="block mt-3 text-white underline text-xs">Попробовать снова</button>
            </div>
          )}

          {/* Content */}
          {lesson && !isLoading && (
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
                <h2 className="font-montserrat font-black text-2xl text-white mb-1.5">{lesson.title}</h2>
                <p className="text-white/55 text-sm">{lesson.subtitle} · ≈ {lesson.duration_minutes} мин</p>
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

              {/* THEORY */}
              {phase === "theory" && lesson.theory_blocks.length > 0 && (() => {
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
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
                        {theoryIdx + 1}
                      </div>
                      <h3 className="font-montserrat font-black text-lg text-white">{block.heading}</h3>
                    </div>
                    <p className="text-white/80 text-[15px] leading-relaxed whitespace-pre-line mb-4">{block.content}</p>

                    {block.key_points?.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Запомни</p>
                        <ul className="space-y-1.5">
                          {block.key_points.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-white/85 text-sm">
                              <Icon name="Sparkle" size={12} style={{ color: accent }} className="mt-1 flex-shrink-0" />
                              <span>{p}</span>
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
              })()}

              {/* EXAMPLES */}
              {phase === "examples" && lesson.examples.length > 0 && (() => {
                const ex = lesson.examples[exampleIdx];
                const isFirst = exampleIdx === 0;
                const isLast = exampleIdx === lesson.examples.length - 1;
                const allRevealed = revealedSteps >= ex.solution_steps.length;
                return (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
                        <Icon name="Lightbulb" size={16} />
                      </div>
                      <h3 className="font-montserrat font-black text-lg text-white">{ex.title}</h3>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Задача</p>
                      <p className="text-white/85 text-[15px] leading-relaxed">{ex.problem}</p>
                    </div>

                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Решение по шагам</p>
                    <div className="flex flex-col gap-2 mb-4">
                      {ex.solution_steps.slice(0, revealedSteps).map((step, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/4 border border-white/8 rounded-xl p-3 animate-fade-in">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: accent }}>
                            {i + 1}
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>

                    {!allRevealed && (
                      <button onClick={() => setRevealedSteps(revealedSteps + 1)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-white/80 text-sm font-medium transition-all flex items-center justify-center gap-2">
                        <Icon name="ChevronDown" size={14} />
                        {revealedSteps === 0 ? "Показать первый шаг" : `Показать шаг ${revealedSteps + 1}`}
                      </button>
                    )}

                    {allRevealed && (
                      <>
                        <div className="rounded-2xl p-4 mb-3" style={{ background: `${accent}15`, border: `1px solid ${accent}40` }}>
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
                          if (isFirst) { setPhase("theory"); setTheoryIdx(lesson.theory_blocks.length - 1); }
                          else { setExampleIdx(exampleIdx - 1); setRevealedSteps(0); }
                        }}
                        className="text-white/50 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
                      >
                        <Icon name="ArrowLeft" size={14} /> {isFirst ? "К теории" : "Назад"}
                      </button>
                      <span className="text-white/40 text-xs">Пример {exampleIdx + 1} из {lesson.examples.length}</span>
                      <button
                        onClick={() => {
                          if (isLast) setPhase("tasks");
                          else { setExampleIdx(exampleIdx + 1); setRevealedSteps(0); }
                        }}
                        disabled={!allRevealed}
                        className="text-white font-bold px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                      >
                        {isLast ? "К задачам" : "Следующий"} <Icon name="ArrowRight" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* TASKS */}
              {phase === "tasks" && currentTask && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <span className="text-white/50">Задача {taskIdx + 1} из {lesson.tasks.length}</span>
                    <span className="font-bold px-3 py-1 rounded-full" style={{ background: `${accent}15`, color: accent }}>
                      {currentTask.type === "multiple_choice" ? "Выбери ответ" : currentTask.type === "input" ? "Введи ответ" : "Объясни"}
                    </span>
                  </div>

                  <h3 className="font-montserrat font-black text-lg text-white mb-6 leading-snug">
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
                              {showRight ? <Icon name="Check" size={14} /> : showWrong ? <Icon name="X" size={14} /> : String.fromCharCode(65 + idx)}
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
                        placeholder="Введи ответ..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-60"
                        rows={2}
                      />
                      {showResult && (
                        <div className={`mt-3 p-3 rounded-xl border text-sm ${isAnswerCorrect() ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
                          <strong>Правильный ответ:</strong> {String(currentTask.correct_answer)}
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
                        <div key={i} className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-3 text-purple-200 text-xs">💡 {h}</div>
                      ))}
                    </div>
                  )}

                  {showResult && (
                    <div className={`mt-5 p-4 rounded-2xl border ${isAnswerCorrect() ? "border-green-500/40 bg-green-500/8" : "border-red-500/40 bg-red-500/8"}`}>
                      <p className={`font-bold mb-2 flex items-center gap-2 ${isAnswerCorrect() ? "text-green-300" : "text-red-300"}`}>
                        <Icon name={isAnswerCorrect() ? "Check" : "X"} size={16} />
                        {isAnswerCorrect() ? "Верно!" : "Не совсем"}
                      </p>
                      <p className="text-white/75 text-sm leading-relaxed">{currentTask.explanation}</p>
                      {currentTask.fun_fact && (
                        <p className="text-white/45 text-xs mt-3 italic border-t border-white/10 pt-3">💡 {currentTask.fun_fact}</p>
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
              )}

              {/* DONE */}
              {phase === "done" && (
                <div className="text-center py-6 animate-fade-in">
                  <div className="text-6xl mb-3">🎯</div>
                  <h3 className="font-montserrat font-black text-2xl text-white mb-2">Урок пройден!</h3>
                  <p className="text-white/70 mb-4">Правильных ответов: <span className="font-bold text-white">{correctCount} из {lesson.tasks.length}</span></p>

                  <div className="bg-white/4 border border-white/8 rounded-2xl p-5 text-left mb-4">
                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Резюме</p>
                    <p className="text-white/80 text-sm leading-relaxed">{lesson.summary}</p>
                  </div>

                  {lesson.common_mistakes?.length > 0 && (
                    <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-2xl p-4 text-left mb-5">
                      <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-2">Чтобы не ошибиться в следующий раз</p>
                      <ul className="space-y-1.5">
                        {lesson.common_mistakes.map((m, i) => (
                          <li key={i} className="text-yellow-100/85 text-sm">• {m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button onClick={loadLesson} className="bg-white/8 hover:bg-white/12 border border-white/10 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2">
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}