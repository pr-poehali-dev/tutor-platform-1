import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import PartnersLeadForm from "@/components/partners/PartnersLeadForm";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const BENEFITS = [
  {
    icon: "Bot",
    color: "text-violet-300",
    title: "ИИ-преподаватель 24/7",
    text: "Ваши ученики получают персонального наставника с голосом — он объясняет тему столько раз, сколько нужно, и не устаёт.",
  },
  {
    icon: "Sparkles",
    color: "text-fuchsia-300",
    title: "Курс собирается за час",
    text: "ИИ формирует программу, уроки и проверочные задания по вашей нише. Вам остаётся отредактировать под свой бренд.",
  },
  {
    icon: "Wallet",
    color: "text-cyan-300",
    title: "Приём оплат из коробки",
    text: "Касса, чеки и доступы подключены сразу. Не нужно интегрировать эквайринг и держать отдельного разработчика.",
  },
  {
    icon: "Palette",
    color: "text-amber-300",
    title: "Свой бренд и домен",
    text: "White-label: логотип, цвета и адрес — ваши. Ученики видят вашу школу, а не стороннюю платформу.",
  },
  {
    icon: "TrendingUp",
    color: "text-emerald-300",
    title: "Прогноз прибыли",
    text: "Калькулятор выручки и окупаемости покажет экономику школы ещё до запуска — удобно планировать рекламу.",
  },
  {
    icon: "ShieldCheck",
    color: "text-green-300",
    title: "Данные и серверы в РФ",
    text: "Работаем по 152-ФЗ, шифрование HTTPS. Ваши ученики и платежи под защитой.",
  },
];

const STEPS = [
  { n: "1", title: "Заявка", text: "Оставляете контакты — мы связываемся в течение рабочего дня." },
  { n: "2", title: "Демо и расчёт", text: "Показываем платформу и считаем экономику под вашу нишу." },
  { n: "3", title: "Перенос школы", text: "Помогаем перенести курсы, настроить бренд и оплаты." },
  { n: "4", title: "Запуск", text: "Ваша школа работает с ИИ-преподавателем и приёмом оплат." },
];

export default function Partners() {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Партнёрам и онлайн-школам · Сотрудничество с УЧИСЬПРО"
        description="Приглашаем онлайн-школы, авторов курсов и образовательный бизнес к сотрудничеству. White-label платформа с ИИ-преподавателем, конструктором курсов и приёмом оплат. Оставьте заявку — предложим формат партнёрства."
        canonical={`${SITE_URL}/partners`}
      />

      {/* Хедер */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🤝</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
            <span className="hidden sm:inline text-[11px] text-white/45 border border-white/15 rounded-lg px-2 py-0.5">партнёрам</span>
          </Link>
          <a
            href="#lead"
            className="text-sm font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:scale-[1.02] transition-transform"
          >
            Оставить заявку
          </a>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-10 pb-16">
        {/* Hero */}
        <section className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-400/30 rounded-full px-4 py-1.5 mb-5">
            <Icon name="Handshake" size={14} className="text-violet-200" />
            <span className="text-violet-100 text-xs font-bold uppercase tracking-wider">Сотрудничество</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
            Онлайн-школам — <span className="gradient-text-purple">платформа с ИИ</span> и партнёрство
          </h1>
          <p className="text-white/75 text-base md:text-lg max-w-2xl mx-auto mb-7">
            Помогаем онлайн-школам, авторам курсов и образовательному бизнесу запускать обучение
            с персональным ИИ-преподавателем, конструктором курсов и приёмом оплат — под вашим брендом.
          </p>
          <a
            href="#lead"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-violet-500/25"
          >
            <Icon name="Send" size={18} /> Обсудить сотрудничество
          </a>
        </section>

        {/* Выгоды */}
        <section className="mb-16" aria-label="Что получает школа">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">
            Что получает ваша школа
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-white/20 transition-colors"
              >
                <Icon name={b.icon} size={26} className={`${b.color} mb-3`} />
                <h3 className="font-montserrat font-bold text-white text-lg mb-1.5">{b.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как начать */}
        <section className="mb-16" aria-label="Как начать сотрудничество">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-center mb-8">
            Как начать
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-black text-white mb-3">
                  {s.n}
                </div>
                <h3 className="font-montserrat font-bold text-white text-base mb-1">{s.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Форма */}
        <section id="lead" className="scroll-mt-24 max-w-2xl mx-auto">
          <PartnersLeadForm />
        </section>

        {/* Доп. ссылка */}
        <p className="text-center text-white/50 text-sm mt-8">
          Хотите сначала увидеть платформу?{" "}
          <Link to="/for-business" className="text-violet-200 hover:text-violet-100 underline underline-offset-2 font-bold">
            Смотреть возможности для бизнеса
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
