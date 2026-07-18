// Единый реестр выверенных конспектов уроков всех супер-курсов.
// Ключ — id урока (ph-1, m-1, cs-1 …), значение — конспект LessonNotes.
import type { LessonNotes } from "../lessonTypes";
import { PHYSICS_NOTES } from "./physics";
import { MATH_NOTES } from "./math";
import { INFORMATICS_NOTES } from "./informatics";
import { CHEMISTRY_NOTES } from "./chemistry";
import { BIOLOGY_NOTES } from "./biology";
import { RUSSIAN_NOTES } from "./russian";
import { HISTORY_NOTES } from "./history";

export const LESSON_NOTES: Record<string, LessonNotes> = {
  ...PHYSICS_NOTES,
  ...MATH_NOTES,
  ...INFORMATICS_NOTES,
  ...CHEMISTRY_NOTES,
  ...BIOLOGY_NOTES,
  ...RUSSIAN_NOTES,
  ...HISTORY_NOTES,
};

/**
 * Собирает конспект в компактный текст — источник истины для ИИ-наставника.
 * ИИ обязан опираться на эти теорию, формулы и ответы, а не выдумывать.
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