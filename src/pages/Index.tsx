import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StarsBackground from "@/components/home/StarsBackground";
import HomeSections from "@/components/home/HomeSections";
import DobroBanner from "@/components/promo/DobroBanner";
import { useActiveSection } from "@/components/home/useActiveSection";
import { HOME_JSON_LD } from "@/components/home/constants";

export default function Index() {
  const { activeSection, mobileMenuOpen, setMobileMenuOpen, scrollTo, crumbs } = useActiveSection();

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="УЧИСЬПРО — ИИ-репетитор онлайн 24/7 для школьников 1–11 классов, подготовка к ЕГЭ и ОГЭ"
        description="УЧИСЬПРО — современная образовательная платформа с персональным ИИ-репетитором, который доступен круглосуточно. Голосовое и текстовое общение, адаптивные программы по математике, физике, русскому, английскому и другим школьным предметам. Диагностика пробелов, разбор заданий ЕГЭ и ОГЭ, прогресс с уровнями и бейджами. Есть курсы для взрослых: нейросети, запуск бизнеса и удалённые профессии. Официальный партнёр банка Точка. Первый урок бесплатно на учисьпро.рф."
        canonical="https://xn--h1agdcde2c.xn--p1ai/"
        keywords="учисьпро, учисьпро.рф, репетитор онлайн, ии репетитор, подготовка к егэ, подготовка к огэ, онлайн школа, курсы для школьников, математика онлайн, физика онлайн, английский онлайн, голосовой репетитор, курсы по нейросетям, курсы для взрослых, удалённые профессии, партнёр банка точка"
        jsonLd={HOME_JSON_LD}
      />

      <StarsBackground />

      <Navbar
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        onScrollTo={scrollTo}
        onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Хлебные крошки — компактная панель под навбаром */}
      <div className="border-b border-white/5 bg-background/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <Breadcrumbs items={crumbs} />
        </div>
      </div>

      <DobroBanner />

      <HomeSections />

      <SiteFooter />

      <CookieConsent />

    </div>
  );
}