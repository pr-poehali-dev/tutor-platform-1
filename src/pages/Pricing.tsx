import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import Icon from "@/components/ui/icon";
import PricingPlans from "@/components/pricing/PricingPlans";
import PricingCompare from "@/components/pricing/PricingCompare";
import PricingLeadForm from "@/components/pricing/PricingLeadForm";

const SITE_URL = "https://учисьпро.рф";

const FAQ = [
  {
    q: "Что такое репетитор по подписке?",
    a: "Вы платите фиксированную сумму в месяц и занимаетесь сколько нужно — по всем предметам сразу. Не нужно оплачивать каждое занятие отдельно и подстраиваться под расписание преподавателя.",
  },
  {
    q: "Сколько стоит подписка?",
    a: "1 490 ₽ в месяц или 9 990 ₽ за год — это около 832 ₽ в месяц. В подписку входят все предметы, безлимит занятий и проверка домашних заданий.",
  },
  {
    q: "Чем это отличается от обычного репетитора?",
    a: "Занятия доступны круглосуточно, без записи и без привязки к расписанию. Все предметы входят в одну оплату. Пропущенное занятие не сгорает. Но живого преподавателя подписка не заменяет полностью — это разговор с ИИ-наставником.",
  },
  {
    q: "Можно ли отменить подписку?",
    a: "Да, в любой момент из личного кабинета. Доступ сохраняется до конца оплаченного периода, автопродление отключается.",
  },
  {
    q: "Есть ли бесплатный доступ?",
    a: "Да. Первый урок каждого предмета, проверка домашних заданий по фото и более 30 мини-курсов доступны бесплатно и без подписки.",
  },
  {
    q: "А если нужен только один предмет?",
    a: "Можно купить предмет разово за 1 990 ₽ — без ежемесячной оплаты, доступ остаётся навсегда. Это выгоднее, если предмет действительно один.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const PRODUCT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Репетитор по подписке — УЧИСЬПРО",
  description:
    "Онлайн-репетитор по подписке: все школьные предметы, безлимит занятий, проверка домашних заданий и подготовка к ЕГЭ и ОГЭ за фиксированную плату в месяц.",
  brand: { "@type": "Brand", name: "УЧИСЬПРО" },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "RUB",
    lowPrice: "1490",
    highPrice: "9990",
    offerCount: "2",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/pricing`,
  },
};

const BENEFITS = [
  {
    icon: "Infinity",
    title: "Занятий сколько нужно",
    text: "Никакого счётчика уроков. Можно заниматься каждый день или взять паузу — цена не меняется.",
  },
  {
    icon: "Clock",
    title: "Круглосуточно",
    text: "Не нужно записываться и подстраиваться под расписание. Урок начинается тогда, когда вам удобно.",
  },
  {
    icon: "Layers",
    title: "Все предметы сразу",
    text: "Математика, физика, информатика, химия и остальные — входят в одну оплату, а не в отдельные счета.",
  },
  {
    icon: "Camera",
    title: "Домашка по фото",
    text: "Сфотографируйте задание — наставник проверит и объяснит, где ошибка и как её исправить.",
  },
  {
    icon: "Mic",
    title: "Голосом, как с человеком",
    text: "Наставник говорит и слушает. Можно переспросить, попросить объяснить проще или разобрать ещё раз.",
  },
  {
    icon: "Wallet",
    title: "Отмена в любой момент",
    text: "Не понравилось — отключаете автопродление в кабинете. Никаких договоров и удержаний.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-mesh">
      <Seo
        title="Репетитор по подписке — 1490 ₽/мес за все предметы | УЧИСЬПРО"
        description="Онлайн-репетитор по подписке: все школьные предметы, безлимит занятий и проверка домашки за 1490 ₽ в месяц. Дешевле обычного репетитора, занятия круглосуточно. Первый урок бесплатно."
        canonical={`${SITE_URL}/pricing`}
        keywords="репетитор по подписке, каталог репетитор по подписке, онлайн репетитор абонемент, репетитор помесячно, безлимитный репетитор, сколько стоит онлайн репетитор"
        jsonLd={[FAQ_JSON_LD, PRODUCT_JSON_LD]}
      />

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Репетитор по подписке" }]} />
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-200 mb-6">
          <Icon name="Infinity" size={15} />
          Безлимит занятий по всем предметам
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white leading-tight mb-5">
          Репетитор по подписке
          <br />
          <span className="gradient-text-purple">за 1 490 ₽ в месяц</span>
        </h1>
        <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          Одна оплата вместо счёта за каждое занятие. Все школьные предметы, занятия
          круглосуточно и проверка домашних заданий — без ограничений по количеству.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/checkout/tutor"
            className="rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-4 px-8 hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2 glow-purple"
          >
            <Icon name="Rocket" size={18} />
            Оформить подписку
          </Link>
          <Link
            to="/free-courses"
            className="rounded-2xl border border-white/15 bg-white/[0.04] text-white font-semibold py-4 px-8 hover:border-white/30 transition-colors inline-flex items-center justify-center gap-2"
          >
            Сначала попробовать бесплатно
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-7 text-sm text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Check" size={14} className="text-emerald-400" />
            Первый урок бесплатно
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Check" size={14} className="text-emerald-400" />
            Отмена в любой момент
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Check" size={14} className="text-emerald-400" />
            Без договоров
          </span>
        </div>
      </section>

      {/* Что входит */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-3">
          Что входит в подписку
        </h2>
        <p className="text-white/60 text-center max-w-2xl mx-auto mb-10">
          Всё перечисленное — за одну фиксированную плату, без доплат за предметы и занятия.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 card-hover"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/25 to-cyan-500/25 border border-white/10 flex items-center justify-center mb-3">
                <Icon name={b.icon} size={20} className="text-purple-200" />
              </div>
              <div className="text-white font-semibold mb-1.5">{b.title}</div>
              <p className="text-white/60 text-sm leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingCompare />
      <PricingPlans />

      {/* Форма заявки */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <PricingLeadForm />
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="font-montserrat font-black text-2xl md:text-4xl text-white text-center mb-10">
          Частые вопросы
        </h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-white font-semibold">
                {f.q}
                <Icon
                  name="ChevronDown"
                  size={18}
                  className="text-white/40 flex-shrink-0 group-open:rotate-180 transition-transform"
                />
              </summary>
              <p className="text-white/70 leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/50 text-sm">
            Нужен курс, которого нет в каталоге?{" "}
            <Link to="/order" className="text-purple-300 hover:text-purple-200 underline">
              Соберём индивидуальную программу
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
