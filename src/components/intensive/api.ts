import func2url from "../../../backend/func2url.json";

const INTENSIVE_URL = (func2url as Record<string, string>)["intensive"];

export interface LeadInput {
  name: string;
  contact: string;
  comment?: string;
  track?: string;
  source?: string;
}

export interface TrainerMessage {
  from: "user" | "client";
  text: string;
}

export async function submitLead(input: LeadInput): Promise<{ ok: boolean; message?: string; error?: string }> {
  if (!INTENSIVE_URL) return { ok: false, error: "Сервис недоступен" };
  try {
    const res = await fetch(`${INTENSIVE_URL}?action=lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Не удалось отправить заявку" };
    return { ok: true, message: data.message };
  } catch {
    return { ok: false, error: "Ошибка соединения" };
  }
}

export async function trainerTurn(
  sessionId: string,
  scenarioKey: string,
  message: string,
  history: TrainerMessage[],
): Promise<{ ok: boolean; reply?: string; score?: number | null; error?: string }> {
  if (!INTENSIVE_URL) return { ok: false, error: "Сервис недоступен" };
  try {
    const res = await fetch(`${INTENSIVE_URL}?action=trainer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, scenario_key: scenarioKey, message, history }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Тренажёр недоступен" };
    return { ok: true, reply: data.reply, score: data.score };
  } catch {
    return { ok: false, error: "Ошибка соединения" };
  }
}

export async function checkHomework(
  sessionId: string,
  lessonKey: string,
  submission: string,
): Promise<{ ok: boolean; score?: number | null; feedback?: string; verdict?: string; error?: string }> {
  if (!INTENSIVE_URL) return { ok: false, error: "Сервис недоступен" };
  try {
    const res = await fetch(`${INTENSIVE_URL}?action=check_homework`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, lesson_key: lessonKey, submission }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Проверка недоступна" };
    return { ok: true, score: data.score, feedback: data.feedback, verdict: data.verdict };
  } catch {
    return { ok: false, error: "Ошибка соединения" };
  }
}

export interface AuditResult {
  sources: string[];
  leaks: string[];
  connection: string;
  lead_fields: string[];
  email: { subject: string; body: string };
}

export async function runAudit(
  description: string,
): Promise<{ ok: boolean; result?: AuditResult; error?: string }> {
  if (!INTENSIVE_URL) return { ok: false, error: "Сервис недоступен" };
  try {
    const res = await fetch(`${INTENSIVE_URL}?action=audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Аудит недоступен" };
    return {
      ok: true,
      result: {
        sources: data.sources || [],
        leaks: data.leaks || [],
        connection: data.connection || "",
        lead_fields: data.lead_fields || [],
        email: data.email || { subject: "", body: "" },
      },
    };
  } catch {
    return { ok: false, error: "Ошибка соединения" };
  }
}

export async function checkAccess(
  email: string,
): Promise<{ access: boolean; token?: string; name?: string; message?: string; error?: string }> {
  if (!INTENSIVE_URL) return { access: false, error: "Сервис недоступен" };
  try {
    const res = await fetch(`${INTENSIVE_URL}?action=check_access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { access: false, error: data.error || "Ошибка" };
    return { access: !!data.access, token: data.token, name: data.name, message: data.message };
  } catch {
    return { access: false, error: "Ошибка соединения" };
  }
}

const ACCESS_KEY = "intensive_access";

export function saveAccess(email: string, token?: string): void {
  try {
    localStorage.setItem(ACCESS_KEY, JSON.stringify({ email, token: token || "", at: Date.now() }));
  } catch {
    /* storage недоступен */
  }
}

export function getSavedAccess(): { email: string; token: string } | null {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && p.email) return { email: p.email, token: p.token || "" };
  } catch {
    /* ignore */
  }
  return null;
}

/** Email, на который оформляли оплату (для повторной проверки доступа). */
export function getPaidEmail(): string | null {
  try {
    return localStorage.getItem("intensive_paid_email");
  } catch {
    return null;
  }
}

export function setPaidEmail(email: string): void {
  try {
    localStorage.setItem("intensive_paid_email", email);
  } catch {
    /* ignore */
  }
}

/** Стабильный id сессии в localStorage — чтобы прогресс привязывался к пользователю. */
export function getSessionId(): string {
  const KEY = "intensive_session_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}