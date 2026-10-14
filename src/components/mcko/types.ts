export type McKoSubject = "math" | "russian" | "reading" | "functional";

export type McKoTask =
  | {
      id: string;
      type: "single";
      question: string;
      options: string[];
      correct: number;
      explanation: string;
      skill: string;
    }
  | {
      id: string;
      type: "multi";
      question: string;
      options: string[];
      correct: number[];
      explanation: string;
      skill: string;
    }
  | {
      id: string;
      type: "input";
      question: string;
      /** Допустимые ответы — сравниваются без пробелов и регистра, «,» = «.» */
      answers: string[];
      unit?: string;
      explanation: string;
      skill: string;
    };

export interface McKoSet {
  id: string;
  subject: McKoSubject;
  grade: string;
  title: string;
  /** Общий текст/ситуация для всех заданий варианта (читательская/функциональная грамотность) */
  context?: { title: string; body: string[]; table?: { head: string[]; rows: string[][] } };
  tasks: McKoTask[];
}

export const SUBJECT_META: Record<McKoSubject, { label: string; icon: string; color: string; text: string }> = {
  math: { label: "Математика", icon: "Calculator", color: "from-violet-500 to-indigo-500", text: "Текстовые задачи, дроби, проценты, геометрия, графики" },
  russian: { label: "Русский язык", icon: "PenLine", color: "from-cyan-500 to-blue-500", text: "Орфография, пунктуация, морфология, лексика" },
  reading: { label: "Читательская грамотность", icon: "BookOpen", color: "from-emerald-500 to-teal-500", text: "Найти, понять и оценить информацию в тексте" },
  functional: { label: "Функциональная грамотность", icon: "Globe", color: "from-amber-500 to-orange-500", text: "Жизненные ситуации: бюджет, тарифы, инструкции" },
};
