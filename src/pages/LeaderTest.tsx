import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { ANSWERS, COMPETENCIES, QUESTIONS, scoreAnswers } from "@/components/leaderTest/leaderTestData";
import LeaderTestResult, { COURSE_URL } from "@/components/leaderTest/LeaderTestResult";

const URL = "https://учисьпро.рф/test-rukovoditelya";
const STORAGE_KEY = "uchispro_leader_test_v1";

const FAQ = [
  { q: "Сколько времени занимает тест?", a: "5–7 минут: 20 утверждений, по четыре на каждую из пяти компетенций руководителя." },
  { q: "Это профессиональная оценка?", a: "Нет, это самодиагностика: она показывает, как вы сами оцениваете свои привычки. Результат помогает выбрать, что развивать в первую очередь." },
  { q: "Нужна ли регистрация?", a: "Нет. Тест бесплатный, ответы сохраняются только в вашем браузере." },
  { q: "Как отвечать, чтобы результат был точным?", a: "Отвечайте, как вы действуете на практике в обычную рабочую неделю, а не как считаете правильным." },
];

type Answers = Record<number, number>;

function loadAnswers(): Answers {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Answers;
  } catch {
    return {};
  }
}

export default function LeaderTest() {
  const [answers, setAnswers] = useState<Answers>(loadAnswers);
  const [step, setStep] = useState<number>(() => {
    const done = Object.keys(loadAnswers()).length;
    return done >= QUESTIONS.length ? QUESTIONS.length : -1;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const finished = step >= QUESTIONS.length;
  const scores = useMemo(() => (finished ? scoreAnswers(answers) : []), [finished, answers]);

  const start = () => {
    trackGoal("leader_test_start");
    setStep(0);
  };

  const answer = (value: number) => {
    const q = QUESTIONS[step];
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    const next = step + 1;
    if (next >= QUESTIONS.length) trackGoal("leader_test_finish");
    setTimeout(() => setStep(next), 150);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Тест для руководителя: самодиагностика по пяти компетенциям",
      url: URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  const q = step >= 0 && !finished ? QUESTIONS[step] : null;
  const comp = q ? COMPETENCIES.find((c) => c.id === q.competency) : null;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Тест для руководителя онлайн бесплатно: самодиагностика управленческих компетенций"
        description="Бесплатный тест на 5 минут: оцените себя как руководителя по пяти компетенциям — управление собой, системное мышление, результат, команда, клиентоцентричность и ИИ. Результат с рекомендациями."
        canonical={URL}
        image="https://учисьпро.рф/covers/rukovoditel-novoy-formacii.jpg"
        keywords="тест для руководителя, управленческие компетенции тест, самодиагностика руководителя, оценка руководителя онлайн, тест на лидерские качества"
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-2.5">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Бизнес и MBA", href: "/courses/business" },
              { label: "Тест для руководителя" },
            ]}
          />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-8 md:py-12">
        {step === -1 && (
          <section>
            <p className="text-emerald-300 text-xs uppercase tracking-widest font-bold mb-3">Бесплатная самодиагностика · 5 минут</p>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
              Какой вы руководитель? Тест по пяти компетенциям
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              20 утверждений о ваших рабочих привычках. В конце — профиль по пяти компетенциям, сильные стороны,
              зоны роста и подсказка, с чего начать развитие.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {COMPETENCIES.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Icon name={c.icon} size={18} />
                  </span>
                  <span className="font-semibold">{c.title}</span>
                </div>
              ))}
            </div>
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-lg px-7 py-4"
            >
              Начать тест <Icon name="ArrowRight" size={20} />
            </button>
            <p className="text-white/45 text-sm mt-3">Без регистрации. Ответы хранятся только в вашем браузере.</p>
          </section>
        )}

        {q && comp && (
          <section>
            <div className="flex items-center justify-between text-sm text-white/55 mb-2">
              <span className="flex items-center gap-2">
                <Icon name={comp.icon} size={16} className="text-emerald-300" /> {comp.title}
              </span>
              <span>
                {step + 1} из {QUESTIONS.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-8">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <h2 className="font-montserrat font-black text-xl md:text-3xl leading-snug mb-8">{q.text}</h2>
            <div className="grid gap-3">
              {ANSWERS.map((a) => {
                const selected = answers[q.id] === a.value;
                return (
                  <button
                    key={a.value}
                    onClick={() => answer(a.value)}
                    className={`text-left rounded-2xl border px-5 py-4 font-semibold transition-all ${
                      selected
                        ? "border-emerald-400 bg-emerald-500/20 text-white"
                        : "border-white/10 bg-white/[0.04] text-white/85 hover:border-emerald-400/50 hover:bg-white/[0.07]"
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-6 inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm"
              >
                <Icon name="ArrowLeft" size={16} /> Предыдущий вопрос
              </button>
            )}
          </section>
        )}

        {finished && (
          <>
            <h1 className="font-montserrat font-black text-2xl md:text-4xl leading-tight mb-6">
              Результат теста для руководителя
            </h1>
            <LeaderTestResult scores={scores} onRestart={restart} />
          </>
        )}

        <section className="mt-14">
          <h2 className="font-montserrat font-black text-xl mb-4">Частые вопросы</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <summary className="font-semibold cursor-pointer">{f.q}</summary>
                <p className="text-white/65 mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-white/50 text-sm mt-6">
            Тест составлен по программе курса{" "}
            <Link to={COURSE_URL} className="text-emerald-300 hover:underline">
              «Руководитель новой формации»
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
