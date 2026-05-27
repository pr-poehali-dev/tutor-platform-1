import { lazy, Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import SocialProofStrip from "@/components/SocialProofStrip";
import QuickQuiz from "@/components/QuickQuiz";
import CoursesTeaser from "@/components/CoursesTeaser";
import PremiumTracks from "@/components/PremiumTracks";
import { SectionSkeleton } from "./constants";

const AITeacher = lazy(() => import("@/components/AITeacher"));
const LearningJourney = lazy(() => import("@/components/LearningJourney"));
const LeaderboardSection = lazy(() => import("@/components/LeaderboardSection"));
const MySpaceSection = lazy(() => import("@/components/myspace/MySpaceSection"));

export default function HomeSections() {
  return (
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

      <PremiumTracks />

      <Suspense fallback={<SectionSkeleton />}>
        <LeaderboardSection />
      </Suspense>
    </main>
  );
}
