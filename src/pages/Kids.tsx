import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { AGES, AREAS, ACTIVITIES } from "@/components/kids/kidsData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const PRINCIPLES = [
  {
    icon: "Shield",
    title: "Без рекламы и автоплатежей",
    text: "Ребёнок защищён: никаких всплывающих окон, никаких подписок, которые сами продлеваются. Спокойно даём планшет в руки.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: "Clock",
    title: "Контроль экранного времени",
    text: "Для каждого возраста — рекомендованное время и таймер. Когда оно вышло — игра ставится на паузу, появляется напоминание отдохнуть.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: "Users",
    title: "Родитель — главный участник",
    text: "Каждое занятие показывает: что развивает, как играть, на что обратить внимание. Вы видите прогресс ребёнка в личном кабинете.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: "Heart",
    title: "По методикам Монтессори и Никитиных",
    text: "Всё, что предлагаем — основано на проверенных подходах. От простого к сложному, через игру, в комфортном темпе.",
    color: "from-rose-500 to-red-500",
  },
];

const REVIEWS = [
  {
    name: "Алина, мама Софии (3 года)",
    avatar: "👩",
    text: "Дочка стала сама подходить и просить «давай поиграем». Через месяц освоила цвета, формы и счёт до 5. И никакого мультика весь день — это огромный плюс.",
  },
  {
    name: "Сергей, папа Артёма (5 лет)",
    avatar: "👨",
    text: "Готовимся к школе. Сын читает по слогам, считает до 20. Главное — занимаемся вместе, 15 минут в день. Не вижу обычной «развивашки», вижу настоящие занятия.",
  },
  {
    name: "Марина, мама Леры (2 года)",
    avatar: "👩‍🦰",
    text: "Очень понравились пальчиковые игры и сортеры. Лера повторяет всё за мной, говорит уже 200 слов. Спасибо, что есть советы для родителя — раньше не знала, как играть «правильно».",
  },
];

export default function KidsLanding() {
  const totalActivities = ACTIVITIES.length;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "УЧИСЬПРО Малыш — развивающие занятия для детей 1–6 лет",
      description:
        "Развивающий модуль для дошкольников от 1 года: речь, логика, моторика, окружающий мир, творчество, эмоции. По методикам Монтессори, Никитиных, Домана.",
      provider: {
        "@type": "EducationalOrganization",
        name: "УЧИСЬПРО",
        url: SITE_URL,
      },
      inLanguage: "ru",
      educationalLevel: "Preschool",
      audience: { "@type": "EducationalAudience", educationalRole: "child" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "С какого возраста подходит УЧИСЬПРО Малыш?",
          acceptedAnswer: { "@type": "Answer", text: "С 1 года. У нас 5 возрастных ступеней до 6 лет, каждая со своими занятиями." },
        },
        {
          "@type": "Question",
          name: "Сколько времени ребёнок проводит у экрана?",
          acceptedAnswer: { "@type": "Answer", text: "Для 1–2 лет — до 10 минут в день, для 5–6 лет — до 1 часа. Все занятия предполагают участие взрослого." },
        },
        {
          "@type": "Question",
          name: "Какие методики используются?",
          acceptedAnswer: { "@type": "Answer", text: "Монтессори, методика Никитиных, Домана, Железновых. Развитие через игру, в темпе ребёнка." },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="УЧИСЬПРО Малыш — развивающие занятия для детей от 1 года до 6 лет"
        description="Развивающий модуль для дошкольников: речь, логика, моторика, окружающий мир, творчество, эмоции. По методикам Монтессори и Никитиных. 5 возрастных ступеней, контроль экранного времени, советы родителям."
        canonical={`${SITE_URL}/kids`}
        keywords="развитие детей 1 год, развивашки для малышей, развивающие занятия дошкольникам, монтессори онлайн, подготовка к школе 5 лет, развитие речи ребёнка, развитие моторики, занятия с детьми 2 года, 3 года, 4 года"
        jsonLd={jsonLd}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: (i % 3) + 1 + "px",
                 height: (i % 3) + 1 + "px",
                 left: ((i * 137.5) % 100) + "%",
                 top: ((i * 97.3) % 100) + "%",
                 opacity: 0.1 + (i % 4) * 0.06,
               }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Малыш" }]} />
          </div>
          <Link
            to="/pricing"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} />
            Тарифы
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-base">🐣</span>
              <span className="text-sm text-pink-200 font-bold uppercase tracking-wider">Малыш · от 1 года</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl lg:text-6xl text-white mb-5 leading-[1.05]">
              УЧИСЬПРО <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">Малыш</span>
            </h1>
            <p className="text-white/75 text-lg md:text-xl mb-3 leading-snug">
              Развивающие занятия для детей <b>от 1 года до 6 лет</b>.
            </p>
            <p className="text-white/55 text-base md:text-lg leading-relaxed max-w-xl mb-7">
              По методикам Монтессори, Никитиных и Домана. Без рекламы, с контролем экранного времени и подробными подсказками для родителя.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <a
                href="#ages"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-base font-bold px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl shadow-pink-500/20"
              >
                <Icon name="Rocket" size={16} />
                Выбрать возраст
              </a>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 text-white text-base font-semibold px-6 py-3.5 rounded-2xl transition-colors"
              >
                <Icon name="Sparkles" size={16} />
                Тарифы
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/55 text-sm">
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> {totalActivities}+ занятий</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> 5 возрастов</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> 6 направлений</span>
              <span className="flex items-center gap-1.5"><Icon name="CheckCircle2" size={14} className="text-emerald-400" /> Без рекламы</span>
            </div>
          </div>

          {/* Декоративная иллюстрация: облако с цветными зверушками */}
          <div className="relative aspect-square max-w-md mx-auto md:ml-auto w-full">
            <div className="absolute -inset-4 bg-gradient-to-br from-pink-400/30 via-rose-400/30 to-orange-400/30 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400 rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl p-8 grid grid-cols-3 gap-4 items-center justify-items-center aspect-square">
              {AGES.map((a) => (
                <Link
                  key={a.slug}
                  to={`/kids/${a.slug}`}
                  className="group flex flex-col items-center hover:scale-110 transition-transform"
                  style={{ animation: `float ${3 + AGES.indexOf(a) * 0.3}s ease-in-out infinite alternate` }}
                >
                  <div className="text-5xl md:text-6xl mb-1 drop-shadow-lg">{a.emoji}</div>
                  <p className="text-white text-xs font-black bg-black/30 backdrop-blur px-2 py-0.5 rounded-full">{a.shortLabel}</p>
                </Link>
              ))}
              <div className="text-4xl md:text-5xl">⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Возрастные ступени */}
      <section id="ages" className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Возрастные ступени</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
          Выбери возраст ребёнка
        </h2>
        <p className="text-white/55 text-base text-center max-w-2xl mx-auto mb-10">
          Каждая ступень — это занятия, подобранные под актуальные задачи развития. Не торопимся, не пропускаем.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AGES.map((a) => {
            const count = ACTIVITIES.filter((act) => act.ageSlug === a.slug).length;
            return (
              <Link
                key={a.slug}
                to={`/kids/${a.slug}`}
                className="group relative bg-card border border-white/10 rounded-3xl overflow-hidden hover:border-white/25 hover:translate-y-[-4px] transition-all"
              >
                <div className={`h-2 bg-gradient-to-r ${a.color}`} />
                <div className="p-5 text-center">
                  <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${a.color} flex items-center justify-center text-5xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {a.emoji}
                  </div>
                  <p className="font-montserrat font-black text-white text-xl mb-1">{a.label}</p>
                  <p className="text-white/65 text-xs mb-3 italic">«{a.motto}»</p>
                  <div className="inline-flex items-center gap-1 text-[10px] text-white/45 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                    <Icon name="Sparkles" size={10} />
                    {count} занятий
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Направления развития */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Что развиваем</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
          6 направлений развития
        </h2>
        <p className="text-white/55 text-base text-center max-w-2xl mx-auto mb-10">
          Гармоничное развитие — это когда не только буквы и счёт, но и эмоции, моторика, творчество.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AREAS.map((a) => (
            <div key={a.id} className="bg-card border border-white/10 rounded-3xl p-5 hover:border-white/20 transition-colors">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {a.emoji}
              </div>
              <h3 className="font-montserrat font-black text-white text-lg mb-2">{a.label}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Принципы */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Принципы</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-10">
          Почему родители выбирают нас
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bg-card border border-white/10 rounded-3xl p-6 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0`}>
                <Icon name={p.icon} size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-montserrat font-black text-white text-lg mb-1.5">{p.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Отзывы */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">Отзывы родителей</p>
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-10">
          Что говорят семьи
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-card border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/30 to-rose-500/30 border border-pink-500/30 flex items-center justify-center text-2xl">
                  {r.avatar}
                </div>
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">{r.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon key={s} name="Star" size={11} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">«{r.text}»</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 py-12">
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold mb-2 text-center">FAQ</p>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white text-center mb-8">Частые вопросы</h2>

        <div className="space-y-3">
          {[
            { q: "С какого возраста подходит?", a: "С 1 года. У нас 5 возрастных ступеней, каждая со своими занятиями, подобранными по нормам развития." },
            { q: "Сколько времени проводить с приложением?", a: "Зависит от возраста: от 10 минут в день (1–2 года) до 1 часа (5–6 лет). Все занятия предполагают участие взрослого." },
            { q: "Нужно ли покупать материалы?", a: "Большинство занятий — с тем, что уже есть дома: игрушки, карточки, пластилин. Дополнительные пособия по желанию." },
            { q: "Подходит для подготовки к школе?", a: "Да, ступень 5–6 лет полностью соответствует требованиям к будущим первоклассникам: чтение по слогам, счёт до 10, звуковой анализ." },
            { q: "Что делать, если ребёнок не хочет заниматься?", a: "Не настаивайте. Дошкольное обучение — только через интерес. Попробуйте другую игру, поиграйте сами, дайте ребёнку выбор." },
          ].map((f, i) => (
            <details key={i} className="group bg-card border border-white/10 rounded-2xl overflow-hidden">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-5 hover:bg-white/[0.03] transition-colors">
                <span className="font-montserrat font-bold text-white text-sm md:text-base">{f.q}</span>
                <Icon name="Plus" size={18} className="text-white/55 flex-shrink-0 group-open:rotate-45 transition-transform" />
              </summary>
              <div className="px-5 pb-5 text-white/65 text-sm leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="text-6xl mb-4">🐣</div>
            <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
              Начни первое занятие сегодня
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-6 max-w-xl mx-auto">
              Бесплатно: 1 занятие для каждой возрастной ступени. Без регистрации и оплаты.
            </p>
            <a
              href="#ages"
              className="inline-flex items-center gap-2 bg-white text-rose-600 text-sm md:text-base font-black px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform shadow-2xl"
            >
              <Icon name="Rocket" size={16} />
              Выбрать возраст
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
