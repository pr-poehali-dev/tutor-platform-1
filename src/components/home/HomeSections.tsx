import { lazy, Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import SocialProofStrip from "@/components/SocialProofStrip";
import FreeCoursesBlock from "@/components/courses/FreeCoursesBlock";
import PremiumTracks from "@/components/PremiumTracks";
import { useAuth } from "@/context/AuthContext";
import { SectionSkeleton } from "./constants";

const AITeacher = lazy(() => import("@/components/AITeacher"));
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

      {/* 3. Главное действие — бесплатные курсы (точка входа) */}
      <FreeCoursesBlock />

      {/* Персональное пространство — только для вошедших */}
      {isAuthenticated && (
        <Suspense fallback={<SectionSkeleton />}>
          <MySpaceSection />
        </Suspense>
      )}

      {/* 4. Главный продукт — демо ИИ-учителя */}
      <Suspense fallback={<SectionSkeleton />}>
        <AITeacher />
      </Suspense>

      {/* 5. Премиум-направления */}
      <PremiumTracks />

      {/* 6. Рейтинг — социальное доказательство + финальный CTA */}
      <Suspense fallback={<SectionSkeleton />}>
        <LeaderboardSection />
      </Suspense>
    </main>
  );
}