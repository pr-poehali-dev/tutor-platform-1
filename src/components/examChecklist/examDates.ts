/**
 * Расписание ЕГЭ 2026 (основной этап, по проекту Рособрнадзора).
 * Используется для обратного отсчёта и формирования персонального чек-листа.
 */

import { SubjectCode } from "@/components/graduate/graduateData";

export interface ExamDate {
  subject: SubjectCode;
  date: string; // ISO YYYY-MM-DD
  durationMin: number;
  notes?: string;
}

/**
 * Основной этап ЕГЭ-2026. Даты — ориентировочный график (по аналогии с 2024–2025).
 * При появлении точного расписания Рособрнадзора — обновить.
 */
export const EGE_2026_SCHEDULE: ExamDate[] = [
  { subject: "russian",     date: "2026-05-22", durationMin: 210 },
  { subject: "math_base",   date: "2026-05-29", durationMin: 180 },
  { subject: "math_prof",   date: "2026-05-29", durationMin: 235 },
  { subject: "history",     date: "2026-06-02", durationMin: 210 },
  { subject: "physics",     date: "2026-06-02", durationMin: 235 },
  { subject: "chemistry",   date: "2026-06-05", durationMin: 210 },
  { subject: "literature",  date: "2026-06-05", durationMin: 235 },
  { subject: "biology",     date: "2026-06-09", durationMin: 235 },
  { subject: "english",     date: "2026-06-09", durationMin: 180, notes: "Письменная часть. Устная — 15 июня." },
  { subject: "foreign",     date: "2026-06-09", durationMin: 180 },
  { subject: "social",      date: "2026-06-15", durationMin: 235 },
  { subject: "geography",   date: "2026-06-15", durationMin: 180 },
  { subject: "informatics", date: "2026-06-18", durationMin: 235, notes: "Компьютерная форма (КЕГЭ)." },
];

/** Ключевые даты года для выпускника. */
export const KEY_DEADLINES_2026 = [
  { id: "final-essay",  title: "Итоговое сочинение (допуск к ЕГЭ)", date: "2025-12-03", emoji: "✍️" },
  { id: "ege-apply",    title: "Подача заявления на ЕГЭ",            date: "2026-02-01", emoji: "📝" },
  { id: "ege-start",    title: "Начало ЕГЭ (досрочный этап)",        date: "2026-03-20", emoji: "🚀" },
  { id: "ege-main",     title: "Начало основного этапа ЕГЭ",          date: "2026-05-22", emoji: "📚" },
  { id: "results-end",  title: "Все результаты ЕГЭ опубликованы",     date: "2026-07-01", emoji: "📊" },
  { id: "vuz-apply",    title: "Подача документов в вузы",            date: "2026-06-20", emoji: "🎓" },
  { id: "vuz-deadline", title: "Дедлайн подачи документов",           date: "2026-07-25", emoji: "⚠️" },
  { id: "vuz-priority", title: "Приоритет согласия на зачисление",    date: "2026-08-04", emoji: "✅" },
  { id: "vuz-enroll",   title: "Зачисление в вуз",                    date: "2026-08-09", emoji: "🎉" },
];

/** Возвращает дату ближайшего ЕГЭ по предметам пользователя. */
export function getNearestExam(subjects: SubjectCode[], from = new Date()): ExamDate | null {
  const exams = EGE_2026_SCHEDULE
    .filter((e) => subjects.includes(e.subject))
    .map((e) => ({ ...e, ts: new Date(e.date).getTime() }))
    .filter((e) => e.ts >= from.getTime())
    .sort((a, b) => a.ts - b.ts);
  return exams[0] || null;
}

export function daysUntil(dateIso: string, from = new Date()): number {
  const target = new Date(dateIso + "T00:00:00").getTime();
  const diff = target - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
