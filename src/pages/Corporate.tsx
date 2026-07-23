import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import CorporateLeadForm from "@/components/business/CorporateLeadForm";

const SITE_URL = "https://учисьпро.рф";
const HERO_IMG = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/3f02630b-145c-4b29-826d-48ad3253085f.jpg";

const PAINS = [
  { icon: "Clock", title: "Новичок «входит» месяцами", text: "Пока сотрудник разберётся в сложной линейке — компания теряет продажи и время наставников." },
  { icon: "BookX", title: "Зубрёжка вместо понимания", text: "Люди помнят названия, но не умеют подобрать решение под реальную задачу клиента." },
  { icon: "TrendingDown", title: "Возражения рушат сделки", text: "«Дорого» и «у конкурентов дешевле» закрывают продажу, потому что менеджер не продаёт ценность." },
  { icon: "RefreshCcw", title: "Обучение не масштабируется", text: "Линейка обновляется, а материалы устаревают. Переобучать всю команду каждый раз — дорого." },
];

const MODULES = [
  { n: "01", title: "Архитектура линейки", text: "Логика категорий и «ядро решения» вместо заучивания названий.", h: "2 ч" },
  { n: "02", title: "Ключевые линейки", text: "Назначение, преимущества, ограничения и типичные ошибки подбора.", h: "4 ч" },
  { n: "03", title: "Подбор под задачу", text: "Читаем ТЗ клиента и собираем совместимое решение под объект и бюджет.", h: "6 ч" },
  { n: "04", title: "Работа с возражениями", text: "Переводим «дорого» в разговор о ценности: срок службы, экономия, монтаж.", h: "4 ч" },
  { n: "05", title: "Автоматизация подбора", text: "Шаблоны КП и спецификаций, CRM и промпты для ИИ — на 20–30% быстрее.", h: "4 ч" },
  { n: "06", title: "Контроль и развитие", text: "Тесты, разбор ошибок, план обновления знаний под новые продукты.", h: "2 ч" },
];

const METRICS = [
  { value: "80%+", label: "правильных ответов в тестах на знание продуктов" },
  { value: "−20–30%", label: "времени на подготовку коммерческого предложения" },
  { value: "4 недели", label: "до готовности сотрудника вместо месяцев онбординга" },
  { value: "24/7", label: "ИИ-тренер отвечает и разбирает кейсы в любое время" },
];

const HOW = [
  { icon: "ClipboardList", title: "Аудит линейки", text: "Изучаем ваш ассортимент, типичные сделки и боли команды продаж." },
  { icon: "Wand2", title: "Сборка курса на ИИ", text: "Готовим программу и уроки под ваши продукты — быстро и с обновлением." },
  { icon: "Users", title: "Обучение команды", text: "Сотрудники учатся с ИИ-тренером: теория, практика, кейсы, озвучка." },
  { icon: "BarChart3", title: "Контроль результата", text: "Дашборд прогресса, тесты и понятный критерий «готов к работе»." },
];

const FAQ = [
  { q: "Можно ли сделать курс под нашу продуктовую линейку?", a: "Да. «Мастер продукта» — это шаблон, который наполняется вашими продуктами, кейсами и сценариями. Мы адаптируем программу под вашу отрасль: стройматериалы, оборудование, инженерные системы и другие." },
  { q: "Как быстро обновлять курс при выходе новых продуктов?", a: "Курс собирается на ИИ, поэтому добавить новую линейку или обновить характеристики можно быстро — без пересъёмки видео и переверстки материалов." },
  { q: "Подходит ли для онбординга новичков?", a: "Да, это один из основных сценариев. Новый сотрудник проходит путь от логики каталога до самостоятельного подбора решения под ТЗ за 4 недели." },
  { q: "Как измеряется результат обучения?", a: "Тесты на знание продуктов, разбор кейсов, скорость подготовки КП и доля закрытых возражений. Руководитель видит прогресс каждого сотрудника на дашборде." },
  { q: "Сколько это стоит?", a: "Стоимость зависит от размера команды и объёма адаптации под ваши продукты. Оставьте заявку — покажем демо и подготовим расчёт под вашу задачу." },
];

function Header() {
  return (
    <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-lg">🏭</div>
          <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">для компаний</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/courses?subject=sales"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white border border-white/15 hover:border-amber-400/50 px-4 py-2 rounded-xl transition-colors"
          >
            <Icon name="BookOpen" size={15} className="text-amber-300" /> Курс в каталоге
          </Link>
          <a
            href="#lead"
            className="text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform"
          >
            Получить демо
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Corporate() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Корпоративное обучение сотрудников на ИИ · Продуктовая линейка для продаж — УЧИСЬПРО"
        description="Обучаем отделы продаж и новых сотрудников вашей продуктовой линейке. ИИ-тренер, практика на реальных кейсах, автоматизация КП и работа с возражениями. Онбординг за 4 недели, масштабируется на всю команду."
        canonical={`${SITE_URL}/corporate`}
        image={HERO_IMG}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <Header />

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16">
        {/* HERO */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-20">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-amber-200 bg-amber-500/15 border border-amber-500/25 rounded-lg px-3 py-1 mb-4">
              <Icon name="Building2" size={14} /> Корпоративное обучение
            </span>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-[1.05] mb-4">
              Ваши сотрудники <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">уверенно продают</span> вашу линейку
            </h1>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">
              Обучаем менеджеров, консультантов и новичков вашей продуктовой линейке — не «зубрить названия», а подбирать решение под задачу клиента. ИИ-тренер, практика на реальных кейсах и автоматизация продаж.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#lead"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3.5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/25"
              >
                <Icon name="Send" size={18} /> Оставить заявку
              </a>
              <a
                href="#program"
                className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/85 font-bold px-6 py-3.5 rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                <Icon name="ListChecks" size={18} /> Смотреть программу
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-3xl rounded-full" aria-hidden="true" />
            <img
              src={HERO_IMG}
              alt="Корпоративное обучение отдела продаж"
              className="relative w-full rounded-3xl border border-white/10 shadow-2xl"
            />
          </div>
        </section>

        {/* БОЛИ */}
        <section className="mb-20">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-3">Знакомые проблемы?</h2>
          <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
            У производителей со сложным ассортиментом обучение продажам почти всегда упирается в одно и то же.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {PAINS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name={p.icon} size={20} className="text-rose-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">{p.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ПРОГРАММА */}
        <section id="program" className="mb-20 scroll-mt-20">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-3">Программа курса «Мастер продукта»</h2>
          <p className="text-white/55 text-center text-sm max-w-xl mx-auto mb-8">
            6 модулей, 20–24 академических часа: 30% теории и 70% практики. Адаптируется под вашу линейку.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((m) => (
              <div key={m.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-400/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-montserrat font-black text-2xl bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{m.n}</span>
                  <span className="text-[11px] font-bold text-amber-200 bg-amber-500/15 rounded-lg px-2 py-0.5">{m.h}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-1.5">{m.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/courses?subject=sales" className="inline-flex items-center gap-1.5 text-amber-300 text-sm font-bold hover:underline">
              Открыть курс в каталоге <Icon name="ArrowRight" size={15} />
            </Link>
          </div>
        </section>

        {/* МЕТРИКИ */}
        <section className="mb-20">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/[0.08] to-amber-500/[0.05] p-8 md:p-10">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Измеримый результат</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {METRICS.map((m) => (
                <div key={m.label} className="text-center">
                  <div className="font-montserrat font-black text-3xl md:text-4xl bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                    {m.value}
                  </div>
                  <p className="text-white/60 text-xs md:text-sm leading-snug">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* КАК ВНЕДРЯЕМ */}
        <section className="mb-20">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Как это работает</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW.map((h, i) => (
              <div key={h.title} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-3">
                  <Icon name={h.icon} size={20} className="text-amber-300" />
                </div>
                <span className="absolute top-5 right-5 text-white/20 font-montserrat font-black text-xl">{i + 1}</span>
                <h3 className="font-bold text-white text-base mb-1.5">{h.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{h.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* КЕЙС-ЦИТАТА */}
        <section className="mb-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center max-w-3xl mx-auto">
            <Icon name="Quote" size={32} className="text-amber-400/50 mx-auto mb-4" />
            <p className="text-white/85 text-lg md:text-xl leading-relaxed font-medium mb-4">
              «Раньше новый менеджер входил в ассортимент месяцами. Теперь за 4 недели уверенно собирает решение под ТЗ. Блок автоматизации КП реально экономит время команды.»
            </p>
            <p className="text-white/50 text-sm">Руководитель отдела продаж · производитель стройматериалов</p>
          </div>
        </section>

        {/* ФОРМА ЗАЯВКИ */}
        <section id="lead" className="mb-20 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h2 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Обсудим обучение вашей команды</h2>
              <p className="text-white/65 text-sm leading-relaxed mb-5">
                Оставьте заявку — покажем демо, соберём пилотный курс по вашему продукту и подготовим расчёт внедрения под размер команды.
              </p>
              <ul className="space-y-3">
                {[
                  "Демо платформы и ИИ-тренера",
                  "Пилотный курс под вашу линейку",
                  "Расчёт внедрения под команду",
                  "Дашборд прогресса и тесты для HR",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-white/80 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Check" size={14} className="text-amber-300" />
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <CorporateLeadForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">Частые вопросы</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ.map((f) => (
              <div key={f.q} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold text-white text-sm mb-2 flex items-start gap-2">
                  <Icon name="HelpCircle" size={16} className="text-amber-300 mt-0.5 flex-shrink-0" />
                  {f.q}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ФИНАЛЬНЫЙ CTA */}
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-orange-600/25 via-amber-500/15 to-orange-600/20 p-8 md:p-12 text-center">
            <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="text-4xl mb-3">🏭</div>
              <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white mb-3 leading-tight">
                Обучите команду продавать вашу линейку
              </h2>
              <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-7">
                Оставьте заявку — покажем демо и соберём пилотный курс по вашему продукту. Масштабируется на всю команду и обновляется под новые продукты.
              </p>
              <a
                href="#lead"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-7 py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/25"
              >
                <Icon name="Send" size={18} /> Получить демо и расчёт
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
