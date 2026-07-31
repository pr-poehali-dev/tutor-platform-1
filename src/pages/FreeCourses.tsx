import { useMemo } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import FreeVersionCard from "@/components/courses/FreeVersionCard";
import { COURSES, getCoursePrice } from "@/components/courses/coursesData";

const SITE_URL = "https://учисьпро.рф";

export default function FreeCourses() {
  // Берём платные курсы (цена > 0, не бесплатные навсегда) и показываем их
  // бесплатные «облегчённые» версии. Сортируем по популярности и ограничиваем.
  const courses = useMemo(() => {
    return COURSES.filter((c) => getCoursePrice(c) > 0 && !c.freeForever)
      .sort((a, b) => (b.isHit ? 1 : 0) - (a.isHit ? 1 : 0) || b.students - a.students)
      .slice(0, 12);
  }, []);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Бесплатные версии курсов УЧИСЬПРО",
      description:
        "Бесплатные облегчённые версии платных курсов: первые уроки открыты без оплаты, чтобы попробовать перед покупкой полного курса.",
      itemListElement: courses.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.title,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Бесплатные версии курсов — попробуй перед покупкой | УЧИСЬПРО"
        description="Бесплатные облегчённые версии платных курсов УЧИСЬПРО. Первые уроки открыты без оплаты и карты — попробуй формат и содержание, а потом решай, покупать ли полный курс."
        canonical={`${SITE_URL}/free-courses`}
        keywords="бесплатные курсы, бесплатные уроки, пробный курс, курсы бесплатно, попробовать курс, демо курса"
        jsonLd={jsonLd}
      />

      {/* Top bar */}
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg">🎁</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Бесплатные версии" }]} />
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 hover:scale-[1.02] text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-500/25 transition-transform"
          >
            <Icon name="LayoutGrid" size={14} />
            Все курсы
          </Link>
        </div>
      </div>

      <div className="md:hidden max-w-7xl mx-auto px-4 pt-3">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Бесплатные версии" }]} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-6 pb-16">
        {/* HERO */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
            <Icon name="Gift" size={14} className="text-emerald-300" />
            <span className="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">Бесплатный старт</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white leading-tight">
            Попробуй курс <span className="gradient-text-purple">бесплатно</span> — реши потом
          </h1>
          <p className="text-white/60 text-sm md:text-base mt-4 max-w-2xl mx-auto">
            У каждого платного курса есть бесплатная версия: первые уроки открыты без оплаты и карты.
            Посмотри формат и содержание, а полный курс купишь, только если понравится.
          </p>
        </section>

        {/* Как это работает */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: "Unlock", title: "Первые уроки открыты", text: "Заходишь и учишься сразу — без оплаты и регистрации карты." },
            { icon: "Eye", title: "Видишь всю программу", text: "Полный список уроков — понятно, что будет в платной версии." },
            { icon: "Rocket", title: "Продолжаешь, если зашло", text: "Понравилось — открываешь полный курс одним касанием." },
          ].map((s) => (
            <div key={s.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-3">
                <Icon name={s.icon} size={20} className="text-emerald-300" />
              </div>
              <p className="font-montserrat font-bold text-white text-sm mb-1">{s.title}</p>
              <p className="text-white/55 text-xs leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Сетка бесплатных версий */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <FreeVersionCard key={c.id} course={c} freeLessons={2} />
          ))}
        </div>

        {/* CTA */}
        <section className="mt-12">
          <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-600/15 via-fuchsia-500/8 to-cyan-500/12 p-8 md:p-10 text-center">
            <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white leading-tight">
              Хочешь <span className="gradient-text-purple">больше курсов</span>?
            </h2>
            <p className="text-white/65 text-sm md:text-base mt-3 max-w-xl mx-auto">
              В каталоге сотни курсов для школьников и взрослых. У каждого — бесплатное начало.
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-6 py-3.5 rounded-xl hover:scale-[1.03] transition-transform"
            >
              Открыть каталог курсов <Icon name="ChevronRight" size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
