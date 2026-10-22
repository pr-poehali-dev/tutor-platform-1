export type Category = "physics" | "safety" | "profession" | "biology" | "chemistry" | "other";
export type Audience = "school" | "college" | "company";

/** Объект сцены: тип из библиотеки, позиция, подпись. */
export interface SceneObject {
  id: string;
  kind: string;
  label: string;
  pos: [number, number, number];
  rot?: number;
  scale?: number;
  color?: string;
}

/** Шаг сценария: нужно нажать правильный объект. Ловушки — частые ошибки с объяснением. */
export interface Step {
  id: string;
  title: string;
  instruction: string;
  target: string;
  hint: string;
  explain?: string;
  traps?: { object: string; feedback: string; critical?: boolean }[];
  timeLimit?: number;
  effect?: { object: string; state: string };
}

export interface Simulator {
  id?: number;
  slug?: string;
  title: string;
  description: string;
  category: Category;
  audience: Audience[];
  grade?: string;
  location: string;
  objects: SceneObject[];
  steps: Step[];
  passScore?: number;
}

export interface Mistake {
  step: string;
  object: string;
  critical: boolean;
}

export interface RunResult {
  score: number;
  passed: boolean;
  durationSec: number;
  mistakes: Mistake[];
  hints: number;
  stepTimes: Record<string, number>;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  physics: "Физика",
  safety: "ОБЖ и охрана труда",
  profession: "Профессии",
  biology: "Биология",
  chemistry: "Химия",
  other: "Другое",
};

export const AUDIENCE_LABEL: Record<Audience, string> = {
  school: "Школа",
  college: "Колледж",
  company: "Предприятие",
};

/** Подсчёт оценки: 100 баллов минус штрафы. Критическая ошибка — провал. */
export function scoreRun(stepsCount: number, mistakes: Mistake[], hints: number, overtime: number, passScore = 70) {
  const minor = mistakes.filter((m) => !m.critical).length;
  const critical = mistakes.filter((m) => m.critical).length;
  const raw = 100 - minor * 8 - critical * 25 - hints * 4 - overtime * 3;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  return { score, passed: score >= passScore && critical === 0 && stepsCount > 0 };
}
