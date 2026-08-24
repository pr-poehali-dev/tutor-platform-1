import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import { COURSES } from "@/components/courses/coursesData";
import { matchCourse, OrderPlan, OrderRequest, MIN_PRICE, CatalogItem } from "@/components/courseOrder/api";
import OrderForm from "@/components/courseOrder/OrderForm";
import PlanView from "@/components/courseOrder/PlanView";
import LeadForm from "@/components/courseOrder/LeadForm";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const SITE_URL = "https://учисьпро.рф";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Что делать, если нужного курса нет в каталоге?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Опишите свой запрос в разделе «Заказ курса». Мы подберём ближайший по смыслу курс из каталога и дополним его тем, чего в нём не хватает именно под вашу задачу.",
      },
    },
    {
      "@type": "Question",
      name: "Сколько стоит индивидуальный курс?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Индивидуальный курс — от 10 000 ₽. Точная стоимость зависит от объёма программы и обсуждается после заявки. Программу вы видите бесплатно.",
      },
    },
    {
      "@type": "Question",
      name: "Нужно ли платить, чтобы увидеть программу курса?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Нет. Вы описываете запрос и сразу бесплатно получаете программу: какой курс ближе всего, что в нём уже есть, чего не хватает и чем мы его дополним.",
      },
    },
  ],
};

const STEPS = [
  {
    icon: "PenLine",
    title: "Описываете запрос",
    text: "Чему хотите научиться и зачем. Чем подробнее — тем точнее программа.",
  },
  {
    icon: "Search",
    title: "Находим близкий курс",
    text: "Подбираем самый близкий курс из каталога и честно показываем, что в нём уже есть.",
  },
  {
    icon: "Puzzle",
    title: "Дополняем под вас",
    text: "Добавляем то, чего не хватает: модули, материалы, разборы вашей ситуации.",
  },
  {
    icon: "GraduationCap",
    title: "Собираем курс",
    text: "Методист согласует детали и соберёт программу лично под вашу задачу.",
  },
];

type Stage = "intro" | "form" | "plan";

const CATALOG: CatalogItem[] = COURSES.map((c) => ({
  id: c.id,
  title: c.title,
  subject: c.subject,
}));

function initialStage(): Stage {
  try {
    return new URLSearchParams(window.location.search).get("start") ? "form" : "intro";
  } catch {
    return "intro";
  }
}

export default function Order() {
  const [stage, setStage] = useState<Stage>(initialStage);
  const [req, setReq] = useState<OrderRequest>({ topic: "" });
  const [plan, setPlan] = useState<OrderPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLead, setShowLead] = useState(false);

  const patch = (p: Partial<OrderRequest>) => setReq((prev) => ({ ...prev, ...p }));

  const runMatch = async () => {
    if (req.topic.trim().length < 3) return setError("Опишите, чему хотите научиться");
    setLoading(true);
    setError(null);
    trackGoal("course_order_match", { topic: req.topic.slice(0, 60) });
    const res = await matchCourse(req, CATALOG);
    setLoading(false);
    if (!res.ok || !res.plan) return setError(res.message || "Не удалось подобрать курс");
    setPlan(res.plan);
    setStage("plan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setPlan(null);
    setReq({ topic: "" });
    setStage("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Seo
        title="Заказ индивидуального курса — обучение под ваш запрос | УЧИСЬПРО"
        description="Не нашли нужный курс? Опишите, чему хотите научиться, — подберём ближайшую программу и дополним её под вашу задачу. Индивидуальный курс от 10 000 ₽."
        canonical={`${SITE_URL}/order`}
        keywords="индивидуальный курс, обучение под заказ, персональный курс, заказать курс, обучение по запросу"
        jsonLd={[FAQ_JSON_LD]}
      />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Заказ курса" }]} />
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {stage === "intro" && (
          <div className="animate-fade-in">
            <div className="text-center pt-8 pb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-200 mb-6">
                <Icon name="Sparkles" size={15} />
                Курс под ваш запрос
              </div>
              <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white leading-tight mb-5">
                Не нашли нужный курс?
                <br />
                <span className="gradient-text-purple">Соберём его под вас</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
                Раньше один курс делали для миллионов. Сегодня программу можно собрать
                под одного человека — под вашу задачу, ваш уровень и ваше время.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 card-hover"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/25 to-cyan-500/25 border border-white/10 flex items-center justify-center">
                      <Icon name={s.icon} size={19} className="text-purple-200" />
                    </div>
                    <div className="text-white font-semibold">{s.title}</div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-8">
              <h2 className="font-montserrat font-bold text-xl text-white mb-4">
                Кому это подойдёт
              </h2>
              <ul className="space-y-3">
                {[
                  "Нужна узкая тема, которой нет в готовых курсах",
                  "Есть курс, но он «почти о том» — не хватает вашей специфики",
                  "Нужны знания под конкретную рабочую задачу, а не программа вообще",
                  "Хотите учиться в своём темпе и по своей ситуации",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 text-white/80">
                    <Icon name="Check" size={17} className="text-emerald-400 flex-shrink-0 mt-1" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setStage("form");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full md:w-auto md:px-12 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2 glow-purple"
              >
                <Icon name="ArrowRight" size={19} />
                Описать свой запрос
              </button>
              <p className="text-white/45 text-sm mt-4">
                Программу увидите бесплатно · Курс от {MIN_PRICE.toLocaleString("ru-RU")} ₽
              </p>
              <p className="text-white/40 text-sm mt-5">
                Не знаете, в какую сторону двигаться?{" "}
                <Link to="/career-pro" className="text-purple-300 hover:text-purple-200 underline">
                  Пройдите профориентацию
                </Link>
              </p>
            </div>
          </div>
        )}

        {stage === "form" && (
          <div className="animate-fade-in pt-6">
            <button
              onClick={() => setStage("intro")}
              className="text-white/50 hover:text-white/80 text-sm mb-5 inline-flex items-center gap-1.5 transition-colors"
            >
              <Icon name="ArrowLeft" size={15} />
              Назад
            </button>
            <h1 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3">
              Расскажите о своём запросе
            </h1>
            <p className="text-white/65 mb-8">
              Чем подробнее опишете — тем точнее будет программа. Обязательное поле только одно.
            </p>
            <OrderForm
              req={req}
              onChange={patch}
              onSubmit={runMatch}
              loading={loading}
              error={error}
            />
          </div>
        )}

        {stage === "plan" && plan && (
          <div className="pt-6">
            <h1 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-6">
              Что мы подобрали
            </h1>
            <PlanView plan={plan} onOrder={() => setShowLead(true)} onRestart={restart} />
          </div>
        )}
      </div>

      {showLead && <LeadForm req={req} plan={plan} onClose={() => setShowLead(false)} />}

      <SiteFooter />
    </div>
  );
}