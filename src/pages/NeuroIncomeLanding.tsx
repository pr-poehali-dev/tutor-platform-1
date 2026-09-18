import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { COURSES } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";

/**
 * Посадочная под главный поисковый запрос платформы — заработок на нейросетях.
 *
 * Зачем отдельная страница, а не карточка в каталоге: каталог из 88 курсов
 * отвечает на вопрос «что у вас есть», а человек из поиска спрашивает
 * «научите зарабатывать на нейросетях». Каталог заставляет выбирать — и
 * 19 из 20 зарегистрированных не открывали после этого ни одного урока.
 * Здесь выбора нет: одно обещание и одна кнопка.
 */

const SITE_URL = "https://учисьпро.рф";
const CANONICAL = `${SITE_URL}/zarabotok-na-neirosetyah`;
// Адреса строим тем же slugify, что и каталог (courseSlug.ts), а не руками:
// ручной вариант уже разошёлся с реальным и увёл бы людей на 404.
const byId = (id: number) => {
  const c = COURSES.find((x) => x.id === id);
  return c ? courseUrl(c) : "/courses";
};
/** Бесплатный вводный курс (id 76) — единственный вход на этой странице. */
const FREE_COURSE = byId(76);
/** Полная программа (id 64) — предлагается только после бесплатной. */
const FULL_COURSE = byId(64);

const LESSONS = [
  { n: 1, t: "Карта заработка на ИИ", d: "Какие задачи бизнес реально отдаёт нейросетям и сколько за них платят", m: 20 },
  { n: 2, t: "Сервисы без ухищрений", d: "Что работает из России бесплатно — и чем пользоваться не стоит", m: 20 },
  { n: 3, t: "Первая картинка и логотип", d: "Практика: генерируете сами, прямо по ходу урока", m: 25 },
  { n: 4, t: "Продающий пост с помощью ИИ", d: "Практика: текст, который можно показать заказчику", m: 25 },
  { n: 5, t: "Собираем услугу на продажу", d: "Упаковка: что именно вы продаёте и за сколько", m: 25 },
  { n: 6, t: "Куда идти за заказами", d: "Площадки, первые отклики и что писать в портфолио", m: 15 },
];

const HONEST = [
  "За вечер вы не станете специалистом — это рабочий старт, а не профессия под ключ.",
  "Первый заказ сам не придёт. Мы показываем, где искать, но писать людям придётся вам.",
  "Никаких «5 000 ₽ за час гарантированно». Сколько получится — зависит от того, что вы сделаете дальше.",
];

const FOR_WHOM = [
  { icon: "Briefcase", t: "Работаете и хотите подработку", d: "Вечер занят курсом, а не сериалом — и на выходе есть что продавать" },
  { icon: "RefreshCw", t: "Думаете сменить профессию", d: "Дешёвый способ проверить, ваше это вообще или нет — до того, как платить за большой курс" },
  { icon: "Home", t: "Вышли из декрета или паузы", d: "Начинаете с нуля, без опыта и без вложений" },
  { icon: "Store", t: "У вас свой небольшой бизнес", d: "Контент и тексты перестают быть статьёй расходов" },
];

export default function NeuroIncomeLanding() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Заработок на нейросетях с нуля: первая услуга за вечер",
      description:
        "Бесплатный курс из 6 уроков: генерация картинок и логотипов, продающие тексты с помощью ИИ и упаковка первой услуги на продажу. Без программирования и вложений.",
      provider: { "@type": "Organization", name: "УЧИСЬПРО", sameAs: SITE_URL },
      url: CANONICAL,
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
        courseWorkload: "PT2H",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Курс правда бесплатный?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да, все шесть уроков открыты бесплатно навсегда. Карта не нужна, оплата не потребуется ни на одном шаге.",
          },
        },
        {
          "@type": "Question",
          name: "Нужно ли уметь программировать?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нет. Все инструменты работают через обычный браузер, код писать не нужно.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько можно заработать на нейросетях?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Честный ответ: зависит от вас. Курс даёт первую упакованную услугу и площадки, где искать заказы. Гарантий дохода мы не даём — их не может дать никто.",
          },
        },
        {
          "@type": "Question",
          name: "Сколько времени занимает курс?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Около двух часов: шесть уроков по 20–25 минут. Можно пройти за один вечер или растянуть на неделю.",
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Заработок на нейросетях с нуля: бесплатный курс"
        description="Бесплатный курс из 6 уроков: соберите первую услугу на нейросетях за вечер. Картинки, логотипы, продающие тексты. Без программирования, вложений и карты."
        canonical={CANONICAL}
        keywords="заработок на нейросетях, курс нейросети с нуля, нейросети бесплатно, как зарабатывать на ии, фриланс на нейросетях, обучение нейросетям бесплатно"
        jsonLd={jsonLd}
      />

      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <Breadcrumbs
          className="mb-5"
          items={[
            { label: "Главная", href: "/" },
            { label: "Курсы", href: "/courses" },
            { label: "Заработок на нейросетях" },
          ]}
        />

        {/* Главный экран: одно обещание и одна кнопка */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
              Бесплатно навсегда · без карты
            </span>
          </div>

          <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
            Соберите первую услугу
            <br className="hidden md:block" /> на нейросетях{" "}
            <span className="gradient-text-purple">за один вечер</span>
          </h1>

          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-7 leading-relaxed">
            Шесть уроков по 20–25 минут. Вы сгенерируете картинку и логотип, напишете
            продающий пост с помощью ИИ и упакуете это в услугу с ценой — то, что уже
            можно продавать. Без программирования и вложений.
          </p>

          <Link
            to={FREE_COURSE}
            onClick={() => trackGoal("neuro_landing_start", { place: "hero" })}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-base px-9 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-xl shadow-amber-500/25"
          >
            <Icon name="Play" size={20} />
            Начать бесплатно
          </Link>

          <p className="text-white/40 text-xs mt-3">
            Первый урок открывается сразу — регистрация не нужна
          </p>
        </section>

        {/* Программа: видно, что за вечер реально успеть */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-1.5">
            Что именно вы сделаете
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Каждый урок заканчивается результатом, а не конспектом
          </p>

          <div className="space-y-2.5">
            {LESSONS.map((l) => (
              <div
                key={l.n}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
              >
                <span className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/20 border border-amber-400/25 flex items-center justify-center font-black text-sm text-amber-200">
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

        {/* Кому подходит */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-6">Кому подойдёт</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FOR_WHOM.map((f) => (
              <div key={f.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Icon name={f.icon} fallback="Circle" size={20} className="text-amber-300 mb-2.5" />
                <div className="font-bold text-white text-[15px] mb-1">{f.t}</div>
                <div className="text-white/55 text-sm leading-relaxed">{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Честный блок — он же снимает главное возражение «опять развод» */}
        <section className="mb-14">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 md:p-7">
            <h2 className="font-montserrat font-black text-xl md:text-2xl mb-4 flex items-center gap-2.5">
              <Icon name="ShieldCheck" size={22} className="text-emerald-300" />
              Чего мы не обещаем
            </h2>
            <ul className="space-y-3">
              {HONEST.map((h) => (
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

        {/* Повторный вход + мягкое продолжение */}
        <section className="text-center">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
            Начните сегодня вечером
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            Два часа — и у вас есть услуга, цена и площадки, где её предлагать.
            Дальше решите сами, нужно ли продолжение.
          </p>

          <Link
            to={FREE_COURSE}
            onClick={() => trackGoal("neuro_landing_start", { place: "footer" })}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-base px-9 py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-xl shadow-amber-500/25"
          >
            <Icon name="Play" size={20} />
            Открыть бесплатный курс
          </Link>

          <div className="mt-6">
            <Link
              to={FULL_COURSE}
              onClick={() => trackGoal("neuro_landing_full_click")}
              className="text-white/40 hover:text-white/70 text-xs underline underline-offset-2 transition-colors"
            >
              Уже проходили? Полная программа: 36 уроков, Reels, чат-боты, выход на заказы
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}