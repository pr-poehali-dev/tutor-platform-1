import func2url from "../../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["edu-institutions"];
const PIN_KEY = "uchispro_admin_pin_v1";

export type EduKind = "online_school" | "college" | "technical_school" | "other";
export type EduStatus = "new" | "contacted" | "negotiation" | "partner" | "declined";

export interface EduInstitution {
  id: number;
  org_name: string;
  kind: EduKind;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  website: string;
  status: EduStatus;
  note: string;
  created_at: string | null;
  updated_at: string | null;
  address?: string;
  segment?: string;
  source?: string;
  unsubscribed?: boolean;
  last_mailed_at?: string | null;
  mail_count?: number;
}

export const KIND_LABELS: Record<EduKind, string> = {
  online_school: "Онлайн-школа",
  college: "Колледж",
  technical_school: "Техникум",
  other: "Другое",
};

export const STATUS_LABELS: Record<EduStatus, string> = {
  new: "Новый",
  contacted: "Связались",
  negotiation: "Переговоры",
  partner: "Партнёр",
  declined: "Отказ",
};

export const STATUS_TONE: Record<EduStatus, string> = {
  new: "#64748b",
  contacted: "#0ea5e9",
  negotiation: "#f59e0b",
  partner: "#10b981",
  declined: "#ef4444",
};

function pin(): string {
  try {
    return sessionStorage.getItem(PIN_KEY) || localStorage.getItem(PIN_KEY) || "";
  } catch {
    return "";
  }
}

interface Result<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function req<T>(
  action: string,
  opts: { method?: string; body?: unknown; query?: Record<string, string> } = {}
): Promise<Result<T>> {
  const params = new URLSearchParams({ action, ...(opts.query || {}) });
  try {
    const res = await fetch(`${URL}?${params.toString()}`, {
      method: opts.method || "GET",
      headers: { "Content-Type": "application/json", "X-Admin-Pin": pin() },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || `Ошибка ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Сеть недоступна" };
  }
}

export interface ListResponse {
  items: EduInstitution[];
  total: number;
  by_kind: Record<string, number>;
}

export function listInstitutions(query: { kind?: string; status?: string; q?: string; city?: string }) {
  const q: Record<string, string> = {};
  if (query.city) q.city = query.city;
  if (query.kind) q.kind = query.kind;
  if (query.status) q.status = query.status;
  if (query.q) q.q = query.q;
  return req<ListResponse>("list", { query: q });
}

export type EduInput = Omit<EduInstitution, "id" | "created_at" | "updated_at" | "address" | "segment" | "source" | "unsubscribed" | "last_mailed_at" | "mail_count"> & { id?: number };

export function createInstitution(body: EduInput) {
  return req<{ item: EduInstitution }>("create", { method: "POST", body });
}

export function updateInstitution(body: EduInput) {
  return req<{ item: EduInstitution }>("update", { method: "POST", body });
}

export function deleteInstitution(id: number) {
  return req<{ ok: boolean }>("delete", { method: "POST", body: { id } });
}

export function exportCsv() {
  return req<{ csv: string }>("export");
}

export interface ImportRow {
  org_name?: string;
  kind?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  city?: string;
  website?: string;
  note?: string;
}

export function importInstitutions(rows: ImportRow[]) {
  return req<{ inserted: number; skipped: number; total: number }>("import", {
    method: "POST",
    body: { rows },
  });
}
export interface OutreachSend {
  to: string;
  status: string;
  error: string;
  is_test: boolean;
  at: string;
  org: string;
}

export interface OutreachStatus {
  smtp_configured: boolean;
  sender: string | null;
  subject: string;
  total: number;
  with_email: number;
  unsubscribed: number;
  pending: number;
  sends: { status: string; is_test: boolean; count: number }[];
  last: OutreachSend[];
  batch_max: number;
}

export function outreachStatus() {
  return req<OutreachStatus>("outreach_status");
}

export function outreachPreview() {
  return req<{ subject: string; html: string; text: string; to: string }>("outreach_preview");
}

export function outreachTest(email: string) {
  return req<{ ok: boolean; to?: string; error?: string }>("outreach_test", { method: "POST", body: { email } });
}

export function outreachSend(limit: number) {
  return req<{ sent: number; failed: number; left: number; done: boolean; errors?: { org: string; email: string; error: string }[] }>(
    "outreach_send",
    { method: "POST", body: { limit, confirm: "SEND" } },
  );
}

export interface PilotCityStat {
  slug: string;
  name: string;
  name_gen: string;
  promo_code: string;
  campaign_code: string;
  wave: number;
  page_slug: string | null;
  active: boolean;
  total: number;
  with_email: number;
  unsubscribed: number;
  pending: number;
  sent: number;
  failed: number;
  activations: number;
}

export interface PilotOverview {
  cities: PilotCityStat[];
  auto: { enabled: boolean; daily_limit: number };
  sent_today: number;
  cooldown_min: number;
  registry_rows: number;
  smtp_configured: boolean;
  sender: string | null;
  batch_max: number;
  last: (OutreachSend & { city: string })[];
}

export function pilotOverview() {
  return req<PilotOverview>("pilot_overview");
}

export function pilotPreview(city: string) {
  return req<{ subject: string; html: string; text: string; to: string }>("pilot_preview", { query: { city } });
}

export function pilotTest(city: string, email: string) {
  return req<{ ok: boolean; to?: string; error?: string }>("pilot_test", { method: "POST", body: { city, email } });
}

export function pilotSend(city: string, limit: number) {
  return req<{ sent: number; failed: number; left: number; done: boolean; errors?: { org: string; email: string; error: string }[] }>(
    "pilot_send",
    { method: "POST", body: { city, limit, confirm: "SEND" } },
  );
}

export function pilotSettings(body: { enabled?: boolean; daily_limit?: number }) {
  return req<{ enabled: boolean; daily_limit: number }>("pilot_settings", { method: "POST", body });
}

/** Шаг авторассылки: публичный, без PIN. Сервер сам решает, слать ли сейчас. */
export function pilotTick() {
  return fetch(`${URL}?action=pilot_tick`).catch(() => undefined);
}
