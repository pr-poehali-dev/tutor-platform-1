import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCode as applyReferralCode } from "@/components/referrals/api";

/**
 * Перехват партнёрской ссылки вида /?ref=КОД.
 *
 * До этого ссылки из кабинета выдавались, но параметр ?ref= нигде не читался:
 * пришедший по ссылке человек должен был сам зайти на /referral и вбить код
 * руками. На практике этого не делал почти никто — то есть партнёрская
 * механика существовала только на бумаге.
 *
 * Теперь код запоминается при первом заходе и применяется автоматически,
 * как только человек войдёт в аккаунт. Срок хранения — 90 дней: решение
 * об оплате редко принимают в первый визит.
 */
const REF_KEY = "uchispro_ref_code_v1";
const REF_TTL_DAYS = 90;

interface StoredRef {
  code: string;
  capturedAt: number;
}

function readStored(): StoredRef | null {
  try {
    const raw = localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRef;
    const ageMs = Date.now() - (parsed.capturedAt || 0);
    if (ageMs > REF_TTL_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(REF_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Код из ссылки — чтобы показать его на экранах регистрации. */
export function getStoredRefCode(): string | null {
  return readStored()?.code ?? null;
}

export function clearStoredRef(): void {
  try {
    localStorage.removeItem(REF_KEY);
  } catch {
    /* noop */
  }
}

export function useRefCapture(): void {
  const { isAuthenticated } = useAuth();
  // Применяем код один раз за сессию, иначе при каждом рендере уйдёт запрос.
  const applied = useRef(false);

  // 1. Ловим код из адреса при любом заходе на сайт.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = (params.get("ref") || "").trim().toUpperCase();
      if (!raw || !/^[A-Z0-9]{4,12}$/.test(raw)) return;
      // Уже сохранённый код не перезаписываем: засчитываем того,
      // кто привёл человека первым.
      if (readStored()) return;
      localStorage.setItem(
        REF_KEY,
        JSON.stringify({ code: raw, capturedAt: Date.now() } satisfies StoredRef)
      );
    } catch {
      /* noop */
    }
  }, []);

  // 2. Как только человек вошёл — применяем код.
  useEffect(() => {
    if (!isAuthenticated || applied.current) return;
    const stored = readStored();
    if (!stored) return;

    applied.current = true;
    applyReferralCode(stored.code).then((res) => {
      // Код сработал или был использован раньше — больше не пытаемся.
      // При сетевой ошибке оставляем: применится при следующем заходе.
      if (res.ok || res.message) clearStoredRef();
    });
  }, [isAuthenticated]);
}
