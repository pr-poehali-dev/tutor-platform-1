import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import { visibleSteps, ChecklistStep } from "@/components/careerPro/checklist";
import { generatePlan, CareerPlan, Answers } from "@/components/careerPro/api";
import PlanView from "@/components/careerPro/PlanView";
import LeadForm from "@/components/careerPro/LeadForm";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const SITE_URL = "https://учисьпро.рф";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Чем индивидуальный курс отличается от обычного?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Обычный курс одинаков для всех. Здесь вы проходите чек-лист, а ИИ собирает программу лично под вашу цель, уровень, время и нужные навыки — курс, который нужен только вам.",
      },
    },
    {
      "@type": "Question",
      name: "Сколько стоит индивидуальный курс?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Индивидуальный курс от 10 000 ₽. Точная стоимость зависит от объёма программы и рассчитывается после прохождения чек-листа. План курса вы видите бесплатно.",
      },
    },
    {
      "@type": "Question",
      name: "Нужно ли платить, чтобы увидеть программу?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Нет. Вы проходите чек-лист и сразу бесплатно видите полный персональный план курса. Оплата — только если решите учиться.",
      },
    },
  ],
};

type Stage = "intro" | "checklist" | "loading" | "plan";

export default function CareerPro() {
  const [stage, setStage] = useState<Stage>("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [price, setPrice] = useState(10000);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = visibleSteps(answers);
  const safeIdx = Math.min(stepIdx, steps.length - 1);
  const step = steps[safeIdx];
  const total = steps.length;
  const progress = Math.round(((safeIdx + (stage === "plan" ? 1 : 0)) / total) * 100);

  const start = () => {
    trackGoal("career_pro_start");
    setStage("checklist");
    setStepIdx(0);
  };

  const setAnswer = (key: string, value: string | string[]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const canNext = (s: ChecklistStep): boolean => {
    if (s.optional) return true;
    const v = answers[s.key];
    if (s.type === "multi") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  };

  const next = async () => {
    if (safeIdx < total - 1) {
      setStepIdx(safeIdx + 1);
      return;
    }
    setStage("loading");
    setError(null);
    const goal = (answers.goal as string) || "";
    const res = await generatePlan(goal, answers);
    if (!res.ok || !res.plan) {
      setError(res.message || "Не удалось собрать план, попробуйте ещё раз");
      setStage("checklist");
      return;
    }
    setPlan(res.plan);
    setPrice(res.price || res.min_price || 10000);
    trackGoal("career_pro_plan_ready");
    setStage("plan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (safeIdx > 0) setStepIdx(safeIdx - 1);
    else setStage("intro");
  };

  const restart = () => {
    setAnswers({});
    setPlan(null);
    setShowForm(false);
    setStepIdx(0);
    setStage("intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Профориентация PRO — индивидуальный курс под вас с помощью ИИ"
        description="Пройдите чек-лист — и ИИ соберёт индивидуальный курс лично под вашу цель, уровень и нужные навыки. Персональная программа обучения для взрослых от 10 000 ₽. План курса — бесплатно."
        canonical={`${SITE_URL}/career-pro`}
        keywords="профориентация, индивидуальный курс, персональный курс обучения, курс под меня, обучение взрослых, сменить профессию, ии подбор курса, карьера, переквалификация"
        jsonLd={[FAQ_JSON_LD]}
      />

      <Header />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: "Главная", href: "/" }, { label: "Профориентация PRO" }]}
        />

        {stage === "intro" && <Intro onStart={start} />}

        {stage === "checklist" && (
          <ChecklistStepView
            step={step}
            stepIdx={safeIdx}
            total={total}
            progress={progress}
            answers={answers}
            error={error}
            onSet={setAnswer}
            onNext={next}
            onBack={back}
            canNext={canNext(step)}
            isLast={safeIdx === total - 1}
          />
        )}

        {stage === "loading" && <LoadingView />}

        {stage === "plan" && plan && (
          <>
            {showForm ? (
              <LeadForm
                goal={(answers.goal as string) || ""}
                answers={answers}
                plan={plan}
                price={price}
                onClose={() => setShowForm(false)}
              />
            ) : (
              <PlanView
                plan={plan}
                price={price}
                onApply={() => {
                  trackGoal("career_pro_apply_click");
                  setShowForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onRestart={restart}
              />
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Header() {
  return (
    <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🎯</div>
          <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
        </Link>
        <Link
          to="/courses"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white border border-white/15 hover:border-purple-400/50 px-4 py-2 rounded-xl transition-colors"
        >
          <Icon name="Library" size={15} className="text-purple-300" /> Каталог курсов
        </Link>
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  const steps = [
    { icon: "ClipboardList", title: "Пройдите чек-лист", text: "Вопросы о ваших интересах, сильных сторонах и целях. 2 минуты." },
    { icon: "Compass", title: "Наставник подберёт путь", text: "ИИ определит направление, соберёт курс и даст план действий." },
    { icon: "Rocket", title: "Сделайте первый шаг", text: "Получите «волшебный пинок» и понятные шаги — начните сегодня." },
  ];
  return (
    <div>
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-purple-200 bg-purple-500/15 border border-purple-500/25 rounded-lg px-3 py-1 mb-4">
          <Icon name="Fingerprint" size={14} /> Профориентация PRO
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.05] mb-4">
          Курс, который создан <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">только для вас</span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
          Не можете определиться, чем заниматься? Пройдите чек-лист — и ИИ-наставник подберёт
          направление, соберёт индивидуальный курс под вашу цель и даст пошаговый план действий.
          Работает даже если вам 30, 40 или 50+. Такого нет больше нигде.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center mb-3">
              <Icon name={s.icon} size={20} className="text-purple-300" />
            </div>
            <h3 className="font-bold text-white mb-1">{s.title}</h3>
            <p className="text-white/55 text-sm">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-600/15 to-cyan-500/10 p-6 md:p-8 text-center">
        <p className="text-white/80 mb-1">Индивидуальный курс под вашу цель</p>
        <div className="font-montserrat font-black text-3xl text-white mb-1">от 10 000 ₽</div>
        <p className="text-white/45 text-xs mb-5">Персональный план курса вы увидите бесплатно — оплата только если решите учиться.</p>
        <button
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform glow-purple"
        >
          <Icon name="Rocket" size={18} /> Собрать мой курс
        </button>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/15 flex items-center justify-center mb-5">
        <Icon name="Loader2" size={32} className="text-purple-300 animate-spin" />
      </div>
      <h3 className="font-montserrat font-black text-xl text-white mb-2">ИИ собирает ваш курс…</h3>
      <p className="text-white/55 text-sm max-w-sm">
        Анализируем ваши ответы и подбираем модули, навыки и проект — лично под вас. Это займёт несколько секунд.
      </p>
    </div>
  );
}

function ChecklistStepView({
  step, stepIdx, total, progress, answers, error, onSet, onNext, onBack, canNext, isLast,
}: {
  step: ChecklistStep;
  stepIdx: number;
  total: number;
  progress: number;
  answers: Answers;
  error: string | null;
  onSet: (key: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  canNext: boolean;
  isLast: boolean;
}) {
  const value = answers[step.key];

  const toggleMulti = (v: string) => {
    const arr = Array.isArray(value) ? value : [];
    if (arr.includes(v)) {
      onSet(step.key, arr.filter((x) => x !== v));
    } else {
      if (step.maxSelect && arr.length >= step.maxSelect) return;
      onSet(step.key, [...arr, v]);
    }
  };
  const multiLimitReached =
    step.maxSelect != null && Array.isArray(value) && value.length >= step.maxSelect;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-white/45 mb-2">
          <span>Шаг {stepIdx + 1} из {total}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(8, (stepIdx / total) * 100)}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-1">{step.question}</h2>
        {step.hint && <p className="text-white/50 text-sm mb-5">{step.hint}</p>}
        {!step.hint && <div className="mb-5" />}

        {step.type === "text" && (
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onSet(step.key, e.target.value)}
            placeholder={step.placeholder}
            rows={3}
            autoFocus
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 resize-y"
          />
        )}

        {step.type === "single" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {step.options!.map((o) => (
              <button
                key={o.value}
                onClick={() => onSet(step.key, o.value)}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm text-left transition-all ${
                  value === o.value
                    ? "border-purple-400/60 bg-purple-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25"
                }`}
              >
                {o.emoji && <span className="text-lg">{o.emoji}</span>}
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        )}

        {step.type === "multi" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {step.options!.map((o) => {
                const active = Array.isArray(value) && value.includes(o.value);
                const disabled = !active && multiLimitReached;
                return (
                  <button
                    key={o.value}
                    onClick={() => toggleMulti(o.value)}
                    disabled={disabled}
                    className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm text-left transition-all ${
                      active
                        ? "border-purple-400/60 bg-purple-500/15 text-white"
                        : disabled
                        ? "border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed"
                        : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center ${
                        active ? "bg-purple-500 border-purple-500" : "border-white/25"
                      }`}
                    >
                      {active && <Icon name="Check" size={13} className="text-white" />}
                    </span>
                    {o.emoji && <span>{o.emoji}</span>}
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
            {step.maxSelect && (
              <p className="text-white/40 text-xs mt-2">
                Выбрано {Array.isArray(value) ? value.length : 0} из {step.maxSelect}
              </p>
            )}
          </>
        )}

        {error && <div className="mt-4 text-rose-300 text-sm">{error}</div>}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm px-4 py-3 rounded-xl border border-white/10 transition-colors"
          >
            <Icon name="ChevronLeft" size={16} /> Назад
          </button>
          <button
            onClick={onNext}
            disabled={!canNext}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
          >
            {isLast ? (
              <>
                <Icon name="Sparkles" size={18} /> Собрать мой курс
              </>
            ) : (
              <>
                Далее <Icon name="ChevronRight" size={18} />
              </>
            )}
          </button>
        </div>
        {step.optional && (
          <p className="text-white/35 text-xs text-center mt-3">Этот вопрос можно пропустить</p>
        )}
      </div>
    </div>
  );
}