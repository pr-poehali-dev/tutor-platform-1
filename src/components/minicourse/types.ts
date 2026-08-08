/** Общие типы линейки бесплатных мини-курсов.
 *  Каждый курс — отдельный файл в /courses, контент написан заранее
 *  (не генерируется ИИ), чтобы страница открывалась мгновенно. */

export interface LessonBlock {
  kind: "text" | "steps" | "prompt" | "note" | "money" | "checklist";
  title?: string;
  body?: string;
  items?: string[];
}

export interface MiniLesson {
  slug: string;
  index: number;
  title: string;
  subtitle: string;
  minutes: number;
  emoji: string;
  goal: string;
  blocks: LessonBlock[];
  task: string;
  result: string;
}

export interface MiniCourse {
  /** Часть URL: /mini-course/{slug} */
  slug: string;
  title: string;
  subtitle: string;
  promise: string;
  minutes: number;
  audience: string;
  emoji: string;
  cover: string;
  /** Tailwind-градиент для карточки в хабе */
  gradient: string;
  /** Короткая выгода для карточки */
  benefit: string;
  /** Кому подойдёт — для лендинга курса */
  forWhom: string[];
  /** Что будет на руках после прохождения */
  outcome: string;
  seoKeywords: string;
  lessons: MiniLesson[];
}
