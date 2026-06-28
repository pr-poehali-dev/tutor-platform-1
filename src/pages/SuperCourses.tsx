import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import AITeacher from "@/components/AITeacher";
import { useAccess } from "@/context/AccessContext";

const CANONICAL = "https://xn--h1agdcde2c.xn--p1ai/super-courses";

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Супер-курсы УЧИСЬПРО — физика, математика, информатика",
    description:
      "Супер-курсы уровня репетитора по физике, математике и информатике: полная школьная программа, профильный ЕГЭ, ДВИ. Уроки с ИИ-наставником и голосом.",
    url: CANONICAL,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://xn--h1agdcde2c.xn--p1ai/" },
      { "@type": "ListItem", position: 2, name: "Супер-курсы", item: CANONICAL },
    ],
  },
];

export default function SuperCourses() {
  const navigate = useNavigate();
  const { hasSubscription } = useAccess();

  const goBuy = () => navigate("/pricing?from=/super-courses");

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Супер-курсы УЧИСЬПРО — физика, математика, информатика с ИИ-наставником"
        description="Супер-курсы уровня репетитора: вся школьная программа + профильный ЕГЭ и ДВИ. Уроки с ИИ-наставником и голосом по физике, математике и информатике. Первый урок бесплатно."
        canonical={CANONICAL}
        keywords="супер-курсы, репетитор по физике, подготовка к егэ физика, математика профиль, информатика егэ, ии наставник, курсы с голосом"
        jsonLd={JSON_LD}
      />

      {/* Header bar */}
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" aria-label="Шапка сайта">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="На главную УЧИСЬПРО">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/courses" }, { label: "Супер-курсы" }]} />
          </div>
          <Link
            to="/courses"
            className="hidden md:inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <Icon name="Library" size={14} aria-hidden="true" />
            Все курсы
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-2 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Sparkles" size={14} className="text-cyan-300" />
          <span className="text-xs text-cyan-200 font-bold uppercase tracking-wider">Уровень репетитора · с голосом</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white leading-tight">
          Супер-курсы по <span className="gradient-text-purple">физике, математике</span> и информатике
        </h1>
        <p className="text-white/65 text-sm md:text-lg mt-4 max-w-2xl mx-auto">
          Полная школьная программа плюс профильный ЕГЭ и вступительные испытания технических вузов. Наставник ведёт каждый урок голосом, как живой репетитор. Первый урок каждого предмета — бесплатно.
        </p>
        {!hasSubscription && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={goBuy}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity glow-purple"
            >
              <Icon name="Crown" size={16} />
              Открыть полный доступ
            </button>
            <span className="text-white/50 text-sm">или попробуй бесплатный урок ниже</span>
          </div>
        )}
      </section>

      {/* Super courses + наставник */}
      <AITeacher showSuperCourses superHasAccess={hasSubscription} onBuySuper={goBuy} />

      <SiteFooter />
    </div>
  );
}
