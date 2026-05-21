import { useState } from "react";
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

export default function Index() {
  const [activeSection, setActiveSection] = useState("courses");
  const [activeCourse, setActiveCourse] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">

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