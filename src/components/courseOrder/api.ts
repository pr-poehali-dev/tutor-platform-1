import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["course-order"] || "";
const CONTACT_URL = (func2url as Record<string, string>)["contact"] || "";

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

/** Запасной канал: заявка уходит в общую форму обращений, чтобы не потеряться. */
async function submitViaContact(
  payload: OrderSubmitPayload,
): Promise<{ ok: boolean; message?: string }> {
  if (!CONTACT_URL) return { ok: false, message: "Отправка временно недоступна" };
  const lines = [
    "ЗАКАЗ ИНДИВИДУАЛЬНОГО КУРСА",
    `Тема: ${payload.topic}`,
    payload.goal ? `Цель: ${payload.goal}` : "",
    payload.level ? `Уровень: ${payload.level}` : "",
    payload.time_per_week ? `Время: ${payload.time_per_week}` : "",
    payload.deadline_pref ? `Сроки: ${payload.deadline_pref}` : "",
    payload.format_pref ? `Формат: ${payload.format_pref}` : "",
    payload.details ? `Детали: ${payload.details}` : "",
    payload.matched?.course_title ? `Подобрано: ${payload.matched.course_title}` : "",
  ].filter(Boolean);
  try {
    const res = await fetch(`${CONTACT_URL}?action=feedback_submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_name: payload.contact_name,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone,
        subject: "general",
        message: lines.join("\n").slice(0, 5000),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export async function submitOrder(
  payload: OrderSubmitPayload,
): Promise<{ ok: boolean; message?: string }> {
  if (!URL) return submitViaContact(payload);
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
    return submitViaContact(payload);
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