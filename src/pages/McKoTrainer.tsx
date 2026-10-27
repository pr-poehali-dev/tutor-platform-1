import { useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import McKoRunner, { savedResult } from "@/components/mcko/McKoRunner";
import { ALL_SETS } from "@/components/mcko/sets";
import { McKoSubject, SUBJECT_META } from "@/components/mcko/types";

const URL = "https://учисьпро.рф/trenazher-mcko";

const FAQ = [
  { q: "Это настоящие задания МЦКО?", a: "Нет. Задания составлены редакцией УЧИСЬПРО по формату диагностик: те же типы заданий и проверяемые навыки. Официальные демоверсии публикует Московский центр качества образования." },
  { q: "Тренажёр бесплатный?", a: "Да, полностью бесплатный и без регистрации. Результаты сохраняются в вашем браузере." },
  { q: "Как проверяются ответы?", a: "Автоматически сразу после нажатия «Проверить ответы». К каждому заданию показывается правильный ответ, подробный разбор и навык, который стоит повторить." },
  { q: "Подойдёт ли тренажёр учителю?", a: "Да. Варианты удобно использовать как разминку на уроке или домашнее задание: ссылку на вариант можно отправить ученикам." },
];

export default function McKoTrainer() {
  const [params, setParams] = useSearchParams();
  const [subject, setSubject] = useState<McKoSubject | "all">("all");
  const activeId = params.get("v");
  const active = ALL_SETS.find((s) => s.id === activeId);

  const open = (id: string | null) => {
    const p = new URLSearchParams(params);
    if (id) p.set("v", id);
    else p.delete("v");
    setParams(p);
    window.scrollTo({ top: 0 });
  };

  const list = ALL_SETS.filter((s) => subject === "all" || s.subject === subject);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Тренажёр МЦКО онлайн",
      url: URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Тренажёр МЦКО онлайн: математика, русский, грамотность"
        description="Бесплатный тренажёр в формате диагностик МЦКО: математика, русский язык, читательская и функциональная грамотность. Автопроверка и разбор каждой ошибки."
        keywords="тренажер мцко, мцко онлайн, подготовка к мцко, мцко математика, мцко читательская грамотность, функциональная грамотность задания, диагностика мцко"
        canonical={active ? `${URL}?v=${active.id}` : URL}
        jsonLd={jsonLd}
      />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-16">
        <Breadcrumbs
          className="mb-6"
          items={active ? [{ label: "Главная", href: "/" }, { label: "Тренажёр МЦКО", href: "/trenazher-mcko" }, { label: active.title }] : [{ label: "Главная", href: "/" }, { label: "Тренажёр МЦКО" }]}
        />

        {active ? (
          <McKoRunner key={active.id} set={active} onExit={() => open(null)} />
        ) : (
          <>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
              Тренажёр <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">в формате МЦКО</span>
            </h1>
            <p className="text-white/70 text-base md:text-lg mb-6 max-w-2xl">
              Задания по математике, русскому языку, читательской и функциональной грамотности. Ответы проверяются сразу, к каждой ошибке — подробный разбор. Бесплатно и без регистрации.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {(["all", "math", "russian", "reading", "functional"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setSubject(k)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    subject === k ? "bg-violet-500/30 border-violet-400/60 text-white" : "bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25"
                  }`}
                >
                  {k === "all" ? "Все" : SUBJECT_META[k].label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {list.map((s) => {
                const meta = SUBJECT_META[s.subject];
                const res = savedResult(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => open(s.id)}
                    className="group text-left rounded-3xl border border-white/10 bg-white/[0.03] p-5 hover:border-violet-400/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
                        <Icon name={meta.icon} size={20} className="text-white" />
                      </div>
                      {res ? (
                        <span className="text-xs font-bold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 rounded-full px-2.5 py-1">
                          {res.score}/{res.total}
                        </span>
                      ) : (
                        <span className="text-xs text-white/45">{s.grade}</span>
                      )}
                    </div>
                    <p className="font-montserrat font-black text-white mb-1">{s.title}</p>
                    <p className="text-white/50 text-sm mb-3">{s.tasks.length} заданий · {meta.text}</p>
                    <span className="inline-flex items-center gap-1.5 text-cyan-300 text-sm font-bold group-hover:gap-2.5 transition-all">
                      {res ? "Решить снова" : "Начать"} <Icon name="ArrowRight" size={15} />
                    </span>
                  </button>
                );
              })}
            </div>

            <section className="mt-12 grid md:grid-cols-2 gap-4">
              <Link to="/feed/mcko-chto-eto-i-kak-gotovitsya" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-violet-400/50 transition-colors">
                <Icon name="Newspaper" size={22} className="text-violet-300 mb-3" />
                <p className="font-montserrat font-black text-white mb-1">Что такое МЦКО и как готовиться</p>
                <p className="text-white/55 text-sm">Что проверяют, как устроены работы и план подготовки на месяц.</p>
              </Link>
              <Link to="/test-skorosti-chteniya" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-emerald-400/50 transition-colors">
                <Icon name="Timer" size={22} className="text-emerald-300 mb-3" />
                <p className="font-montserrat font-black text-white mb-1">Тест скорости чтения</p>
                <p className="text-white/55 text-sm">Не хватает времени на задания с текстом? Проверьте скорость и понимание за 2 минуты.</p>
              </Link>
            </section>

            <section className="mt-12">
              <h2 className="font-montserrat font-black text-2xl mb-4">Частые вопросы</h2>
              <div className="space-y-3">
                {FAQ.map((f) => (
                  <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-bold text-white">
                      {f.q}
                      <Icon name="ChevronDown" size={18} className="text-white/50 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-white/65 text-sm leading-relaxed mt-3">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            <p className="text-white/40 text-xs mt-10">
              Задания составлены редакцией УЧИСЬПРО по формату диагностик и не являются официальными материалами Московского центра качества образования.
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
