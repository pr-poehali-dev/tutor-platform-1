import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import BusinessLeadForm from "@/components/business/BusinessLeadForm";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const PROBLEMS: { emoji: string; text: string }[] = [
  { emoji: "😮‍💨", text: "Месяцы на запись уроков и написание программы вручную" },
  { emoji: "🧩", text: "Отдельно платформа, отдельно оплаты, отдельно рассылки — всё разрозненно" },
  { emoji: "💸", text: "Конкуренты берут абонплату и большой процент, а результат делаете вы сами" },
  { emoji: "🕐", text: "Ученики ждут ответа на вопрос сутками — падает доходимость" },
];

const PILLARS: { icon: string; title: string; desc: string; accent: string }[] = [
  {
    icon: "Sparkles",
    title: "ИИ-фабрика курсов",
    desc: "Вводите тему — искусственный интеллект за час собирает программу, уроки, тесты и даже видео с озвучкой. Вам остаётся отредактировать и запустить.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "Bot",
    title: "ИИ-преподаватель 24/7",
    desc: "У каждой школы — свой ИИ-наставник. Он отвечает ученикам круглосуточно, проверяет домашки и держит их в потоке, пока вы спите.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    icon: "Palette",
    title: "Ваш бренд, ваш домен",
    desc: "White-label: свой логотип, цвета и адрес школы. Ученики видят ваш бренд — нас в кадре нет.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: "Wallet",
    title: "Готовые деньги",
    desc: "Приём оплат, тарифы, промокоды, рассрочка и выплаты автору — из коробки. Подключается за пару кликов.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const AUDIENCE: { emoji: string; title: string; desc: string }[] = [
  { emoji: "🎤", title: "Авторам и экспертам", desc: "Запустите свою мини-школу за вечер, без техников и подрядчиков." },
  { emoji: "🏫", title: "Онлайн-школам", desc: "Перенесите курсы на одну платформу и усильте их ИИ-преподавателем." },
  { emoji: "🏢", title: "Бизнесу", desc: "Онбординг и обучение сотрудников с автопроверкой знаний." },
  { emoji: "🎓", title: "Учебным центрам", desc: "Допобразование и подготовка с прогрессом и сертификатами." },
];

const STEPS: { n: string; title: string; desc: string }[] = [
  { n: "1", title: "Опишите тему", desc: "Скажите, чему хотите учить — одной фразой." },
  { n: "2", title: "ИИ соберёт курс", desc: "Программа, уроки, тесты и видео готовы за час." },
  { n: "3", title: "Настройте бренд", desc: "Логотип, цвета, домен, цены и тарифы." },
  { n: "4", title: "Запустите продажи", desc: "Приём оплат и ИИ-наставник для учеников включены." },
];

const COMPARE: { feature: string; us: boolean; others: string }[] = [
  { feature: "ИИ создаёт курс целиком за час", us: true, others: "Всё вручную" },
  { feature: "ИИ-преподаватель для учеников 24/7", us: true, others: "Нет или чат-бот сбоку" },
  { feature: "Автопроверка домашних заданий", us: true, others: "Вручную" },
  { feature: "White-label: свой бренд и домен", us: true, others: "Часто на верхних тарифах" },
  { feature: "Приём оплат и выплаты из коробки", us: true, others: "Интеграции и доплаты" },
  { feature: "Запуск школы за один вечер", us: true, others: "Недели настройки" },
];

const TESTIMONIALS: { name: string; role: string; emoji: string; text: string }[] = [
  {
    name: "Марина К.",
    role: "автор курсов по английскому",
    emoji: "🎤",
    text: "Запускала школу три месяца на другом конструкторе и бросила. Здесь ИИ собрал программу и уроки за вечер — я только отредактировала под себя. Первые продажи пошли на той же неделе.",
  },
  {
    name: "Онлайн-школа «Логос»",
    role: "подготовка к ЕГЭ",
    emoji: "🏫",
    text: "Перенесли 8 курсов на платформу. ИИ-преподаватель закрыл боль с ответами ученикам ночью — доходимость до конца курса выросла заметно, а нам не пришлось расширять штат кураторов.",
  },
  {
    name: "Дмитрий В.",
    role: "эксперт по маркетингу",
    emoji: "💼",
    text: "Модель без абонплаты — то, что нужно на старте. Плачу процент только с реальных продаж, а не за воздух. Свой домен и логотип: ученики даже не знают, что под капотом чужая платформа.",
  },
];

const PLANS: {
  id: "start" | "pro" | "scale";
  name: string;
  price: string;
  note: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: "start",
    name: "Старт",
    price: "8%",
    note: "для авторов и экспертов",
    features: ["1 школа, свой бренд", "ИИ-генерация курсов", "Приём оплат внутри", "До 300 учеников", "Без абонплаты"],
  },
  {
    id: "pro",
    name: "Про",
    price: "5%",
    note: "для растущих школ",
    features: ["Свой домен", "ИИ-преподаватель 24/7", "Промокоды и рассрочка", "Аналитика продаж", "До 3000 учеников", "Без абонплаты"],
    highlight: true,
  },
  {
    id: "scale",
    name: "Масштаб",
    price: "3%",
    note: "для сетей и команд",
    features: ["Несколько школ", "Роли и команда", "API и интеграции", "Приоритетная поддержка", "Без лимитов", "Без абонплаты"],
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Чем вы отличаетесь от GetCourse и других конструкторов?",
    a: "Конкуренты дают пустой движок — программу, уроки и видео вы делаете сами месяцами. У нас ИИ собирает курс целиком за час и работает как преподаватель для ваших учеников. Вы получаете результат, а не только инструмент.",
  },
  {
    q: "Ученики будут видеть ваш бренд?",
    a: "Нет. Это white-label платформа: свой логотип, цвета и домен. Для учеников это ваша школа, нас в кадре нет.",
  },
  {
    q: "Как устроена оплата платформы?",
    a: "Никакой абонплаты. Мы берём только небольшой процент с ваших продаж: 8% на старте, 5% для школ и 3% для сетей. Пока школа не заработала — вы не платите ничего. Приём платежей уже входит в этот процент.",
  },
  {
    q: "Можно отредактировать то, что сгенерировал ИИ?",
    a: "Да. ИИ даёт готовую основу за минуты, а вы правите тексты, добавляете свои материалы и видео — полный контроль остаётся за вами.",
  },
  {
    q: "Нужны ли технические знания?",
    a: "Нет. Всё настраивается мышкой: тема курса, бренд, цены. Ни строчки кода.",
  },
];

export default function ForBusiness() {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Конструктор онлайн-школ на ИИ · Запустите свою школу за вечер — УЧИСЬПРО для бизнеса"
        description="White-label платформа для онлайн-школ, авторов и бизнеса. ИИ собирает курс целиком за час, работает преподавателем 24/7, приём оплат из коробки. Свой бренд и домен. Дешевле и мощнее GetCourse."
        canonical={`${SITE_URL}/for-business`}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">для бизнеса</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/school-builder"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white border border-white/15 hover:border-violet-400/50 px-4 py-2 rounded-xl transition-colors"
            >
              <Icon name="Sparkles" size={15} className="text-violet-300" /> Собрать курс
            </Link>
            <a
              href="#lead"
              className="text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform"
            >
              Получить демо
            </a>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Для бизнеса" }]} />
        </div>

        {/* Hero */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name="Sparkles" size={12} className="text-violet-300" />
            <span className="text-xs text-violet-200 font-bold uppercase tracking-wider">Платформа-конструктор для школ</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-6xl mb-5 leading-tight">
            Своя онлайн-школа{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              за один вечер
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-7">
            Вводите тему — искусственный интеллект собирает курс целиком: программу, уроки, тесты и видео. А затем работает преподавателем для ваших учеников 24/7. Ваш бренд, ваш домен, ваши деньги. Без абонплаты — платите только процент с продаж.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#lead"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <Icon name="Rocket" size={18} /> Получить демо и цену
            </a>
            <Link
              to="/school-builder"
              className="inline-flex items-center justify-center gap-2 border border-violet-400/40 bg-violet-500/10 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-violet-500/20 transition-colors"
            >
              <Icon name="Sparkles" size={18} className="text-violet-300" /> Собрать курс бесплатно
            </Link>
          </div>
        </section>

        {/* Боль */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">
            Запуск школы отнимает месяцы. Мы сжали это в вечер
          </h2>
          <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
            Знакомые проблемы каждого, кто хоть раз запускал обучение:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROBLEMS.map((p) => (
              <div key={p.text} className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                <p className="text-white/75 text-sm leading-snug">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4 столпа */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">
            Не движок, а{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">готовый результат</span>
          </h2>
          <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
            Четыре вещи, которых нет ни у одного конкурента из коробки
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-colors">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-4`}>
                  <Icon name={p.icon} size={22} className="text-white" />
                </div>
                <h3 className="font-montserrat font-black text-white text-lg mb-2">{p.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как работает */}
        <section id="how" className="mb-16 scroll-mt-20">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Как это работает</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-montserrat font-black text-white mx-auto mb-3">
                  {s.n}
                </div>
                <p className="font-bold text-white text-sm mb-1">{s.title}</p>
                <p className="text-white/55 text-xs leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Для кого */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Кому подходит</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AUDIENCE.map((a) => (
              <div key={a.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <p className="font-bold text-white text-sm mb-1">{a.title}</p>
                <p className="text-white/55 text-xs leading-snug">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Сравнение */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Почему это эталон</h2>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-3 border-b border-white/10 text-xs font-bold text-white/50">
              <div>Возможность</div>
              <div className="w-24 text-center text-violet-300">УЧИСЬПРО</div>
              <div className="w-28 text-center hidden sm:block">Другие</div>
            </div>
            {COMPARE.map((c) => (
              <div key={c.feature} className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-3 border-b border-white/5 last:border-0 items-center">
                <div className="text-white/80 text-sm leading-snug">{c.feature}</div>
                <div className="w-24 flex justify-center">
                  <Icon name="CircleCheck" size={20} className="text-emerald-400" />
                </div>
                <div className="w-28 text-center text-white/40 text-xs hidden sm:block">{c.others}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Отзывы */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Что говорят наши партнёры</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col">
                <div className="flex text-amber-400 mb-3" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name="Star" size={15} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/75 text-sm leading-relaxed flex-1 mb-4">«{t.text}»</p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/8">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center text-lg flex-shrink-0">
                    {t.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{t.name}</p>
                    <p className="text-white/45 text-xs truncate">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Тарифы */}
        <section className="mb-16">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-2">Платите, только когда зарабатываете</h2>
          <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
            Никакой абонплаты. Только процент с ваших продаж — приём платежей уже входит. Нет продаж — нет платы.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={`rounded-3xl border p-6 flex flex-col ${
                  p.highlight
                    ? "border-violet-400/50 bg-gradient-to-br from-violet-500/12 to-cyan-500/8"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {p.highlight && (
                  <span className="self-start text-[11px] font-bold uppercase tracking-wider text-violet-200 bg-violet-500/20 rounded-lg px-2 py-0.5 mb-3">
                    Популярный
                  </span>
                )}
                <h3 className="font-montserrat font-black text-white text-xl mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-montserrat font-black text-3xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{p.price}</span>
                  <span className="text-white/45 text-xs">с продаж</span>
                </div>
                <p className="text-white/70 text-sm mb-4">{p.note}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/75">
                      <Icon name="Check" size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#lead"
                  className={`inline-flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-transform hover:scale-[1.02] ${
                    p.highlight
                      ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                      : "border border-white/15 text-white/85 hover:bg-white/[0.05]"
                  }`}
                >
                  Обсудить тариф
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Форма заявки */}
        <section id="lead" className="mb-16 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">
                Соберём ваш первый курс на демо
              </h2>
              <p className="text-white/65 text-sm leading-relaxed mb-5">
                Оставьте заявку — назначим короткий созвон, покажем платформу и прямо при вас сгенерируем курс по вашей теме. Вы увидите результат за минуты и получите расчёт цены под вашу школу.
              </p>
              <ul className="space-y-3">
                {[
                  "Демо платформы под вашу нишу",
                  "Живая генерация курса на ИИ",
                  "Расчёт тарифа и комиссии",
                  "Помощь с переносом существующих курсов",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-white/80 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Check" size={14} className="text-violet-300" />
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <BusinessLeadForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Частые вопросы</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-white text-sm mb-2 flex items-start gap-2">
                  <Icon name="HelpCircle" size={16} className="text-violet-300 mt-0.5 flex-shrink-0" />
                  {f.q}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Финальный CTA */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600/25 via-fuchsia-500/15 to-cyan-600/20 p-8 md:p-12 text-center">
            <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="text-4xl mb-3">🚀</div>
              <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
                Запустите свою школу уже сегодня
              </h2>
              <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-7">
                Оставьте заявку — покажем платформу и прямо на демо соберём ваш первый курс на ИИ. Без абонплаты: платите только процент с продаж.
              </p>
              <a
                href="#lead"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold px-7 py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25"
              >
                <Icon name="Rocket" size={18} /> Получить демо и цену
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}