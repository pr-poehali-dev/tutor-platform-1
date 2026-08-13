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
        title="УЧИСЬПРО — платформа обучения для всей семьи: школьникам, взрослым, руководителям"
        description="Одна платформа для всей семьи. Школьникам — ИИ-репетитор 24/7, разбор домашки и подготовка к ЕГЭ и ОГЭ. Взрослым — нейросети, запуск бизнеса и удалённые профессии. Руководителям — готовые шаблоны управления. 30 бесплатных мини-курсов за вечер, первый урок без регистрации. Официальный партнёр Точка Банк."
        canonical="https://xn--h1agdcde2c.xn--p1ai/"
        keywords="учисьпро, учисьпро.рф, платформа обучения, репетитор онлайн, ии репетитор, подготовка к егэ, подготовка к огэ, курсы для школьников, курсы по нейросетям, курсы для взрослых, удалённые профессии, инструменты руководителя, бесплатные мини-курсы, обучение для всей семьи, партнёр точка банк"
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