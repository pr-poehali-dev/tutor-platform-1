// Лёгкий модуль: сборка конспекта в текст для ИИ-наставника.
// Вынесен отдельно от реестра конспектов, чтобы не тянуть все предметные данные в бандл.
import type { LessonNotes } from "./lessonTypes";

/**
 * Собирает конспект в компактный текст — источник истины для ИИ-наставника.
 * ИИ обязан опираться на эту теорию, формулы и ответы, а не выдумывать.
 */
export function notesToPromptText(notes: LessonNotes): string {
  const parts: string[] = [];
  parts.push(`Суть темы: ${notes.summary}`);
  if (notes.theory?.length) parts.push(`Теория: ${notes.theory.join(" ")}`);
  if (notes.formulas?.length)
    parts.push(
      "Формулы: " + notes.formulas.map((f) => `${f.expr} — ${f.note}`).join("; ")
    );
  if (notes.examples?.length)
    parts.push(
      "Разобранные примеры: " +
        notes.examples
          .map((e) => `${e.problem} Решение: ${e.solution.join(" ")} Ответ: ${e.answer}`)
          .join(" | ")
    );
  if (notes.practice?.length)
    parts.push(
      "Задачи для ученика (с верными ответами): " +
        notes.practice.map((p) => `${p.question} Ответ: ${p.answer}`).join(" | ")
    );
  if (notes.mistakes?.length) parts.push(`Типичные ошибки: ${notes.mistakes.join("; ")}`);
  return parts.join("\n");
}
