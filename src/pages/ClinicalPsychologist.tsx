import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { COURSES, getCoursePrice } from "@/components/courses/coursesData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";
const CANONICAL = `${SITE_URL}/klinicheskiy-psiholog`;
const COURSE_ID = 78;

const FAQ = [
  {
    q: "Можно ли пройти курс без психологического образования?",
    a: "Да, программа рассчитана на старт с нуля: каждый метод разбирается пошагово, с примерами и практикумами. Важно понимать: курс даёт консультативные навыки доказательного подхода и не заменяет высшее психологическое или медицинское образование и право на клиническую диагностику.",
  },
  {
    q: "Чем доказательная терапия отличается от обычных курсов психологии?",
    a: "КПТ, ACT и DBT — это методы с доказанной научной эффективностью, которые применяют в клиниках по всему миру. Здесь нет эзотерики и «энергий»: только протоколы, формулировка случая, измеримый результат и супервизия.",
  },
  {
    q: "Какой документ выдаётся по окончании?",
    a: "После прохождения программы и защиты итогового проекта вы получаете сертификат и портфолио разобранных обезличенных случаев, которое можно показать клиентам и работодателю.",
  },
  {
    q: "Сколько зарабатывает психолог-консультант?",
    a: "Стоимость одной консультации на рынке — ориентировочно 2 500–7 000 ₽. При 5–10 клиентах в неделю это выходит в полноценный доход. Прогноз ориентировочный и зависит от ниши, региона и опыта.",
  },
  {
    q: "Это безопасно для клиентов?",
    a: "Да. Отдельные модули посвящены этике, оценке риска, работе с кризисом и границам компетенции — вы учитесь распознавать, когда клиента нужно направить к психиатру или врачу, и действовать по алгоритму безопасности.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Клинический психолог-консультант: как освоить доказательную терапию (КПТ, ACT, DBT) с нуля",
    description:
      "Гид по профессии психолога-консультанта: доказательные методы КПТ, ACT и DBT, диагностика, работа с тревогой, депрессией, ПТСР и кризисом, запуск частной практики.",
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
      { "@type": "ListItem", position: 2, name: "Клинический психолог-консультант", item: CANONICAL },
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
  { emoji: "🧩", title: "КПТ по протоколам", desc: "Работа с мыслями, убеждениями, экспозиция и поведенческие эксперименты" },
  { emoji: "🌱", title: "ACT", desc: "Ценности, принятие, дефузия и осмысленные действия" },
  { emoji: "🌊", title: "DBT", desc: "Эмоциональная регуляция, стрессоустойчивость, осознанность" },
  { emoji: "🩺", title: "Диагностика и риск", desc: "Первичное интервью, формулировка случая, оценка суицидального риска" },
  { emoji: "🆘", title: "Кризис и травма", desc: "Кризисные сессии, работа с ПТСР, утратой и горем" },
  { emoji: "🚀", title: "Частная практика", desc: "Договор, ведение случая, первые клиенты и прайс" },
];

const WHY = [
  "Только доказательные методы: КПТ, ACT и DBT имеют научно подтверждённую эффективность — вы работаете инструментами, а не «интуицией».",
  "Не набор техник, а система: диагностика → формулировка случая → протокол → измерение результата → супервизия.",
  "Честность о границах: отдельные уроки учат распознавать «зону психиатрии» и вовремя направлять клиента к врачу — это защищает и вас, и клиента.",
  "Забота о специалисте: профилактика выгорания, интервизия и супервизия — чтобы вы работали долго и устойчиво, а не сгорели за год.",
];

export default function ClinicalPsychologist() {
  const course = COURSES.find((c) => c.id === COURSE_ID);
  const price = course ? getCoursePrice(course) : 44900;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Клинический психолог-консультант с нуля: обучение КПТ, ACT и DBT онлайн · УЧИСЬПРО"
        description="Мощный курс доказательной терапии: КПТ, ACT, DBT, диагностика, работа с тревогой, депрессией, ПТСР и кризисом, запуск частной практики. Профессия с нуля, сертификат и портфолио случаев. Первый урок бесплатно."
        canonical={CANONICAL}
        type="article"
        keywords="клинический психолог обучение, кпт курс, обучение психотерапии, act терапия, dbt обучение, психолог консультант с нуля, доказательная психотерапия"
        jsonLd={JSON_LD}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-lg">🩺</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Клинический психолог-консультант" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/35 rounded-full px-4 py-1.5 mb-4">
            <Icon name="ShieldCheck" size={12} className="text-emerald-300" />
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Доказательная психотерапия</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            Психолог-консультант:{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              методы, которые доказаны наукой
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Освойте три золотых стандарта современной психотерапии — КПТ, ACT и DBT. Диагностика, работа с тревогой, депрессией, ПТСР и кризисом, запуск частной практики. С нуля, с наставником и супервизией.
          </p>
          {course && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/course-checkout/${COURSE_ID}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                <Icon name="GraduationCap" size={18} />
                Открыть курс — от {price.toLocaleString("ru-RU")} ₽
              </Link>
              <span className="text-white/50 text-xs">Первый урок бесплатно · 10 модулей · 80 уроков</span>
            </div>
          )}
        </section>

        {/* Что освоите */}
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

        {/* Почему сильный курс */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">
            Почему это серьёзная профессия, а не «инфокурс»
          </h2>
          <div className="space-y-3">
            {WHY.map((w, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <Icon name="CircleCheck" size={18} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                <p className="text-white/75 text-sm leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Кому подходит */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Кому подойдёт</h2>
          <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 md:p-6">
            <ul className="space-y-2.5">
              {[
                "Тем, кто хочет доказательную помогающую профессию, а не эзотерику",
                "Начинающим психологам — для рабочих протоколов и уверенности в сессии",
                "Практикующим специалистам — для апгрейда до доказательного подхода",
                "Волонтёрам кризисных линий, коучам и HR, работающим с людьми в стрессе",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white/80 text-sm">
                  <Icon name="UserCheck" size={16} className="text-teal-300 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Доход */}
        <section className="mb-12">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 md:p-6 text-center">
            <h2 className="font-montserrat font-black text-xl md:text-2xl mb-2">Сколько зарабатывает психолог-консультант</h2>
            <p className="text-white/65 text-sm leading-relaxed max-w-2xl mx-auto">
              Стоимость одной консультации на рынке — ориентировочно <span className="text-white font-bold">2 500–7 000 ₽</span>. При 5–10 клиентах в неделю это полноценный доход. Отдельный модуль учит упаковать услуги, назначить прайс и найти первых клиентов этично.
            </p>
            <p className="text-white/35 text-[11px] mt-3">Данные о доходе ориентировочные и зависят от ниши, региона и опыта.</p>
          </div>
        </section>

        {/* Важно / дисклеймер */}
        <section className="mb-12">
          <div className="bg-amber-500/10 border border-amber-400/25 rounded-2xl p-4 flex items-start gap-3">
            <Icon name="Info" size={18} className="text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-white/75 text-sm leading-relaxed">
              Курс даёт консультативные навыки доказательного подхода и профессиональную практику, но не заменяет высшее психологическое или медицинское образование и право на клиническую диагностику и лечение. При тяжёлых состояниях клиента специалист направляет к психиатру или врачу.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Частые вопросы</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="font-montserrat font-bold text-white text-sm mb-1.5 flex items-start gap-2">
                  <Icon name="HelpCircle" size={16} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                  {f.q}
                </p>
                <p className="text-white/60 text-sm leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Финальный CTA */}
        {course && (
          <section className="text-center bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/15 border border-emerald-500/30 rounded-3xl p-6 md:p-8">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Начните бесплатно</h2>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-5">
              Первый урок открыт бесплатно. Пройдите его, чтобы почувствовать формат, а затем откройте все 80 уроков с личным ИИ-наставником, разбором клинических кейсов и супервизией.
            </p>
            <Link
              to={`/course-checkout/${COURSE_ID}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
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
