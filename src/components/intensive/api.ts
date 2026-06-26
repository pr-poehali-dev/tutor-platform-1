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
