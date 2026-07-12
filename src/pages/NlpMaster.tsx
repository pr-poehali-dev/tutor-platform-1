import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { COURSES, getCoursePrice } from "@/components/courses/coursesData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";
const CANONICAL = `${SITE_URL}/nlp-master`;
const COURSE_ID = 77;

const FAQ = [
  {
    q: "Нужно ли психологическое образование, чтобы пройти курс?",
    a: "Нет. Курс построен так, чтобы человек без базового образования освоил профессию с нуля: каждая техника разбирается на практике, с примерами и супервизией. Психологам курс даёт апгрейд арсенала и рост чека.",
  },
  {
    q: "Чем этот курс сильнее классического «НЛП-Мастера»?",
    a: "Это интегративная система: помимо НЛП вы осваиваете доказательную КПТ, эриксоновский гипноз, коучинг по стандартам ICF, психологию переговоров и запуск частной практики. Упор не на теорию, а на отработанные техники с живым сопровождением наставника.",
  },
  {
    q: "Какой документ выдаётся по окончании?",
    a: "После прохождения программы и защиты итогового проекта вы получаете сертификат и готовое портфолио кейсов, которое можно показывать клиентам и работодателю.",
  },
  {
    q: "Сколько можно зарабатывать после курса?",
    a: "Стоимость одной сессии психолога-коуча на рынке — ориентировочно 2 000–6 000 ₽. При 3–5 клиентах в неделю это даёт дополнительный доход уже в первые месяцы практики. Прогноз ориентировочный и зависит от усилий и ниши.",
  },
  {
    q: "Это безопасно и этично?",
    a: "Да. Отдельные уроки посвящены этике, границам компетенции и распознаванию «зоны психиатрии», когда клиента нужно направить к врачу. Все техники подаются экологично, без манипуляций и давления.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "НЛП-практик PRO: как получить помогающую профессию с нуля в 2026 году",
    description:
      "Разбираем интегративный подход к обучению НЛП: НЛП + КПТ + эриксоновский гипноз + коучинг ICF + переговоры + запуск частной практики. Кому подходит, что осваивают, сколько зарабатывают.",
    author: { "@type": "Organization", name: "УЧИСЬПРО" },
    publisher: { "@type": "Organization", name: "УЧИСЬПРО" },
    datePublished: "2026-07-11",
    dateModified: "2026-07-11",
    mainEntityOfPage: CANONICAL,
    url: CANONICAL,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "НЛП-практик PRO", item: CANONICAL },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

const PILLARS = [
  { emoji: "🧠", title: "НЛП с нуля до практика", desc: "Раппорт, якорение, метамодель, рефрейминг, субмодальности — на реальных сессиях" },
  { emoji: "🧩", title: "Доказательная КПТ", desc: "Работа с тревогой, выгоранием и когнитивными искажениями" },
  { emoji: "🌀", title: "Эриксоновский гипноз", desc: "Мягкие трансовые техники и терапевтические метафоры — этично" },
  { emoji: "🎯", title: "Коучинг ICF", desc: "Модель GROW, колесо баланса, сильные вопросы, работа с целью" },
  { emoji: "🤝", title: "Переговоры и влияние", desc: "Экологичное воздействие, работа с возражениями и манипуляциями" },
  { emoji: "🚀", title: "Частная практика", desc: "Упаковка услуг, прайс, первые клиенты и защита проекта" },
];

const WHY = [
  "Классические курсы «НЛП-Мастер» дают технику, но редко учат зарабатывать на ней. Здесь профессия собирается целиком: от навыка до первых клиентов.",
  "Один метод не закрывает все запросы клиента. Интеграция НЛП, КПТ, гипнотехник и коучинга делает вас гибким специалистом, а не «фокусником с якорями».",
  "Каждый модуль отрабатывается на практике с ИИ-наставником и супервизией — вы выходите с реальными навыками, а не с конспектом.",
  "Отдельный блок про этику и границы: вы понимаете, где заканчивается ваша зона и когда направить человека к врачу. Это защищает и вас, и клиента.",
];

export default function NlpMaster() {
  const course = COURSES.find((c) => c.id === COURSE_ID);
  const price = course ? getCoursePrice(course) : 34900;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="НЛП-практик PRO с нуля: обучение НЛП, КПТ, коучингу и гипнозу онлайн · УЧИСЬПРО"
        description="Мощный интегративный курс НЛП-практика: НЛП, КПТ, эриксоновский гипноз, коучинг ICF, переговоры и запуск частной практики. Профессия с нуля, диплом-сертификат и портфолио. Первый урок бесплатно."
        canonical={CANONICAL}
        type="article"
        keywords="нлп курс, обучение нлп онлайн, нлп практик, нлп мастер, курс коучинга, кпт обучение, эриксоновский гипноз, психолог с нуля, коуч обучение"
        jsonLd={JSON_LD}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-lg">🧠</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "НЛП-практик PRO" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-fuchsia-500/15 border border-fuchsia-500/35 rounded-full px-4 py-1.5 mb-4">
            <Icon name="Sparkles" size={12} className="text-fuchsia-300" />
            <span className="text-xs text-fuchsia-200 font-bold uppercase tracking-wider">Помогающая профессия 2026</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            НЛП-практик PRO:{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              профессия, которая работает
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Не сухая теория «НЛП-Мастера», а живая интегративная система: НЛП, КПТ, эриксоновский гипноз, коучинг ICF, переговоры и запуск собственной практики. С нуля до первых клиентов — с наставником и супервизией.
          </p>
          {course && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/course-checkout/${COURSE_ID}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity glow-purple"
              >
                <Icon name="GraduationCap" size={18} />
                Открыть курс — от {price.toLocaleString("ru-RU")} ₽
              </Link>
              <span className="text-white/50 text-xs">Первый урок бесплатно · 8 модулей · 64 урока</span>
            </div>
          )}
        </section>

        {/* Из чего состоит профессия */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Что вы освоите</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{p.emoji}</div>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">{p.title}</p>
                  <p className="text-white/55 text-xs mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Почему интегративный подход сильнее */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">
            Почему это сильнее классического «НЛП-Мастера»
          </h2>
          <div className="space-y-3">
            {WHY.map((w, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <Icon name="CircleCheck" size={18} className="text-fuchsia-300 flex-shrink-0 mt-0.5" />
                <p className="text-white/75 text-sm leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Кому подходит */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Кому подойдёт</h2>
          <div className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-fuchsia-500/25 rounded-2xl p-5 md:p-6">
            <ul className="space-y-2.5">
              {[
                "Новичкам без образования, кто хочет помогающую профессию и доход",
                "Психологам и коучам — для роста арсенала техник и чека",
                "Руководителям, переговорщикам и продавцам — инструменты влияния",
                "Тем, кто хочет разобраться в себе: тревога, выгорание, убеждения",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white/80 text-sm">
                  <Icon name="UserCheck" size={16} className="text-indigo-300 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Доход */}
        <section className="mb-12">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 md:p-6 text-center">
            <h2 className="font-montserrat font-black text-xl md:text-2xl mb-2">Сколько зарабатывает НЛП-практик и коуч</h2>
            <p className="text-white/65 text-sm leading-relaxed max-w-2xl mx-auto">
              Стоимость одной сессии на рынке — ориентировочно <span className="text-white font-bold">2 000–6 000 ₽</span>. Даже 3–5 клиентов в неделю дают ощутимый дополнительный доход уже в первые месяцы практики. Курс отдельным модулем учит упаковать услуги, назначить прайс и найти первых клиентов.
            </p>
            <p className="text-white/35 text-[11px] mt-3">Данные о доходе ориентировочные и зависят от ниши, региона и усилий.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Частые вопросы</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="font-montserrat font-bold text-white text-sm mb-1.5 flex items-start gap-2">
                  <Icon name="HelpCircle" size={16} className="text-fuchsia-300 flex-shrink-0 mt-0.5" />
                  {f.q}
                </p>
                <p className="text-white/60 text-sm leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Финальный CTA */}
        {course && (
          <section className="text-center bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-purple-500/15 border border-fuchsia-500/30 rounded-3xl p-6 md:p-8">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Начните бесплатно</h2>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-5">
              Первый урок открыт бесплатно. Пройдите его, чтобы почувствовать формат, а затем откройте все 64 урока с личным ИИ-наставником, разбором кейсов и супервизией.
            </p>
            <Link
              to={`/course-checkout/${COURSE_ID}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity glow-purple"
            >
              <Icon name="GraduationCap" size={18} />
              Перейти к курсу — от {price.toLocaleString("ru-RU")} ₽
            </Link>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
