import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { COURSES, getCoursePrice, getCoursePriceLabel } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";

const SITE = "https://учисьпро.рф";

/** Направления взрослых курсов — сгруппированы по цели человека,
 *  а не по внутренним предметам: так ищут работу, а не «курс по subject». */
const TRACKS: { id: string; label: string; icon: string; subjects: string[] }[] = [
  { id: "ai", label: "Нейросети и ИИ", icon: "Sparkles", subjects: ["ai", "prompteng", "neuroincome", "avangard"] },
  { id: "it", label: "IT и данные", icon: "Cpu", subjects: ["cs", "datascience", "product", "roomscan", "smartmach"] },
  { id: "business", label: "Бизнес и продажи", icon: "Briefcase", subjects: ["business", "marketing", "sales", "tenders", "ved"] },
  { id: "help", label: "Психология и люди", icon: "HeartHandshake", subjects: ["psychology", "personalbrand"] },
  { id: "lang", label: "Языки и творчество", icon: "Languages", subjects: ["chinese", "korean", "design"] },
];

const FAQ = [
  {
    q: "Сколько времени занимает обучение?",
    a: "Уроки по 30 минут, заниматься можно в любое время. Большинство программ проходят за 4–8 недель по 2–3 урока в неделю. Дедлайнов нет: доступ остаётся навсегда, темп выбираете сами.",
  },
  {
    q: "Нужен ли опыт, чтобы начать?",
    a: "Нет. Все курсы для взрослых начинаются с нуля и не требуют технического бэкграунда. Первый урок в каждом курсе бесплатный — можно посмотреть формат до оплаты.",
  },
  {
    q: "Сколько стоит и есть ли подписка?",
    a: "Оплата разовая, подписки нет. Цены — от 3 990 ₽ за курс, доступ навсегда, включая все будущие обновления программы.",
  },
  {
    q: "Выдаёте ли документ об образовании?",
    a: "Сервис не выдаёт документов государственного образца — услуги носят информационно-консультационный характер. По итогам обучения остаётся портфолио работ, которое ценится работодателем выше сертификата.",
  },
  {
    q: "Поздно ли учиться после 35–40 лет?",
    a: "Нет. Опыт из прошлой профессии — это половина новой: он ускоряет вход, а не мешает ему. Курсы построены на практике и рассчитаны на занятых людей, у которых есть работа и семья.",
  },
];

export default function AdultCourses() {
  const adult = useMemo(() => COURSES.filter((c) => c.grade === "adult"), []);
  const totalLessons = useMemo(() => adult.reduce((n, c) => n + c.lessons, 0), [adult]);
  const minPrice = useMemo(
    () => Math.min(...adult.map(getCoursePrice).filter((p) => p > 0)),
    [adult]
  );

  const grouped = useMemo(
    () =>
      TRACKS.map((t) => ({
        ...t,
        courses: adult.filter((c) => t.subjects.includes(c.subject)),
      })).filter((t) => t.courses.length > 0),
    [adult]
  );

  const other = useMemo(() => {
    const used = new Set(TRACKS.flatMap((t) => t.subjects));
    return adult.filter((c) => !used.has(c.subject));
  }, [adult]);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Курсы для взрослых",
      description: `${adult.length} онлайн-курсов для взрослых: нейросети, IT, бизнес, удалённые профессии.`,
      url: `${SITE}/kursy-dlya-vzroslyh`,
      inLanguage: "ru-RU",
      isPartOf: { "@type": "WebSite", name: "УЧИСЬПРО", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Курсы для взрослых — УЧИСЬПРО",
      numberOfItems: adult.length,
      itemListElement: adult.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Course",
          name: c.title,
          description: c.description.slice(0, 200),
          url: `${SITE}${courseUrl(c)}`,
          provider: { "@type": "Organization", name: "УЧИСЬПРО", url: SITE },
          offers: {
            "@type": "Offer",
            price: getCoursePrice(c),
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: c.rating,
            reviewCount: c.reviews,
            bestRating: 5,
          },
        },
      })),
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

  return (
    <div className="min-h-screen bg-background text-white">
      <Seo
        title={`Курсы для взрослых онлайн — ${adult.length} программ с нуля`}
        description={`${adult.length} онлайн-курсов для взрослых: нейросети, IT, бизнес, удалённые профессии. Обучение с нуля, от ${minPrice.toLocaleString("ru-RU")} ₽, доступ навсегда. Первый урок бесплатно.`}
        canonical={`${SITE}/kursy-dlya-vzroslyh`}
        keywords="курсы для взрослых, обучение взрослых онлайн, курсы с нуля, переквалификация, вторая профессия, удалённые профессии, курсы нейросети, курсы программирования, обучение после 40"
        jsonLd={jsonLd}
      />

      <div className="border-b border-white/5 bg-background/30">
        <div className="max-w-6xl mx-auto px-5 py-2.5">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Курсы", href: "/courses" },
              { label: "Взрослым" },
            ]}
          />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-5 py-10 md:py-14">
        <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
          Курсы для взрослых: {adult.length} программ с нуля
        </h1>
        <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
          Нейросети, IT, бизнес и удалённые профессии — {totalLessons.toLocaleString("ru-RU")} уроков
          по 30 минут. Без дедлайнов и вебинаров по расписанию: учитесь в своём темпе, доступ
          остаётся навсегда. Первый урок в каждом курсе бесплатный, оплата разовая.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/mini-course"
            className="inline-flex items-center gap-2 bg-emerald-500/12 border border-emerald-500/30 text-emerald-200 font-bold px-5 py-3 rounded-2xl hover:bg-emerald-500/20 transition-colors"
          >
            <Icon name="Gift" size={17} aria-hidden="true" />
            Сначала бесплатно — 31 мини-курс
          </Link>
          <Link
            to="/career-pro"
            className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/12 font-bold px-5 py-3 rounded-2xl hover:bg-white/10 transition-colors"
          >
            <Icon name="Fingerprint" size={17} aria-hidden="true" />
            Не знаю, что выбрать
          </Link>
        </div>

        {grouped.map((track) => (
          <section key={track.id} className="mb-12" aria-labelledby={`track-${track.id}`}>
            <h2
              id={`track-${track.id}`}
              className="font-montserrat font-black text-xl md:text-2xl mb-4 flex items-center gap-2.5"
            >
              <Icon name={track.icon} size={22} className="text-purple-300" aria-hidden="true" />
              {track.label}
              <span className="text-white/35 text-sm font-medium">{track.courses.length}</span>
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
              {track.courses.map((c) => (
                <li key={c.id}>
                  <Link
                    to={courseUrl(c)}
                    className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/25 hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-start gap-3 mb-2.5">
                      <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl flex-shrink-0`} aria-hidden="true">
                        {c.emoji}
                      </span>
                      <h3 className="font-bold text-white text-sm leading-snug">{c.title}</h3>
                    </div>
                    <p className="text-white/55 text-xs leading-relaxed mb-3 line-clamp-3">
                      {c.description.slice(0, 130)}…
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{getCoursePriceLabel(c)}</span>
                      <span className="text-white/40">{c.lessons} уроков</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {other.length > 0 && (
          <section className="mb-12" aria-labelledby="track-other">
            <h2 id="track-other" className="font-montserrat font-black text-xl md:text-2xl mb-4">
              Другие направления
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
              {other.map((c) => (
                <li key={c.id}>
                  <Link
                    to={courseUrl(c)}
                    className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/25 transition-all"
                  >
                    <h3 className="font-bold text-white text-sm mb-2">{c.emoji} {c.title}</h3>
                    <p className="text-white/45 text-xs">{getCoursePriceLabel(c)} · {c.lessons} уроков</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-10" aria-labelledby="faq-adult">
          <h2 id="faq-adult" className="font-montserrat font-black text-xl md:text-2xl mb-4">
            Частые вопросы об обучении взрослых
          </h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <details key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 group">
                <summary className="font-semibold text-white text-sm cursor-pointer list-none flex items-center justify-between gap-3">
                  {f.q}
                  <Icon name="ChevronDown" size={16} className="text-white/40 group-open:rotate-180 transition-transform flex-shrink-0" aria-hidden="true" />
                </summary>
                <p className="text-white/60 text-sm mt-2.5 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <nav className="rounded-3xl border border-white/10 bg-white/[0.02] p-6" aria-label="Полезные разборы">
          <h2 className="font-montserrat font-black text-lg mb-3">Разборы перед выбором</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/feed/kursy-dlya-vzroslyh-putevoditel-35-programm" className="text-cyan-200 hover:text-cyan-100">
                Путеводитель по всем {adult.length} курсам: деньги, сроки и риски
              </Link>
            </li>
            <li>
              <Link to="/feed/kursy-dlya-vzroslyh-uchitsya-posle-30-40-50" className="text-cyan-200 hover:text-cyan-100">
                Поздно ли учиться после 35: разбор главного страха
              </Link>
            </li>
            <li>
              <Link to="/remote-professions" className="text-cyan-200 hover:text-cyan-100">
                Удалённые профессии: с чего начать
              </Link>
            </li>
          </ul>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
