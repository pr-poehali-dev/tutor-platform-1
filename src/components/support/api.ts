import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["support"];
const TOKEN_KEY = "uchispro_auth_token_v1";
const PIN_KEY = "uchispro_admin_pin_v1";

export interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", ...extra };
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) h["X-Auth-Token"] = t;
  } catch { /* noop */ }
  return h;
}

export async function supportChat(question: string, history: ChatMsg[], page: string): Promise<{ answer: string; escalate: boolean }> {
  try {
    const r = await fetch(`${URL}?action=chat`, { method: "POST", headers: headers(), body: JSON.stringify({ question, history, page }) });
    const d = await r.json();
    if (!r.ok) return { answer: d.error || "Не получилось ответить. Оставьте обращение команде.", escalate: true };
    return d;
  } catch {
    return { answer: "Нет связи с сервером. Проверьте интернет или оставьте обращение команде.", escalate: true };
  }
}

export interface TicketPayload {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  message: string;
  subject?: string;
  page?: string;
  chat?: ChatMsg[];
  website?: string;
}

export async function supportTicket(p: TicketPayload): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const r = await fetch(`${URL}?action=ticket`, { method: "POST", headers: headers(), body: JSON.stringify({ ...p, source: "widget" }) });
    const d = await r.json();
    return r.ok ? { ok: true, message: d.message } : { ok: false, error: d.error };
  } catch {
    return { ok: false, error: "Нет связи с сервером" };
  }
}

export interface SupportTicket {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "done" | "spam";
  source: string;
  page: string | null;
  chat: string | null;
  note: string | null;
  notified: boolean;
  created_at: string;
}

export interface SupportList {
  items: SupportTicket[];
  counts: Record<string, number>;
  topics: Record<string, string>;
  chat_7d: { questions: number; escalated: number };
  recent_chat: { question: string; answer: string; escalate: boolean; page: string | null; at: string }[];
  notify: { max: boolean; email: string };
}

function pin(): string {
  try { return sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || ""; } catch { return ""; }
}

async function admin<T>(action: string, method = "GET", body?: unknown, query = ""): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const r = await fetch(`${URL}?action=${action}${query}`, { method, headers: headers({ "X-Admin-Pin": pin() }), body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    return r.ok ? { ok: true, data: d, status: r.status } : { ok: false, error: d.error || "Ошибка", status: r.status };
  } catch {
    return { ok: false, error: "Нет связи с сервером", status: 0 };
  }
}

export const supportAdmin = {
  list: (status: string, includeTest: boolean) =>
    admin<SupportList>("list", "GET", undefined, `${status ? `&status=${status}` : ""}${includeTest ? "&include_test=1" : ""}`),
  update: (id: number, patch: { status?: string; note?: string }) => admin<{ ok: boolean }>("update", "POST", { id, ...patch }),
  notifyTest: () => admin<{ ok: boolean; max: boolean; email: boolean; email_to: string }>("notify_test", "POST", {}),
};

export interface MonitorItem {
  name: string;
  label: string;
  status: "ok" | "degraded" | "fail" | "unknown";
  fails: number;
  error: string | null;
  ms: number | null;
  checked_at: string | null;
  last_ok_at: string | null;
}

export interface MonitorStatus {
  last_run_at: string | null;
  summary: string | null;
  items: MonitorItem[];
  interval_min: number;
}

export const monitorAdmin = {
  status: () => admin<MonitorStatus>("monitor_status"),
  run: () => admin<MonitorStatus>("monitor_run", "POST", {}),
};

let monitorTicked = false;
/** Шаг мониторинга — раз за сессию вкладки; сервер сам проверяет не чаще раза в 5 минут. */
export function monitorTick() {
  if (monitorTicked || !URL) return;
  monitorTicked = true;
  setTimeout(() => { fetch(`${URL}?action=monitor_tick`).catch(() => undefined); }, 12000);
}
