import { useEffect, useState } from "react";
import { SECTION_LABELS } from "./constants";

export function useActiveSection() {
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

  return {
    activeSection,
    mobileMenuOpen,
    setMobileMenuOpen,
    scrollTo,
    crumbs,
  };
}
