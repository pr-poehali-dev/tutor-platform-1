import { lazy, Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import FreeCoursesBlock from "@/components/courses/FreeCoursesBlock";
import QuickTools from "@/components/home/QuickTools";
import BusinessPromoBanner from "@/components/home/BusinessPromoBanner";
import HowItWorks from "@/components/home/HowItWorks";
import StudentResults from "@/components/home/StudentResults";
import TrustGuarantee from "@/components/home/TrustGuarantee";
import { useAuth } from "@/context/AuthContext";
import { SectionSkeleton } from "./constants";

const AITeacher = lazy(() => import("@/components/AITeacher"));
const PremiumTracks = lazy(() => import("@/components/PremiumTracks"));
const LeaderboardSection = lazy(() => import("@/components/LeaderboardSection"));
const MySpaceSection = lazy(() => import("@/components/myspace/MySpaceSection"));
const MentorCompanion = lazy(() => import("@/components/mentor/MentorCompanion"));

export default function HomeSections() {
  const { isAuthenticated } = useAuth();

  // Вошедший ученик: сразу его пространство и обучение, без «начни бесплатно».
  if (isAuthenticated) {
    return (
      <main id="main-content">
        <HeroSection />
        <section className="max-w-6xl mx-auto px-4 py-6">
          <Suspense fallback={<SectionSkeleton />}>
            <MentorCompanion />
          </Suspense>
        </section>
        <Suspense fallback={<SectionSkeleton />}>
          <MySpaceSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <AITeacher />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <PremiumTracks />
        </Suspense>
        <QuickTools />
        <Suspense fallback={<SectionSkeleton />}>
          <LeaderboardSection />
        </Suspense>
      </main>
    );
  }

  // Новый посетитель: чёткая воронка к одному действию — «начать бесплатно».
  return (
    <main id="main-content">
      {/* 1. Первое впечатление + главный CTA */}
      <HeroSection />

      {/* 2. Точка входа — бесплатные курсы */}
      <FreeCoursesBlock />

      {/* 2.5. Как это работает — путь ученика в 4 шага */}
      <HowItWorks />

      {/* 3. Главный продукт — демо ИИ-учителя */}
      <Suspense fallback={<SectionSkeleton />}>
        <AITeacher />
      </Suspense>

      {/* 3.5. ИИ-наставник-мотиватор */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <Suspense fallback={<SectionSkeleton />}>
          <MentorCompanion />
        </Suspense>
      </section>

      {/* 3.6. Результаты и отзывы учеников — доверие до покупки */}
      <StudentResults />

      {/* 4. Премиум-направления */}
      <Suspense fallback={<SectionSkeleton />}>
        <PremiumTracks />
      </Suspense>

      {/* 5. Полезные инструменты — без регистрации */}
      <QuickTools />

      {/* 5.5. Полоса доверия — гарантии и безопасность оплаты */}
      <TrustGuarantee />

      {/* 5.6. B2B — конструктор онлайн-школ */}
      <BusinessPromoBanner />
    </main>
  );
}