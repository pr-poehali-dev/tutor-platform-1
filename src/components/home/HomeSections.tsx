import { lazy, Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import SocialProofStrip from "@/components/SocialProofStrip";
import FreeCoursesBlock from "@/components/courses/FreeCoursesBlock";
import CoursesTeaser from "@/components/CoursesTeaser";
import PremiumTracks from "@/components/PremiumTracks";
import { useAuth } from "@/context/AuthContext";
import { SectionSkeleton } from "./constants";

const AITeacher = lazy(() => import("@/components/AITeacher"));
const LearningJourney = lazy(() => import("@/components/LearningJourney"));
const LeaderboardSection = lazy(() => import("@/components/LeaderboardSection"));
const MySpaceSection = lazy(() => import("@/components/myspace/MySpaceSection"));

export default function HomeSections() {
  const { isAuthenticated } = useAuth();

  return (
    <main id="main-content">
      {/* 1. Первое впечатление */}
      <HeroSection />

      {/* 2. Доверие — цифры и результаты */}
      <SocialProofStrip />

      {/* 2.5. Бесплатные курсы — точка входа для рекламного трафика */}
      <FreeCoursesBlock />

      {/* Персональное пространство — только для вошедших */}
      {isAuthenticated && (
        <Suspense fallback={<SectionSkeleton />}>
          <MySpaceSection />
        </Suspense>
      )}

      {/* 3. Главный продукт — демо ИИ-учителя */}
      <Suspense fallback={<SectionSkeleton />}>
        <AITeacher />
      </Suspense>

      {/* 4. Как это работает — маршрут обучения */}
      <Suspense fallback={<SectionSkeleton />}>
        <LearningJourney />
      </Suspense>

      {/* 5. Курсы — компактная витрина */}
      <CoursesTeaser />

      {/* 6. Премиум-направления */}
      <PremiumTracks />

      {/* 7. Рейтинг — социальное доказательство + финальный CTA */}
      <Suspense fallback={<SectionSkeleton />}>
        <LeaderboardSection />
      </Suspense>
    </main>
  );
}