import { useState } from "react";
import Icon from "@/components/ui/icon";
import { PracticeProblem, checkAnswer } from "@/components/practice/types";

interface Props {
  problem: PracticeProblem;
  onSolved?: (id: number) => void;
  solved?: boolean;
  /** Цветовая схема акцента — например "from-purple-500 to-cyan-500" */
  accent?: string;
}

const DIFFICULTY_STYLE: Record<PracticeProblem["difficulty"], { label: string; cls: string }> = {
  easy: { label: "Легко", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  medium: { label: "Средне", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  hard: { label: "Сложно", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

const MAX_ATTEMPTS_BEFORE_HINT = 1;

export default function PracticeSolver({
  problem,
  onSolved,
  solved = false,
  accent = "from-purple-500 to-cyan-500",
}: Props) {
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  // Интерактивный ввод ответа
  const [userInput, setUserInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [verdict, setVerdict] = useState<"idle" | "correct" | "wrong">("idle");
  const [showSolutionUnlocked, setShowSolutionUnlocked] = useState(false);

  const totalSteps = problem.steps.length;
  const allRevealed = revealedSteps >= totalSteps;
  const diff = DIFFICULTY_STYLE[problem.difficulty];
  const hasAutoCheck = !!problem.expectedAnswers?.length;
  // Если автопроверки нет — сразу разрешаем смотреть разбор
  const solutionOpen = !hasAutoCheck || showSolutionUnlocked || verdict === "correct";

  const handleCheck = () => {
    if (!userInput.trim()) return;
    setAttempts((a) => a + 1);
    const ok = checkAnswer(userInput, problem);
    if (ok) {
      setVerdict("correct");
      setShowSolutionUnlocked(true);
      onSolved?.(problem.id);
    } else {
      setVerdict("wrong");
    }
  };

  const unlockSolution = () => {
    setShowSolutionUnlocked(true);
  };

  const handleNext = () => {
    if (revealedSteps < totalSteps) setRevealedSteps((n) => n + 1);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setRevealedSteps(totalSteps);
    if (!hasAutoCheck) onSolved?.(problem.id);
  };

  const reset = () => {
    setRevealedSteps(0);
    setShowAnswer(false);
    setShowPlan(false);
    setUserInput("");
    setAttempts(0);
    setVerdict("idle");
    setShowSolutionUnlocked(false);
  };

  return (
    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
      {/* Заголовок */}
      <div className="p-5 md:p-6 border-b border-white/8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${diff.cls}`}>
            <Icon name="Gauge" size={10} />
            {diff.label}
          </span>
          <span className="text-white/45 text-[11px] uppercase tracking-wider">
            {problem.grade} · {problem.topicLabel}
          </span>
          <span className="text-white/30 text-[11px]">·</span>
          <span className="text-white/45 text-[11px] italic">{problem.source}</span>
          {(solved || verdict === "correct") && (
            <span className="ml-auto inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
              <Icon name="CheckCircle2" size={10} /> Решена
            </span>
          )}
        </div>
        <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-3 leading-tight">
          {problem.title}
        </h2>
        <div className={`bg-gradient-to-br ${accent} bg-opacity-10 border border-white/15 rounded-2xl p-4`}
             style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1">
            <Icon name="FileText" size={11} />
            Условие задачи
          </p>
          <p className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {problem.statement}
          </p>
        </div>
      </div>

      {/* Интерактивный ввод ответа */}
      {hasAutoCheck && (
        <div className="p-5 md:p-6 border-b border-white/8">
          <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
            <Icon name="Edit3" size={11} />
            Твой ответ
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (verdict === "wrong") setVerdict("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheck();
              }}
              disabled={verdict === "correct"}
              placeholder={problem.answerPlaceholder ?? "Введи ответ..."}
              className={`flex-1 bg-white/5 border rounded-2xl px-4 py-3 text-white placeholder:text-white/35 focus:outline-none transition-colors ${
                verdict === "correct"
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : verdict === "wrong"
                  ? "border-rose-500/50 bg-rose-500/10"
                  : "border-white/12 focus:border-purple-500/50 focus:bg-white/8"
              }`}
            />
            <button
              onClick={handleCheck}
              disabled={!userInput.trim() || verdict === "correct"}
              className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r ${accent} text-white text-sm font-bold px-5 py-3 rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100`}
            >
              <Icon name="Send" size={14} />
              Проверить
            </button>
          </div>

          {verdict === "correct" && (
            <div className="mt-3 flex items-start gap-2 bg-emerald-500/12 border border-emerald-500/35 rounded-2xl p-3.5 animate-fadeIn">
              <Icon name="PartyPopper" size={16} className="text-emerald-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-200 text-sm font-bold">Верно! Так держать.</p>
                <p className="text-emerald-200/80 text-xs mt-0.5">Раскрыли разбор ниже — изучи логику и закрепи метод.</p>
              </div>
            </div>
          )}

          {verdict === "wrong" && (
            <div className="mt-3 flex items-start gap-2 bg-rose-500/12 border border-rose-500/35 rounded-2xl p-3.5 animate-fadeIn">
              <Icon name="XCircle" size={16} className="text-rose-300 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-rose-200 text-sm font-bold">Не совсем. Попытка {attempts}.</p>
                <p className="text-rose-200/80 text-xs mt-0.5">
                  {attempts < MAX_ATTEMPTS_BEFORE_HINT + 1
                    ? "Подумай ещё раз. Если нужна помощь — открой план решения ниже."
                    : "Не получается? Открой подсказку или посмотри разбор по шагам."}
                </p>
                {attempts >= MAX_ATTEMPTS_BEFORE_HINT + 1 && !showSolutionUnlocked && (
                  <button
                    onClick={unlockSolution}
                    className="mt-2 inline-flex items-center gap-1.5 text-rose-200 hover:text-white text-xs font-semibold underline underline-offset-2"
                  >
                    <Icon name="Eye" size={11} />
                    Открыть разбор
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Анализ + План + Шаги — скрыты, пока пользователь не решил или не разблокировал */}
      {solutionOpen && (
        <>
          {/* Анализ */}
          <div className="p-5 md:p-6 border-b border-white/8">
            <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
              <Icon name="Search" size={11} />
              Анализ задачи
            </p>
            <p className="text-white/75 text-sm leading-relaxed">{problem.analysis}</p>
          </div>

          {/* План */}
          {problem.plan.length > 0 && (
            <div className="p-5 md:p-6 border-b border-white/8">
              {!showPlan ? (
                <button
                  onClick={() => setShowPlan(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
                >
                  <Icon name="Lightbulb" size={14} />
                  Показать план решения (подсказка)
                </button>
              ) : (
                <>
                  <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
                    <Icon name="ListChecks" size={11} />
                    План решения
                  </p>
                  <ol className="space-y-2">
                    {problem.plan.map((p, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-white/80 text-sm leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-200 font-bold mt-0.5">
                          {i + 1}
                        </span>
                        {p}
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}

          {/* Прогресс шагов */}
          <div className="px-5 md:px-6 pt-5 md:pt-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-white/45 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Icon name="Footprints" size={11} />
                Пошаговое решение
              </p>
              <p className="text-white/55 text-xs tabular-nums">
                Шаг {Math.min(revealedSteps, totalSteps)} / {totalSteps}
              </p>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden mb-5">
              <div
                className={`h-full bg-gradient-to-r ${accent} transition-all duration-500`}
                style={{ width: `${(revealedSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Шаги */}
          <div className="px-5 md:px-6 pb-2 space-y-3">
            {problem.steps.slice(0, revealedSteps).map((s, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-2xl p-4 animate-fadeIn"
              >
                <p className="font-montserrat font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white text-xs font-black`}>
                    {i + 1}
                  </span>
                  {s.title}
                </p>
                <p className="text-white/75 text-sm leading-relaxed mb-2.5 whitespace-pre-line">{s.text}</p>
                {s.formula && (
                  <div className="bg-background/60 border border-purple-500/25 rounded-xl px-3.5 py-2.5 font-mono text-sm text-purple-200 inline-block">
                    {s.formula}
                  </div>
                )}
                {s.hint && (
                  <div className="flex items-start gap-2 mt-3 bg-amber-500/8 border border-amber-500/25 rounded-xl p-2.5">
                    <Icon name="Lightbulb" size={13} className="text-amber-300 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-200/90 text-xs leading-relaxed">{s.hint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Кнопки управления шагами */}
          <div className="p-5 md:p-6 pt-3 flex flex-wrap gap-2.5">
            {!allRevealed ? (
              <>
                <button
                  onClick={handleNext}
                  className={`flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r ${accent} text-white text-sm font-bold px-5 py-3 rounded-2xl hover:scale-[1.01] transition-transform`}
                >
                  <Icon name="ArrowRight" size={14} />
                  {revealedSteps === 0 ? "Начать решение" : "Следующий шаг"}
                </button>
                <button
                  onClick={handleShowAnswer}
                  className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white/75 text-sm font-semibold px-4 py-3 rounded-2xl transition-colors"
                >
                  <Icon name="Eye" size={14} />
                  Показать ответ
                </button>
              </>
            ) : (
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white/75 text-sm font-semibold px-4 py-3 rounded-2xl transition-colors"
              >
                <Icon name="RefreshCw" size={14} />
                Решить заново
              </button>
            )}
          </div>

          {/* Ответ + инсайт */}
          {(allRevealed || showAnswer) && (
            <>
              <div className="mx-5 md:mx-6 mb-4 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/35 rounded-2xl p-4">
                <p className="text-emerald-300 text-[10px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
                  <Icon name="CheckCircle2" size={11} />
                  Ответ
                </p>
                <p className="font-montserrat font-black text-white text-lg md:text-xl whitespace-pre-line">
                  {problem.answer}
                </p>
              </div>
              <div className={`mx-5 md:mx-6 mb-6 bg-gradient-to-br ${accent} bg-opacity-10 border border-white/15 rounded-2xl p-4 flex items-start gap-3`}
                   style={{ background: "rgba(168, 85, 247, 0.08)" }}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center flex-shrink-0`}>
                  <Icon name="Brain" size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-purple-200 text-[10px] uppercase tracking-wider font-bold mb-1">
                    Ключевая идея
                  </p>
                  <p className="text-white/85 text-sm leading-relaxed">{problem.insight}</p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
