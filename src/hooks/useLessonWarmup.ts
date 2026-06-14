import { useEffect, useRef } from "react";
import { LEARNING_PATH_URL } from "@/components/journey/journeyData";
import type { RealLesson } from "./useCourseCurriculum";

// Предметы, которые бэкенд learning-path понимает напрямую (как в LessonViewerModal).
const SUPPORTED_SUBJECTS = [
  "math", "physics", "english", "russian",
  "chinese", "korean", "datascience", "product", "avangard", "roomscan", "business",
  "chemistry", "biology", "cs", "ai", "history", "society", "geography",
  "logic", "skills", "career", "literature", "marketing", "robotics", "smartmach",
];

const mapSubject = (s: string): string => (SUPPORTED_SUBJECTS.includes(s) ? s : "math");

const mapGrade = (g: string): string => {
  if (["5-9", "10-11", "ege"].includes(g)) return g;
  if (g === "oge") return "5-9";
  if (g === "1-4") return "5-9";
  if (g === "adult") return "10-11";
  return "5-9";
};

// Чтобы не греть один и тот же урок повторно в рамках сессии.
const warmedKeys = new Set<string>();

/**
 * Фоновый «прогрев» урока: пока пользователь читает программу курса,
 * тихо запускаем генерацию первого превью-урока, чтобы он осел в кэш.
 * Когда ученик откроет урок — материал придёт почти мгновенно.
 *
 * Полностью бесшумный: без UI, без влияния на интерфейс. Ошибки игнорируются.
 */
export default function useLessonWarmup(
  subject: string,
  grade: string,
  lessons: RealLesson[],
  enabled: boolean,
) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    if (!lessons || lessons.length === 0) return;

    // Берём первый превью-урок, иначе — первый урок программы.
    const target = lessons.find((l) => l.is_preview) || lessons[0];
    const topic = target?.topics?.[0] || target?.lesson_title;
    if (!topic) return;

    const subj = mapSubject(subject);
    const gr = mapGrade(grade);
    const key = `${subj}|${gr}|${topic}|${target.lesson_title}`;
    if (warmedKeys.has(key)) return;

    warmedKeys.add(key);
    startedRef.current = true;

    // Небольшая задержка — не мешаем загрузке основной страницы.
    const timer = setTimeout(() => {
      const controller = new AbortController();
      const abort = setTimeout(() => controller.abort(), 50000);
      fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "warmup",
          limit: 1,
          items: [
            { subject: subj, grade: gr, topic, lesson_title: target.lesson_title },
          ],
        }),
        signal: controller.signal,
      })
        .catch(() => {
          // тихо — это фоновая оптимизация, ошибки не важны
          warmedKeys.delete(key);
        })
        .finally(() => clearTimeout(abort));
    }, 1500);

    return () => clearTimeout(timer);
  }, [enabled, subject, grade, lessons]);
}
