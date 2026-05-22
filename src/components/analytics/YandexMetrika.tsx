import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const COUNTER_IDS = [101026698, 109375884];

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

/**
 * SPA-трекер Яндекс.Метрики: уведомляет счётчики о смене URL в React Router.
 * Без него Метрика видит только первую страницу при загрузке.
 */
export default function YandexMetrika() {
  const location = useLocation();
  const firstHit = useRef(true);

  useEffect(() => {
    if (firstHit.current) {
      firstHit.current = false;
      return;
    }
    if (typeof window === "undefined" || typeof window.ym !== "function") return;
    const url = window.location.origin + location.pathname + location.search + location.hash;
    COUNTER_IDS.forEach((id) => {
      try {
        window.ym?.(id, "hit", url, {
          title: document.title,
          referer: document.referrer,
        });
      } catch {
        /* noop */
      }
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
}

/** Хелпер для отправки целей в Метрику из любого места приложения. */
export function trackGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ym !== "function") return;
  COUNTER_IDS.forEach((id) => {
    try {
      window.ym?.(id, "reachGoal", goal, params);
    } catch {
      /* noop */
    }
  });
}
