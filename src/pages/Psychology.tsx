import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import PsyChat from "@/components/psychology/PsyChat";
import { PSY_SECTIONS, PSY_EMERGENCY } from "@/components/psychology/psychologyData";

const CANONICAL = "https://xn--h1agdcde2c.xn--p1ai/psychology";

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Психологическая помощь онлайн — УЧИСЬПРО",
    description:
      "Бесплатный ИИ-помощник психолог и наставник: поддержка для родителей, школьников и подростков, участников СВО и их близких, помощь при тревоге, выгорании и одиночестве. Без регистрации.",
    url: CANONICAL,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://xn--h1agdcde2c.xn--p1ai/" },
      { "@type": "ListItem", position: 2, name: "Психологическая помощь", item: CANONICAL },
    ],
  },
];

const PSY_FAQ = [
  {
    q: "Это бесплатно?",
    a: "Да, психологическая помощь полностью бесплатна и доступна без регистрации. Это социальный раздел, а не платная услуга.",
  },
  {
    q: "Это заменит настоящего психолога?",
    a: "Нет. Помощник бережно поддержит, поможет разобраться в ситуации и подскажет шаги, но он не заменяет очную психотерапию и врача. При серьёзных состояниях он мягко направит к специалисту.",
  },
  {
    q: "Мои разговоры конфиденциальны?",
    a: "Беседа с помощником приватна. Не указывайте паспортные данные и пароли — для душевного разговора это не нужно.",
  },
  {
    q: "Что делать в кризисной ситуации прямо сейчас?",
    a: "Если есть угроза жизни или мысли причинить себе вред — звоните 112 или на телефон доверия 8-800-2000-122 (бесплатно, круглосуточно, анонимно). Вы не одни.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PSY_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Psychology() {
  const [activeSlug, setActiveSlug] = useState(PSY_SECTIONS[0].slug);
  const active = PSY_SECTIONS.find((s) => s.slug === activeSlug) || PSY_SECTIONS[0];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Психологическая помощь онлайн бесплатно — ИИ психолог и наставник | УЧИСЬПРО"
        description="Бесплатный ИИ-помощник психолог и наставник без регистрации. Поддержка для родителей, школьников и подростков, участников СВО и их близких. Помощь при тревоге, выгорании, стрессе и одиночестве — бережно и конфиденциально."
        canonical={CANONICAL}
        keywords="психологическая помощь онлайн, бесплатный психолог, помощь подростку, помощь родителям, психолог для участников СВО, поддержка при тревоге, выгорание, телефон доверия"
        jsonLd={[...JSON_LD, FAQ_JSON_LD]}
      />

      {/* Простой топ */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-base">🚀</div>
            <span className="font-montserrat font-black gradient-text-purple hidden sm:inline">УЧИСЬПРО</span>
          </Link>
          <Link to="/" className="text-white/60 hover:text-white text-sm flex items-center gap-1.5">
            <Icon name="ArrowLeft" size={15} /> На главную
          </Link>
        </div>
      </header>

      {/* Хлебные крошки */}
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-4">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Психологическая помощь" },
          ]}
        />
      </div>

      {/* Герой */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-6 pb-4 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/25 rounded-full px-3 py-1 mb-4">
          <Icon name="HeartHandshake" size={14} className="text-emerald-300" />
          <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Бесплатно · без регистрации</span>
        </div>
        <h1 className="font-montserrat font-black text-4xl md:text-5xl text-white mb-3">Психологическая помощь</h1>
        <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto">
          Бережный ИИ-помощник — психолог и наставник. Поможет выслушать, разобраться в ситуации
          и сделать первый шаг. Выберите, что вам ближе.
        </p>
      </section>

      {/* Экстренная помощь — всегда на виду */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 mb-6">
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4">
          <p className="text-red-200/90 text-sm font-semibold mb-2 flex items-center gap-2">
            <Icon name="Phone" size={15} /> Если ситуация острая и есть угроза жизни — обратитесь за живой помощью:
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {PSY_EMERGENCY.map((e) => (
              <span key={e.phone} className="text-sm text-white/80">
                <span className="text-white/55">{e.label}:</span>{" "}
                <a href={`tel:${e.phone.replace(/-/g, "")}`} className="font-bold text-white hover:underline">{e.phone}</a>{" "}
                <span className="text-white/40 text-xs">({e.note})</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Вкладки разделов */}
      <section className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex flex-wrap gap-2.5 justify-center mb-8">
          {PSY_SECTIONS.map((s) => {
            const isActive = s.slug === activeSlug;
            return (
              <button
                key={s.slug}
                onClick={() => setActiveSlug(s.slug)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all border ${
                  isActive
                    ? `bg-gradient-to-br ${s.color} text-white border-transparent shadow-lg`
                    : "bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]"
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                {s.title}
              </button>
            );
          })}
        </div>

        <p className="text-center text-white/50 text-sm mb-8 max-w-2xl mx-auto">{active.subtitle}</p>

        {/* Контент раздела: разборы + чат */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Разборы типовых ситуаций */}
          <div className="space-y-4">
            <h2 className="font-montserrat font-bold text-xl text-white flex items-center gap-2">
              <Icon name="BookOpen" size={20} className="text-white/60" />
              Частые ситуации и что с ними делать
            </h2>
            {active.scenarios.map((sc) => (
              <details key={sc.title} className="group bg-card border border-white/10 rounded-2xl overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-3 hover:bg-white/[0.03]">
                  <div>
                    <p className="font-semibold text-white">{sc.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">{sc.trigger}</p>
                  </div>
                  <Icon name="ChevronDown" size={18} className="text-white/40 mt-1 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 pt-1 space-y-3">
                  <p className="text-white/75 text-sm leading-relaxed">{sc.advice}</p>
                  <div className="space-y-1.5">
                    {sc.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-white/80">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
            <p className="text-white/40 text-xs leading-relaxed pt-1">
              Это поддержка и общие рекомендации, а не замена очной помощи специалиста. Если тяжело —
              обратиться к живому психологу абсолютно нормально.
            </p>
          </div>

          {/* Живой чат-помощник */}
          <div>
            <h2 className="font-montserrat font-bold text-xl text-white flex items-center gap-2 mb-2">
              <Icon name="MessageCircleHeart" size={20} className="text-white/60" />
              Поговорить с помощником
            </h2>
            <p className="text-white/50 text-sm mb-4 flex items-center gap-1.5">
              <Icon name="Mic" size={13} /> Можно писать или говорить голосом — Ксюша ответит мягким голосом
            </p>
            <PsyChat section={active} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 pb-14">
        <h2 className="font-montserrat font-bold text-2xl text-white text-center mb-6">Частые вопросы</h2>
        <div className="space-y-3">
          {PSY_FAQ.map((item) => (
            <details key={item.q} className="group bg-card border border-white/10 rounded-2xl">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 hover:bg-white/[0.03]">
                <span className="font-semibold text-white text-sm">{item.q}</span>
                <Icon name="ChevronDown" size={18} className="text-white/40 group-open:rotate-180 transition-transform flex-shrink-0" />
              </summary>
              <p className="px-5 pb-5 text-white/70 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Мостик к профессии психолога-коуча */}
      <section className="max-w-3xl mx-auto px-5 md:px-8 pb-16">
        <div className="bg-gradient-to-br from-indigo-500/12 via-fuchsia-500/8 to-purple-500/12 border border-fuchsia-500/25 rounded-3xl p-6 md:p-7 text-center">
          <div className="text-3xl mb-2">🧠</div>
          <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
            Хотите помогать людям профессионально?
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-5 leading-relaxed">
            Освойте помогающую профессию с нуля: НЛП, КПТ, эриксоновский гипноз, коучинг ICF и запуск
            частной практики. С наставником, разбором кейсов и первым уроком бесплатно.
          </p>
          <Link
            to="/nlp-master"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="GraduationCap" size={18} />
            Узнать о курсе «НЛП-практик PRO»
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}