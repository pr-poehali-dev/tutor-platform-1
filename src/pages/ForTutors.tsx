import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import TutorsLeadForm from "@/components/tutors/TutorsLeadForm";
import { MINI_COURSES } from "@/components/minicourse/registry";

const SITE_URL = "https://учисьпро.рф";
const CANONICAL = `${SITE_URL}/repetitoram`;

/** Комиссия платформы — совпадает со значением platform_fee_percent в базе. */
const FEE_PERCENT = 8;

const PAINS = [
  {
    icon: "Clock",
    title: "Программа съедает выходные",
    text: "Методичка на курс из 12 уроков пишется неделями. Всё это время вы не зарабатываете, а готовитесь.",
  },
  {
    icon: "Users",
    title: "Потолок — часы в сутках",
    text: "Индивидуальные занятия не масштабируются. Больше учеников — только больше часов за тем же столом.",
  },
  {
    icon: "Megaphone",
    title: "Курс есть, продаж нет",
    text: "Методист внутри вас силён, а маркетолог молчит: непонятно, что писать в объявлении и сколько просить.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Назовите тему",
    text: "«Английский с нуля», «Подготовка к ЕГЭ по профильной математике», «Постановка голоса» — любая.",
  },
  {
    n: "2",
    title: "ИИ собирает курс",
    text: "Программа по модулям, уроки с конспектами, практические задания и квизы с вариантами ответов. 15–40 секунд.",
  },
  {
    n: "3",
    title: "Получаете маркетинг-пакет",
    text: "Заголовки для объявления, посты в соцсети, цепочка писем, рекомендованная цена и УТП.",
  },
  {
    n: "4",
    title: "Продаёте под своим именем",
    text: "Открываем кабинет школы: своя страница курса, приём оплат, ученики и выплаты.",
  },
];

const SCHOOL_FEATURES = [
  {
    icon: "Palette",
    title: "Ваш бренд, не наш",
    text: "Логотип, фирменный цвет и собственный домен с бесплатным SSL. Ученики видят вашу школу.",
  },
  {
    icon: "Bot",
    title: "ИИ-наставник 24/7",
    text: "Отвечает вашим ученикам строго по вашей программе. Характер выбираете вы: наставник, строгий эксперт или коуч.",
  },
  {
    icon: "Wallet",
    title: "Оплаты и выплаты",
    text: "Приём платежей, чеки по 54-ФЗ, заявки на вывод. Всё по договору оферты.",
  },
  {
    icon: "BarChart3",
    title: "Ученики и доходы",
    text: "Кто купил, кто приглашён, сколько заработано и сколько осталось к выплате — на одном экране.",
  },
];

const FAQ = [
  {
    q: "Сколько это стоит?",
    a: `Конструктор курсов бесплатный — им можно пользоваться без регистрации. Если решите продавать через платформу, абонплаты нет: мы берём ${FEE_PERCENT}% с реальных продаж. Нет продаж — нет платежей.`,
  },
  {
    q: "Курс от ИИ — это же шаблон?",
    a: "Это рабочий черновик уровня сильного методиста: структура, конспекты, задания и квизы под вашу тему и аудиторию. Ваша экспертиза добавляется сверху — править можно всё. Экономит не качество, а недели рутины.",
  },
  {
    q: "У меня нет своего сайта и я не технарь",
    a: "Сайт не нужен. Курс получает свою страницу на платформе, её можно открыть на своём домене. Ни строчки кода, ни программиста.",
  },
  {
    q: "Кому принадлежит курс?",
    a: "Вам. Программу можно скачать в PDF и унести куда угодно — даже если решите уйти с платформы.",
  },
  {
    q: "Я веду только индивидуальные занятия. Мне это зачем?",
    a: "Готовая программа экономит подготовку к урокам, а курс в записи продаётся параллельно занятиям — доход перестаёт упираться в ваши часы.",
  },
];

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "УЧИСЬПРО для репетиторов — ИИ-конструктор курсов и своя онлайн-школа",
    serviceType: "Платформа для репетиторов и авторов курсов",
    description:
      "Репетитор собирает онлайн-курс с помощью ИИ за минуту: программа, уроки, задания, квизы и маркетинг-пакет. Продажа курсов под своим брендом без абонплаты.",
    url: CANONICAL,
    provider: { "@type": "Organization", name: "УЧИСЬПРО" },
    areaServed: "RU",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RUB",
      description: `Конструктор курсов бесплатно. Комиссия платформы ${FEE_PERCENT}% только с продаж, без абонплаты.`,
    },
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
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Репетиторам", item: CANONICAL },
    ],
  },
];

export default function ForTutors() {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Репетиторам: соберите свой онлайн-курс с ИИ за минуту"
        description={`Репетиторам и преподавателям: ИИ собирает готовый курс — программа, уроки, задания, квизы и маркетинг-пакет. Продавайте под своим брендом, без абонплаты, комиссия ${FEE_PERCENT}%.`}
        keywords="платформа для репетиторов, как создать онлайн курс, конструктор курсов, репетитору своя школа, продавать курсы онлайн, заработок репетитора"
        canonical={CANONICAL}
        jsonLd={JSON_LD}
      />

      {/* Шапка */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">
              🎓
            </div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">
              УЧИСЬПРО
            </span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">
              репетиторам
            </span>
          </Link>
          <a
            href="#start"
            className="text-sm font-bold text-violet-200 hover:text-white transition-colors"
          >
            Попробовать
          </a>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 pt-8 pb-16">
        <Breadcrumbs
          className="mb-6"
          items={[{ label: "Главная", href: "/" }, { label: "Репетиторам" }]}
        />

        {/* Hero */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name="Sparkles" size={12} className="text-violet-300" />
            <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">
              Репетиторам и преподавателям
            </span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-4 leading-tight">
            От репетитора —{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              к своей онлайн-школе
            </span>
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto mb-7">
            Назовите тему — ИИ соберёт готовый курс: программу, уроки с заданиями
            и квизами, и даже тексты для продаж. Бесплатно и без регистрации.
          </p>
          <Link to="/school-builder">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/20">
              <Icon name="Wand2" size={18} /> Собрать курс за минуту
            </span>
          </Link>
          <p className="text-white/40 text-sm mt-4">
            Ничего не нужно платить и подключать — просто попробуйте
          </p>
        </section>

        {/* Боли */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">
            Знакомо?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PAINS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-3">
                  <Icon name={p.icon} size={20} className="text-rose-200" />
                </div>
                <h3 className="font-bold mb-1.5">{p.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как работает */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-3">
            Как это работает
          </h2>
          <p className="text-white/55 text-center text-sm mb-8 max-w-xl mx-auto">
            Путь от идеи до продающегося курса — четыре шага
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 font-montserrat font-black">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Что внутри школы */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">
            Что получает ваша школа
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {SCHOOL_FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={20} className="text-violet-200" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Условия */}
        <section className="mb-14">
          <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-background to-cyan-500/10 p-6 md:p-8">
            <h2 className="font-montserrat font-black text-2xl mb-5 text-center">
              Честные условия
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  0 ₽
                </p>
                <p className="text-white/65 text-sm mt-1">
                  Конструктор курсов и вход — бесплатно
                </p>
              </div>
              <div>
                <p className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {FEE_PERCENT}%
                </p>
                <p className="text-white/65 text-sm mt-1">
                  Комиссия только с реальных продаж, без абонплаты
                </p>
              </div>
              <div>
                <p className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  54-ФЗ
                </p>
                <p className="text-white/65 text-sm mt-1">
                  Чеки, договор и выплаты — по закону
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Заявка + конструктор */}
        <section id="start" className="mb-14 grid md:grid-cols-2 gap-5 items-start">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-4">
              <Icon name="Wand2" size={24} className="text-violet-300" />
            </div>
            <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
              Сначала попробуйте
            </h3>
            <p className="text-white/60 text-sm mb-5 leading-relaxed">
              Соберите курс по своей теме прямо сейчас — без регистрации и карты.
              Результат можно скачать в PDF и оставить себе, даже если дальше вы
              с нами не пойдёте.
            </p>
            <Link to="/school-builder">
              <span className="inline-flex items-center gap-2 border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 text-white font-bold py-3 px-5 rounded-xl transition-colors">
                <Icon name="Sparkles" size={17} /> Открыть конструктор
              </span>
            </Link>
          </div>

          <TutorsLeadForm />
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">
            Частые вопросы
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <summary className="font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                  {f.q}
                  <Icon
                    name="ChevronDown"
                    size={18}
                    className="text-white/40 flex-shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="text-white/65 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Финальный CTA */}
        <section className="text-center">
          <div className="rounded-3xl border border-white/10 bg-card/60 p-6 md:p-10">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
              Ваш первый курс — сегодня вечером
            </h2>
            <p className="text-white/65 max-w-xl mx-auto mb-6">
              Одна минута на конструктор вместо недели на методичку. Посмотрите,
              что получится по вашей теме.
            </p>
            <Link to="/school-builder">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 px-7 rounded-xl hover:scale-[1.02] transition-transform">
                <Icon name="ArrowRight" size={18} /> Собрать курс бесплатно
              </span>
            </Link>
            <p className="text-white/40 text-sm mt-5">
              А ещё у нас {MINI_COURSES.length} бесплатных мини-курсов — можно
              посмотреть, как мы упаковываем материал
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
