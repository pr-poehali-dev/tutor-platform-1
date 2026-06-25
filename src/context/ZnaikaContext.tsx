import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import func2url from "../../backend/func2url.json";
import { useAuth } from "@/context/AuthContext";
import { safeStorage } from "@/lib/safeStorage";

const ZNAIKA_URL = (func2url as Record<string, string>).znaika;

export interface ZnaikaTransaction {
  amount: number;
  kind: "earn" | "spend";
  reason: string;
  description: string | null;
  created_at: string;
}

export interface ZnaikaAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  tier: "common" | "rare" | "epic" | "legendary";
  earned: boolean;
  earned_at: string | null;
}

export interface ZnaikaState {
  balance: number;
  total_earned: number;
  total_spent: number;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  level: number;
  next_level_at: number | null;
  discount_percent: number;
  transactions: ZnaikaTransaction[];
  achievements: ZnaikaAchievement[];
}

export interface ZnaikaShopItem {
  code: string;
  title: string;
  description: string;
  icon: string;
  kind: "discount_coupon" | "bonus_days" | "cosmetic";
  price: number;
  payload: Record<string, unknown>;
  tier: "common" | "rare" | "epic" | "legendary";
}

export interface ZnaikaRedemption {
  item_code: string;
  kind: string;
  coupon_code: string | null;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface ZnaikaContextValue {
  state: ZnaikaState | null;
  loading: boolean;
  refresh: () => Promise<void>;
  checkIn: () => Promise<{ ok: boolean; awarded?: { amount: number; reason: string }[]; new_achievements?: ZnaikaAchievement[]; already?: boolean }>;
  earn: (reason: string, amount?: number, description?: string) => Promise<void>;
  quoteDiscount: (price: number) => Promise<{ max_discount: number; final_price: number; balance: number; discount_percent_limit: number } | null>;
  spend: (amount: number, reason: string, description?: string) => Promise<{ ok: boolean; message?: string }>;
  fetchShop: () => Promise<{ items: ZnaikaShopItem[]; inventory: ZnaikaRedemption[]; balance: number } | null>;
  redeem: (itemCode: string) => Promise<{ ok: boolean; couponCode?: string | null; kind?: string; message?: string }>;
}

const ZnaikaContext = createContext<ZnaikaContextValue | null>(null);

export function ZnaikaProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [state, setState] = useState<ZnaikaState | null>(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback((): Record<string, string> => {
    if (!token) return { "Content-Type": "application/json" };
    return { "Content-Type": "application/json", "X-Auth-Token": token };
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) {
      setState(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${ZNAIKA_URL}?action=state`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  // Автозагрузка при логине
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setState(null);
    }
  }, [isAuthenticated, refresh]);

  // Авто чек-ин раз в сутки (тихо)
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const KEY = "znaika_last_auto_checkin";
    const today = new Date().toISOString().slice(0, 10);
    if (safeStorage.get(KEY) === today) return;
    fetch(`${ZNAIKA_URL}?action=checkin`, { method: "POST", headers: authHeaders(), body: "{}" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        safeStorage.set(KEY, today);
        if (data?.state) setState(data.state);
      })
      .catch(() => {});
  }, [isAuthenticated, token, authHeaders]);

  const checkIn = useCallback(async () => {
    if (!token) return { ok: false };
    try {
      const res = await fetch(`${ZNAIKA_URL}?action=checkin`, {
        method: "POST",
        headers: authHeaders(),
        body: "{}",
      });
      const data = await res.json();
      if (data?.state) setState(data.state);
      return data;
    } catch {
      return { ok: false };
    }
  }, [token, authHeaders]);

  const earn = useCallback(async (reason: string, amount?: number, description?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${ZNAIKA_URL}?action=earn`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason, amount, description }),
      });
      const data = await res.json();
      if (data?.state) setState(data.state);
    } catch {
      // silent
    }
  }, [token, authHeaders]);

  const quoteDiscount = useCallback(async (price: number) => {
    if (!token) return null;
    try {
      const res = await fetch(`${ZNAIKA_URL}?action=quote_discount`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ price }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, [token, authHeaders]);

  const spend = useCallback(async (amount: number, reason: string, description?: string) => {
    if (!token) return { ok: false, message: "Не авторизован" };
    try {
      const res = await fetch(`${ZNAIKA_URL}?action=spend`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ amount, reason, description }),
      });
      const data = await res.json();
      if (data?.state) setState(data.state);
      if (!res.ok) return { ok: false, message: data?.error };
      return { ok: true };
    } catch {
      return { ok: false, message: "Сетевая ошибка" };
    }
  }, [token, authHeaders]);

  const fetchShop = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${ZNAIKA_URL}?action=shop`, { headers: authHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, [token, authHeaders]);

  const redeem = useCallback(async (itemCode: string) => {
    if (!token) return { ok: false, message: "Войди в аккаунт" };
    try {
      const res = await fetch(`${ZNAIKA_URL}?action=redeem`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ item_code: itemCode }),
      });
      const data = await res.json();
      if (data?.state) setState(data.state);
      if (!res.ok) return { ok: false, message: data?.error };
      return { ok: true, couponCode: data.coupon_code, kind: data.kind };
    } catch {
      return { ok: false, message: "Сетевая ошибка" };
    }
  }, [token, authHeaders]);

  return (
    <ZnaikaContext.Provider value={{ state, loading, refresh, checkIn, earn, quoteDiscount, spend, fetchShop, redeem }}>
      {children}
    </ZnaikaContext.Provider>
  );
}

export function useZnaika(): ZnaikaContextValue {
  const ctx = useContext(ZnaikaContext);
  if (!ctx) {
    return {
      state: null,
      loading: false,
      refresh: async () => {},
      checkIn: async () => ({ ok: false }),
      earn: async () => {},
      quoteDiscount: async () => null,
      spend: async () => ({ ok: false }),
      fetchShop: async () => null,
      redeem: async () => ({ ok: false }),
    };
  }
  return ctx;
}

/** Утилита форматирования: 1 234 ₽ */
export function formatZnaika(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}