import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import GraduateCard from "@/components/graduates/GraduateCard";
import { GRADUATES } from "@/components/graduates/graduatesData";

const SITE_URL = "https://учисьпро.рф";

const STATS = [
  { value: "12 000+", label: "выпускников", color: "from-purple-500 to-pink-500" },
  { value: "+27", label: "средний рост баллов ЕГЭ", color: "from-emerald-500 to-teal-500" },
  { value: "4,9", label: "средняя оценка курсов", color: "from-amber-500 to-orange-500" },
  { value: "89%", label: "поступили в выбранный вуз", color: "from-cyan-500 to-blue-500" },
];

export default function Graduates() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Галерея выпускников УЧИСЬПРО",
      description:
        "Истории учеников УЧИСЬПРО: результаты до и после прохождения курсов подготовки к ЕГЭ, ОГЭ и обучения взрослых.",
      itemListElement: GRADUATES.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${g.name} — ${g.result}`,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Галерея выпускников — реальные истории учеников | УЧИСЬПРО"
        description="Истории выпускников УЧИСЬПРО: как ученики выросли в баллах ЕГЭ и ОГЭ, поступили в вузы и освоили новые профессии. Реальные результаты до и после курсов."
        canonical={`${SITE_URL}/graduates`}
        keywords="выпускники учисьпро, отзывы учеников, результаты егэ, истории успеха, до и после курсов, поступление в вуз"
        jsonLd={jsonLd}
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-base">🎓</span>
            <span className="text-[11px] text-purple-100 font-bold uppercase tracking-wider">Галерея выпускников</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white leading-tight">
            Истории тех, кто <span className="gradient-text-purple">дошёл до цели</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base mt-4 max-w-2xl mx-auto">
            Реальные результаты наших учеников: рост баллов на ЕГЭ и ОГЭ, поступление в вузы и новые профессии.
            Каждая история — это «было → стало».
          </p>
        </section>

        {/* Цифры */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center hover:bg-white/[0.05] transition-colors"
            >
              <p className={`font-montserrat font-black text-3xl md:text-4xl bg-gradient-to-br ${s.color} bg-clip-text text-transparent leading-none`}>
                {s.value}
              </p>
              <p className="text-white/55 text-xs mt-2 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Карточки выпускников */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GRADUATES.map((g) => (
            <GraduateCard key={g.id} graduate={g} />
          ))}
        </div>

        {/* CTA */}
        <section className="mt-12">
          <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-600/15 via-fuchsia-500/8 to-cyan-500/12 p-8 md:p-10 text-center">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight">
              Следующая история — <span className="gradient-text-purple">твоя</span>
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

        <p className="text-white/35 text-[11px] text-center mt-8">
          Истории публикуются обезличенно — имя, инициалы и город, в соответствии со 152-ФЗ.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
