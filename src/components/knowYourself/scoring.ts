import {
  Answer,
  RiasecCode,
  ValueCode,
  AbilityCode,
  SchoolSubject,
  TestResult,
} from "./types";
import { QUESTIONS } from "./questions";
import { PROFESSIONS } from "./professions";
import func2url from "../../../backend/func2url.json";

const KY_URL = (func2url as Record<string, string>)["know-yourself"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function getAuthToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

const RIASEC_CODES: RiasecCode[] = ["R", "I", "A", "S", "E", "C"];
const VALUE_CODES: ValueCode[] = ["stability", "income", "creativity", "service", "science", "power", "freedom", "team"];
const ABILITY_CODES: AbilityCode[] = ["analytical", "verbal", "spatial", "mechanical", "creative", "social", "memory", "leadership"];
const SCHOOL_CODES: SchoolSubject[] = ["math", "physics", "informatics", "chemistry", "biology", "russian", "literature", "english", "history", "social", "geography", "art", "pe"];

/**
 * Преобразует ответ 1..5 в [-2..+2] относительно центра.
 * Обратные вопросы (reversed) инвертируются.
 */
function answerToDelta(a: Answer, reversed = false): number {
  const delta = a - 3; // -2..+2
  return reversed ? -delta : delta;
}

/** Возвращает нормализованный балл (0..100) для шкалы. */
function normalize(raw: number, maxPossible: number): number {
  if (maxPossible === 0) return 0;
  // raw в диапазоне [-maxPossible, +maxPossible]
  const shifted = raw + maxPossible;
  const pct = (shifted / (2 * maxPossible)) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

export function computeResult(answers: Record<string, Answer>): TestResult {
  const riasecRaw: Record<RiasecCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const valueRaw: Record<ValueCode, number> = {
    stability: 0, income: 0, creativity: 0, service: 0,
    science: 0, power: 0, freedom: 0, team: 0,
  };
  const abilityRaw: Record<AbilityCode, number> = {
    analytical: 0, verbal: 0, spatial: 0, mechanical: 0,
    creative: 0, social: 0, memory: 0, leadership: 0,
  };
  const schoolRaw: Record<SchoolSubject, number> = {
    math: 0, physics: 0, informatics: 0, chemistry: 0, biology: 0,
    russian: 0, literature: 0, english: 0, history: 0, social: 0,
    geography: 0, art: 0, pe: 0,
  };

  // Максимально возможные веса по каждой шкале — для нормализации
  const riasecMax: Record<RiasecCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const valueMax: Record<ValueCode, number> = {
    stability: 0, income: 0, creativity: 0, service: 0,
    science: 0, power: 0, freedom: 0, team: 0,
  };
  const abilityMax: Record<AbilityCode, number> = {
    analytical: 0, verbal: 0, spatial: 0, mechanical: 0,
    creative: 0, social: 0, memory: 0, leadership: 0,
  };
  const schoolMax: Record<SchoolSubject, number> = {
    math: 0, physics: 0, informatics: 0, chemistry: 0, biology: 0,
    russian: 0, literature: 0, english: 0, history: 0, social: 0,
    geography: 0, art: 0, pe: 0,
  };

  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    const delta = answerToDelta(a, q.reversed);
    for (const s of q.scales) {
      switch (s.kind) {
        case "riasec":  riasecRaw[s.code]  += delta; riasecMax[s.code]  += 2; break;
        case "value":   valueRaw[s.code]   += delta; valueMax[s.code]   += 2; break;
        case "ability": abilityRaw[s.code] += delta; abilityMax[s.code] += 2; break;
        case "school":  schoolRaw[s.code]  += delta; schoolMax[s.code]  += 2; break;
      }
    }
  }

  const riasec = {} as Record<RiasecCode, number>;
  for (const c of RIASEC_CODES) riasec[c] = normalize(riasecRaw[c], riasecMax[c] || 1);

  const values = {} as Record<ValueCode, number>;
  for (const c of VALUE_CODES) values[c] = normalize(valueRaw[c], valueMax[c] || 1);

  const abilities = {} as Record<AbilityCode, number>;
  for (const c of ABILITY_CODES) abilities[c] = normalize(abilityRaw[c], abilityMax[c] || 1);

  const subjects = {} as Record<SchoolSubject, number>;
  for (const c of SCHOOL_CODES) subjects[c] = normalize(schoolRaw[c], schoolMax[c] || 1);

  const topRiasec = [...RIASEC_CODES].sort((a, b) => riasec[b] - riasec[a]).slice(0, 3);
  const topValues = [...VALUE_CODES].sort((a, b) => values[b] - values[a]).slice(0, 3);
  const topAbilities = [...ABILITY_CODES].sort((a, b) => abilities[b] - abilities[a]).slice(0, 4);
  const topSubjects = [...SCHOOL_CODES].sort((a, b) => subjects[b] - subjects[a]).slice(0, 5);

  // ── Подбор профессий по совпадению с топ-шкалами ──
  const professions = PROFESSIONS.map((p) => {
    const riasecScore = p.riasec.reduce((sum, code) => sum + (riasec[code] || 0), 0) / p.riasec.length;
    const valueScore = p.values.reduce((sum, code) => sum + (values[code] || 0), 0) / p.values.length;
    const abilityScore = p.abilities.reduce((sum, code) => sum + (abilities[code] || 0), 0) / p.abilities.length;
    const subjectScore = p.subjects.reduce((sum, code) => sum + (subjects[code] || 0), 0) / p.subjects.length;

    // Веса: интересы (RIASEC) и сильные стороны важнее ценностей
    const score = Math.round(
      riasecScore * 0.35 +
      abilityScore * 0.30 +
      subjectScore * 0.20 +
      valueScore * 0.15,
    );
    return { profession: p, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    riasec, topRiasec,
    values, topValues,
    abilities, topAbilities,
    subjects, topSubjects,
    professions,
  };
}

const STORAGE_KEY = "uchispro_know_yourself_v1";

export function saveAnswers(answers: Record<string, Answer>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, savedAt: Date.now() }));
  } catch { /* noop */ }
}

export function loadAnswers(): Record<string, Answer> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { answers: Record<string, Answer> };
    return parsed.answers || null;
  } catch {
    return null;
  }
}

export function clearAnswers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* noop */ }
}

// ─── СИНХРОНИЗАЦИЯ С ЛИЧНЫМ КАБИНЕТОМ ─────────────────────────────────

/** Сохраняет результат теста на бэк (если пользователь авторизован). */
export async function syncResultToCloud(
  answers: Record<string, Answer>,
  result: TestResult,
): Promise<{ saved: boolean; id?: number }> {
  const token = getAuthToken();
  if (!token) return { saved: false };
  try {
    const res = await fetch(`${KY_URL}?action=save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ answers, result }),
    });
    if (!res.ok) return { saved: false };
    const data = await res.json();
    return { saved: !!data.saved, id: data.id };
  } catch {
    return { saved: false };
  }
}

export interface CloudResult {
  id: number;
  answers: Record<string, Answer>;
  result: TestResult;
  top_riasec: string;
  created_at: string;
}

/** Достаёт последний результат пользователя из облака. */
export async function fetchLatestFromCloud(): Promise<CloudResult | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${KY_URL}?action=latest`, {
      headers: { "X-Auth-Token": token },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

export interface HistoryItem {
  id: number;
  top_riasec: string;
  created_at: string;
}

/** Список последних 20 прохождений (для ЛК). */
export async function fetchHistoryFromCloud(): Promise<HistoryItem[]> {
  const token = getAuthToken();
  if (!token) return [];
  try {
    const res = await fetch(`${KY_URL}?action=history`, {
      headers: { "X-Auth-Token": token },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}