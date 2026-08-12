import { CourseAudience, MiniCourse, MiniLesson } from "./types";
import { AI_MONEY_COURSE } from "./courses/aiMoney";
import { BUSINESS_2026_COURSE } from "./courses/business2026";
import { SALARY_COURSE } from "./courses/salary";
import { WRITING_COURSE } from "./courses/writing";
import { TABLES_COURSE } from "./courses/tables";
import { SPEAKING_COURSE } from "./courses/speaking";
import { STUDY_COURSE } from "./courses/study";
import { TIME_TEEN_COURSE } from "./courses/timeteen";
import { SAFETY_COURSE } from "./courses/safety";
import { SCHOOL_SPEAK_COURSE } from "./courses/schoolspeak";
import { MONEY_TEEN_COURSE } from "./courses/moneyteen";
import { SLEEP_COURSE } from "./courses/sleep";
import { CONSUMER_LAW_COURSE } from "./courses/consumerlaw";
import { NEGOTIATION_COURSE } from "./courses/negotiation";
import { BACKPAIN_COURSE } from "./courses/backpain";
import { DOCTOR_COURSE } from "./courses/doctor";
import { COOKING_COURSE } from "./courses/cooking";
import { HOMEFIX_COURSE } from "./courses/homefix";
import { PHONE_FOTO_COURSE } from "./courses/phonefoto";
import { MATH_FEAR_COURSE } from "./courses/mathfear";
import { EXAM_STRESS_COURSE } from "./courses/examstress";
import { ENGLISH_COURSE } from "./courses/english";
import { PHYSICS_COURSE } from "./courses/physics";
import { HISTORY_COURSE } from "./courses/history";
import { LITERATURE_COURSE } from "./courses/literature";
import { ASTRONOMY_COURSE } from "./courses/astronomy";
import { RASCI_COURSE } from "./courses/rasci";
import { TASK_SETTING_COURSE } from "./courses/tasksetting";
import { HIRING_COURSE } from "./courses/hiring";
import { FEEDBACK_COURSE } from "./courses/feedback";

/** Порядок в хабе: сначала самые востребованные. */
export const MINI_COURSES: MiniCourse[] = [
  // Руководителям: управленческие инструменты с готовым шаблоном на выходе
  RASCI_COURSE,
  TASK_SETTING_COURSE,
  FEEDBACK_COURSE,
  HIRING_COURSE,
  // Взрослым: деньги и работа
  BUSINESS_2026_COURSE,
  AI_MONEY_COURSE,
  SALARY_COURSE,
  NEGOTIATION_COURSE,
  CONSUMER_LAW_COURSE,
  // Взрослым: рабочие навыки
  WRITING_COURSE,
  TABLES_COURSE,
  SPEAKING_COURSE,
  PHONE_FOTO_COURSE,
  // Взрослым: здоровье и быт
  SLEEP_COURSE,
  BACKPAIN_COURSE,
  DOCTOR_COURSE,
  COOKING_COURSE,
  HOMEFIX_COURSE,
  // Школьникам: учёба и экзамены
  STUDY_COURSE,
  MATH_FEAR_COURSE,
  EXAM_STRESS_COURSE,
  ENGLISH_COURSE,
  LITERATURE_COURSE,
  HISTORY_COURSE,
  PHYSICS_COURSE,
  ASTRONOMY_COURSE,
  // Школьникам: жизненные навыки
  TIME_TEEN_COURSE,
  SCHOOL_SPEAK_COURSE,
  MONEY_TEEN_COURSE,
  SAFETY_COURSE,
];

export function coursesByTrack(track: CourseAudience): MiniCourse[] {
  return MINI_COURSES.filter((c) => c.track === track);
}

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

export type { MiniCourse, MiniLesson, CourseAudience };