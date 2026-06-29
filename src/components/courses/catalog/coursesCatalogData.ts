import {
  COURSES,
  getCoursePrice,
} from "@/components/courses/coursesData";

export type BadgeFilter = "all" | "free" | "new" | "hit" | "sale" | "trial";

export const BADGES: { id: BadgeFilter; label: string; icon: string }[] = [
  { id: "all", label: "Все", icon: "Sparkle" },
  { id: "free", label: "Бесплатные", icon: "Gift" },
  { id: "hit", label: "Хиты", icon: "Flame" },
  { id: "new", label: "Новинки", icon: "Sparkles" },
  { id: "sale", label: "Со скидкой", icon: "Tag" },
  { id: "trial", label: "Есть пробный", icon: "Star" },
];

export const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

// JSON-LD: каталог курсов как ItemList со вложенными Course schema.org
// Это даёт rich snippets в Google: список курсов с рейтингом, провайдером, описанием
export const COURSES_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Каталог онлайн-курсов УЧИСЬПРО",
    description: "Полный каталог онлайн-курсов для школьников 1–11 классов и подготовки к ОГЭ/ЕГЭ",
    numberOfItems: COURSES.length,
    itemListElement: COURSES.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Course",
        "@id": `${SITE_URL}/course-checkout/${c.id}`,
        name: c.title,
        description: c.description,
        url: `${SITE_URL}/course-checkout/${c.id}`,
        provider: {
          "@type": "EducationalOrganization",
          name: "УЧИСЬПРО",
          sameAs: SITE_URL,
        },
        educationalLevel:
          c.grade === "ege" ? "ЕГЭ" :
          c.grade === "oge" ? "ОГЭ" :
          c.grade === "1-4" ? "1–4 класс" :
          c.grade === "5-9" ? "5–9 класс" :
          c.grade === "10-11" ? "10–11 класс" : c.grade,
        teaches: c.tags.join(", "),
        inLanguage: "ru-RU",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: c.rating,
          reviewCount: c.reviews,
          bestRating: 5,
          worstRating: 1,
        },
        offers: {
          "@type": "Offer",
          price: getCoursePrice(c),
          priceCurrency: "RUB",
          availability: "https://schema.org/InStock",
          category: c.trialAvailable ? "Подписка с пробным периодом" : "Подписка",
          url: `${SITE_URL}/course-checkout/${c.id}`,
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: c.format === "online" ? "online" : c.format === "offline" ? "onsite" : "online",
          courseWorkload: `PT${c.lessons * 30}M`,
        },
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Каталог курсов", item: `${SITE_URL}/courses` },
    ],
  },
];
