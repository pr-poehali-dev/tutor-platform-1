import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import func2url from "../../backend/func2url.json";
import { useAuth } from "@/context/AuthContext";
import { isPromoActive } from "@/components/promo/dobroConfig";
import { isCourseFreeForever, isSchoolCourse } from "@/components/courses/courseAccessFlags";
import { safeFetch } from "@/lib/safeFetch";

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

/** Доступ к модулю «Малыш» — изолирован от школьной подписки. */
export interface KidsAccessState {
  /** Открыт ли детский раздел: платная подписка «Малыш» или бесплатный период. */
  access: boolean;
  /** Откуда доступ: subscription — оплачен, trial — бесплатные 3 месяца. */
  source: "subscription" | "trial" | null;
  /** Когда заканчивается — показываем родителю в кабинете. */
  expiresAt: string | null;
  /** Использован ли уже бесплатный период (повторно его не дают). */
  trialUsed: boolean;
}

interface AccessState {
  loading: boolean;
  hasSubscription: boolean;
  purchasedCourseIds: number[];
  /** До какой даты открыты курсы «Школьникам» по промокоду (пилот школ). */
  schoolAccessUntil: string | null;
  /** Активирует промокод бесплатного доступа (напр. «САМАРА»). */
  redeemAccessCode: (code: string) => Promise<{ ok: boolean; alreadyActive?: boolean; expiresAt?: string; message?: string }>;
  /** Детский модуль живёт отдельно: своя подписка, свой срок. */
  kids: KidsAccessState;
  /** Включает бесплатные 3 месяца «Малыша». Карта не нужна. */
  startKidsTrial: () => Promise<{ ok: boolean; expiresAt?: string; message?: string }>;
  canAccessCourse: (courseId: number) => boolean;
  refreshAccess: () => Promise<void>;
  buyCourse: (courseId: number, grade: string, title: string, returnUrl: string, email?: string, promoCode?: string) => Promise<BuyCourseResult>;
  buySubscription: (planId: string, returnUrl: string, email?: string, period?: "month" | "year", couponCode?: string) => Promise<BuySubscriptionResult>;
  validateCoupon: (couponCode: string, amountRub: number) => Promise<{ valid: boolean; percent?: number; discountRub?: number; finalRub?: number; message?: string }>;
  syncPayment: () => Promise<{ synced: boolean; activated?: Array<{ kind: string; id: number; course_id?: number }> }>;
  confirmDemoPurchase: (purchaseId: number, kind?: "course" | "subscription") => Promise<{ ok: boolean; courseId?: number; subscriptionId?: number; message?: string }>;
}

const AccessContext = createContext<AccessState | null>(null);

function readToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

const KIDS_EMPTY: KidsAccessState = {
  access: false,
  source: null,
  expiresAt: null,
  trialUsed: false,
};

export function AccessProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<number[]>([]);
  const [kids, setKids] = useState<KidsAccessState>(KIDS_EMPTY);
  const [schoolAccessUntil, setSchoolAccessUntil] = useState<string | null>(null);

  const refreshAccess = useCallback(async () => {
    const authToken = token || readToken();
    if (!authToken) {
      setHasSubscription(false);
      setPurchasedCourseIds([]);
      setKids(KIDS_EMPTY);
      setSchoolAccessUntil(null);
      return;
    }
    setLoading(true);
    const res = await safeFetch<{
      has_subscription?: boolean;
      purchased_course_ids?: number[];
      kids_access?: boolean;
      kids_source?: "subscription" | "trial" | null;
      kids_expires_at?: string | null;
      kids_trial_used?: boolean;
      school_access_until?: string | null;
    }>(
      `${ACCESS_URL}?action=check`,
      { method: "GET", headers: { "X-Auth-Token": authToken } }
    );
    if (res.ok && res.data) {
      setHasSubscription(!!res.data.has_subscription);
      setPurchasedCourseIds(
        Array.isArray(res.data.purchased_course_ids) ? res.data.purchased_course_ids : []
      );
      setKids({
        access: !!res.data.kids_access,
        source: res.data.kids_source ?? null,
        expiresAt: res.data.kids_expires_at ?? null,
        trialUsed: !!res.data.kids_trial_used,
      });
      setSchoolAccessUntil(res.data.school_access_until ?? null);
    }
    // При сбое/таймауте мягко считаем, что доступа нет — без падения и без зависания.
    setLoading(false);
  }, [token]);

  const startKidsTrial = useCallback(async () => {
    const authToken = token || readToken();
    if (!authToken) return { ok: false, message: "Сначала войдите в аккаунт" };
    try {
      const res = await fetch(`${ACCESS_URL}?action=kids_start_trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || "Не удалось включить доступ" };
      await refreshAccess();
      return { ok: true, expiresAt: data.expires_at };
    } catch {
      return { ok: false, message: "Нет связи с сервером" };
    }
  }, [token, refreshAccess]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAccess();
    } else {
      setHasSubscription(false);
      setPurchasedCourseIds([]);
      setKids(KIDS_EMPTY);
      setSchoolAccessUntil(null);
    }
  }, [isAuthenticated, refreshAccess]);

  const redeemAccessCode = useCallback(async (code: string) => {
    const authToken = token || readToken();
    if (!authToken) return { ok: false, message: "Сначала войдите в аккаунт" };
    try {
      const res = await fetch(`${ACCESS_URL}?action=redeem_access`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || "Не удалось активировать промокод" };
      await refreshAccess();
      return { ok: true, alreadyActive: !!data.already_active, expiresAt: data.expires_at };
    } catch {
      return { ok: false, message: "Нет связи с сервером" };
    }
  }, [token, refreshAccess]);

  const canAccessCourse = useCallback(
    // Бесплатные навсегда курсы открыты всем и всегда.
    // Во время акции «ДОБРО» — все курсы доступны бесплатно для всех.
    (courseId: number) =>
      isCourseFreeForever(courseId) || isPromoActive() || hasSubscription || purchasedCourseIds.includes(courseId) ||
      (!!schoolAccessUntil && new Date(schoolAccessUntil) > new Date() && isSchoolCourse(courseId)),
    [hasSubscription, purchasedCourseIds, schoolAccessUntil]
  );

  const buyCourse = useCallback(async (courseId: number, grade: string, title: string, returnUrl: string, email?: string, promoCode?: string): Promise<BuyCourseResult> => {
    const authToken = token || readToken();
    if (!authToken) return { ok: false, message: "Сначала войди в аккаунт" };
    try {
      const res = await fetch(`${ACCESS_URL}?action=buy_course`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: JSON.stringify({ course_id: courseId, grade, title, return_url: returnUrl, email, promo_code: promoCode }),
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

  const buySubscription = useCallback(async (planId: string, returnUrl: string, email?: string, period: "month" | "year" = "month", couponCode?: string): Promise<BuySubscriptionResult> => {
    const authToken = token || readToken();
    if (!authToken) return { ok: false, message: "Сначала войди в аккаунт" };
    try {
      const res = await fetch(`${ACCESS_URL}?action=buy_subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: JSON.stringify({ plan_id: planId, return_url: returnUrl, email, period, coupon_code: couponCode }),
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

  const validateCoupon = useCallback(async (couponCode: string, amountRub: number) => {
    const authToken = token || readToken();
    try {
      const res = await fetch(`${ACCESS_URL}?action=validate_coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authToken ? { "X-Auth-Token": authToken } : {}) },
        body: JSON.stringify({ coupon_code: couponCode, amount_rub: amountRub }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { valid: false, message: data?.message || "Промокод не найден" };
      }
      return {
        valid: true,
        percent: data.percent,
        discountRub: data.discount_rub,
        finalRub: data.final_rub,
      };
    } catch {
      return { valid: false, message: "Нет связи с сервером" };
    }
  }, [token]);

  const syncPayment = useCallback(async () => {
    const authToken = token || readToken();
    if (!authToken) return { synced: false };
    try {
      const res = await fetch(`${ACCESS_URL}?action=sync_payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": authToken },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      await refreshAccess();
      return { synced: !!data.synced, activated: data.activated };
    } catch {
      return { synced: false };
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
    schoolAccessUntil,
    redeemAccessCode,
    kids,
    startKidsTrial,
    canAccessCourse,
    refreshAccess,
    buyCourse,
    buySubscription,
    validateCoupon,
    syncPayment,
    confirmDemoPurchase,
  };

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

// Безопасное значение по умолчанию: если контекст временно недоступен
// (например, рассинхрон Vite-кэша при hot-reload в dev), компонент не роняет
// всё приложение, а получает нейтральное состояние «без доступа».
const ACCESS_FALLBACK: AccessState = {
  loading: false,
  hasSubscription: false,
  purchasedCourseIds: [],
  schoolAccessUntil: null,
  redeemAccessCode: async () => ({ ok: false, message: "Доступ недоступен" }),
  kids: KIDS_EMPTY,
  startKidsTrial: async () => ({ ok: false, message: "Доступ недоступен" }),
  canAccessCourse: () => false,
  refreshAccess: async () => {},
  buyCourse: async () => ({ ok: false, message: "Доступ недоступен" }),
  buySubscription: async () => ({ ok: false, message: "Доступ недоступен" }),
  validateCoupon: async () => ({ valid: false }),
  syncPayment: async () => ({ synced: false }),
  confirmDemoPurchase: async () => ({ ok: false }),
};

export function useAccess(): AccessState {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn("useAccess: AccessProvider не найден — использую значение по умолчанию");
    }
    return ACCESS_FALLBACK;
  }
  return ctx;
}