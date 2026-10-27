import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";

const SITE_URL = "https://учисьпро.рф";

const STEPS = [
  { icon: "Gift", title: "Бесплатный месяц", text: "Первым 20 семьям — месяц ИИ-репетитора бесплатно в обмен на честный отзыв." },
  { icon: "ChartLine", title: "Фиксируем «было»", text: "В начале — пробная работа. Через 2–3 месяца — повторная, чтобы видеть реальный рост." },
  { icon: "MessageSquareHeart", title: "Публикуем как есть", text: "Только с согласия семьи, обезличенно по 152-ФЗ. Хорошие и критичные отзывы — одинаково." },
];

export default function Graduates() {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Истории учеников — скоро | УЧИСЬПРО"
        description="Мы публикуем только подтверждённые истории учеников. Первые появятся после первых выпускников — присоединяйтесь к программе честных отзывов."
        canonical={`${SITE_URL}/graduates`}
        keywords="выпускники учисьпро, отзывы учеников, результаты егэ, истории успеха, до и после курсов, поступление в вуз"
        noindex
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🎓</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Выпускники" }]} />
          </div>
          <Link
            to="/tutor"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 hover:scale-[1.02] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-500/25 transition-transform"
          >
            <Icon name="Sparkles" size={14} />
            Начать учиться
          </Link>
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Выпускники" }]} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-6 pb-16">
        {/* HERO */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
            <Icon name="BadgeCheck" size={14} className="text-emerald-300" />
            <span className="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">Только проверенные истории</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white leading-tight">
            Истории учеников <span className="gradient-text-purple">появятся здесь</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base mt-4 max-w-2xl mx-auto">
            Платформа запущена в 2026 году. Мы не публикуем придуманные отзывы и баллы — только подтверждённые результаты
            с согласия семей. Первые истории появятся после первых выпускников.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <Icon name={s.icon} size={22} className="text-purple-300 mb-3" />
              <p className="font-bold text-white mb-1.5">{s.title}</p>
              <p className="text-white/65 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-4">
          <Link to="/contacts" className="inline-flex items-center gap-1.5 text-sm text-purple-300 hover:underline">
            Хочу участвовать в программе честных отзывов <Icon name="ChevronRight" size={14} />
          </Link>
        </div>

        {/* CTA */}
        <section className="mt-12">
          <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-600/15 via-fuchsia-500/8 to-cyan-500/12 p-8 md:p-10 text-center">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight">
              Станьте одной из <span className="gradient-text-purple">первых историй</span>
            </h2>
            <p className="text-white/65 text-sm md:text-base mt-3 max-w-xl mx-auto">
              Первый урок бесплатно. Персональный ИИ-репетитор, разбор домашки и подготовка к экзаменам — всё в одном месте.
            </p>
            <Link
              to="/tutor"
              className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-6 py-3.5 rounded-xl hover:scale-[1.03] transition-transform"
            >
              Начать бесплатно <Icon name="ChevronRight" size={16} />
            </Link>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
