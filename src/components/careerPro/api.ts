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
  is_fallback?: boolean;
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