import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import Seo from "@/components/seo/Seo";
import StarsBackground from "@/components/home/StarsBackground";
import HomeSections from "@/components/home/HomeSections";
import DobroBanner from "@/components/promo/DobroBanner";
import { useActiveSection } from "@/components/home/useActiveSection";
import { HOME_JSON_LD } from "@/components/home/constants";

export default function Index() {
  const { mobileMenuOpen, setMobileMenuOpen, scrollTo } = useActiveSection();

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="УЧИСЬПРО — обучение для всей семьи: малыши, школа, взрослые"
        description="Одна платформа для всей семьи: малышам — развивающие занятия, школьникам — ИИ-репетитор 24/7 и подготовка к ЕГЭ, взрослым — нейросети и новые профессии. Первый урок бесплатно."
        canonical="https://учисьпро.рф/"
        keywords="учисьпро, учисьпро.рф, платформа обучения, развивающие занятия для малышей, репетитор онлайн, ии репетитор, подготовка к егэ, подготовка к огэ, курсы для школьников, курсы по нейросетям, курсы для взрослых, удалённые профессии, обучение для всей семьи, партнёр точка банк"
        jsonLd={HOME_JSON_LD}
      />

      <StarsBackground />

      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        onScrollTo={scrollTo}
        onToggleMobile={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Отступ под фиксированную шапку */}
      <div className="pt-20 md:pt-24">
        <DobroBanner />
        <HomeSections />
      </div>

      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
