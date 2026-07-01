import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["contact"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export interface Review {
  id: number;
  author_name: string;
  author_role: "student" | "parent" | "teacher";
  rating: number;
  text: string;
  avatar_url: string | null;
  created_at: string | null;
}

export async function fetchReviews(): Promise<{ items: Review[]; avg_rating: number; total: number }> {
  try {
    const res = await fetch(`${URL}?action=reviews_list`);
    if (!res.ok) return { items: [], avg_rating: 0, total: 0 };
    return await res.json();
  } catch {
    return { items: [], avg_rating: 0, total: 0 };
  }
}

export interface SubmitReviewPayload {
  author_name: string;
  author_role: "student" | "parent" | "teacher";
  rating: number;
  text: string;
}

export async function submitReview(payload: SubmitReviewPayload): Promise<{ ok: boolean; message?: string }> {
  const t = token();
  if (!t) return { ok: false, message: "Войди в кабинет" };
  try {
    const res = await fetch(`${URL}?action=review_submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true, message: data.message };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface FeedbackPayload {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  subject: "general" | "payment" | "tech" | "idea" | "cooperation" | "press";
  message: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<{ ok: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const t = token();
    if (t) headers["X-Auth-Token"] = t;
    const res = await fetch(`${URL}?action=feedback_submit`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true, message: data.message };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface PartnerLeadPayload {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  company?: string;
  audience_type?: "author" | "school" | "business" | "edu";
  topic?: string;
  students_est?: string;
  plan_interest?: "start" | "pro" | "scale";
  message?: string;
  utm?: Record<string, string>;
}

export async function submitPartnerLead(payload: PartnerLeadPayload): Promise<{ ok: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const t = token();
    if (t) headers["X-Auth-Token"] = t;
    const res = await fetch(`${URL}?action=partner_lead`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true, message: data.message };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}