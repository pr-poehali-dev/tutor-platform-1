import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { AGES, AREAS, AgeSlug, AgeStage } from "@/components/kids/kidsData";
import {
  DIAGNOSTIC_QUESTIONS,
  calculateResult,
  DiagnosticResult,
  ScoreLevel,
} from "@/components/kids/diagnostics";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const LEVEL_STYLE: Record<ScoreLevel, { label: string; cls: string; icon: string }> = {
  behind: { label: "Зона роста", cls: "bg-rose-500/15 text-rose-300 border-rose-500/30", icon: "TrendingUp" },
  normal: { label: "Возрастная норма", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: "CircleCheck" },
  ahead: { label: "Опережает норму", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: "Sparkles" },
};

export default function KidsDiagnostic() {
  // step 0 = выбор возраста, 1..N = вопросы, N+1 = результат
  const [stage, setStage] = useState<AgeStage | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questions = stage ? DIAGNOSTIC_QUESTIONS[stage.slug] : [];
  const totalSteps = questions.length;
  const isResultStep = stage && step > totalSteps;

  const result: DiagnosticResult | null = useMemo(() => {
    if (!stage || !isResultStep) return null;
    return calculateResult(stage.slug, answers);
  }, [stage, isResultStep, answers]);

  const handlePickAge = (age: AgeStage) => {
    setStage(age);
    setStep(1);
    setAnswers({});
  };

  const handleAnswer = (areaId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [areaId]: score }));
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const restart = () => {
    setStage(null);
    setStep(0);
    setAnswers({});
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Диагностика развития ребёнка от 1 до 6 лет — УЧИСЬПРО Малыш"
        description="Бесплатный тест из 6 вопросов: узнайте уровень развития ребёнка по 6 направлениям и получите персональный план занятий. По методикам Монтессори и Никитиных."
        canonical={`${SITE_URL}/kids/test`}
        keywords="диагностика развития ребёнка, тест на развитие 1 год, 2 года, 3 года, нормы развития дошкольника, монтессори тест, что должен уметь ребёнок"
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: (i % 3) + 1 + "px",
                 height: (i % 3) + 1 + "px",
                 left: ((i * 137.5) % 100) + "%",
                 top: ((i * 97.3) % 100) + "%",
                 opacity: 0.1 + (i % 4) * 0.06,
               }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Малыш", href: "/kids" }, { label: "Диагностика" }]} />
          </div>
          <Link
            to="/kids"
            className="hidden md:inline-flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            К Малышу
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16">

        {/* ─── ШАГ 0: ВЫБОР ВОЗРАСТА ───────────────────────────────────── */}
        {!stage && (
          <>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <Icon name="Stethoscope" size={14} className="text-pink-300" />
              <span className="text-sm text-pink-200 font-bold uppercase tracking-wider">Бесплатная диагностика · 2 минуты</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4 leading-tight">
              Узнайте, на что обратить <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">внимание</span> в развитии
            </h1>
            <p className="text-white/65 text-base md:text-lg max-w-2xl mb-8">
              Ответьте на 6 коротких вопросов о ребёнке. Мы сравним с возрастной нормой и подберём занятия именно под ваши задачи.
            </p>

            <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8">
              <p className="text-white/45 text-[11px] uppercase tracking-wider font-bold mb-4 flex items-center gap-1.5">
                <Icon name="Baby" size={12} />
                Возраст ребёнка
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AGES.map((a) => (
                  <button
                    key={a.slug}
                    onClick={() => handlePickAge(a)}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl p-4 transition-all hover:translate-y-[-2px] text-center"
                  >
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-4xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      {a.emoji}
                    </div>
                    <p className="font-montserrat font-black text-white text-base">{a.label}</p>
                    <p className="text-white/45 text-[11px] mt-0.5 italic">«{a.motto}»</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 bg-cyan-500/8 border border-cyan-500/25 rounded-2xl p-4">
                <Icon name="Shield" size={16} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                <p className="text-white/70 text-xs leading-relaxed">
                  Тест анонимный, без регистрации. Никаких автоплатежей. Ваши ответы остаются только в этом браузере.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ─── ШАГИ 1..N: ВОПРОСЫ ──────────────────────────────────────── */}
        {stage && !isResultStep && (() => {
          const q = questions[step - 1];
          const area = AREAS.find((a) => a.id === q.areaId)!;
          const progress = Math.round((step / totalSteps) * 100);
          return (
            <>
              {/* Прогресс */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className="inline-flex items-center gap-1.5 text-white/55 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon name="ArrowLeft" size={14} />
                    Назад
                  </button>
                  <span className="text-white/55 text-xs tabular-nums">Вопрос {step} из {totalSteps}</span>
                  <button
                    onClick={restart}
                    className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
                  >
                    <Icon name="RotateCcw" size={12} />
                    Заново
                  </button>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Карточка вопроса */}
              <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${area.color}`} />
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {area.emoji}
                    </div>
                    <div>
                      <p className="text-white/45 text-[11px] uppercase tracking-wider font-bold">{area.label}</p>
                      <p className="text-white/60 text-xs">Возраст: {stage.label}</p>
                    </div>
                  </div>

                  <h2 className="font-montserrat font-black text-white text-xl md:text-2xl mb-5 leading-snug">
                    {q.text}
                  </h2>

                  <div className="space-y-2.5">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(q.areaId, opt.score)}
                        className="group w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-2xl px-5 py-4 transition-all flex items-center justify-between gap-3"
                      >
                        <span className="text-white text-sm md:text-base">{opt.label}</span>
                        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 group-hover:bg-purple-500/25 border border-white/10 group-hover:border-purple-500/45 flex items-center justify-center transition-all">
                          <Icon name="ArrowRight" size={14} className="text-white/55 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-white/40 text-xs text-center mt-4">
                Отвечайте честно — это нужно только для вашего ребёнка. Никаких «правильных» ответов нет.
              </p>
            </>
          );
        })()}

        {/* ─── РЕЗУЛЬТАТ ───────────────────────────────────────────────── */}
        {result && (
          <>
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${result.age.color} rounded-full px-4 py-1.5 mb-5 shadow-lg`}>
              <span className="text-base">{result.age.emoji}</span>
              <span className="text-sm text-white font-bold uppercase tracking-wider">Результат · {result.age.label}</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
              Готово! Вот ваш <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">персональный план</span>
            </h1>
            <p className="text-white/65 text-base md:text-lg mb-8 leading-relaxed">{result.generalComment}</p>

            {/* Общий балл */}
            <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-white/45 text-[11px] uppercase tracking-wider font-bold mb-1">Общий результат</p>
                  <p className="font-montserrat font-black text-white text-3xl md:text-4xl">
                    {result.total} <span className="text-white/30 text-2xl">/ {result.totalMax}</span>
                  </p>
                </div>
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke="url(#diagGrad)"
                            strokeWidth="8" fill="none"
                            strokeDasharray={`${(result.total / result.totalMax) * 264} 264`}
                            strokeLinecap="round" />
                    <defs>
                      <linearGradient id="diagGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="font-montserrat font-black text-white text-lg">{Math.round((result.total / result.totalMax) * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Разбор по направлениям */}
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-3">По направлениям</p>
            <div className="space-y-2 mb-8">
              {result.areas.map((a) => {
                const ls = LEVEL_STYLE[a.level];
                return (
                  <div key={a.areaId} className="bg-card border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${a.areaColor} flex items-center justify-center text-xl flex-shrink-0`}>
                      {a.areaEmoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <p className="font-montserrat font-black text-white text-sm">{a.areaLabel}</p>
                        <span className={`inline-flex items-center gap-1 border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ls.cls}`}>
                          <Icon name={ls.icon} size={10} />
                          {ls.label}
                        </span>
                      </div>
                      <p className="text-white/65 text-xs leading-relaxed">{a.comment}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Подборка занятий */}
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-3">Рекомендованные занятия</p>
            <p className="text-white/55 text-sm mb-5">
              Мы поставили на первое место занятия для тех направлений, где есть зона роста.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {result.recommendedActivities.map((act) => {
                const area = AREAS.find((ar) => ar.id === act.areaId)!;
                return (
                  <div key={act.id} className="bg-card border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors">
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center text-base flex-shrink-0`}>
                        {area.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-white/45 font-bold">{area.label} · {act.typeLabel}</p>
                        <p className="font-montserrat font-black text-white text-sm leading-tight">{act.title}</p>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed mb-2 line-clamp-2">{act.description}</p>
                    <p className="text-white/40 text-[11px] flex items-center gap-1">
                      <Icon name="Clock" size={10} /> {act.duration}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Кнопки действия */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/kids/${result.age.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-base font-bold px-6 py-4 rounded-2xl hover:scale-[1.01] transition-transform shadow-2xl shadow-pink-500/20"
              >
                <Icon name="Rocket" size={16} />
                Все занятия для {result.age.label}
              </Link>
              <button
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-sm font-semibold px-6 py-4 rounded-2xl transition-colors"
              >
                <Icon name="RotateCcw" size={14} />
                Пройти заново
              </button>
            </div>

            {/* Совет родителю */}
            <div className="mt-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Icon name="Lightbulb" size={20} className="text-white" />
              </div>
              <div>
                <p className="text-amber-200 text-[11px] uppercase tracking-wider font-bold mb-1">Совет родителю</p>
                <p className="text-white/80 text-sm leading-relaxed">{result.age.parentTip}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
