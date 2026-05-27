import func2url from "../../../backend/func2url.json";
import { SubjectCode } from "@/components/graduate/graduateData";

const URL = (func2url as Record<string, string>)["exam-checklist"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export interface ExamProfile {
  exam_year: number;
  subjects: SubjectCode[];
  target_score: number;
  target_university_id: string | null;
  target_faculty_id: string | null;
  exists: boolean;
}

export interface TaskStatus {
  task_id: string;
  done: boolean;
  note: string;
  completed_at: string | null;
  updated_at: string | null;
}

export interface ProfileResponse {
  authenticated: boolean;
  profile: ExamProfile | null;
  tasks: TaskStatus[];
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const t = token();
  if (!t) return { authenticated: false, profile: null, tasks: [] };
  try {
    const res = await fetch(`${URL}?action=profile`, { headers: { "X-Auth-Token": t } });
    if (!res.ok) return { authenticated: false, profile: null, tasks: [] };
    return await res.json();
  } catch {
    return { authenticated: false, profile: null, tasks: [] };
  }
}

export async function saveProfile(profile: Partial<ExamProfile>): Promise<boolean> {
  const t = token();
  if (!t) return false;
  try {
    const res = await fetch(`${URL}?action=save_profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function toggleTask(task_id: string, done: boolean, note?: string): Promise<boolean> {
  const t = token();
  if (!t) return false;
  try {
    const res = await fetch(`${URL}?action=toggle_task`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: JSON.stringify({ task_id, done, note }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
