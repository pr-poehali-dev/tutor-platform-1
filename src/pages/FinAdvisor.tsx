import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { FIELDS, FinField, canGenerate } from "@/components/finAdvisor/fields";
import { generatePlan, savePlan, getPlan, FinReport, Answers } from "@/components/finAdvisor/api";
import ReportView from "@/components/finAdvisor/ReportView";
import LeadForm from "@/components/finAdvisor/LeadForm";
import StoriesBlock from "@/components/finAdvisor/StoriesBlock";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const SITE_URL = "https://учисьпро.рф";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Что делает финансовый консультант?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Вы вводите финансовые показатели бизнеса, а ИИ-финансист рассчитывает ключевые метрики, даёт честную оценку устойчивости, находит скрытые возможности, предупреждает о рисках и предлагает реальные пути привлечения денег — инвестиции, гранты, кредиты или оптимизацию.",
      },
    },
    {
      "@type": "Question",
      name: "Нужно ли платить, чтобы увидеть анализ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Нет. Вы вводите показатели и сразу бесплатно получаете полный финансовый анализ с оценкой устойчивости, рисками и вариантами финансирования. Платное — только живое сопровождение финансиста.",
      },
    },
    {
      "@type": "Question",
      name: "Анализ честный или продающий?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Честный и непредвзятый. Если бизнес в опасной зоне — консультант скажет прямо и может отговорить от кредита или невыгодной сделки. Задача — дать максимальную выгоду собственнику и уберечь от ошибок.",
      },
    },
  ],
};

type Stage = "intro" | "form" | "loading" | "report";

export default function FinAdvisor() {
  const { isAuthenticated } = useAuth();
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [report, setReport] = useState<FinReport | null>(null);
  const [price, setPrice] = useState(10000);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Прямая ссылка на форму анализа: /fin-advisor?start=1
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("start") === "1") {
        setStage("form");
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Авторизованный пользователь возвращается — подгружаем сохранённый анализ.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getPlan().then((res) => {
      if (cancelled || !res.ok || !res.has_plan || !res.plan) return;
      setReport(res.plan);
      setStage("report");
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const setAnswer = (key: string, value: string) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const generate = async () => {
    if (!canGenerate(answers)) {
      setError("Заполните хотя бы выручку и один вид расходов");
      return;
    }
    setStage("loading");
    setError(null);
    const goal = (answers.goal as string) || "";
    const res = await generatePlan(goal, answers);
    if (!res.ok || !res.plan) {
      setError(res.message || "Не удалось собрать анализ, попробуйте ещё раз");
      setStage("form");
      return;
    }
    setReport(res.plan);
    setPrice(res.price || res.min_price || 10000);
    trackGoal("fin_advisor_report_ready");
    setStage("report");
    if (isAuthenticated) {
      savePlan(goal, res.plan);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setAnswers({});
    setReport(null);
    setShowForm(false);
    setStage("form");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const start = () => {
    trackGoal("fin_advisor_start");
    setStage("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Финансовый консультант: честный разбор по вашим цифрам"
        description="Введите цифры бизнеса — ИИ-финансист оценит устойчивость, предупредит о рисках и подскажет, где взять деньги: инвестиции, гранты, кредит. Честно и бесплатно."
        canonical={`${SITE_URL}/fin-advisor`}
        image="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/4bf1160a-4c3f-4e1c-863d-f881a20448d4.jpg"
        keywords="финансовый консультант, финансовый анализ бизнеса, оценка устойчивости бизнеса, привлечение инвестиций, гранты для бизнеса, финансовый директор на аутсорсе, ии для финансов, аналитика бизнеса"
        jsonLd={[FAQ_JSON_LD]}
      />

      <Header />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: "Главная", href: "/" }, { label: "Финансовый консультант" }]}
        />

        {stage === "intro" && <Intro onStart={start} />}

        {stage === "form" && (
          <FinForm
            answers={answers}
            error={error}
            onSet={setAnswer}
            onGenerate={generate}
            canGo={canGenerate(answers)}
          />
        )}

        {stage === "loading" && <LoadingView />}

        {stage === "report" && report && (
          <>
            {showForm ? (
              <LeadForm
                goal={(answers.goal as string) || ""}
                answers={answers}
                plan={report}
                price={price}
                onClose={() => setShowForm(false)}
              />
            ) : (
              <ReportView
                report={report}
                price={price}
                onApply={() => {
                  trackGoal("fin_advisor_apply_click");
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-lg">💰</div>
          <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
        </Link>
        <Link
          to="/courses"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white border border-white/15 hover:border-emerald-400/50 px-4 py-2 rounded-xl transition-colors"
        >
          <Icon name="Library" size={15} className="text-emerald-300" /> Каталог курсов
        </Link>
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  const steps = [
    { icon: "PencilLine", title: "Введите цифры бизнеса", text: "Выручка, расходы, долги, подушка. 2 минуты, без бухгалтерии." },
    { icon: "Gauge", title: "Получите оценку устойчивости", text: "ИИ посчитает метрики и честно скажет, в какой зоне ваш бизнес." },
    { icon: "Landmark", title: "Узнайте, где взять деньги", text: "Инвестиции, гранты, кредит или оптимизация — что реально подходит вам." },
  ];
  return (
    <div>
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-500/15 border border-emerald-500/25 rounded-lg px-3 py-1 mb-4">
          <Icon name="ChartNoAxesCombined" size={14} /> Финансовый консультант
        </span>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.05] mb-4">
          Честный финансовый разбор <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">вашего бизнеса</span>
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
          Введите свои цифры — и ИИ-финансист уровня финдиректора оценит устойчивость бизнеса, вскроет скрытые
          возможности, предупредит о рисках и подскажет реальные пути привлечь деньги. Без лести и без запугивания —
          только честный анализ, который поможет заработать больше и уберечься от ошибок.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3">
              <Icon name={s.icon} size={20} className="text-emerald-300" />
            </div>
            <h3 className="font-bold text-white mb-1">{s.title}</h3>
            <p className="text-white/55 text-sm">{s.text}</p>
          </div>
        ))}
      </div>

      <StoriesBlock />

      <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-600/15 to-cyan-500/10 p-6 md:p-8 text-center">
        <p className="text-white/80 mb-1">Полный финансовый анализ</p>
        <div className="font-montserrat font-black text-3xl text-white mb-1">бесплатно</div>
        <p className="text-white/45 text-xs mb-5">Оценку, риски и варианты финансирования вы увидите сразу — платное только живое сопровождение.</p>
        <button
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform"
        >
          <Icon name="Rocket" size={18} /> Проанализировать бизнес
        </button>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-5">
        <Icon name="Loader2" size={32} className="text-emerald-300 animate-spin" />
      </div>
      <h3 className="font-montserrat font-black text-xl text-white mb-2">Считаем ваши финансы…</h3>
      <p className="text-white/55 text-sm max-w-sm">
        Рассчитываем метрики, оцениваем устойчивость, ищем риски и возможности — честно и по вашим цифрам. Это займёт несколько секунд.
      </p>
    </div>
  );
}

const GROUP_META: Record<string, { title: string; icon: string; hint?: string }> = {
  context: { title: "О бизнесе", icon: "Building2" },
  money: { title: "Деньги в месяц", icon: "Wallet", hint: "Достаточно примерных цифр. Пустые необязательные поля можно пропустить." },
  goal: { title: "Ваш запрос", icon: "Target" },
};

function FinForm({
  answers, error, onSet, onGenerate, canGo,
}: {
  answers: Answers;
  error: string | null;
  onSet: (key: string, value: string) => void;
  onGenerate: () => void;
  canGo: boolean;
}) {
  const groups: FinField["group"][] = ["context", "money", "goal"];
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1">Введите показатели бизнеса</h2>
        <p className="text-white/55 text-sm">
          Чем точнее цифры — тем честнее и полезнее анализ. Данные никуда не передаются, кроме вашего анализа.
        </p>
      </div>

      <div className="space-y-5">
        {groups.map((g) => {
          const meta = GROUP_META[g];
          const fields = FIELDS.filter((f) => f.group === g);
          return (
            <div key={g} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Icon name={meta.icon} size={18} className="text-emerald-300" />
                <h3 className="font-montserrat font-black text-white text-lg">{meta.title}</h3>
              </div>
              {meta.hint && <p className="text-white/45 text-xs mb-4">{meta.hint}</p>}
              {!meta.hint && <div className="mb-4" />}

              <div className="grid sm:grid-cols-2 gap-3">
                {fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={(answers[f.key] as string) || ""}
                    onSet={onSet}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {error && <div className="mt-4 text-rose-300 text-sm">{error}</div>}

      <button
        onClick={onGenerate}
        disabled={!canGo}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
      >
        <Icon name="Sparkles" size={18} /> Получить финансовый анализ
      </button>
      <p className="text-white/35 text-[11px] text-center mt-3">
        Минимум для анализа — выручка и один вид расходов. Остальное уточнит точность.
      </p>
    </div>
  );
}

function FieldInput({
  field, value, onSet,
}: {
  field: FinField;
  value: string;
  onSet: (key: string, value: string) => void;
}) {
  const wide = field.type === "text" || field.type === "select" ? "sm:col-span-2" : "";
  const baseCls =
    "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50";

  return (
    <div className={wide}>
      <label className="block text-white/70 text-sm font-semibold mb-1">
        {field.label}
        {!field.optional && field.group === "money" && field.key === "revenue" && (
          <span className="text-emerald-300"> *</span>
        )}
      </label>
      {field.hint && <p className="text-white/40 text-[11px] mb-1.5">{field.hint}</p>}

      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          className={`${baseCls} appearance-none`}
        >
          <option value="" className="bg-[#140f28]">Выберите…</option>
          {field.options!.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#140f28]">{o.label}</option>
          ))}
        </select>
      ) : field.type === "number" ? (
        <div className="relative">
          <input
            inputMode="numeric"
            value={value}
            onChange={(e) => onSet(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseCls} pr-9`}
          />
          {field.suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{field.suffix}</span>
          )}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onSet(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={baseCls}
        />
      )}
    </div>
  );
}