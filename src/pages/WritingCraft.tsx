import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import WritingHero, { WritingTopBar } from "@/components/writing/WritingHero";
import WritingProgram from "@/components/writing/WritingProgram";
import WritingOutcomesPricingFaq from "@/components/writing/WritingOutcomesPricingFaq";
import { FAQ } from "@/components/writing/data";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export default function WritingCraft() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Мастерская сочинений", item: `${SITE_URL}/writing-craft` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Написание сочинения: мастерская слова для будущих журналистов",
      description:
        "Профессиональный курс письма: итоговое сочинение, сочинение ЕГЭ на 25 баллов, журналистские жанры (репортаж, очерк, рецензия, интервью, колонка), эссеистика, литературные приёмы русской классики. Готовит к поступлению на журфак МГУ, ВШЭ, СПбГУ.",
      provider: { "@type": "EducationalOrganization", name: "УЧИСЬПРО", url: SITE_URL },
      inLanguage: "ru-RU",
      educationalLevel: "10–11 классы, абитуриенты, взрослые",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT48H",
      },
      offers: {
        "@type": "Offer",
        price: "890",
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/writing-craft`,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.99",
        reviewCount: "127",
        bestRating: "5",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Мастерская сочинений: подготовка к ЕГЭ, итоговому и журфаку — УЧИСЬПРО"
        description="Профессиональный курс письма: итоговое сочинение 11 класса, сочинение ЕГЭ на 25 баллов, журналистские жанры (репортаж, очерк, интервью, колонка), эссеистика. Готовит к поступлению на журфак МГУ, ВШЭ, СПбГУ. 8 модулей, 64 урока, разбор Толстого, Чехова, Бунина."
        canonical={`${SITE_URL}/writing-craft`}
        keywords="как писать сочинение, итоговое сочинение 2026, сочинение егэ русский, направления итогового сочинения, журфак мгу подготовка, ДВИ журфак, поступление на журналистику, эссе по литературе, репортаж очерк рецензия, нора галь канцелярит, литературное мастерство, мастерская сочинений"
        jsonLd={jsonLd}
      />

      <WritingTopBar />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <WritingHero />

        <WritingProgram />

        <WritingOutcomesPricingFaq />
      </div>

      <SiteFooter />
    </div>
  );
}
