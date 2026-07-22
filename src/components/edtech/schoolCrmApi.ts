import func2url from "../../../backend/func2url.json";

const CRM_URL = (func2url as Record<string, string>)["school-crm"];

export type ProspectStatus = "new" | "contacted" | "negotiation" | "client" | "rejected";

export interface SchoolProspect {
  id: number;
  name: string;
  segment: string;
  subjects: string[];
  city: string | null;
  size_hint: string | null;
  contact_hint: string | null;
  site: string | null;
  fit_reason: string | null;
  services_offered: string[];
  status: ProspectStatus;
  note: string;
  emoji: string;
  color: string;
  is_seed: boolean;
}

export interface CrmResponse {
  items: SchoolProspect[];
  stats: Record<ProspectStatus, number>;
  total: number;
}

export async function fetchProspects(): Promise<CrmResponse> {
  const res = await fetch(CRM_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateProspect(
  id: number,
  patch: { status?: ProspectStatus; note?: string; services_offered?: string[] }
): Promise<SchoolProspect> {
  const res = await fetch(CRM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", id, ...patch }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка обновления");
  return data.item;
}

export async function createProspect(payload: {
  name: string;
  segment?: string;
  subjects?: string[];
  city?: string;
  contact_hint?: string;
  site?: string;
  fit_reason?: string;
}): Promise<SchoolProspect> {
  const res = await fetch(CRM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "upsert", ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка создания");
  return data.item;
}

export async function deleteProspect(id: number): Promise<void> {
  const res = await fetch(CRM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Ошибка удаления");
  }
}

export const STATUS_META: Record<ProspectStatus, { label: string; tone: string; dot: string }> = {
  new: { label: "Новый", tone: "bg-slate-500/15 text-slate-200 border-slate-400/30", dot: "bg-slate-400" },
  contacted: { label: "Связались", tone: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30", dot: "bg-cyan-400" },
  negotiation: { label: "Переговоры", tone: "bg-amber-500/15 text-amber-200 border-amber-400/30", dot: "bg-amber-400" },
  client: { label: "Клиент", tone: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30", dot: "bg-emerald-400" },
  rejected: { label: "Отказ", tone: "bg-rose-500/15 text-rose-200 border-rose-400/30", dot: "bg-rose-400" },
};

export const STATUS_ORDER: ProspectStatus[] = ["new", "contacted", "negotiation", "client", "rejected"];

/** Услуги платформы, которые предлагаем маленьким школам. */
export const SERVICES = [
  { id: "lms", label: "ИИ-платформа / LMS", emoji: "🖥️" },
  { id: "builder", label: "Конструктор курсов", emoji: "🧩" },
  { id: "tutor", label: "ИИ-репетитор / голос", emoji: "🎙️" },
  { id: "content", label: "Готовые курсы / контент", emoji: "📦" },
];

export const SEGMENT_META: Record<string, { label: string; emoji: string }> = {
  school: { label: "Школьная программа", emoji: "📚" },
  lang: { label: "Языки", emoji: "🌍" },
  it: { label: "IT для детей", emoji: "💻" },
  creative: { label: "Творчество", emoji: "🎨" },
  kids: { label: "Дети / дошкольники", emoji: "🧸" },
  other: { label: "Другое", emoji: "🏫" },
};
