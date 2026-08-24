import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["course-order"] || "";

export interface OrderModule {
  title: string;
  goal: string;
  lessons: string[];
}

export interface OrderPlan {
  matched_course_id?: number | null;
  matched_course_title?: string | null;
  match_percent?: number;
  match_reason?: string;
  covered?: string[];
  missing?: string[];
  course_title: string;
  summary: string;
  modules: OrderModule[];
  extras?: string[];
  duration_weeks?: number;
  hours_per_week?: number;
  final_project?: string;
  is_fallback?: boolean;
}

export interface OrderRequest {
  topic: string;
  goal?: string;
  level?: string;
  format_pref?: string;
  time_per_week?: string;
  deadline_pref?: string;
  details?: string;
}

export interface CatalogItem {
  id: number;
  title: string;
  subject: string;
}

export const MIN_PRICE = 10000;

export async function matchCourse(
  req: OrderRequest,
  catalog: CatalogItem[],
): Promise<{ ok: boolean; plan?: OrderPlan; message?: string }> {
  if (!URL) return { ok: false, message: "Сервис подбора временно недоступен" };
  try {
    const res = await fetch(`${URL}?action=match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req, catalog }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error || "Не удалось подобрать курс" };
    return { ok: true, plan: data.plan };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface OrderSubmitPayload extends OrderRequest {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  matched?: OrderPlan;
  price?: number;
  utm?: Record<string, string>;
}

export async function submitOrder(
  payload: OrderSubmitPayload,
): Promise<{ ok: boolean; message?: string }> {
  if (!URL) return { ok: false, message: "Отправка временно недоступна" };
  try {
    const res = await fetch(`${URL}?action=submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export function collectUtm(): Record<string, string> | undefined {
  try {
    const p = new URLSearchParams(window.location.search);
    const collected: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
      const v = p.get(k);
      if (v) collected[k] = v;
    });
    return Object.keys(collected).length ? collected : undefined;
  } catch {
    return undefined;
  }
}