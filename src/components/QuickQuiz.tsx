import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { QUIZ_STEPS, buildResult } from "@/data/quizFlow";

export default function QuickQuiz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [finished, setFinished] = useState(false);

  const totalSteps = QUIZ_STEPS.length;
  const step = QUIZ_STEPS[stepIndex];
  const progress = finished ? 100 : (stepIndex / totalSteps) * 100;

  const currentAnswer = step ? (answers[step.id] ?? []) : [];

  const result = useMemo(() => (finished ? buildResult(answers) : null), [finished, answers]);

  const toggleOption = (optId: string) => {
    if (!step) return;
    setAnswers((prev) => {
      const current = prev[step.id] ?? [];
      if (step.multi) {
        const isSelected = current.includes(optId);
        const next = isSelected ? current.filter((x) => x !== optId) : [...current, optId];
        return { ...prev, [step.id]: next.slice(0, step.id === "subjects" ? 3 : next.length) };
      }
      return { ...prev, [step.id]: [optId] };
    });
  };

  const goNext = () => {
    if (stepIndex < totalSteps - 1) setStepIndex(stepIndex + 1);
    else setFinished(true);
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const restart = () => {
    setAnswers({});
    setStepIndex(0);
    setFinished(false);
  };

  const canProceed = currentAnswer.length > 0;

  return (
    <section
      id="quick-quiz"
      className="relative px-4 py-14"
      aria-label="Быстрый подбор курса"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Icon name="Sparkles" size={12} />
            30 секунд · бесплатно · без регистрации
          </div>
          <h2 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-2">
            Подбери свой <span className="gradient-text-purple">маршрут</span> за 4 шага
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
            Ответь на 4 вопроса — ИИ покажет, какой план обучения подойдёт именно тебе и сколько месяцев нужно до результата.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card/50 backdrop-blur-md overflow-hidden shadow-2xl shadow-purple-500/10">
          {/* Прогресс-бар */}
          <div className="h-1.5 bg-white/5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {!finished && step ? (
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">
                  Шаг {stepIndex + 1} из {totalSteps}
                </p>
                {stepIndex > 0 && (
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-1 text-white/60 hover:text-white text-xs transition-colors"
                  >
                    <Icon name="ArrowLeft" size={12} />
                    Назад
                  </button>
                )}
              </div>

              <h3 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1.5">
                {step.question}
              </h3>
              {step.hint && (
                <p className="text-white/60 text-sm mb-5">{step.hint}</p>
              )}

              <div
                className={`grid gap-2.5 mb-6 ${
                  step.options.length > 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                {step.options.map((opt) => {
                  const selected = currentAnswer.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(opt.id)}
                      className={`group relative text-left rounded-2xl border-2 p-4 transition-all ${
                        selected
                          ? "border-purple-500/70 bg-purple-500/15 shadow-lg shadow-purple-500/20"
                          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {opt.emoji && (
                          <div className="text-2xl flex-shrink-0">{opt.emoji}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm md:text-base leading-tight">
                            {opt.label}
                          </p>
                          {opt.description && (
                            <p className="text-white/60 text-xs mt-1">
                              {opt.description}
                            </p>
                          )}
                        </div>
                        {selected && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                            <Icon name="Check" size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-white/50 text-xs">
                  {step.multi
                    ? `Выбрано: ${currentAnswer.length}`
                    : canProceed
                      ? "Можно идти дальше"
                      : "Выбери один вариант"}
                </p>
                <button
                  onClick={goNext}
                  disabled={!canProceed}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                    canProceed
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-[1.03] shadow-lg shadow-purple-500/30"
                      : "bg-white/8 text-white/40 cursor-not-allowed"
                  }`}
                >
                  {stepIndex === totalSteps - 1 ? "Показать план" : "Дальше"}
                  <Icon name="ArrowRight" size={14} />
                </button>
              </div>
            </div>
          ) : (
            result && (
              <div className="p-6 md:p-8 animate-fade-in">
                <div className="flex items-start gap-4 mb-5">
                  <div className="text-5xl md:text-6xl flex-shrink-0">{result.emoji}</div>
                  <div className="flex-1">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wide mb-1">
                      Готово · твой план
                    </p>
                    <h3 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight mb-2">
                      {result.title}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">
                      {result.description}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                    <p className="text-white/55 text-xs mb-1">Программа</p>
                    <p className="text-white text-sm font-semibold leading-tight">
                      {result.recommendedTrack}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-purple-500/10 border border-purple-500/25 p-3">
                    <p className="text-purple-200/70 text-xs mb-1">Срок до цели</p>
                    <p className="text-white text-base font-bold">
                      ~{result.estimateMonths} мес.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/25 p-3">
                    <p className="text-cyan-200/70 text-xs mb-1">Предметы</p>
                    <p className="text-white text-sm font-semibold leading-tight">
                      {result.primarySubjects.join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link
                    to={result.ctaPath}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-sm hover:scale-[1.02] shadow-lg shadow-purple-500/30 transition-all"
                  >
                    <Icon name="Rocket" size={16} />
                    {result.ctaLabel}
                  </Link>
                  <Link
                    to={result.secondaryCtaPath}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all"
                  >
                    <Icon name="Library" size={16} />
                    {result.secondaryCtaLabel}
                  </Link>
                  <button
                    onClick={restart}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-white/10 text-white/65 hover:text-white hover:border-white/20 text-sm transition-all"
                  >
                    <Icon name="RotateCcw" size={14} />
                    Заново
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <p className="text-center text-white/50 text-xs mt-4">
          Без оплаты · без карты · результат сразу
        </p>
      </div>
    </section>
  );
}
