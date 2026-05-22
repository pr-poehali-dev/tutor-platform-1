import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";

const CoursesLibrary = lazy(() => import("@/components/CoursesLibrary"));
const CoursesSection = lazy(() => import("@/components/CoursesSection"));

const SectionSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-12">
    <div className="rounded-3xl border border-white/8 bg-white/[0.02] h-64 animate-pulse" />
  </div>
);

export default function CoursesPage() {
  const [activeCourse, setActiveCourse] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Каталог курсов УЧИСЬПРО — школьная программа 1–11 классов, ОГЭ и ЕГЭ"
        description="Полный каталог онлайн-курсов УЧИСЬПРО: математика, физика, русский, английский и другие предметы для 1–11 классов, подготовка к ОГЭ и ЕГЭ. Доступ по подписке или разовая покупка."
        canonical="https://xn--h1agdcde2c.xn--p1ai/courses"
        keywords="каталог курсов, онлайн курсы школьникам, курсы 1-11 классы, подготовка к егэ курсы, подготовка к огэ курсы, математика онлайн, физика онлайн, английский онлайн"
      />

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.12 + (i % 4) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="border-b border-white/5 bg-background/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог курсов" }]} />
          <Link
            to="/pricing"
            className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Icon name="Sparkles" size={14} />
            Тарифы
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>

        <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-5">
          <Icon name="Library" size={14} className="text-purple-300" />
          <span className="text-sm text-purple-300 font-medium">Каталог курсов</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4 leading-tight">
          Все курсы <span className="gradient-text-purple">УЧИСЬПРО</span>
        </h1>
        <p className="text-white/55 text-base md:text-lg max-w-2xl">
          Школьная программа 1–11 классов, подготовка к ОГЭ и ЕГЭ. Выбирай предмет, проходи диагностику и получай индивидуальный маршрут от ИИ-преподавателя.
        </p>
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <CoursesLibrary />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CoursesSection activeCourse={activeCourse} onSetActiveCourse={setActiveCourse} />
      </Suspense>

      <SiteFooter />
    </div>
  );
}
