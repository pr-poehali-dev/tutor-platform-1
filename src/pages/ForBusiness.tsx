import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import ForBusinessHeader from "@/components/business/for-business/ForBusinessHeader";
import ForBusinessHero from "@/components/business/for-business/ForBusinessHero";
import ForBusinessExpertise from "@/components/business/for-business/ForBusinessExpertise";
import ForBusinessValue from "@/components/business/for-business/ForBusinessValue";
import ForBusinessEcosystem from "@/components/business/for-business/ForBusinessEcosystem";
import ForBusinessForecast from "@/components/business/for-business/ForBusinessForecast";
import ForBusinessSavings from "@/components/business/for-business/ForBusinessSavings";
import ForBusinessLicense from "@/components/business/for-business/ForBusinessLicense";
import ForBusinessOffer from "@/components/business/for-business/ForBusinessOffer";
import { FOR_BUSINESS_FAQ_JSON_LD } from "@/components/business/for-business/forBusinessData";

const SITE_URL = "https://учисьпро.рф";

export default function ForBusiness() {
  const location = useLocation();

  // Плавный переход к секции по якорю (#forecast, #ecosystem, #lead),
  // в т.ч. при переходе со статьи в ленте.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(t);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Конструктор онлайн-школ на ИИ — запустите школу за вечер"
        description="White-label платформа для онлайн-школ и бизнеса: ИИ собирает курс за час, работает преподавателем 24/7, приём оплат из коробки. Свой бренд и домен."
        canonical={`${SITE_URL}/for-business`}
        keywords="конструктор онлайн-школ, платформа для онлайн-школы, white label lms, своя онлайн-школа, создать онлайн-курс, аналог getcourse"
        jsonLd={[FOR_BUSINESS_FAQ_JSON_LD]}
      />

      <ForBusinessHeader />

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16">
        <ForBusinessHero />
        <ForBusinessExpertise />
        <ForBusinessValue />
        <ForBusinessEcosystem />
        <ForBusinessForecast />
        <ForBusinessSavings />
        <ForBusinessLicense />
        <ForBusinessOffer />
      </main>

      <SiteFooter />
    </div>
  );
}