import { useEffect } from "react";

/**
 * Хук UTM-трекинга для рекламных кампаний.
 *
 * При заходе на сайт с UTM-метками:
 *  1) Сохраняет их в localStorage (на 90 дней) — чтобы атрибутировать оплату даже если она через неделю.
 *  2) Сохраняет в sessionStorage — для текущей сессии.
 *  3) Отправляет в Яндекс.Метрику параметры визита.
 *  4) Регистрирует цель `landing_visit_{campaign}` для оптимизации Директа.
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "yclid"] as const;
const STORAGE_KEY = "uchispro_utm_v1";
const TTL_DAYS = 90;

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

// ID наших счётчиков Метрики
const COUNTER_IDS = [101026698, 109375884];

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  yclid?: string; // Яндекс Click ID
  capturedAt: number; // timestamp
  landingPath: string;
}

function readStored(): UtmData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UtmData;
    const ageMs = Date.now() - (parsed.capturedAt || 0);
    if (ageMs > TTL_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(data: UtmData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* noop */ }
}

function sendToMetrika(data: UtmData) {
  if (typeof window === "undefined" || typeof window.ym !== "function") return;
  COUNTER_IDS.forEach((id) => {
    try {
      // Параметры визита
      window.ym?.(id, "params", {
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        utm_term: data.utm_term,
        utm_content: data.utm_content,
        yclid: data.yclid,
      });
      // Цель — заход с рекламы
      if (data.utm_campaign) {
        window.ym?.(id, "reachGoal", `landing_${data.utm_campaign}`);
      }
      if (data.utm_source === "yandex" && data.utm_medium === "cpc") {
        window.ym?.(id, "reachGoal", "ad_visit_yandex");
      }
    } catch { /* noop */ }
  });
}

export function useUtmTracking() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const params: Record<string, string> = {};
    let hasUtm = false;
    for (const key of UTM_KEYS) {
      const val = url.searchParams.get(key);
      if (val) {
        params[key] = val;
        hasUtm = true;
      }
    }
    if (!hasUtm) return;

    const data: UtmData = {
      ...params,
      capturedAt: Date.now(),
      landingPath: window.location.pathname,
    };
    writeStored(data);
    sendToMetrika(data);
  }, []);
}

/** Получить сохранённые UTM-данные (для атрибуции оплат и т.д.) */
export function getStoredUtm(): UtmData | null {
  return readStored();
}

/** Зарегистрировать цель с привязкой к рекламной кампании */
export function trackAdGoal(goalName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ym !== "function") return;
  const utm = readStored();
  const extra = utm ? {
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    ...params,
  } : params;
  COUNTER_IDS.forEach((id) => {
    try {
      window.ym?.(id, "reachGoal", goalName, extra);
    } catch { /* noop */ }
  });
}
