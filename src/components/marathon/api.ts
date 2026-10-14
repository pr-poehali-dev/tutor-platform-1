import func2url from "../../../backend/func2url.json";
import { MarathonTrack } from "./types";

const URL = (func2url as Record<string, string>)["marathon"];

const tokenKey = (track: MarathonTrack) => `marathon_token_${track}`;

export function getSavedToken(track: MarathonTrack): string | null {
  try {
    return localStorage.getItem(tokenKey(track));
  } catch {
    return null;
  }
}

export function saveToken(track: MarathonTrack, token: string) {
  try {
    localStorage.setItem(tokenKey(track), token);
  } catch {
    /* noop */
  }
}

export function getVisitorId(): string {
  try {
    return localStorage.getItem("visitor_id") || "";
  } catch {
    return "";
  }
}

export interface MarathonMe {
  track: MarathonTrack;
  email: string;
  name: string;
  started_at: string;
  unlocked_day: number;
  completed_days: number[];
  homework: Record<string, string>;
  max_link_code: string | null;
  max_linked: boolean;
  max_bot: string;
  tests: { wpm: number; comprehension: number; at: string }[];
}

async function call<T>(action: string, init?: RequestInit, qs = ""): Promise<T> {
  const res = await fetch(`${URL}?action=${action}${qs}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Сервис недоступен, попробуйте ещё раз");
  return data as T;
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const marathonApi = {
  register: (track: MarathonTrack, email: string, name: string, source: string) =>
    call<{ token: string; unlocked_day: number; existing: boolean }>("register", post({ track, email, name, source })),
  me: (token: string) => call<MarathonMe>("me", undefined, `&token=${encodeURIComponent(token)}`),
  completeDay: (token: string, day: number, homework: string) =>
    call<{ completed_days: number[] }>("complete_day", post({ token, day, homework })),
  saveTest: (data: { token?: string; grade: string; words: number; seconds: number; comprehension: number }) =>
    call<{ wpm: number; comprehension: number }>("reading_test", post({ ...data, visitor_id: getVisitorId() })),
};

/** Лёгкий «пульс» напоминаний: вызывается с сайта не чаще раза в 15 минут на вкладку. */
export function tickReminders() {
  if (!URL) return;
  try {
    const last = Number(sessionStorage.getItem("marathon_tick") || 0);
    if (Date.now() - last < 15 * 60 * 1000) return;
    sessionStorage.setItem("marathon_tick", String(Date.now()));
    fetch(`${URL}?action=tick`).catch(() => {});
  } catch {
    /* noop */
  }
}
