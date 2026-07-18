// Типы учебного конспекта урока — вынесены отдельно, чтобы файлы конспектов
// (lessonNotes/*) не создавали циклический импорт с superCourses.ts.

/** Разобранный пример: условие → пошаговое решение → ответ. */
export interface WorkedExample {
  problem: string;
  solution: string[]; // шаги решения по порядку
  answer: string;
}

/** Задача для самостоятельного решения с ответом и подсказкой. */
export interface PracticeTask {
  question: string;
  answer: string;
  hint?: string;
}

/**
 * Выверенный конспект урока — источник истины для ученика и для ИИ-наставника.
 * Соответствует школьной программе РФ (ФГОС) и кодификаторам ФИПИ.
 */
export interface LessonNotes {
  summary: string; // короткая суть темы (1-2 предложения)
  theory: string[]; // абзацы теории по порядку
  formulas?: { expr: string; note: string }[]; // ключевые формулы с пояснением
  examples: WorkedExample[]; // разобранные примеры
  practice: PracticeTask[]; // задачи для закрепления
  mistakes?: string[]; // типичные ошибки
}
