import func2url from "../../../backend/func2url.json";
import { RunResult, Simulator } from "./types";

const URL = (func2url as Record<string, string>)["sim-builder"];
const MINE_KEY = "uchispro_sims_v1";

async function req<T>(action: string, body?: unknown, query = ""): Promise<T & { ok: boolean; error?: string }> {
  try {
    const r = await fetch(`${URL}?action=${action}${query}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 504) return { ok: false, error: "ИИ думал слишком долго — попробуйте ещё раз" } as T & { ok: boolean; error?: string };
    return { ok: r.ok && d.ok !== false, ...d };
  } catch {
    return { ok: false, error: "Нет связи с сервером" } as T & { ok: boolean; error?: string };
  }
}

export const simApi = {
  generate: (prompt: string, audience: string) => req<{ trainer: Simulator }>("generate", { prompt, audience }),
  save: (trainer: Simulator, slug?: string, edit_key?: string) =>
    req<{ slug: string; edit_key: string }>("save", { trainer, slug, edit_key }),
  get: (slug: string) => req<{ trainer: Simulator }>("get", undefined, `&slug=${encodeURIComponent(slug)}`),
  run: (slug: string, r: RunResult, student_name: string, group_code: string) =>
    req("run", {
      slug,
      student_name,
      group_code,
      score: r.score,
      passed: r.passed,
      duration_sec: r.durationSec,
      mistakes: r.mistakes,
      hints: r.hints,
      step_times: r.stepTimes,
    }),
  stats: (slug: string, key: string) =>
    req<{
      summary: { runs: number; passed: number; avg_score: number; avg_duration: number };
      heat: { step: string; title: string; errors: number; avg_time: number | null }[];
      runs: { student: string | null; group: string | null; score: number; passed: boolean; duration: number; at: string }[];
    }>("stats", undefined, `&slug=${encodeURIComponent(slug)}&key=${encodeURIComponent(key)}`),
};

export interface MySim {
  slug: string;
  key: string;
  title: string;
}

/** Ключи правки хранятся у автора в браузере — без регистрации. */
export const mySims = {
  list(): MySim[] {
    try {
      return JSON.parse(localStorage.getItem(MINE_KEY) || "[]");
    } catch {
      return [];
    }
  },
  put(s: MySim) {
    const all = mySims.list().filter((x) => x.slug !== s.slug);
    localStorage.setItem(MINE_KEY, JSON.stringify([s, ...all].slice(0, 50)));
  },
  key(slug: string) {
    return mySims.list().find((x) => x.slug === slug)?.key;
  },
};
