import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["max-app"];
const AUTH_URL = (func2url as Record<string, string>).auth;

export interface MaxSummary {
  name: string | null;
  grade: string | null;
  stats: { tasks: number; correct: number; days: number; week_tasks: number; active_days_week: number; streak: number };
  daily: { done: boolean; correct: boolean };
  topics: { subject: string; topic: string; total: number; correct: number }[];
}

export async function fetchSummary(token: string): Promise<MaxSummary | null> {
  try {
    const r = await fetch(`${URL}?action=summary`, { headers: { "X-Auth-Token": token } });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

export async function sendAnswer(
  token: string,
  a: { task_id: string; subject: string; exam: string; topic: string; correct: boolean; is_daily: boolean },
) {
  try {
    await fetch(`${URL}?action=answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify(a),
    });
  } catch {
    /* ответ не сохранится в статистике — ученику это не мешает */
  }
}

export async function saveGrade(token: string, grade: string): Promise<boolean> {
  try {
    const r = await fetch(`${AUTH_URL}?action=set-grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ grade }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[\s\u00a0]+/g, "")
    .replace(/,/g, ".")
    .replace(/[«»"'.;:]+$/g, "")
    .replace(/^ответ[:=]?/, "");

/** Ответ верный, если совпадает с эталоном или с одним из вариантов через «/» или «или». */
export function isCorrect(user: string, answer: string): boolean {
  const u = norm(user);
  if (!u) return false;
  return answer
    .split(/\s*(?:\/|\bили\b|;)\s*/i)
    .map(norm)
    .some((a) => a && a === u);
}
