import { useEffect, useRef } from "react";
import { LEARNING_PATH_URL } from "@/components/journey/journeyData";
import type { RealLesson } from "./useCourseCurriculum";

// Предметы, которые бэкенд learning-path понимает напрямую (как в LessonViewerModal).
const SUPPORTED_SUBJECTS = [
  "math", "physics", "english", "russian",
  "chinese", "korean", "datascience", "product", "avangard", "roomscan", "business",
  "chemistry", "biology", "cs", "ai", "history", "society", "geography",
  "logic", "skills", "career", "literature", "marketing", "robotics", "smartmach",
  "psychology",
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

// Сколько первых уроков прогреваем заранее (открытие станет почти мгновенным).
const WARMUP_COUNT = 6;

/**
 * Фоновый «прогрев» уроков: пока пользователь читает программу курса,
 * тихо генерируем первые несколько уроков, чтобы они осели в кэш.
 * Когда ученик откроет урок — материал придёт почти мгновенно.
 *
 * Греем уроки ПОСЛЕДОВАТЕЛЬНО (по одному за запрос, с паузой), чтобы не
 * перегружать бэкенд: генерация одного урока ~20с, поэтому шлём по очереди.
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

    const subj = mapSubject(subject);
    const gr = mapGrade(grade);

    // Превью-уроки в начало (они доступны без оплаты — их откроют первыми),
    // затем остальные по порядку. Берём первые WARMUP_COUNT уникальных.
    const ordered = [...lessons].sort(
      (a, b) => Number(!!b.is_preview) - Number(!!a.is_preview),
    );
    const targets: { topic: string; lesson_title: string }[] = [];
    for (const l of ordered) {
      const topic = l?.topics?.[0] || l?.lesson_title;
      if (!topic) continue;
      const key = `${subj}|${gr}|${topic}|${l.lesson_title}`;
      if (warmedKeys.has(key)) continue;
      warmedKeys.add(key);
      targets.push({ topic, lesson_title: l.lesson_title });
      if (targets.length >= WARMUP_COUNT) break;
    }
    if (targets.length === 0) return;

    startedRef.current = true;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const warmOne = (idx: number) => {
      if (cancelled || idx >= targets.length) return;
      const t = targets[idx];
      const controller = new AbortController();
      const abort = setTimeout(() => controller.abort(), 50000);
      fetch(LEARNING_PATH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "warmup",
          limit: 1,
          items: [{ subject: subj, grade: gr, topic: t.topic, lesson_title: t.lesson_title }],
        }),
        signal: controller.signal,
      })
        .catch(() => {
          // тихо — это фоновая оптимизация
          warmedKeys.delete(`${subj}|${gr}|${t.topic}|${t.lesson_title}`);
        })
        .finally(() => {
          clearTimeout(abort);
          if (!cancelled) {
            // следующий урок — после паузы, чтобы не нагружать бэкенд
            timers.push(setTimeout(() => warmOne(idx + 1), 1200));
          }
        });
    };

    // Небольшая стартовая задержка — не мешаем загрузке основной страницы.
    timers.push(setTimeout(() => warmOne(0), 1500));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [enabled, subject, grade, lessons]);
}