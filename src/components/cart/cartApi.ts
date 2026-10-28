import func2url from "../../../backend/func2url.json";

const ACCESS_URL = (func2url as Record<string, string>).access;

export interface CartQuoteItem {
  course_id: number;
  price_rub: number;
  final_rub: number;
}

export interface CartQuote {
  items: CartQuoteItem[];
  skipped: { course_id: number; reason: "free" | "owned" | "unknown" }[];
  count: number;
  total_rub: number;
  discount_percent: number;
  discount_rub: number;
  final_rub: number;
}

export interface BuyCartResult extends Partial<CartQuote> {
  ok: boolean;
  message?: string;
  cartId?: string;
  purchaseIds?: number[];
  paymentUrl?: string;
  demoMode?: boolean;
  alreadyPurchased?: boolean;
}

export async function fetchCartQuote(courseIds: number[], token: string | null): Promise<CartQuote | null> {
  try {
    const res = await fetch(`${ACCESS_URL}?action=cart_quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { "X-Auth-Token": token } : {}) },
      body: JSON.stringify({ course_ids: courseIds }),
    });
    if (!res.ok) return null;
    return (await res.json()) as CartQuote;
  } catch {
    return null;
  }
}

export async function buyCart(courseIds: number[], token: string, returnUrl: string, email: string): Promise<BuyCartResult> {
  try {
    const res = await fetch(`${ACCESS_URL}?action=buy_cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ course_ids: courseIds, return_url: returnUrl, email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: data.error || "Не получилось оформить заказ" };
    return {
      ok: true,
      ...data,
      cartId: data.cart_id,
      purchaseIds: data.purchase_ids,
      paymentUrl: data.payment_url,
      demoMode: !!data.demo_mode,
      alreadyPurchased: !!data.already_purchased,
    };
  } catch {
    return { ok: false, message: "Нет связи с сервером" };
  }
}
