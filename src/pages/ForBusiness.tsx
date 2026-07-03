import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import ForBusinessHeader from "@/components/business/for-business/ForBusinessHeader";
import ForBusinessHero from "@/components/business/for-business/ForBusinessHero";
import ForBusinessValue from "@/components/business/for-business/ForBusinessValue";
import ForBusinessEcosystem from "@/components/business/for-business/ForBusinessEcosystem";
import ForBusinessForecast from "@/components/business/for-business/ForBusinessForecast";
import ForBusinessOffer from "@/components/business/for-business/ForBusinessOffer";
import { FOR_BUSINESS_FAQ_JSON_LD } from "@/components/business/for-business/forBusinessData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

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
        title="Конструктор онлайн-школ на ИИ · Запустите свою школу за вечер — УЧИСЬПРО для бизнеса"
        description="White-label платформа для онлайн-школ, авторов и бизнеса. ИИ собирает курс целиком за час, работает преподавателем 24/7, приём оплат из коробки. Свой бренд и домен. Дешевле и мощнее GetCourse."
        canonical={`${SITE_URL}/for-business`}
        jsonLd={[FOR_BUSINESS_FAQ_JSON_LD]}
      />

      <ForBusinessHeader />

      <main className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16">
        <ForBusinessHero />
        <ForBusinessValue />
        <ForBusinessEcosystem />
        <ForBusinessForecast />
        <ForBusinessOffer />
      </main>

      <SiteFooter />
    </div>
  );
}