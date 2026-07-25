import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["orchestrator"];
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

// ─── Типы трека ───
export interface SkillItem {
  skill: string;
  level: string;
  why: string;
}
export interface OnboardingDay {
  day: string;
  goal: string;
  steps: string[];
  checkpoint: string;
}
export interface TrackTask {
  title: string;
  done_criteria: string;
  deliverable: string;
}
export interface RiskItem {
  risk: string;
  signal: string;
  action: string;
}
export interface Screening {
  test_questions: string[];
  mini_case: string;
  pass_criteria: string;
}
export interface Track {
  track_title: string;
  summary: string;
  skill_matrix: SkillItem[];
  artifacts: string[];
  screening: Screening;
  onboarding: OnboardingDay[];
  tasks: TrackTask[];
  risks: RiskItem[];
  metrics: string[];
  is_fallback?: boolean;
}

export async function generateTrack(
  role_title: string,
  brief: string,
): Promise<{ ok: boolean; track?: Track; message?: string }> {
  try {
    const res = await fetch(`${URL}?action=generate_track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_title, brief }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error || "Не удалось собрать трек" };
    return { ok: true, track: data.track };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export interface SubmitPayload {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  company?: string;
  role_title?: string;
  project_brief?: string;
  track?: Track;
  message?: string;
  utm?: Record<string, string>;
}

export async function submitLead(p: SubmitPayload): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${URL}?action=submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
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
    const c: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
      const v = p.get(k);
      if (v) c[k] = v;
    });
    return Object.keys(c).length ? c : undefined;
  } catch {
    return undefined;
  }
}

// ─── PRO: дашборд ───
export const PRO_COURSE_ID = 9203;

export interface ProjectItem {
  id: number;
  name: string;
  role_title?: string;
  brief?: string;
  created_at?: string;
  performers: number;
  tasks_total: number;
  tasks_done: number;
}

export interface Performer {
  id: number;
  name: string;
  contact?: string;
  screening: "pending" | "ok" | "train" | "reject";
  quality_avg: number | null;
  speed_avg: number | null;
  comm_avg: number | null;
  deadline_avg: number | null;
  risk_level: "low" | "medium" | "high";
}

export interface Task {
  id: number;
  performer_id: number | null;
  title: string;
  done_criteria?: string;
  deliverable?: string;
  due_date?: string | null;
  status: "todo" | "in_progress" | "review" | "revision" | "done";
  revisions: number;
}

export interface DashboardMetrics {
  tasks_total: number;
  tasks_done: number;
  tasks_in_progress: number;
  completion_pct: number;
  revisions_total: number;
  performers_total: number;
  high_risk_performers: string[];
}

export interface Dashboard {
  project: { id: number; name: string; role_title?: string; brief?: string; track?: Track };
  performers: Performer[];
  tasks: Task[];
  metrics: DashboardMetrics;
}

async function post(action: string, body: Record<string, unknown>) {
  try {
    const res = await fetch(`${URL}?action=${action}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error, status: res.status };
    return { ok: true, ...data };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

async function get(action: string, query = "") {
  try {
    const res = await fetch(`${URL}?action=${action}${query}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.error, status: res.status };
    return { ok: true, ...data };
  } catch {
    return { ok: false, message: "Сеть недоступна" };
  }
}

export const proAccess = () => get("pro_access");
export const projectsList = () => get("projects_list");
export const dashboard = (projectId: number) => get("dashboard", `&project_id=${projectId}`);
export const projectCreate = (b: { name: string; role_title?: string; brief?: string; track?: Track }) =>
  post("project_create", b);
export const projectDelete = (project_id: number) => post("project_delete", { project_id });
export const performerAdd = (b: { project_id: number; name: string; contact?: string }) => post("performer_add", b);
export const performerUpdate = (b: { performer_id: number; screening?: string; name?: string; contact?: string }) =>
  post("performer_update", b);
export const taskAdd = (b: {
  project_id: number;
  title: string;
  performer_id?: number;
  done_criteria?: string;
  deliverable?: string;
  due_date?: string;
}) => post("task_add", b);
export const taskUpdate = (b: {
  task_id: number;
  status?: string;
  performer_id?: number;
  title?: string;
}) => post("task_update", b);
export const feedbackAdd = (b: {
  performer_id: number;
  task_id?: number;
  quality?: number;
  speed?: number;
  communication?: number;
  deadline?: number;
  comment?: string;
}) => post("feedback_add", b);
