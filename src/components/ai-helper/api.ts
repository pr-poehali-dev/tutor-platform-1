import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["ai-helper"];
const TOKEN_KEY = "uchispro_auth_token_v1";

export interface HelperTemplate {
  id: string;
  title: string;
  role: string;
  greeting: string;
  instructions: string;
  knowledge: string;
}

export interface PlanLimits {
  helpers: number;
  knowledge: number;
  answers_month: number;
}

export interface Helper {
  id: number;
  slug: string;
  name: string;
  role: string;
  template: string;
  greeting: string;
  instructions: string;
  knowledge: string;
  contact: string;
  tone: "friendly" | "business" | "simple";
  color: string;
  is_active: boolean;
  is_pro: boolean;
  pro_until?: string | null;
  answers_total?: number;
  month_answers?: number;
  limits?: PlanLimits;
}

export interface HelperReport {
  is_pro: boolean;
  summary: { questions_30d: number; missed_30d: number; people_30d: number; questions_7d: number; month_answers: number };
  missed?: { question: string; count: number; last_at: string }[];
  recent?: { question: string; answer: string; found: boolean; at: string }[];
}

type Res<T> = { ok: boolean; data?: T; error?: string; status: number };

async function req<T>(action: string, opts: { method?: string; body?: unknown; query?: Record<string, string> } = {}): Promise<Res<T>> {
  const qs = new URLSearchParams({ action, ...(opts.query || {}) });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers["X-Auth-Token"] = token;
  try {
    const r = await fetch(`${URL}?${qs}`, {
      method: opts.method || "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data?.error || "Ошибка сервера", status: r.status };
    return { ok: true, data, status: r.status };
  } catch {
    return { ok: false, error: "Нет связи с сервером", status: 0 };
  }
}

export const helperApi = {
  templates: () => req<{ templates: HelperTemplate[]; limits: Record<"free" | "pro", PlanLimits>; pro_price: number }>("templates"),
  my: () => req<{ items: Helper[]; limits: Record<"free" | "pro", PlanLimits>; pro_price: number }>("my"),
  save: (h: Partial<Helper>) => req<{ item: Helper }>("save", { method: "POST", body: h }),
  remove: (id: number) => req<{ ok: boolean }>("delete", { method: "POST", body: { id } }),
  report: (id: number) => req<HelperReport>("report", { query: { id: String(id) } }),
  proOrder: (id: number) => req<{ pay_id: number; amount: number }>("pro_order", { method: "POST", body: { id } }),
  publicInfo: (slug: string) => req<{ item: Helper }>("public", { query: { slug } }),
  ask: (slug: string, question: string, history: { role: string; text: string }[]) =>
    req<{ answer: string; found: boolean; limit?: boolean }>("ask", { method: "POST", body: { slug, question, history } }),
};

export const helperLink = (slug: string) => `${window.location.origin}/h/${slug}`;
