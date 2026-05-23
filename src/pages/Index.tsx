import { useEffect, useState, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SocialProofStrip from "@/components/SocialProofStrip";
import QuickQuiz from "@/components/QuickQuiz";
import CoursesTeaser from "@/components/CoursesTeaser";

const AITeacher = lazy(() => import("@/components/AITeacher"));
const LearningJourney = lazy(() => import("@/components/LearningJourney"));
const LeaderboardSection = lazy(() => import("@/components/LeaderboardSection"));
const MySpaceSection = lazy(() => import("@/components/myspace/MySpaceSection"));

const SectionSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-12">
    <div className="rounded-3xl border border-white/8 bg-white/[0.02] h-64 animate-pulse" />
  </div>
);

const SECTION_LABELS: Record<string, string> = {
  hero: "Главная",
  journey: "Маршрут обучения",
  ai: "ИИ-преподаватель",
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
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  // Автообновление activeSection при скролле
  useEffect(() => {
    const ids = ["myspace", "journey", "ai", "leaderboard"];
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
        title="УЧИСЬПРО — ИИ-репетитор онлайн 24/7 для школьников 1–11 классов, подготовка к ЕГЭ и ОГЭ"
        description="УЧИСЬПРО — современная образовательная платформа с персональным ИИ-репетитором, который доступен круглосуточно. Голосовое и текстовое общение, адаптивные программы по математике, физике, русскому, английскому и другим школьным предметам. Диагностика пробелов, разбор заданий ЕГЭ и ОГЭ, прогресс с уровнями и бейджами. Первый урок бесплатно на учисьпро.рф."
        canonical="https://xn--h1agdcde2c.xn--p1ai/"
        keywords="учисьпро, учисьпро.рф, репетитор онлайн, ии репетитор, подготовка к егэ, подготовка к огэ, онлайн школа, курсы для школьников, математика онлайн, физика онлайн, английский онлайн, голосовой репетитор"
        jsonLd={HOME_JSON_LD}
      />

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
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

      <main id="main-content">
        <HeroSection />

        <SocialProofStrip />

        <QuickQuiz />

        <Suspense fallback={<SectionSkeleton />}>
          <MySpaceSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <LearningJourney />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AITeacher />
        </Suspense>

        <CoursesTeaser />

        <Suspense fallback={<SectionSkeleton />}>
          <LeaderboardSection />
        </Suspense>
      </main>

      <SiteFooter />

      <CookieConsent />

    </div>
  );
}