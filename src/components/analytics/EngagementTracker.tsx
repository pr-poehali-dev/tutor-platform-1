import { useEffect, useRef } from "react";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Невидимый трекер вовлечённости.
 * - Отправляет цель `deep_scroll` когда пользователь прокрутил > 75% страницы.
 * - Отправляет цель `engaged_session` после 3 минут на сайте.
 * Каждая цель отправляется только один раз за сессию.
 */
export default function EngagementTracker() {
  const scrollFired = useRef(false);
  const timeFired = useRef(false);

  useEffect(() => {
    // Скролл > 75%
    const onScroll = () => {
      if (scrollFired.current) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total > 0.75) {
        scrollFired.current = true;
        trackGoal("deep_scroll");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Время на сайте > 3 мин
    const timer = window.setTimeout(() => {
      if (!timeFired.current) {
        timeFired.current = true;
        trackGoal("engaged_session");
      }
    }, 3 * 60 * 1000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
