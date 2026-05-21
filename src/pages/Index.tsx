import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AITeacher from "@/components/AITeacher";
import LearningJourney from "@/components/LearningJourney";
import CoursesLibrary from "@/components/CoursesLibrary";
import CoursesSection from "@/components/CoursesSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import MySpaceSection from "@/components/myspace/MySpaceSection";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const SECTION_LABELS: Record<string, string> = {
  hero: "Главная",
  journey: "Маршрут обучения",
  ai: "ИИ-преподаватель",
  courses: "Каталог курсов",
  leaderboard: "Рейтинг учеников",
  myspace: "Моё обучение",
};

const HOME_JSON_LD = [
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

export default function Index() {
  const [activeSection, setActiveSection] = useState("courses");
  const [activeCourse, setActiveCourse] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  // Автообновление activeSection при скролле
  useEffect(() => {
    const ids = ["myspace", "journey", "ai", "courses", "leaderboard"];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && e.intersectionRatio > 0.3) {
              setActiveSection(id);
            }
          });
        },
        { threshold: [0.3, 0.6] },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const crumbs = activeSection && activeSection !== "hero"
    ? [
        { label: "Главная", href: "/" },
        { label: SECTION_LABELS[activeSection] || activeSection },
      ]
    : [{ label: "Главная" }];

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Космо-Учитель — ИИ-репетитор онлайн для школьников 1–11 классов, ЕГЭ и ОГЭ"
        description="Образовательная платформа с ИИ-преподавателем: голосовой репетитор 24/7, персональные программы по математике, физике, английскому. Подготовка к ЕГЭ и ОГЭ. Бесплатный пробный урок."
        canonical="https://kosmo-uchitel.ru/"
        keywords="репетитор онлайн, ии репетитор, подготовка к егэ, подготовка к огэ, онлайн школа, курсы для школьников, математика онлайн, физика онлайн, английский онлайн, голосовой репетитор"
        jsonLd={HOME_JSON_LD}
      />

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + 'px',
              height: (i % 3) + 1 + 'px',
              left: ((i * 137.5) % 100) + '%',
              top: ((i * 97.3) % 100) + '%',
              opacity: 0.15 + (i % 4) * 0.1,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i % 5) * 0.6}s infinite`,
            }}
          />
        ))}
      </div>

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

      <HeroSection />

      <MySpaceSection />

      <LearningJourney />

      <AITeacher />

      <CoursesLibrary />

      <CoursesSection
        activeCourse={activeCourse}
        onSetActiveCourse={setActiveCourse}
      />

      <LeaderboardSection />

      <SiteFooter />

      <CookieConsent />

    </div>
  );
}