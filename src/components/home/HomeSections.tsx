import { lazy, Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import SocialProofStrip from "@/components/SocialProofStrip";
import FreeCoursesBlock from "@/components/courses/FreeCoursesBlock";
import QuickTools from "@/components/home/QuickTools";
import PremiumTracks from "@/components/PremiumTracks";
import { useAuth } from "@/context/AuthContext";
import { SectionSkeleton } from "./constants";

const AITeacher = lazy(() => import("@/components/AITeacher"));
const LeaderboardSection = lazy(() => import("@/components/LeaderboardSection"));
const MySpaceSection = lazy(() => import("@/components/myspace/MySpaceSection"));

export default function HomeSections() {
  const { isAuthenticated } = useAuth();

  // Вошедший ученик: сразу его пространство и обучение, без «начни бесплатно».
  if (isAuthenticated) {
    return (
      <main id="main-content">
        <HeroSection />
        <Suspense fallback={<SectionSkeleton />}>
          <MySpaceSection />
        </Suspense>
        <SocialProofStrip />
        <Suspense fallback={<SectionSkeleton />}>
          <AITeacher />
        </Suspense>
        <PremiumTracks />
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

      {/* 2. Доверие — цифры и результаты (тонкая лента) */}
      <SocialProofStrip />

      {/* 3. Точка входа — бесплатные курсы */}
      <FreeCoursesBlock />

      {/* 4. Главный продукт — демо ИИ-учителя */}
      <Suspense fallback={<SectionSkeleton />}>
        <AITeacher />
      </Suspense>

      {/* 5. Премиум-направления */}
      <PremiumTracks />

      {/* 6. Полезные инструменты — без регистрации */}
      <QuickTools />

      {/* 7. Рейтинг — социальное доказательство + финальный CTA */}
      <Suspense fallback={<SectionSkeleton />}>
        <LeaderboardSection />
      </Suspense>
    </main>
  );
}