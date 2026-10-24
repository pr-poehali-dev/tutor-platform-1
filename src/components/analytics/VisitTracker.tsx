import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import func2url from "../../../backend/func2url.json";
import { tickReminders } from "@/components/marathon/api";
import { kidsEnrichTick, pilotTick } from "@/components/admin/eduInstitutions/api";
import { monitorTick } from "@/components/support/api";

const ANALYTICS_URL = (func2url as Record<string, string>).analytics;
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

const DAILY_REPORT_URL = (func2url as Record<string, string>)["daily-report"];

/** Ленивый дневной отчёт владельцу — один раз за сессию вкладки.
 *  Планировщик Vercel на текущем тарифе выполняет не все задания,
 *  из-за чего отчёт почти не приходил. Бэкенд сам следит, чтобы письмо
 *  ушло не раньше 9:00 по Москве и строго один раз в сутки. */
let reportTicked = false;
const SCHOOL_PILOT_URL = (func2url as Record<string, string>)["school-pilot"];

function tickDailyReport() {
  if (reportTicked || !DAILY_REPORT_URL) return;
  reportTicked = true;
  try {
    fetch(`${DAILY_REPORT_URL}?action=tick`).catch(() => {});
    // Недельная сводка пилота: сервер шлёт только в понедельник после 9:00 МСК и раз в неделю.
    if (SCHOOL_PILOT_URL && new Date().getDay() === 1) fetch(`${SCHOOL_PILOT_URL}?action=weekly_tick`).catch(() => {});
  } catch {
    /* фоновая задача — молчим */
  }
}

/** Шаг авторассылки директорам школ — раз за сессию вкладки, с задержкой,
 *  чтобы не мешать загрузке страницы. Сервер сам решает, слать ли сейчас:
 *  только если админ включил авторассылку, в рабочее время и в пределах дневного лимита. */
let pilotTicked = false;
function tickPilotOutreach() {
  if (pilotTicked) return;
  pilotTicked = true;
  setTimeout(() => {
    pilotTick();
  }, 4000);
  // Дособирание почты детских садов и детских домов из открытого реестра — маленькими порциями.
  setTimeout(() => {
    kidsEnrichTick();
  }, 9000);
}

/**
 * Учёт посещений всех страниц (включая анонимных гостей).
 * Отправляет визит в backend при каждой смене URL.
 */
export default function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    tickDailyReport();
    tickReminders();
    tickPilotOutreach();
    monitorTick();
  }, []);

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
      // text/plain — единственный JSON-совместимый тип, который sendBeacon шлёт без
      // CORS-preflight. С application/json браузер молча отбрасывает запрос.
      const blob = new Blob([JSON.stringify(payload)], { type: "text/plain;charset=UTF-8" });
      const sent = navigator.sendBeacon ? navigator.sendBeacon(ANALYTICS_URL, blob) : false;
      if (!sent) {
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