import { MiniCourse, MiniLesson } from "./types";
import { AI_MONEY_COURSE } from "./courses/aiMoney";
import { SALARY_COURSE } from "./courses/salary";
import { WRITING_COURSE } from "./courses/writing";
import { TABLES_COURSE } from "./courses/tables";
import { SPEAKING_COURSE } from "./courses/speaking";

/** Порядок в хабе: сначала самые востребованные. */
export const MINI_COURSES: MiniCourse[] = [
  AI_MONEY_COURSE,
  SALARY_COURSE,
  WRITING_COURSE,
  TABLES_COURSE,
  SPEAKING_COURSE,
];

export function getCourse(slug: string): MiniCourse | undefined {
  return MINI_COURSES.find((c) => c.slug === slug);
}

export function getLesson(course: MiniCourse, slug: string): MiniLesson | undefined {
  return course.lessons.find((l) => l.slug === slug);
}

/** Ключ прогресса в localStorage — свой у каждого курса. */
export function progressKey(courseSlug: string): string {
  return `minicourse_done_${courseSlug}_v1`;
}

export function loadDone(courseSlug: string): string[] {
  try {
    const raw = localStorage.getItem(progressKey(courseSlug));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDone(courseSlug: string, list: string[]) {
  try {
    localStorage.setItem(progressKey(courseSlug), JSON.stringify(list));
  } catch {
    /* приватный режим — прогресс просто не сохранится */
  }
}

export type { MiniCourse, MiniLesson };
