import func2url from "../../../../backend/func2url.json";
import { savedAdminPin } from "@/lib/adminAuth";

const URL = (func2url as Record<string, string>)["tutor-scout"];

export type Status = "found" | "contacted" | "replied" | "talks" | "partner" | "declined";

export const STATUSES: { id: Status; label: string; color: string }[] = [
  { id: "found", label: "Найден", color: "bg-white/10 text-white/80" },
  { id: "contacted", label: "Написали", color: "bg-sky-500/20 text-sky-200" },
  { id: "replied", label: "Ответил", color: "bg-amber-500/20 text-amber-200" },
  { id: "talks", label: "Переговоры", color: "bg-violet-500/20 text-violet-200" },
  { id: "partner", label: "Партнёр", color: "bg-emerald-500/20 text-emerald-200" },
  { id: "declined", label: "Отказ", color: "bg-rose-500/20 text-rose-200" },
];

export const SOURCE_LABEL: Record<string, string> = {
  vk: "ВКонтакте",
  web: "Интернет",
  channels: "Канал",
  bot: "Бот MAX",
  manual: "Вручную",
};

export interface Found {
  source: string;
  kind: string;
  name: string;
  url: string;
  snippet: string;
  subject?: string | null;
  city?: string | null;
  write_url: string;
  phone?: string | null;
  email?: string | null;
  messenger?: string | null;
  in_base?: boolean;
}

export interface Partner extends Found {
  id: number;
  status: Status;
  draft: string | null;
  notes: string | null;
  search_query: string | null;
  contacted_at: string | null;
  next_step_at: string | null;
  created_at: string;
  updated_at: string;
  max_user_id: number | null;
}

export async function call<T = Record<string, unknown>>(
  action: string,
  body?: unknown,
  query = "",
): Promise<T & { ok: boolean; error?: string }> {
  try {
    const r = await fetch(`${URL}?action=${action}${query}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", "X-Admin-Pin": savedAdminPin() },
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 403) return { ok: false, error: "Нет доступа" } as T & { ok: boolean; error?: string };
    return { ok: r.ok && d.ok !== false, ...d };
  } catch {
    return { ok: false, error: "Нет связи с сервером" } as T & { ok: boolean; error?: string };
  }
}
