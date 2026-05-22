import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import func2url from "../../backend/func2url.json";
import { useAuth } from "@/context/AuthContext";

const ACCESS_URL = (func2url as Record<string, string>).access;
const TOKEN_KEY = "uchispro_auth_token_v1";

export interface BuyCourseResult {
  ok: boolean;
  purchaseId?: number;
  amount?: number;
  message?: string;
  alreadyPurchased?: boolean;
  paymentUrl?: string;
  demoMode?: boolean;
}

export interface BuySubscriptionResult {
  ok: boolean;
  subscriptionId?: number;
  amount?: number;
  message?: string;
  alreadySubscribed?: boolean;
  expiresAt?: string;
  paymentUrl?: string;
  demoMode?: boolean;
}

interface AccessState {
  loading: boolean;
  hasSubscription: boolean;
  purchasedCourseIds: number[];
  canAccessCourse: (courseId: number) => boolean;
  refreshAccess: () => Promise<void>;
  buyCourse: (courseId: number, grade: string, title: string, returnUrl: string, email?: string) => Promise<BuyCourseResult>;
  buySubscription: (planId: string, returnUrl: string, email?: string) => Promise<BuySubscriptionResult>;
  confirmDemoPurchase: (purchaseId: number, kind?: "course" | "subscription") => Promise<{ ok: boolean; courseId?: number; subscriptionId?: number; message?: string }>;
}

const AccessContext = createContext<AccessState | null>(null);

function readToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<number[]>([]);

  const refreshAccess = useCallback(async () => {
    const authToken = token || readToken();
    if (!authToken) {
      setHasSubscription(false);
      setPurchasedCourseIds([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${ACCESS_URL}?action=check`, {
        method: "GET",
        headers: { "X-Auth-Token": authToken },
      });
      if (res.ok) {
        const data = await res.json();
        setHasSubscription(!!data.has_subscription);
        setPurchasedCourseIds(Array.isArray(data.purchased_course_ids) ? data.purchased_course_ids : []);
      }
    } catch {
      // soft-fail: считаем что доступа нет
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAccess();
    } else {
      setHasSubscription(false);
      setPurchasedCourseIds([]);
    }
  }, [isAuthenticated, refreshAccess]);

  const canAccessCourse = useCallback(
    (courseId: number) => hasSubscription || purchasedCourseIds.includes(courseId),
    [hasSubscription, purchasedCourseIds]
  );

  const buyCourse = useCallback(async (courseId: number, grade: string, title: string, returnUrl: string, email?: string): Promise<BuyCourseResult> => {
    const authToken = token || readToken();
    if (!authToken) return { ok: false, message: "Сначала войди в аккаунт" };
    try {
      const res = await fetch(`${ACCESS_URL}?action=buy_course`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: JSON.stringify({ course_id: courseId, grade, title, return_url: returnUrl, email }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || "Не получилось оформить покупку" };
      if (data.already_purchased) return { ok: true, alreadyPurchased: true };
      return {
        ok: true,
        purchaseId: data.purchase_id,
        amount: data.amount_rub,
        paymentUrl: data.payment_url,
        demoMode: !!data.demo_mode,
      };
    } catch {
      return { ok: false, message: "Нет связи с сервером" };
    }
  }, [token]);

  const buySubscription = useCallback(async (planId: string, returnUrl: string, email?: string): Promise<BuySubscriptionResult> => {
    const authToken = token || readToken();
    if (!authToken) return { ok: false, message: "Сначала войди в аккаунт" };
    try {
      const res = await fetch(`${ACCESS_URL}?action=buy_subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: JSON.stringify({ plan_id: planId, return_url: returnUrl, email }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || "Не получилось оформить подписку" };
      if (data.already_subscribed) {
        await refreshAccess();
        return { ok: true, alreadySubscribed: true, expiresAt: data.expires_at };
      }
      return {
        ok: true,
        subscriptionId: data.subscription_id,
        amount: data.amount_rub,
        paymentUrl: data.payment_url,
        demoMode: !!data.demo_mode,
      };
    } catch {
      return { ok: false, message: "Нет связи с сервером" };
    }
  }, [token, refreshAccess]);

  const confirmDemoPurchase = useCallback(async (purchaseId: number, kind: "course" | "subscription" = "course") => {
    const authToken = token || readToken();
    if (!authToken) return { ok: false, message: "Требуется вход" };
    try {
      const res = await fetch(`${ACCESS_URL}?action=confirm_demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: JSON.stringify({ purchase_id: purchaseId, kind }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || "Не удалось подтвердить" };
      await refreshAccess();
      return { ok: true, courseId: data.course_id, subscriptionId: data.subscription_id };
    } catch {
      return { ok: false, message: "Нет связи с сервером" };
    }
  }, [token, refreshAccess]);

  const value: AccessState = {
    loading,
    hasSubscription,
    purchasedCourseIds,
    canAccessCourse,
    refreshAccess,
    buyCourse,
    buySubscription,
    confirmDemoPurchase,
  };

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessState {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}