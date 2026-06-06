export const SectionSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-12">
    <div className="rounded-3xl border border-white/8 bg-white/[0.02] h-64 animate-pulse" />
  </div>
);

export const SECTION_LABELS: Record<string, string> = {
  hero: "Главная",
  "ai-teacher": "ИИ-преподаватель",
  leaderboard: "Рейтинг учеников",
  myspace: "Моё обучение",
};

export const HOME_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Как работает ИИ-репетитор?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ИИ-репетитор проводит диагностический тест, находит пробелы в знаниях и формирует персональную программу обучения. Доступен 24/7 в голосовом и текстовом режимах.",
        },
      },
      {
        "@type": "Question",
        name: "Есть ли подготовка к ЕГЭ и ОГЭ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Да, в каталоге курсов есть отдельные программы для подготовки к ЕГЭ и ОГЭ по математике, физике, русскому языку, английскому и другим предметам.",
        },
      },
      {
        "@type": "Question",
        name: "Можно ли учиться бесплатно?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Да, доступен бесплатный пробный урок и базовые функции платформы. Полные курсы — по подписке или с разовой оплатой.",
        },
      },
      {
        "@type": "Question",
        name: "Заменяет ли ИИ живого репетитора?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Голосовой ИИ-преподаватель ведёт полноценный диалог, объясняет темы, проверяет задачи и адаптируется под уровень ученика. Подходит как замена или дополнение к занятиям с живым репетитором.",
        },
      },
    ],
  },
];