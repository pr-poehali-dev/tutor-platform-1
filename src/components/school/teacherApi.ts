import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["school-teacher"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function req<T>(
  action: string,
  opts: { method?: string; body?: unknown; query?: Record<string, string> } = {}
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const t = token();
  if (!t) return { ok: false, error: "Войдите в аккаунт" };
  const params = new URLSearchParams({ action, ...(opts.query || {}) });
  try {
    const res = await fetch(`${URL}?${params.toString()}`, {
      method: opts.method || "GET",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error || `Ошибка ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Сеть недоступна" };
  }
}

export function fetchTeacherInfo(courseId: number) {
  return req<{ enabled: boolean; course_title: string; school_name: string }>("info", {
    query: { course_id: String(courseId) },
  });
}

export function askTeacher(courseId: number, message: string, history: ChatMessage[]) {
  return req<{ reply: string }>("ask", {
    method: "POST",
    body: { course_id: courseId, message, history },
  });
}
