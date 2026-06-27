import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import AccessBanner from "@/components/intensive/AccessBanner";
import Reveal from "@/components/intensive/Reveal";
import CasesBlock from "@/components/ai-assistant/CasesBlock";
import FaqBlock from "@/components/ai-assistant/FaqBlock";
import PricingBlock from "@/components/ai-assistant/PricingBlock";
import { COURSE_META, PROGRAM, PRICING, FAQ } from "@/components/ai-assistant/data";

export default function AiAssistant() {
  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `Курс «${COURSE_META.title}»`,
      description:
        "Практический курс по применению нейросетей в работе с ИИ-наставником 24/7: тексты, письма, таблицы, отчёты и презентации за 5 дней.",
      brand: { "@type": "Brand", name: "УЧИСЬПРО" },
      offers: {
        "@type": "Offer",
        price: PRICING.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: "https://учисьпро.рф/ai-assistant",
      },
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Seo
        title="Курс «ИИ-ассистент для работы» — нейросети для офисных задач за 5 дней"
        description="Практический курс по применению ChatGPT и нейросетей в работе с ИИ-наставником 24/7: тексты, письма, таблицы, отчёты и презентации в разы быстрее. Тренажёр промптов, проверка заданий, библиотека из 100+ готовых промптов. Без опыта, в своём темпе."
        canonical="https://учисьпро.рф/ai-assistant"
        keywords="нейросети для работы, chatgpt для работы, промпты, ии ассистент, нейросети в офисе, gemini yandexgpt, автоматизация рутины, искусственный интеллект для бизнеса"
        jsonLd={jsonLd}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumbs
          className="mb-5"
          items={[{ label: "Главная", href: "/" }, { label: "ИИ-ассистент для работы" }]}
        />

        {/* HERO */}
        <section className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 mb-4">
            <Icon name="Sparkles" size={14} className="text-cyan-300" />
            <span className="text-cyan-300 text-xs font-bold uppercase tracking-wide">
              {COURSE_META.subtitle}
            </span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-3 leading-tight">
            {COURSE_META.title}
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-4">{COURSE_META.promise}</p>
          <p className="text-white/55 text-sm md:text-base max-w-2xl mb-6">{COURSE_META.offer}</p>

          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mb-6">
            {COURSE_META.result.map((r) => (
              <div key={r} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={15} className="text-emerald-300" />
                </div>
                <span className="text-white/85 text-sm font-medium">{r}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-white/40 text-xs">Работаем в:</span>
            {COURSE_META.tools.map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-lg bg-white/5 text-white/70 border border-white/10">
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={scrollToPricing}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-7 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="Rocket" size={18} />
              Начать за {PRICING.price.toLocaleString("ru-RU")} ₽
            </button>
            <span className="text-white/40 text-sm line-through">
              {PRICING.oldPrice.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </section>

        {/* ДОСТУП ПОСЛЕ ОПЛАТЫ */}
        <section className="mb-14">
          <AccessBanner
            track={COURSE_META.track}
            productName="курс"
            grantedText="Оплата прошла — курс полностью твой. Проходи уроки в своём темпе, ИИ-наставник на связи 24/7. Начни с первого дня ниже."
          />
        </section>

        {/* 5-ДНЕВНАЯ ПРОГРАММА */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
            Путь за 5 дней: от первого промпта к своей ИИ-системе
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl">
            Линейная программа без перегруза. Каждый день — конкретный навык, который сразу
            применяешь в работе.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROGRAM.map((p) => (
              <div key={p.day} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/25 to-blue-500/15 flex items-center justify-center">
                    <Icon name={p.icon} size={16} className="text-cyan-300" />
                  </div>
                  <span className="text-white/40 text-xs font-bold">День {p.day}</span>
                </div>
                <h3 className="font-montserrat font-bold text-white text-sm mb-0.5">{p.title}</h3>
                <p className="text-white/50 text-xs">{p.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ФОРМАТ */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
            ИИ-наставник, который всегда на связи
          </h2>
          <p className="text-white/60 mb-6 max-w-2xl">
            Ценность — в системе: короткая теория, готовые промпты и мгновенная обратная связь от ИИ
            в любое время суток.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "BookOpen", t: "Короткая теория", d: "5–8 минут только сути, без воды" },
              { icon: "FileText", t: "Готовые промпты", d: "100+ шаблонов под рабочие задачи" },
              { icon: "MessagesSquare", t: "Тренажёр промптов", d: "Отрабатываешь запросы на реальных кейсах" },
              { icon: "CheckCheck", t: "Проверка заданий", d: "ИИ-наставник оценивает и разбирает ошибки" },
              { icon: "Sparkles", t: "Поддержка 24/7", d: "Вопрос — ответ в любое время суток" },
              { icon: "Award", t: "Своя ИИ-система", d: "Личный ассистент под твои задачи" },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mb-3">
                  <Icon name={c.icon} size={20} className="text-cyan-300" />
                </div>
                <h3 className="font-montserrat font-bold text-white text-base mb-1">{c.t}</h3>
                <p className="text-white/55 text-sm">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* КЕЙСЫ */}
        <section className="mb-14">
          <Reveal>
            <CasesBlock />
          </Reveal>
        </section>

        {/* ЦЕНА И ОПЛАТА */}
        <section id="pricing" className="mb-14">
          <PricingBlock />
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <Reveal>
            <FaqBlock />
          </Reveal>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}