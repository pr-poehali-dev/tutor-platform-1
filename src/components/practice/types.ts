export type Difficulty = "easy" | "medium" | "hard";

export interface SolutionStep {
  title: string;
  text: string;
  formula?: string;
  hint?: string;
}

/** Универсальная задача для тренажёра (математика / биология / химия / ...) */
export interface PracticeProblem {
  id: number;
  topic: string;
  topicLabel: string;
  difficulty: Difficulty;
  grade: string;
  source: string;
  title: string;
  statement: string;
  analysis: string;
  plan: string[];
  steps: SolutionStep[];
  answer: string;
  insight: string;
  tags: string[];
  /** Принимаемые формы ответа для авто-проверки. Если нет — проверки нет, только разбор. */
  expectedAnswers?: string[];
  /** Тип проверки: точное совпадение или числовое с допуском */
  checkMode?: "exact" | "numeric";
  /** Допустимое отклонение для numeric (по умолчанию 0.01) */
  tolerance?: number;
  /** Подсказка по формату ответа (placeholder в инпуте) */
  answerPlaceholder?: string;
}

/** Нормализация строки для exact-сравнения */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[,]/g, ".")
    .replace(/\s+/g, " ")
    .replace(/[%°]/g, "")
    .trim();
}

/** Попытка вытащить число из строки (поддержка дробей вида 12/5 → 2.4) */
export function parseNumeric(s: string): number | null {
  const cleaned = s.replace(/\s/g, "").replace(",", ".");
  const fracMatch = cleaned.match(/^-?(\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/** Проверка ответа: возвращает true, если хотя бы один из expectedAnswers совпадает с user */
export function checkAnswer(
  userInput: string,
  problem: Pick<PracticeProblem, "expectedAnswers" | "checkMode" | "tolerance">,
): boolean {
  const expected = problem.expectedAnswers ?? [];
  if (!expected.length || !userInput.trim()) return false;
  const mode = problem.checkMode ?? "exact";
  if (mode === "numeric") {
    const u = parseNumeric(userInput);
    if (u === null) return false;
    const tol = problem.tolerance ?? 0.01;
    return expected.some((e) => {
      const eNum = parseNumeric(e);
      return eNum !== null && Math.abs(eNum - u) <= tol;
    });
  }
  const u = normalizeAnswer(userInput);
  return expected.some((e) => normalizeAnswer(e) === u);
}
