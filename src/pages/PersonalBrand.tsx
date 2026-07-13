import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { COURSES, getCoursePrice } from "@/components/courses/coursesData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";
const CANONICAL = `${SITE_URL}/personal-brand`;
const COURSE_ID = 79;

const FAQ = [
  {
    q: "Подойдёт ли курс, если у меня пока нет публичности?",
    a: "Да. Если имя ещё не на виду, мы начинаем не с управления репутацией, а с самого присутствия: как заявить о себе, с чего начать контент и как выстроить первые точки контакта с аудиторией. Управление рисками подключается позже, когда узнаваемость растёт.",
  },
  {
    q: "Чем это отличается от работы с SMM-агентством?",
    a: "Агентство — это команда из 5–10 специалистов и бюджет от 80 000 ₽ в месяц. Здесь та же методика адаптирована под одного человека: вы получаете стратегию, контент-план и протоколы реакции на негатив, которые обычно доступны только клиентам агентств. Всё делается на вашем реальном профиле, без раздувания штата.",
  },
  {
    q: "Что за «протоколы реакции на негатив»?",
    a: "Это готовые сценарии поведения в кризисных ситуациях: как отвечать на негативный комментарий, как гасить волну, когда молчать, а когда реагировать публично. В основе — те же принципы кризисных коммуникаций, что применяют репутационные агентства при работе с брендами, но упрощённые под личный бренд одного эксперта.",
  },
  {
    q: "Что такое «свой GPT-ассистент» и зачем он нужен?",
    a: "На курсе вы обучаете персонального ИИ-ассистента на своих материалах: тон голоса, экспертиза, темы. После курса он помогает генерировать контент в вашем стиле — посты, ответы, идеи — чтобы личный бренд рос даже без вашего постоянного участия.",
  },
  {
    q: "Сколько длится обучение?",
    a: "6 уроков, всего около 2 часов. Формат сжатый и прикладной: каждый урок даёт конкретный результат — аудит, стратегию, сценарий, контент-план, протоколы и план на 6 месяцев. Первый урок бесплатный.",
  },
  {
    q: "Что я получу на выходе?",
    a: "Готовый контент-план под ваш профиль, личный сценарий сторителлинга, протоколы реакции на негатив, обученного GPT-ассистента и план развития бренда на 6 месяцев. Это не разовые советы, а работающая система.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Личный бренд эксперта: SMM-стратегия и управление репутацией без команды и бюджета",
    description:
      "Персональная методика построения личного бренда для руководителей, консультантов и экспертов: аудит присутствия, контент-стратегия, сторителлинг, протоколы реакции на негатив, свой GPT-ассистент и план на 6 месяцев.",
    author: { "@type": "Organization", name: "УЧИСЬПРО" },
    publisher: { "@type": "Organization", name: "УЧИСЬПРО" },
    datePublished: "2026-07-13",
    dateModified: "2026-07-13",
    mainEntityOfPage: CANONICAL,
    url: CANONICAL,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Личный бренд эксперта", item: CANONICAL },
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

const RESULTS = [
  {
    n: "01",
    icon: "CalendarCheck",
    title: "Готовый контент-план на недели вперёд",
    desc: "Не шаблон «для всех», а расписание публикаций под ваш профиль, нишу и цели.",
  },
  {
    n: "02",
    icon: "MessageSquareQuote",
    title: "Личный сценарий сторителлинга",
    desc: "Как объяснить свою экспертизу за 30 секунд — чтобы запомнили и захотели обратиться.",
  },
  {
    n: "03",
    icon: "ShieldAlert",
    title: "Протоколы реакции на негатив",
    desc: "Те же принципы кризисных коммуникаций, что применяют репутационные агентства с брендами.",
  },
  {
    n: "04",
    icon: "Bot",
    title: "Свой GPT-ассистент на ваших материалах",
    desc: "Обучен на вашем стиле — работает с контентом дальше даже без вашего участия.",
  },
  {
    n: "05",
    icon: "TrendingUp",
    title: "План развития бренда на 6 месяцев",
    desc: "Не разовая рекомендация, а система: понятные шаги и точки роста на полгода вперёд.",
  },
];

const PROGRAM = [
  {
    emoji: "🔍",
    title: "Основы личного бренда и аудит присутствия",
    desc: "Где и как вас уже видят. Сильные и слабые точки. С чего начать, если публичности пока нет.",
  },
  {
    emoji: "📰",
    title: "Контент-стратегия и работа со СМИ",
    desc: "Какие темы усиливают экспертный статус и как попадать в комментарии и публикации.",
  },
  {
    emoji: "🎬",
    title: "Сторителлинг для экспертов",
    desc: "Объяснить свою ценность за 30 секунд. Личная история, которая продаёт экспертизу.",
  },
  {
    emoji: "🗓️",
    title: "Контент-план и дисциплина публикаций",
    desc: "Система регулярности без выгорания. Как публиковаться стабильно и не бросить.",
  },
  {
    emoji: "🛡️",
    title: "Работа с аудиторией и репутацией",
    desc: "Протоколы реакции на негатив, работа с волной, границы публичности и рисков.",
  },
  {
    emoji: "🤖",
    title: "Нейросети и развитие бренда вдолгую",
    desc: "Свой GPT-ассистент на ваших материалах и план развития на 6 месяцев вперёд.",
  },
];

const AUDIENCE = [
  "Руководителям, чьё имя связано с компанией и решениями",
  "Консультантам и экспертам, кто продаёт через личный авторитет",
  "Публичным специалистам — в СМИ, в соцсетях, в комментариях",
  "Тем, у кого пока нет публичности, но пора её выстроить",
];

const VS = [
  { them: "Команда из 5–10 специалистов и бюджет от 80 000 ₽/мес", you: "Одна система под одного человека — без штата и бюджета" },
  { them: "Общий шаблон контента «для всех»", you: "Контент-план под ваш профиль и нишу" },
  { them: "Реакция на кризис — вручную и наугад", you: "Готовые протоколы реакции на негатив" },
  { them: "Всё держится на подрядчике", you: "Свой GPT-ассистент работает без вас" },
  { them: "Разовые рекомендации", you: "План развития бренда на 6 месяцев" },
];

export default function PersonalBrand() {
  const course = COURSES.find((c) => c.id === COURSE_ID);
  const price = course ? getCoursePrice(course) : 6900;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Личный бренд эксперта: SMM-стратегия и управление репутацией онлайн · УЧИСЬПРО"
        description="Персональная методика личного бренда для руководителей, консультантов и экспертов — без команды и бюджета. Аудит присутствия, контент-стратегия, сторителлинг, протоколы реакции на негатив, свой GPT-ассистент и план на 6 месяцев. Первый урок бесплатно."
        canonical={CANONICAL}
        type="article"
        keywords="личный бренд эксперта, smm стратегия, управление репутацией, персональный бренд руководителя, контент-план эксперта, сторителлинг, работа с негативом, gpt ассистент, продвижение эксперта"
        jsonLd={JSON_LD}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg">🎯</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный бренд эксперта" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-fuchsia-500/15 border border-fuchsia-500/35 rounded-full px-4 py-1.5 mb-4">
            <Icon name="Sparkles" size={12} className="text-fuchsia-300" />
            <span className="text-xs text-fuchsia-200 font-bold uppercase tracking-wider">Персональная стратегия · без команды</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            Личный бренд эксперта:{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              стратегия, которая работает на вас
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Та же методика, что у SMM-агентств, — но адаптированная под одного человека. Без корпоративного бюджета и команды из десяти специалистов. Для тех, чьё имя уже на виду: в СМИ, в соцсетях, в комментариях.
          </p>
          {course && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/course-checkout/${COURSE_ID}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity glow-purple"
              >
                <Icon name="Rocket" size={18} />
                Начать — от {price.toLocaleString("ru-RU")} ₽
              </Link>
              <span className="text-white/50 text-xs">Первый урок бесплатно · 6 уроков · 2 часа</span>
            </div>
          )}
        </section>

        {/* Что вы получите — 5 результатов */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2 text-center">Что вы получите</h2>
          <p className="text-white/55 text-sm text-center mb-6 max-w-xl mx-auto">
            Не теория, а готовые рабочие инструменты, которые остаются с вами после курса
          </p>
          <div className="space-y-3">
            {RESULTS.map((r) => (
              <div key={r.n} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/25 border border-fuchsia-500/25 flex items-center justify-center">
                  <Icon name={r.icon} size={20} className="text-fuchsia-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-montserrat font-black text-fuchsia-400/70 text-sm">{r.n}</span>
                    <p className="font-montserrat font-bold text-white text-sm">{r.title}</p>
                  </div>
                  <p className="text-white/55 text-xs mt-1 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Вы vs агентство */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">
            Как у агентства — но без агентства
          </h2>
          <div className="grid gap-3">
            {VS.map((row, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-start gap-2.5">
                  <Icon name="X" size={16} className="text-white/30 flex-shrink-0 mt-0.5" />
                  <p className="text-white/45 text-sm leading-relaxed line-through decoration-white/20">{row.them}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-fuchsia-500/25 rounded-2xl p-4 flex items-start gap-2.5">
                  <Icon name="Check" size={16} className="text-fuchsia-300 flex-shrink-0 mt-0.5" />
                  <p className="text-white/85 text-sm leading-relaxed font-medium">{row.you}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Программа */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2 text-center">Программа: 6 уроков, 2 часа</h2>
          <p className="text-white/55 text-sm text-center mb-6">От аудита присутствия до плана развития на полгода вперёд</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROGRAM.map((p, i) => (
              <div key={p.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="text-2xl">{p.emoji}</div>
                  <span className="font-montserrat font-black text-[10px] text-fuchsia-400/60">УРОК {i + 1}</span>
                </div>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">{p.title}</p>
                  <p className="text-white/55 text-xs mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Кому подходит */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Кому подойдёт</h2>
          <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-fuchsia-500/25 rounded-2xl p-5 md:p-6">
            <ul className="space-y-2.5">
              {AUDIENCE.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white/80 text-sm">
                  <Icon name="UserCheck" size={16} className="text-violet-300 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Цена — сравнение */}
        <section className="mb-12">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 md:p-6 text-center">
            <h2 className="font-montserrat font-black text-xl md:text-2xl mb-3">Честная цена за целую систему</h2>
            <p className="text-white/65 text-sm leading-relaxed max-w-2xl mx-auto">
              Работа SMM-агентства над личным брендом — от <span className="text-white font-bold">80 000 ₽ в месяц</span>. Отдельные онлайн-курсы по теме — около <span className="text-white/50 line-through">4 900 ₽</span>, но это чаще набор советов без стратегии и ассистента.
            </p>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-3">
              Здесь — полная система с контент-планом, протоколами реакции на негатив и обученным GPT-ассистентом всего за{" "}
              <span className="font-montserrat font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {price.toLocaleString("ru-RU")} ₽
              </span>{" "}
              — один раз, навсегда.
            </p>
            <p className="text-white/35 text-[11px] mt-3">Цены агентств и конкурентов приведены для сравнения и являются ориентировочными.</p>
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
          <section className="text-center bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-purple-500/15 border border-fuchsia-500/30 rounded-3xl p-6 md:p-8">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Начните бесплатно</h2>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-5">
              Первый урок открыт бесплатно. Пройдите аудит присутствия, почувствуйте формат — а затем откройте все 6 уроков с личным ИИ-стратегом, контент-планом и GPT-ассистентом под ваш бренд.
            </p>
            <Link
              to={`/course-checkout/${COURSE_ID}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity glow-purple"
            >
              <Icon name="Rocket" size={18} />
              Перейти к курсу — от {price.toLocaleString("ru-RU")} ₽
            </Link>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
