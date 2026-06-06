import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ANALYTICS_URL = "https://functions.poehali.dev/01d958c7-7953-4b8d-8f34-f7a0962bdb76";
const VISITOR_KEY = "up_visitor_id";

function getVisitorId(): { id: string; isNew: boolean } {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (id) return { id, isNew: false };
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(VISITOR_KEY, id);
    return { id, isNew: true };
  } catch {
    return { id: "anon-" + Math.random().toString(36).slice(2), isNew: true };
  }
}

/**
 * Учёт посещений всех страниц (включая анонимных гостей).
 * Отправляет визит в backend при каждой смене URL.
 */
export default function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const { id, isNew } = getVisitorId();
    let userUid: string | null = null;
    try {
      userUid =
        localStorage.getItem("user_uid") ||
        localStorage.getItem("auth_user_id") ||
        null;
    } catch {
      userUid = null;
    }

    const payload = {
      visitor_id: id,
      user_uid: userUid,
      path: location.pathname + location.search,
      referrer: document.referrer || null,
      is_new_visitor: isNew,
    };

    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ANALYTICS_URL, blob);
      } else {
        fetch(ANALYTICS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* noop */
    }
  }, [location.pathname, location.search]);

  return null;
}
