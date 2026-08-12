import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { MINI_COURSES } from "@/components/minicourse/registry";

const SITE_URL = "https://учисьпро.рф";

/** Слаги курсов линейки для руководителей — порядок важен, он задаёт логику пути. */
const TOOL_SLUGS = [
  "matrica-otvetstvennosti",
  "postanovka-zadach",
  "razgovor-o-rezultatah",
  "reglament-nayma",
];

/** Что человек уносит с каждого курса — главный аргумент страницы. */
const ARTIFACTS: Record<string, string[]> = {
  "matrica-otvetstvennosti": [
    "Заполненная матрица по вашему процессу",
    "Чек-лист проверки на дефекты",
    "Письмо команде для фиксации ролей",
  ],
  "postanovka-zadach": [
    "Формула постановки из шести элементов",
    "Скрипт проверки понимания",
    "Шаблон письма-фиксации задачи",
  ],
  "razgovor-o-rezultatah": [
    "Сценарий разговора с готовыми фразами",
    "Формула «факт — последствие — ожидание»",
    "Шаблон письма после разговора",
  ],
  "reglament-nayma": [
    "Шаблон профиля должности",
    "Список вопросов про реальный опыт",
    "Оценочный лист кандидата",
  ],
};

const PROBLEMS = [
  {
    icon: "Users",
    title: "«Я думал, это делает Петров»",
    text: "Задача провисает между людьми, потому что у неё нет одного владельца.",
  },
  {
    icon: "RefreshCcw",
    title: "Сделали не то, что просили",
    text: "Результат приходит в последний день и не совпадает с ожиданием.",
  },
  {
    icon: "MessageSquareWarning",
    title: "Разговор откладывается месяцами",
    text: "Проблема копится, а потом обсуждается на эмоциях и сразу про увольнение.",
  },
  {
    icon: "UserSearch",
    title: "Наняли по ощущению — расстались через месяц",
    text: "Нет профиля должности, каждый интервьюер спрашивает своё.",
  },
];

export default function ManagerTools() {
  const courses = TOOL_SLUGS.map((s) => MINI_COURSES.find((c) => c.slug === s)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  const totalMinutes = courses.reduce((sum, c) => sum + c.minutes, 0);
  const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);

  const canonical = `${SITE_URL}/instrumenty-rukovoditelya`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Инструменты руководителя — бесплатные мини-курсы",
      description:
        "Четыре практических мини-курса для руководителей: матрица ответственности, постановка задач, разговор о результатах, регламент найма.",
      itemListElement: courses.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.title,
        url: `${SITE_URL}/mini-course/${c.slug}`,
      })),
    },
    ...courses.map((c) => ({
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `${SITE_URL}/mini-course/${c.slug}`,
      name: c.title,
      description: c.promise,
      inLanguage: "ru-RU",
      isAccessibleForFree: true,
      provider: {
        "@type": "Organization",
        name: "УЧИСЬПРО",
        url: SITE_URL,
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${c.minutes}M`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
      },
    })),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Сколько стоят курсы для руководителей?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Все четыре курса бесплатные. Первый урок каждого курса открывается без регистрации — там уже есть рабочий шаблон, который можно скопировать и применить.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько времени занимает один курс?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Около 30 минут: четыре урока по 7–9 минут. Курс рассчитан на один вечер, чтобы не выпадать из операционной работы.",
          },
        },
        {
          "@type": "Question",
          name: "Что остаётся после прохождения?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Заполненный шаблон под вашу ситуацию: матрица ответственности по вашему процессу, формула постановки задач, сценарий разговора с сотрудником, профиль должности и оценочный лист кандидата. Каждый шаблон копируется одной кнопкой.",
          },
        },
        {
          "@type": "Question",
          name: "С какого курса начать?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Если задачи теряются между людьми — с матрицы ответственности. Если результат не совпадает с ожиданием — с постановки задач. Если давно назрел разговор с сотрудником — с курса про обратную связь.",
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title="Инструменты руководителя: 4 бесплатных мини-курса за вечер"
        description="Матрица ответственности, постановка задач, разговор о результатах и регламент найма. Каждый курс — 30 минут и готовый шаблон, который можно забрать и применить завтра."
        canonical={canonical}
        keywords="инструменты руководителя, матрица ответственности, как поставить задачу сотруднику, обратная связь подчинённому, регламент найма, курсы для руководителей бесплатно, управление командой"
        image="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/e4540dd8-db26-40ff-8d5f-e0e392586080.jpg"
        jsonLd={jsonLd}
      />

      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Мини-курсы", href: "/mini-course" },
            { label: "Инструменты руководителя" },
          ]}
        />
      </div>

      {/* Первый экран */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/12 border border-cyan-500/25 px-3 py-1.5 rounded-full mb-5">
              <Icon name="Sparkles" size={13} />
              Бесплатно · без регистрации
            </span>

            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
              Инструменты{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                руководителя
              </span>
            </h1>

            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">
              Четыре мини-курса про то, что ломается в управлении чаще всего. Каждый — на один
              вечер. С каждого вы уносите заполненный шаблон, а не конспект.
            </p>

            <div className="flex flex-wrap gap-3 mb-7">
              {[
                { icon: "Clock", label: `${totalMinutes} минут на все четыре` },
                { icon: "BookOpen", label: `${totalLessons} уроков` },
                { icon: "Download", label: "12 готовых шаблонов" },
              ].map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-2 text-sm text-white/70 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl"
                >
                  <Icon name={s.icon} size={15} className="text-cyan-400" />
                  {s.label}
                </span>
              ))}
            </div>

            <a
              href="#courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white font-black px-7 py-3.5 rounded-2xl transition-opacity"
            >
              Выбрать курс
              <Icon name="ArrowDown" size={18} />
            </a>
          </div>

          <div className="relative">
            <img
              src="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/e4540dd8-db26-40ff-8d5f-e0e392586080.jpg"
              alt="Механическая колибри — точная настройка управленческих процессов"
              className="w-full rounded-3xl border border-white/10 shadow-2xl"
              loading="eager"
              width={640}
              height={640}
            />
            <div className="absolute -bottom-4 -left-2 md:left-4 bg-card/95 backdrop-blur border border-white/15 rounded-2xl px-4 py-3 max-w-[240px]">
              <p className="text-xs text-white/70 leading-relaxed">
                Управление — это точность движений, а не размах крыльев
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Проблемы */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-10">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">
          Знакомо?
        </h2>
        <p className="text-white/55 text-center text-sm md:text-base mb-8">
          Каждый курс закрывает одну из этих ситуаций
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-white/10 bg-card/60 p-5 hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/12 border border-rose-500/25 flex items-center justify-center mb-3">
                <Icon name={p.icon} size={18} className="text-rose-300" />
              </div>
              <h3 className="font-bold text-white mb-1.5 text-sm leading-snug">{p.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Курсы */}
      <section id="courses" className="max-w-6xl mx-auto px-5 md:px-8 py-10 scroll-mt-20">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">
          Четыре инструмента
        </h2>
        <p className="text-white/55 text-center text-sm md:text-base mb-8 max-w-2xl mx-auto">
          Первый урок каждого курса открыт без регистрации — в нём уже есть рабочий шаблон
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {courses.map((c, i) => (
            <article
              key={c.slug}
              className="rounded-3xl border border-white/10 bg-card/60 overflow-hidden hover:border-white/25 transition-colors flex flex-col"
            >
              <div className={`h-1.5 bg-gradient-to-r ${c.gradient}`} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl flex-shrink-0">{c.emoji}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/35 block mb-1">
                      Шаг {i + 1}
                    </span>
                    <h3 className="font-montserrat font-black text-lg leading-snug">{c.title}</h3>
                  </div>
                </div>

                <p className="text-white/65 text-sm leading-relaxed mb-4">{c.subtitle}</p>

                <div className="mb-5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300/70 block mb-2">
                    Что заберёте с собой
                  </span>
                  <ul className="space-y-1.5">
                    {(ARTIFACTS[c.slug] || []).map((a) => (
                      <li key={a} className="flex gap-2 text-sm text-white/75">
                        <Icon
                          name="Check"
                          size={15}
                          className="text-emerald-400 flex-shrink-0 mt-0.5"
                        />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3 text-xs text-white/45 mb-5 mt-auto">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="Clock" size={13} />
                    {c.minutes} мин
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="BookOpen" size={13} />
                    {c.lessons.length} урока
                  </span>
                </div>

                <Link
                  to={`/mini-course/${c.slug}`}
                  className="inline-flex items-center justify-center gap-2 w-full bg-white/8 hover:bg-white/14 border border-white/15 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
                >
                  Открыть курс
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Как устроено */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-10">
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">
          Как это устроено
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: "Timer",
              title: "7–9 минут на урок",
              text: "Читается в перерыве между встречами, не выбивает из работы.",
            },
            {
              icon: "ClipboardCheck",
              title: "Шаблон в каждом уроке",
              text: "Копируется одной кнопкой — заполняете под свою ситуацию.",
            },
            {
              icon: "Target",
              title: "Про практику, не про теорию",
              text: "Никаких пирамид и матриц из учебников. Только то, что применимо завтра.",
            },
          ].map((s) => (
            <div key={s.title} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/12 border border-cyan-500/25 flex items-center justify-center mb-3">
                <Icon name={s.icon} size={20} className="text-cyan-300" />
              </div>
              <h3 className="font-bold mb-1.5">{s.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Финальный призыв */}
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-12">
        <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-violet-600/10 p-8 md:p-10 text-center">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
            Начните с того, что болит сильнее
          </h2>
          <p className="text-white/70 mb-7 max-w-xl mx-auto leading-relaxed">
            Задачи теряются между людьми — начните с матрицы ответственности. Результат не
            совпадает с ожиданием — с постановки задач.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/mini-course/matrica-otvetstvennosti"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white font-black px-6 py-3.5 rounded-2xl transition-opacity"
            >
              <Icon name="Play" size={17} />
              Матрица ответственности
            </Link>
            <Link
              to="/mini-course"
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/15 text-white font-bold px-6 py-3.5 rounded-2xl transition-colors"
            >
              Все мини-курсы
              <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}