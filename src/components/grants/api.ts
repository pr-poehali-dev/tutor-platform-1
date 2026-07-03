import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["grant-assistant"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export interface GrantPreview {
  project_title: string | null;
  annotation: string | null;
  goal: string | null;
  relevance_teaser: string | null;
  tasks_preview: string[];
  expert_score: number | null;
  expert_verdict: string | null;
  is_fallback?: boolean;
  sections_locked: string[];
}

export interface TeamMember {
  role: string;
  responsibility: string;
}
export interface CalendarStage {
  stage: string;
  period: string;
  result: string;
}
export interface BudgetItem {
  item: string;
  amount: string;
  justification: string;
}
export interface RiskItem {
  risk: string;
  mitigation: string;
}
export interface ExpertReview {
  score: number;
  strengths: string[];
  weaknesses: string[];
  verdict: string;
}

export interface GrantFull {
  project_title: string;
  annotation: string;
  relevance: string;
  goal: string;
  tasks: string[];
  target_audience: string;
  social_effect: string;
  team: TeamMember[];
  calendar_plan: CalendarStage[];
  budget: BudgetItem[];
  budget_total: string;
  risks: RiskItem[];
  kpi: string[];
  expert_review: ExpertReview;
  cover_letter: string;
}

export interface GrantApplication {
  id: number;
  grant_name: string;
  project_title: string | null;
  is_paid: boolean;
  price_kopecks: number;
  status: string;
  created_at: string | null;
  preview: GrantPreview;
  full?: GrantFull | null;
  organization?: string | null;
  contact_email?: string | null;
}

export interface GeneratePayload {
  grant_name: string;
  project_idea: string;
  organization?: string;
  project_title?: string;
  grant_amount?: string;
  region?: string;
  deadline?: string;
  extra?: string;
}

type Resp<T> = { ok: boolean; data?: T; error?: string; needAuth?: boolean };

async function req<T>(
  action: string,
  opts: { method?: string; body?: unknown; query?: Record<string, string> } = {}
): Promise<Resp<T>> {
  const t = token();
  const params = new URLSearchParams({ action, ...(opts.query || {}) });
  try {
    const res = await fetch(`${URL}?${params.toString()}`, {
      method: opts.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(t ? { "X-Auth-Token": t } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok)
      return { ok: false, error: data?.error || `Ошибка ${res.status}`, needAuth: res.status === 401 };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Сеть недоступна. Попробуйте ещё раз." };
  }
}

export function fetchGrantPrice() {
  return req<{ price_kopecks: number }>("price");
}

export function generateGrant(payload: GeneratePayload) {
  return req<GrantApplication>("generate", { method: "POST", body: payload });
}

export function fetchGrant(id: number) {
  return req<GrantApplication>("get", { query: { id: String(id) } });
}

export function fetchMyGrants() {
  return req<{ items: GrantApplication[]; total: number }>("list");
}

export function payGrant(id: number, returnUrl: string) {
  return req<{ ok?: boolean; already_paid?: boolean; confirmation_url?: string }>("pay", {
    method: "POST",
    body: { id, return_url: returnUrl },
  });
}

export function syncGrantPayment() {
  return req<{ synced: boolean; activated: number[] }>("sync", { method: "POST" });
}