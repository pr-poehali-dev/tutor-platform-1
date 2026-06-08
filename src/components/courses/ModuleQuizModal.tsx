import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { LEARNING_PATH_URL, Task } from "@/components/journey/journeyData";
import { MathText } from "@/lib/mathFormat";
import LessonLoadingProgress from "@/components/journey/lesson/LessonLoadingProgress";

interface Props {
  open: boolean;
  onClose: () => void;
  subjectId: string;          // math/physics/...
  grade: string;              // 5-9 / 10-11 / ege / oge
  moduleTitle: string;
  topics: string[];           // темы уроков модуля для генерации вопросов
  accent?: string;
  onFinish?: (correct: number, total: number) => void;
}

// Маппинг как в LessonViewerModal
const SUPPORTED_SUBJECTS = [
  "math", "physics", "english", "russian",
  "chinese", "korean", "datascience", "product", "avangard", "roomscan", "business",
  "chemistry", "biology", "cs", "ai", "history", "society", "geography",
  "logic", "skills", "career", "literature", "marketing", "robotics", "smartmach",
];
const mapSubject = (s: string) => (SUPPORTED_SUBJECTS.includes(s) ? s : "math");
const mapGrade = (g: string) => {
  if (["5-9", "10-11", "ege"].includes(g)) return g;
  if (g === "oge") return "5-9";
  if (g === "1-4") return "5-9";
  if (g === "adult") return "10-11";
  return "5-9";
};

interface AnswerRecord {
  task: Task;
  given: string;       // ответ ученика (текст или индекс)
  correct: boolean;
}

const QUIZ_SIZE = 6;

export default function ModuleQuizModal({
  open, onClose, subjectId, grade, moduleTitle, topics, accent = "#a855f7", onFinish,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const finishReported = useRef(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      loadQuiz();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);
    setTasks([]);
    setIdx(0);
    setSelected(null);
    setTyped("");
    setShowResult(false);
    setAnswers([]);
    setFinished(false);
    finishReported.current = false;

    const subj = mapSubject(subjectId);
    const gr = mapGrade(grade);
    const pool = topics.filter(Boolean).slice(0, 4);
    const useTopics = pool.length > 0 ? pool : [moduleTitle];

    try {
      // Генерируем задачи по нескольким темам параллельно, потом перемешиваем.
      const perTopic = Math.max(2, Math.ceil(QUIZ_SIZE / useTopics.length));
      const requests = useTopics.map(topic =>
        fetch(LEARNING_PATH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate_lesson_tasks",
            subject: subj,
            topic,
            grade: gr,
            difficulty: "средний",
            n: perTopic,
          }),
        })
          .then(r => r.json())
          .then(d => (Array.isArray(d?.tasks) ? (d.tasks as Task[]) : []))
          .catch(() => [] as Task[]),
      );
      const results = await Promise.all(requests);
      const all = results.flat().filter(t => t && t.question);
      if (all.length === 0) throw new Error("Не удалось собрать вопросы. Попробуй ещё раз.");
      // Перемешиваем и берём QUIZ_SIZE
      const shuffled = all.sort(() => Math.random() - 0.5).slice(0, QUIZ_SIZE);
      setTasks(shuffled);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const correctCount = answers.filter(a => a.correct).length;
  const percent = tasks.length > 0 ? Math.round((correctCount / tasks.length) * 100) : 0;

  useEffect(() => {
    if (finished && !finishReported.current) {
      finishReported.current = true;
      onFinish?.(correctCount, tasks.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (!open) return null;

  const current = tasks[idx] || null;

  const isCorrect = (): boolean => {
    if (!current) return false;
    if (current.type === "multiple_choice") {
      return selected === Number(current.correct_answer);
    }
    const correct = String(current.correct_answer).toLowerCase().trim();
    const user = typed.toLowerCase().trim();
    return user === correct || (user.length > 3 && correct.includes(user));
  };

  const check = () => {
    if (!current) return;
    const correct = isCorrect();
    setAnswers(prev => [
      ...prev,
      {
        task: current,
        given: current.type === "multiple_choice" ? `option_${selected}` : typed,
        correct,
      },
    ]);
    setShowResult(true);
  };

  const next = () => {
    if (idx + 1 >= tasks.length) {
      setFinished(true);
      return;
    }
    setIdx(idx + 1);
    setSelected(null);
    setTyped("");
    setShowResult(false);
  };

  const resultEmoji = percent >= 80 ? "🏆" : percent >= 50 ? "👍" : "💪";
  const resultText =
    percent >= 80 ? "Отличный результат! Тема освоена."
    : percent >= 50 ? "Неплохо! Стоит повторить слабые места."
    : "Есть над чем поработать — вернись к урокам модуля.";

  return (
    <div
      className="fixed inset-0 z-[130] flex items-start md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-white/10 rounded-none md:rounded-3xl w-full max-w-2xl my-0 md:my-8 overflow-hidden"
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
          {/* Заголовок */}
          <div className="mb-6 pr-10">
            <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: accent }}>
              <Icon name="ClipboardCheck" size={14} /> ИТОГОВЫЙ КВИЗ
            </div>
            <h2 className="font-montserrat font-black text-xl text-white leading-snug">{moduleTitle}</h2>
          </div>

          {loading && (
            <LessonLoadingProgress
              topic={moduleTitle}
              accent={accent}
              estimateSeconds={10}
              title="Собираю вопросы по темам модуля"
            />
          )}

          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300 text-sm">
              ⚠️ {error}
              <button onClick={loadQuiz} className="block mt-3 text-white underline text-xs">Попробовать снова</button>
            </div>
          )}

          {/* Вопрос */}
          {!loading && !error && current && !finished && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-xs">Вопрос {idx + 1} из {tasks.length}</span>
                <div className="flex-1 mx-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${((idx) / tasks.length) * 100}%`, background: accent }} />
                </div>
                <span className="font-bold text-xs" style={{ color: accent }}>{correctCount} верно</span>
              </div>

              <h3 className="font-montserrat font-black text-lg text-white mb-5 leading-snug">
                <MathText>{current.question}</MathText>
              </h3>

              {current.type === "multiple_choice" ? (
                <div className="flex flex-col gap-2.5">
                  {current.options.map((opt, i) => {
                    const correctIdx = Number(current.correct_answer);
                    const isSel = selected === i;
                    const showRight = showResult && i === correctIdx;
                    const showWrong = showResult && isSel && i !== correctIdx;
                    return (
                      <button
                        key={i}
                        onClick={() => !showResult && setSelected(i)}
                        disabled={showResult}
                        className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                          showRight ? "border-green-500/60 bg-green-500/15" :
                          showWrong ? "border-red-500/60 bg-red-500/15" :
                          isSel ? "border-purple-500/60 bg-purple-500/15" :
                          "border-white/15 bg-white/[0.08] hover:bg-white/[0.12] hover:border-white/30"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          showRight ? "bg-green-500 text-white" :
                          showWrong ? "bg-red-500 text-white" :
                          isSel ? "bg-purple-500 text-white" : "bg-white/10 text-white/60"
                        }`}>
                          {showRight ? <Icon name="Check" size={14} /> : showWrong ? <Icon name="X" size={14} /> : String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm text-white"><MathText>{opt}</MathText></span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <input
                    value={typed}
                    onChange={e => setTyped(e.target.value)}
                    disabled={showResult}
                    placeholder="Введи ответ..."
                    className="w-full bg-white/[0.09] border border-white/15 rounded-2xl p-4 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-60"
                  />
                  {showResult && (
                    <div className={`mt-3 p-3 rounded-xl border text-sm ${isCorrect() ? "border-green-500/40 bg-green-500/10 text-green-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
                      <strong>Правильный ответ:</strong> <MathText>{String(current.correct_answer)}</MathText>
                    </div>
                  )}
                </div>
              )}

              {showResult && (
                <div className={`mt-5 p-4 rounded-2xl border ${isCorrect() ? "border-green-500/40 bg-green-500/8" : "border-red-500/40 bg-red-500/8"}`}>
                  <p className={`font-bold mb-2 flex items-center gap-2 ${isCorrect() ? "text-green-300" : "text-red-300"}`}>
                    <Icon name={isCorrect() ? "Check" : "X"} size={16} />
                    {isCorrect() ? "Верно!" : "Не совсем"}
                  </p>
                  <p className="text-white/75 text-sm leading-relaxed"><MathText>{current.explanation}</MathText></p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                {!showResult ? (
                  <button
                    onClick={check}
                    disabled={current.type === "multiple_choice" ? selected === null : !typed.trim()}
                    className="text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                  >
                    Проверить
                  </button>
                ) : (
                  <button
                    onClick={next}
                    className="text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-all flex items-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                  >
                    {idx + 1 >= tasks.length ? "Показать результат" : "Следующий вопрос"}
                    <Icon name="ArrowRight" size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Результат */}
          {finished && (
            <div className="animate-fade-in text-center py-2">
              <div className="text-6xl mb-3">{resultEmoji}</div>
              <h3 className="font-montserrat font-black text-2xl text-white mb-1">Результат: {percent}%</h3>
              <p className="text-white/70 mb-1">Правильных ответов: <span className="font-bold text-white">{correctCount} из {tasks.length}</span></p>
              <p className="text-white/55 text-sm mb-6 max-w-md mx-auto">{resultText}</p>

              {/* Разбор ответов */}
              <div className="text-left space-y-2.5 mb-6">
                {answers.map((a, i) => (
                  <div key={i} className={`rounded-2xl border p-3.5 ${a.correct ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${a.correct ? "bg-green-500" : "bg-red-500"}`}>
                        <Icon name={a.correct ? "Check" : "X"} size={13} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white/90 text-sm font-semibold mb-1"><MathText>{a.task.question}</MathText></p>
                        {!a.correct && (
                          <p className="text-white/60 text-xs mb-1">
                            Верный ответ: <span className="text-green-300">
                              <MathText>{a.task.type === "multiple_choice" ? (a.task.options[Number(a.task.correct_answer)] || "") : String(a.task.correct_answer)}</MathText>
                            </span>
                          </p>
                        )}
                        <p className="text-white/50 text-xs leading-relaxed"><MathText>{a.task.explanation}</MathText></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={loadQuiz}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Icon name="RefreshCw" size={14} /> Пройти заново
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
                >
                  Готово
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}