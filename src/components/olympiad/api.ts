import func2url from "../../../backend/func2url.json";

const OLYMPIAD_URL = (func2url as Record<string, string>).olympiad;

export interface OlympiadQuestion {
  index: number;
  total: number;
  subject: string;
  question: string;
  options: string[];
  points: number;
}

export interface StartResponse {
  session_token: string;
  name: string;
  subject: string;
  total: number;
  znaiki_per_correct: number;
  grand_prize: number;
  coach: string;
  question: OlympiadQuestion;
  error?: string;
}

export interface AnswerResponse {
  correct: boolean;
  correct_answer: number;
  explanation: string;
  znaiki_gained: number;
  znaiki_total: number;
  correct_count: number;
  finished: boolean;
  coach: string;
  question?: OlympiadQuestion;
  error?: string;
}

export interface FinishResponse {
  correct_count: number;
  total: number;
  perfect: boolean;
  znaiki_earned: number;
  grand_prize: number;
  score: number;
  coach: string;
  error?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  subject: string;
  grade: string;
  score: number;
  correct: number;
  total: number;
  perfect: boolean;
  date: string | null;
}

function headers(token: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["X-Auth-Token"] = token;
  return h;
}

export async function startOlympiad(
  token: string | null, subject: string, grade: string,
): Promise<StartResponse> {
  const res = await fetch(`${OLYMPIAD_URL}?action=start`, {
    method: "POST", headers: headers(token),
    body: JSON.stringify({ subject, grade }),
  });
  return res.json();
}

export async function answerOlympiad(
  token: string | null, sessionToken: string, answer: number,
): Promise<AnswerResponse> {
  const res = await fetch(`${OLYMPIAD_URL}?action=answer`, {
    method: "POST", headers: headers(token),
    body: JSON.stringify({ session_token: sessionToken, answer }),
  });
  return res.json();
}

export async function finishOlympiad(
  token: string | null, sessionToken: string, displayName: string,
): Promise<FinishResponse> {
  const res = await fetch(`${OLYMPIAD_URL}?action=finish`, {
    method: "POST", headers: headers(token),
    body: JSON.stringify({ session_token: sessionToken, display_name: displayName }),
  });
  return res.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${OLYMPIAD_URL}?action=leaderboard`);
    const data = await res.json();
    return data.leaderboard || [];
  } catch {
    return [];
  }
}

export const OLYMPIAD_SUBJECTS = [
  { id: "mixed", label: "Школьный курс (микс)", emoji: "🎓" },
  { id: "math", label: "Математика", emoji: "📐" },
  { id: "physics", label: "Физика", emoji: "⚡" },
  { id: "chemistry", label: "Химия", emoji: "🧪" },
  { id: "biology", label: "Биология", emoji: "🧬" },
  { id: "russian", label: "Русский язык", emoji: "✍️" },
  { id: "history", label: "История", emoji: "🏛️" },
  { id: "geography", label: "География", emoji: "🗺️" },
  { id: "english", label: "Английский", emoji: "🌍" },
];

export const OLYMPIAD_GRADES = [
  { id: "1-4", label: "1–4 класс" },
  { id: "5-9", label: "5–9 класс" },
  { id: "10-11", label: "10–11 класс" },
];
