import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["fin-advisor"];

export interface Verdict {
  score: number;
  level: string;
  summary: string;
}

export interface MetricRead {
  name: string;
  value: string;
  status: "good" | "warning" | "bad" | string;
  comment: string;
}

export interface RiskItem {
  title: string;
  severity: "high" | "medium" | "low" | string;
  why: string;
  fix: string;
}

export interface OpportunityItem {
  title: string;
  impact: string;
  how: string;
}

export interface FinancingItem {
  type: string;
  fit: "high" | "medium" | "low" | string;
  detail: string;
  caution: string;
}

export interface ActionItem {
  priority: number;
  action: string;
  result: string;
}

export interface FinReport {
  report_title: string;
  verdict: Verdict;
  metrics_read: MetricRead[];
  strengths: string[];
  risks: RiskItem[];
  hidden_opportunities: OpportunityItem[];
  financing_options: FinancingItem[];
  action_plan: ActionItem[];
  honest_take: string;
  metrics?: Record<string, number>;
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

export interface GenerateResult {
  ok: boolean;
  plan?: FinReport;
  price?: number;
  min_price?: number;
  message?: string;
}

export type Answers = Record<string, string | string[]>;

export async function generatePlan(goal: string, answers: Answers): Promise<GenerateResult> {
  try {
    const res = await fetch(`${URL}?action=generate_plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, answers }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error || "Не удалось собрать анализ" };
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
  plan?: FinReport;
  price?: number;
  message?: string;
  utm?: Record<string, string>;
}

export async function submitLead(payload: SubmitPayload): Promise<{ ok: boolean; message?: string }> {
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

// ── Личный кабинет: сохранение анализа, прогресс, дневник-финансист ──

export type Progress = Record<string, { done: boolean; updated_at?: string }>;

export async function savePlan(goal: string, plan: FinReport): Promise<{ ok: boolean; message?: string }> {
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
  plan?: FinReport;
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

export const COACH_COURSE_ID = 9202;
