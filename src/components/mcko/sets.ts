import { MATH_SETS } from "./mathSets";
import { RUSSIAN_SETS } from "./russianSets";
import { READING_SETS, FUNCTIONAL_SETS } from "./literacySets";
import { McKoSet, McKoTask } from "./types";

export const ALL_SETS: McKoSet[] = [...MATH_SETS, ...RUSSIAN_SETS, ...READING_SETS, ...FUNCTIONAL_SETS];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/−/g, "-")
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .replace(/(₽|руб\.?|рублей|мин\.?|минут|км\/ч|гб|м\.?)$/g, "");
}

export type Answer = number | number[] | string | undefined;

export function isCorrect(task: McKoTask, answer: Answer): boolean {
  if (answer === undefined) return false;
  if (task.type === "single") return answer === task.correct;
  if (task.type === "multi") {
    if (!Array.isArray(answer)) return false;
    const a = [...answer].sort().join(",");
    return a === [...task.correct].sort().join(",");
  }
  if (typeof answer !== "string") return false;
  const n = normalize(answer);
  return task.answers.some((v) => normalize(v) === n);
}

export function correctLabel(task: McKoTask): string {
  if (task.type === "single") return task.options[task.correct];
  if (task.type === "multi") return task.correct.map((i) => task.options[i]).join("; ");
  return task.answers[0] + (task.unit ? ` ${task.unit}` : "");
}
