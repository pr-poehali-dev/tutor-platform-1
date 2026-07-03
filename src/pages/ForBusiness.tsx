import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import ForBusinessHeader from "@/components/business/for-business/ForBusinessHeader";
import ForBusinessHero from "@/components/business/for-business/ForBusinessHero";
import ForBusinessValue from "@/components/business/for-business/ForBusinessValue";
import ForBusinessForecast from "@/components/business/for-business/ForBusinessForecast";
import ForBusinessOffer from "@/components/business/for-business/ForBusinessOffer";
import { FOR_BUSINESS_FAQ_JSON_LD } from "@/components/business/for-business/forBusinessData";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function ForBusiness() {
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
        <ForBusinessForecast />
        <ForBusinessOffer />
      </main>

      <SiteFooter />
    </div>
  );
}