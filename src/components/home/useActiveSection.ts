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

  // Переход с другой страницы: /?section=ai-teacher — плавно скроллим к секции.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (!section) return;
    // Даём странице отрисоваться (lazy-секции), затем скроллим.
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setActiveSection(section);
        // Чистим URL, чтобы не скроллило при последующих переходах.
        window.history.replaceState(null, "", "/");
      } else if (attempt < 10) {
        setTimeout(() => tryScroll(attempt + 1), 300);
      }
    };
    tryScroll();
  }, []);

  // Автообновление activeSection при скролле
  useEffect(() => {
    const ids = ["myspace", "ai-teacher", "leaderboard"];
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