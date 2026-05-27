import { COURSES } from "@/components/courses/coursesData";
import func2url from "../../../../backend/func2url.json";
import { BatchResult, PersistedProgress } from "./types";

export const COURSE_BUILDER_URL = (func2url as Record<string, string>)["course-builder"];
export const PROGRESS_KEY = "uchispro_courses_gen_progress_v2";

export function loadProgress(): PersistedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveProgress(p: PersistedProgress | null) {
  try {
    if (p === null) localStorage.removeItem(PROGRESS_KEY);
    else localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch { /* noop */ }
}

/** Гарантированная генерация одного курса с ретраями и fallback на последней попытке.
 * @param forceAI — если true: пересоздаёт курс (force) и запрещает fallback (только реальный ИИ) */
export async function generateOneCourse(courseId: number, forceAI = false): Promise<BatchResult> {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return { course_id: courseId, generated: false, error: "курс не найден" };

  const MAX_ATTEMPTS = forceAI ? 2 : 3;
  let lastError = "unknown";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Таймаут 22 сек: ИИ на бэке имеет 14 сек, плюс БД+сеть. Если ответа нет — точно беда.
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 22000);

    try {
      const res = await fetch(`${COURSE_BUILDER_URL}?action=batch_generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          courses: [{
            id: course.id,
            title: course.title,
            subject: course.subject,
            grade: course.grade,
            lessons: course.lessons,
            duration: course.duration,
            description: course.description,
            format: course.format,
            // В forceAI-режиме даём ИИ чуть больше времени (но бэк всё равно ограничит)
            ai_deadline: forceAI ? 18 : 14,
          }],
          limit: 1,
          // force=true — пересоздать существующий курс
          force: forceAI,
          // allow_fallback=false означает «считай это warning'ом если ИИ не успел»;
          // бэк всё равно сохранит fallback чтобы курс не потерялся
          allow_fallback: !forceAI,
        }),
      });
      clearTimeout(abortTimer);

      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        if (res.status >= 500 && attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        return { course_id: courseId, title: course.title, generated: false, error: lastError };
      }

      const data = await res.json();
      const first = (data.results || [])[0] as BatchResult | undefined;
      if (first) return first;
      lastError = data.error || "пустой ответ";
    } catch (e) {
      clearTimeout(abortTimer);
      const isAbort = e instanceof DOMException && e.name === "AbortError";
      lastError = isAbort ? "превышен таймаут (22с)" : (e instanceof Error ? e.message : "network error");
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  return { course_id: courseId, title: course.title, generated: false, error: `${lastError} (${MAX_ATTEMPTS} попыток)` };
}
