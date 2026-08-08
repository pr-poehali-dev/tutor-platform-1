import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { STAGES, stageReady } from "@/components/bizlab/stages";
import { BizAnswers } from "@/components/bizlab/types";
import { buildVerdict, calcMetrics } from "@/components/bizlab/calc";
import { localBoard } from "@/components/bizlab/localBoard";
import Intro from "@/components/bizlab/BizLabIntro";
import BizLabForm from "@/components/bizlab/BizLabForm";
import BizLabResult from "@/components/bizlab/BizLabResult";

const SITE_URL = "https://учисьпро.рф";
const LS_KEY = "bizlab_answers_v1";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Что делает тренажёр БИЗНЕС 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Вы проходите 8 этапов планирования бизнеса и вводите свои цифры. Сервис считает юнит-экономику, точку безубыточности, запас прочности и проводит стресс-тест — что будет, если продажи упадут на 40%. На выходе — честная оценка жизнеспособности и разбор от ИИ-совета директоров.",
      },
    },
    {
      "@type": "Question",
      name: "Это бесплатно?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да, полностью бесплатно и без регистрации. Все расчёты, вердикт и разбор экспертов доступны сразу.",
      },
    },
    {
      "@type": "Question",
      name: "Чем это отличается от бизнес-курсов?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Здесь нет мотивации и обещаний лёгкого успеха. Задача сервиса — уберечь от потери денег: показать на ваших цифрах, где план не сходится, и отговорить от кредита, если модель его не выдержит.",
      },
    },
  ],
};

type Stage = "intro" | "form" | "result";

export default function BizLab() {
  const [stage, setStage] = useState<Stage>("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<BizAnswers>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const step = STAGES[stepIdx];
  const metrics = useMemo(() => calcMetrics(answers), [answers]);
  const verdict = useMemo(() => buildVerdict(metrics, answers), [metrics, answers]);
  const review = useMemo(
    () => localBoard(metrics, answers, verdict.score),
    [metrics, answers, verdict.score],
  );

  const set = (key: string, value: string) => {
    setAnswers((a) => {
      const next = { ...a, [key]: value };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        /* приватный режим — просто не сохраняем */
      }
      return next;
    });
  };

  const ready = stageReady(step, answers);

  const next = () => {
    if (stepIdx < STAGES.length - 1) {
      setStepIdx(stepIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStage("intro");
    }
  };

  const restart = () => {
    setAnswers({});
    setStepIdx(0);
    setStage("intro");
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="БИЗНЕС 2026 — проверьте свою бизнес-идею на прочность бесплатно"
        description="Виртуальное моделирование бизнеса: 8 этапов, честный расчёт юнит-экономики, точки безубыточности и стресс-тест. ИИ-совет директоров разберёт план и убережёт от дорогих ошибок. Бесплатно, без регистрации."
        canonical={`${SITE_URL}/bizlab`}
        keywords="бизнес план расчет, открыть свое дело, юнит экономика, точка безубыточности, стоит ли брать кредит на бизнес, проверить бизнес идею, финансовая модель бизнеса, бизнес 2026"
        jsonLd={[FAQ_JSON_LD]}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-lg">
              🏗️
            </div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          {stage !== "intro" && (
            <button
              onClick={restart}
              className="text-white/50 hover:text-white text-sm font-bold transition-colors"
            >
              Начать заново
            </button>
          )}
        </div>
        {stage === "form" && (
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${((stepIdx + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: "Главная", href: "/" }, { label: "БИЗНЕС 2026" }]}
        />

        {stage === "intro" && <Intro onStart={() => setStage("form")} hasDraft={Object.keys(answers).length > 3} />}

        {stage === "form" && (
          <BizLabForm
            step={step}
            stepIdx={stepIdx}
            answers={answers}
            metrics={metrics}
            ready={ready}
            onSet={set}
            onNext={next}
            onBack={back}
          />
        )}

        {stage === "result" && (
          <BizLabResult
            verdict={verdict}
            metrics={metrics}
            review={review}
            onRestart={restart}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
