import { lazy, Suspense } from "react";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import TutorTopBar from "@/components/tutor/TutorTopBar";
import TutorHero from "@/components/tutor/TutorHero";
import TutorMentorIntro from "@/components/tutor/TutorMentorIntro";
import TutorFeatures from "@/components/tutor/TutorFeatures";
import TutorSubjects from "@/components/tutor/TutorSubjects";
import TutorHowItWorks from "@/components/tutor/TutorHowItWorks";
import TutorPricing from "@/components/tutor/TutorPricing";
import TutorCTA from "@/components/tutor/TutorCTA";

const LearningJourney = lazy(() => import("@/components/LearningJourney"));

const SITE_URL = "https://учисьпро.рф";
const CANONICAL = `${SITE_URL}/tutor`;

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Репетитор УЧИСЬПРО — личный ИИ-наставник по всем предметам",
    serviceType: "Онлайн-репетитор с ИИ",
    description:
      "Личный репетитор с ИИ: голосовые уроки по физике, математике и информатике, проверка домашнего задания по фото, задачники и подготовка к ЕГЭ. Первый урок бесплатно.",
    url: CANONICAL,
    provider: { "@type": "Organization", name: "УЧИСЬПРО" },
    areaServed: "RU",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Репетитор", item: CANONICAL },
    ],
  },
];

export default function TutorHub() {
  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Репетитор с ИИ — личный наставник по всем предметам | УЧИСЬПРО"
        description="Личный репетитор с ИИ: голосовые уроки, проверка домашки по фото, задачники и подготовка к ЕГЭ по физике, математике, информатике, биологии и химии. Первый урок бесплатно."
        canonical={CANONICAL}
        keywords="репетитор онлайн, ии репетитор, репетитор по физике, репетитор по математике, проверка домашнего задания, подготовка к егэ, наставник с голосом, онлайн занятия для школьников"
        jsonLd={JSON_LD}
      />

      <TutorTopBar />
      <TutorHero />

      {/* Ядро раздела: наставник тестирует и строит персональный план */}
      <TutorMentorIntro />
      <Suspense fallback={<div className="py-16 text-center text-white/40 text-sm">Готовлю наставника…</div>}>
        <LearningJourney />
      </Suspense>

      <TutorFeatures />
      <TutorSubjects />
      <TutorHowItWorks />
      <TutorPricing />
      <TutorCTA />
      <SiteFooter />
    </div>
  );
}