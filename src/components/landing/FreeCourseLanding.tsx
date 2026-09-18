import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { COURSES } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";

/**
 * Общий каркас посадочной под бесплатный курс-приманку.
 *
 * Зачем отдельная страница, а не карточка в каталоге: каталог из 89 курсов
 * отвечает на вопрос «что у вас есть», а человек из поиска спрашивает
 * «научите зарабатывать». Каталог заставляет выбирать — и 19 из 20
 * зарегистрированных не открывали после него ни одного урока.
 * Здесь выбора нет: одно обещание и одна кнопка.
 *
 * Каркас общий, потому что вторая такая страница неизбежно разъедется
 * с первой: поправят отступ в одной — забудут в другой.
 */

const SITE_URL = "https://учисьпро.рф";

/** Адрес курса строим тем же slugify, что и каталог, а не руками. */
function urlById(id: number): string {
  const c = COURSES.find((x) => x.id === id);
  return c ? courseUrl(c) : "/courses";
}

export interface FreeCourseLandingProps {
  /** Путь страницы без домена, например /internet-marketing-s-nulya */
  path: string;
  seo: { title: string; description: string; keywords: string };
  /** Надпись в «хлебных крошках» */
  crumb: string;
  badge: string;
  /** Заголовок: обычная часть и выделенная цветом */
  h1: { lead: string; accent: string };
  intro: string;
  /** id бесплатного курса — единственный вход */
  freeCourseId: number;
  /** id платного продолжения — предлагается только внизу */
  fullCourseId: number;
  fullCourseNote: string;
  lessons: { n: number; t: string; d: string; m: number }[];
  forWhom: { icon: string; t: string; d: string }[];
  honest: string[];
  faq: { q: string; a: string }[];
  /** Цвет кнопок — градиент Tailwind */
  accent: string;
  /** Префикс цели в Метрике, чтобы различать страницы */
  goalPrefix: string;
  /** Часов на прохождение — для разметки курса */
  workloadHours: number;
  closing: { title: string; text: string };
}

export default function FreeCourseLanding(p: FreeCourseLandingProps) {
  const canonical = `${SITE_URL}${p.path}`;
  const free = urlById(p.freeCourseId);
  const full = urlById(p.fullCourseId);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: p.seo.title.replace(/\s*\|.*$/, ""),
      description: p.seo.description,
      provider: { "@type": "Organization", name: "УЧИСЬПРО", sameAs: SITE_URL },
      url: canonical,
      inLanguage: "ru",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        category: "Free",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${p.workloadHours}H`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const cta = (place: string, label: string) => (
    <Link
      to={free}
      onClick={() => trackGoal(`${p.goalPrefix}_start`, { place })}
      className={`inline-flex items-center gap-2.5 bg-gradient-to-r ${p.accent} text-white font-black text-base px-9 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-xl`}
    >
      <Icon name="Play" size={20} />
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title={p.seo.title}
        description={p.seo.description}
        canonical={canonical}
        keywords={p.seo.keywords}
        jsonLd={jsonLd}
      />

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <Breadcrumbs
          className="mb-5"
          items={[
            { label: "Главная", href: "/" },
            { label: "Курсы", href: "/courses" },
            { label: p.crumb },
          ]}
        />

        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
              {p.badge}
            </span>
          </div>

          <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
            {p.h1.lead} <span className="gradient-text-purple">{p.h1.accent}</span>
          </h1>

          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-7 leading-relaxed">
            {p.intro}
          </p>

          {cta("hero", "Начать бесплатно")}

          <p className="text-white/40 text-xs mt-3">
            Первый урок открывается сразу — регистрация не нужна
          </p>
        </section>

        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1.5">
            Что именно вы сделаете
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Каждый урок заканчивается результатом, а не конспектом
          </p>

          <div className="space-y-2.5">
            {p.lessons.map((l) => (
              <div
                key={l.n}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
              >
                <span className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center font-black text-sm text-white/80">
                  {l.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-[15px] leading-snug">{l.t}</div>
                  <div className="text-white/55 text-sm mt-0.5 leading-relaxed">{l.d}</div>
                </div>
                <span className="shrink-0 text-white/35 text-xs pt-1">{l.m} мин</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Кому подойдёт</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {p.forWhom.map((f) => (
              <div key={f.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Icon name={f.icon} fallback="Circle" size={20} className="text-white/70 mb-2.5" />
                <div className="font-bold text-white text-[15px] mb-1">{f.t}</div>
                <div className="text-white/55 text-sm leading-relaxed">{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Честный блок снимает главное возражение рынка — «опять развод» */}
        <section className="mb-14">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 md:p-7">
            <h2 className="font-montserrat font-black text-xl md:text-2xl mb-4 flex items-center gap-2.5">
              <Icon name="ShieldCheck" size={22} className="text-emerald-300" />
              Чего мы не обещаем
            </h2>
            <ul className="space-y-3">
              {p.honest.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-white/70 text-sm leading-relaxed">
                  <Icon name="Minus" size={14} className="text-white/30 mt-1 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <p className="text-white/45 text-xs mt-5 leading-relaxed">
              Мы пишем это здесь, потому что рынок переполнен обещаниями лёгких денег.
              Курс бесплатный — нам незачем вам что-то продавать словами.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
            {p.closing.title}
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            {p.closing.text}
          </p>

          {cta("footer", "Открыть бесплатный курс")}

          <div className="mt-6">
            <Link
              to={full}
              onClick={() => trackGoal(`${p.goalPrefix}_full_click`)}
              className="text-white/40 hover:text-white/70 text-xs underline underline-offset-2 transition-colors"
            >
              {p.fullCourseNote}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
