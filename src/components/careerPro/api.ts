import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["career-pro"];

export interface CareerModule {
  title: string;
  goal: string;
  lessons: string[];
}

export interface ActionStep {
  when: string;
  action: string;
  result: string;
}

export interface FiveYear {
  year: number;
  title: string;
  focus: string;
  milestones: string[];
  metric: string;
}

export interface FiveYearPlan {
  vision: string;
  years: FiveYear[];
  review_system: string[];
}

export interface CareerPlan {
  recommended_direction?: string;
  direction_reason?: string;
  course_title: string;
  summary: string;
  target_role: string;
  duration_weeks: number;
  hours_per_week: number;
  level: string;
  skills: string[];
  modules: CareerModule[];
  final_project: string;
  why_personal: string[];
  action_plan?: ActionStep[];
  pep_talk?: string;
  five_year_plan?: FiveYearPlan;
  is_fallback?: boolean;
}

const TOKEN_KEY = "uchispro_auth_token_v1";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) h["X-Auth-Token"] = t;
  } catch {
    /* ignore */
  }
  return h;
}

export interface GeneratePlanResult {
  ok: boolean;
  plan?: CareerPlan;
  price?: number;
  min_price?: number;
  message?: string;
}

export type Answers = Record<string, string | string[]>;

export async function generatePlan(goal: string, answers: Answers): Promise<GeneratePlanResult> {
  try {
    const res = await fetch(`${URL}?action=generate_plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, answers }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error || "Не удалось собрать план" };
    return { ok: true, plan: data.plan, price: data.price, min_price: data.min_price };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface SubmitPayload {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  goal?: string;
  answers?: Answers;
  plan?: CareerPlan;
  price?: number;
  message?: string;
  utm?: Record<string, string>;
}

export async function submitCareerLead(payload: SubmitPayload): Promise<{ ok: boolean; message?: string }> {
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

// ── Личный кабинет: сохранение плана, прогресс, дневник-коуч ──

export type Progress = Record<string, { done: boolean; updated_at?: string }>;

export async function savePlan(goal: string, plan: CareerPlan): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${URL}?action=save_plan`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ goal, plan }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface GetPlanResult {
  ok: boolean;
  has_plan?: boolean;
  goal?: string;
  direction?: string;
  plan?: CareerPlan;
  progress?: Progress;
  coach_access?: boolean;
  message?: string;
}

export async function getPlan(): Promise<GetPlanResult> {
  try {
    const res = await fetch(`${URL}?action=get_plan`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true, ...data };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export async function toggleCheckpoint(
  key: string,
  done: boolean,
): Promise<{ ok: boolean; progress?: Progress; message?: string }> {
  try {
    const res = await fetch(`${URL}?action=toggle_checkpoint`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ key, done }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true, progress: data.progress };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface JournalMsg {
  id: number;
  role: "user" | "coach";
  content: string;
  created_at: string | null;
}

export async function journalList(): Promise<{ ok: boolean; coach_access?: boolean; items?: JournalMsg[]; message?: string }> {
  try {
    const res = await fetch(`${URL}?action=journal_list`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error };
    return { ok: true, coach_access: data.coach_access, items: data.items };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export async function journalPost(content: string): Promise<{ ok: boolean; reply?: string; message?: string; status?: number }> {
  try {
    const res = await fetch(`${URL}?action=journal_post`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error, status: res.status };
    return { ok: true, reply: data.reply };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export const COACH_COURSE_ID = 9200;