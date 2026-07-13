import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { COURSES, getCoursePrice } from "@/components/courses/coursesData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";
const CANONICAL = `${SITE_URL}/expert-content`;
const COURSE_ID = 80;

const FAQ = [
  {
    q: "Я пишу статьи и посты, но заявок нет. Почему?",
    a: "Чаще всего дело не в качестве экспертизы, а в системе: не те темы, слабые заголовки, нет призыва и воронки, читатель не понимает, что делать дальше. Курс собирает всё в систему — от выбора темы под спрос аудитории до мягкого призыва, который ведёт к заявке.",
  },
  {
    q: "Подойдёт ли курс, если я пишу на TenChat, VC или в Дзене?",
    a: "Да. Отдельный урок посвящён работе с деловыми площадками — TenChat, VC, Дзен, Telegram: их особенности, алгоритмы, форматы и кросс-постинг без потери качества. Методика универсальна и подстраивается под площадку, где сидит ваша аудитория.",
  },
  {
    q: "Нужно ли уметь красиво писать?",
    a: "Нет. Мы работаем не с «красотой», а со структурой: заголовок, который дочитывают, понятная логика, история и призыв. Есть готовые шаблоны и формулы. А нейросети помогают писать быстрее — вы редактируете под свой стиль.",
  },
  {
    q: "Сколько времени занимает обучение?",
    a: "7 уроков, около 2 часов. Формат прикладной: каждый урок даёт готовый фрагмент вашей контент-воронки — темы, заголовки, структуру, истории, призыв, план. Первый урок бесплатный.",
  },
  {
    q: "Что я получу на выходе?",
    a: "Личный контент-план под вашу нишу, набор шаблонов постов и статей, формулы заголовков и готовую воронку через контент — от статьи до заявки. Плюс навык использовать нейросети, чтобы писать чаще без выгорания.",
  },
];

const JSON_LD: Record<string, unknown>[] = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Экспертный контент, который продаёт: статьи и посты, приводящие клиентов",
    description:
      "Система продающего экспертного контента для предпринимателей и экспертов: темы под спрос, цепляющие заголовки, сторителлинг и кейсы, воронка через контент, работа с деловыми площадками (TenChat, VC, Дзен) и нейросети.",
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
      { "@type": "ListItem", position: 2, name: "Экспертный контент, который продаёт", item: CANONICAL },
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

const PAINS = [
  "Пишете регулярно, а заявок из контента нет",
  "Посты набирают лайки, но не превращаются в клиентов",
  "Не знаете, о чём писать, чтобы это читала ваша аудитория",
  "Тексты получаются «правильными», но их пролистывают",
];

const RESULTS = [
  { icon: "Target", title: "Темы под спрос аудитории", desc: "О чём писать, чтобы читали и обращались именно ваши будущие клиенты." },
  { icon: "Type", title: "Заголовки, которые дочитывают", desc: "Формулы заголовков и первых строк, после которых не пролистывают." },
  { icon: "BookOpen", title: "Продающий сторителлинг", desc: "Как превратить кейсы и опыт в истории, которые вызывают доверие." },
  { icon: "Filter", title: "Воронка через контент", desc: "Мягкий призыв без «впаривания» — читатель сам приходит к заявке." },
  { icon: "Bot", title: "Нейросети для контента", desc: "Пишите быстрее и чаще: промпты под ваш стиль и редактура ИИ-текста." },
  { icon: "CalendarCheck", title: "Личный контент-план", desc: "Готовый план и шаблоны под вашу нишу — публикуйтесь системно." },
];

const PROGRAM = [
  { emoji: "🎯", title: "Контент-стратегия эксперта", desc: "Почему контент не приносит заявок и как это исправить. Темы под спрос." },
  { emoji: "🪝", title: "Заголовки и цепляющие начала", desc: "Формулы заголовков и первых строк, которые заставляют читать дальше." },
  { emoji: "🧱", title: "Структура продающей статьи и поста", desc: "Как собрать текст, который ведёт читателя к действию." },
  { emoji: "📖", title: "Сторителлинг и кейсы", desc: "Превращаем опыт и кейсы клиентов в истории, которые продают." },
  { emoji: "🔻", title: "Прогрев и воронка через контент", desc: "Мягкий призыв, прогревающие цепочки и продажа услуг через тексты." },
  { emoji: "🌐", title: "Работа с деловыми площадками", desc: "TenChat, VC, Дзен, Telegram: алгоритмы, охваты, нетворкинг." },
  { emoji: "🤖", title: "Нейросети и контент-план", desc: "Пишем быстрее с ИИ и собираем личный контент-план на месяц." },
];

const AUDIENCE = [
  "Экспертам и консультантам, кто продаёт через контент",
  "Предпринимателям и владельцам малого бизнеса",
  "Самозанятым и специалистам на фрилансе",
  "Всем, кто ведёт блог на TenChat, VC, в Дзене или Telegram",
];

export default function ExpertContent() {
  const course = COURSES.find((c) => c.id === COURSE_ID);
  const price = course ? getCoursePrice(course) : 5900;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Экспертный контент, который продаёт: статьи и посты для клиентов · УЧИСЬПРО"
        description="Курс для экспертов и предпринимателей: как писать статьи и посты, которые приводят клиентов. Темы под спрос, цепляющие заголовки, сторителлинг, воронка через контент, работа с TenChat, VC, Дзеном и нейросети. Первый урок бесплатно."
        canonical={CANONICAL}
        type="article"
        keywords="экспертный контент, контент-маркетинг, продающие статьи, посты для бизнеса, TenChat продвижение, контент-план эксперта, сторителлинг, воронка через контент, тексты для экспертов"
        jsonLd={JSON_LD}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-lg">✍️</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Экспертный контент, который продаёт" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-500/35 rounded-full px-4 py-1.5 mb-4">
            <Icon name="Sparkles" size={12} className="text-sky-300" />
            <span className="text-xs text-sky-200 font-bold uppercase tracking-wider">Контент для экспертов и бизнеса</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            Экспертный контент,{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              который продаёт
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Пишете статьи и посты, но клиентов из них нет? Соберём систему продающего контента: темы под спрос, цепляющие заголовки, сторителлинг и воронка — от статьи до заявки. Для TenChat, VC, Дзена и Telegram.
          </p>
          {course && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/course-checkout/${COURSE_ID}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity glow-purple"
              >
                <Icon name="Rocket" size={18} />
                Начать — от {price.toLocaleString("ru-RU")} ₽
              </Link>
              <span className="text-white/50 text-xs">Первый урок бесплатно · 7 уроков · 2 часа</span>
            </div>
          )}
        </section>

        {/* Боль */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Знакомо?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PAINS.map((p) => (
              <div key={p} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <Icon name="CircleHelp" size={18} className="text-sky-300 flex-shrink-0 mt-0.5" />
                <p className="text-white/75 text-sm leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
          <p className="text-white/55 text-sm text-center mt-4 max-w-xl mx-auto">
            Дело не в экспертизе — в системе. Её и собираем за 7 уроков.
          </p>
        </section>

        {/* Что вы получите */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6 text-center">Что вы получите</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RESULTS.map((r) => (
              <div key={r.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/25 to-indigo-500/25 border border-sky-500/25 flex items-center justify-center">
                  <Icon name={r.icon} size={20} className="text-sky-300" />
                </div>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">{r.title}</p>
                  <p className="text-white/55 text-xs mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Программа */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-2 text-center">Программа: 7 уроков, 2 часа</h2>
          <p className="text-white/55 text-sm text-center mb-6">От стратегии до готовой контент-воронки под вашу нишу</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROGRAM.map((p, i) => (
              <div key={p.title} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="text-2xl">{p.emoji}</div>
                  <span className="font-montserrat font-black text-[10px] text-sky-400/60">УРОК {i + 1}</span>
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
          <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/25 rounded-2xl p-5 md:p-6">
            <ul className="space-y-2.5">
              {AUDIENCE.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white/80 text-sm">
                  <Icon name="UserCheck" size={16} className="text-sky-300 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-5 text-center">Частые вопросы</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="font-montserrat font-bold text-white text-sm mb-1.5 flex items-start gap-2">
                  <Icon name="HelpCircle" size={16} className="text-sky-300 flex-shrink-0 mt-0.5" />
                  {f.q}
                </p>
                <p className="text-white/60 text-sm leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Финальный CTA */}
        {course && (
          <section className="text-center bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-purple-500/15 border border-sky-500/30 rounded-3xl p-6 md:p-8">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Начните бесплатно</h2>
            <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-5">
              Первый урок открыт бесплатно. Пройдите его, почувствуйте формат — а затем откройте все 7 уроков с личным ИИ-редактором, шаблонами и готовой воронкой через контент под вашу нишу.
            </p>
            <Link
              to={`/course-checkout/${COURSE_ID}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-bold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity glow-purple"
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
