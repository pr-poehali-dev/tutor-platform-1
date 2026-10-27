// JSON-LD организации и сайта (раньше лежал в index.html).
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://учисьпро.рф/#organization",
      "name": "УЧИСЬПРО",
      "alternateName": [
        "UCHISPRO",
        "Учисьпро",
        "учисьпро.рф"
      ],
      "url": "https://учисьпро.рф/",
      "logo": "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/cf2ffd57-2e2d-4bbc-acb2-725c718bdc4a.jpg",
      "image": "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg",
      "description": "УЧИСЬПРО — российская образовательная онлайн-платформа для всей семьи. Малышам от 1 года до 6 лет: развивающие занятия, песни, логопедические упражнения и подготовка к школе в разделе «Малыш». Школьникам 1–11 классов: персональный ИИ-репетитор 24/7, голосовые уроки, диагностика пробелов, разбор домашних заданий и подготовка к ЕГЭ и ОГЭ. Взрослым: курсы по нейросетям и ИИ, запуску бизнеса, удалённым профессиям и смене карьеры. Руководителям: практические мини-курсы с готовыми шаблонами — матрица ответственности, постановка задач, обратная связь, регламент найма. Более 30 бесплатных мини-курсов и первый урок без регистрации. Официальный партнёр банка Точка.",
      "areaServed": "RU",
      "inLanguage": "ru",
      "telephone": "+7-927-748-68-68",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+7-927-748-68-68",
        "contactType": "customer support",
        "areaServed": "RU",
        "availableLanguage": "ru",
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "08:00",
          "closes": "17:00"
        }
      },
      "parentOrganization": {
        "@type": "Organization",
        "name": "ООО «МАТ-ЛАБС»",
        "url": "https://mat-labs.ru",
        "taxID": "6312223437",
        "identifier": "ОГРН 1266300004288",
        "telephone": "+7-927-748-68-68"
      },
      "sameAs": [
        "https://t.me/+QgiLIa1gFRY4Y2Iy",
        "https://max.ru/id631205241205_biz",
        "https://mat-labs.ru"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://учисьпро.рф/#website",
      "url": "https://учисьпро.рф/",
      "name": "УЧИСЬПРО",
      "alternateName": "учисьпро.рф",
      "inLanguage": "ru-RU",
      "publisher": {
        "@id": "https://учисьпро.рф/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://учисьпро.рф/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};
