import { useCallback, useEffect, useState } from "react";
import func2url from "../../backend/func2url.json";

const PROGRESS_URL = (func2url as Record<string, string>)["course-progress"];
const TOKEN_KEY = "uchispro_auth_token_v1";

export interface ProgressItem {
  lesson_key: string;
  lesson_title: string | null;
  module_id: number | null;
  status: string;
  score: number | null;
  total: number | null;
}

export interface CourseProgress {
  lessons: ProgressItem[];
  quizzes: ProgressItem[];
}

/** Стабильный ключ урока внутри курса: модуль + номер урока. */
export function lessonKey(moduleId: number, lessonNum: number): string {
  return `m${moduleId}-l${lessonNum}`;
}

/** Ключ итогового квиза модуля. */
export function quizKey(moduleId: number): string {
  return `m${moduleId}-quiz`;
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const EMPTY: CourseProgress = { lessons: [], quizzes: [] };

export default function useCourseProgress(courseId: number | null, enabled = true) {
  const [progress, setProgress] = useState<CourseProgress>(EMPTY);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!enabled || !courseId || !token || !PROGRESS_URL) {
      setProgress(EMPTY);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${PROGRESS_URL}?course_id=${courseId}`, {
        method: "GET",
        headers: { "X-Auth-Token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setProgress({
          lessons: Array.isArray(data.lessons) ? data.lessons : [],
          quizzes: Array.isArray(data.quizzes) ? data.quizzes : [],
        });
      } else {
        setProgress(EMPTY);
      }
    } catch {
      setProgress(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [courseId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const isLessonDone = useCallback(
    (key: string) => progress.lessons.some(l => l.lesson_key === key && l.status === "completed"),
    [progress.lessons],
  );

  const getQuiz = useCallback(
    (key: string) => progress.quizzes.find(q => q.lesson_key === key) || null,
    [progress.quizzes],
  );

  /** Процент пройденных уроков модуля (0-100). */
  const moduleProgress = useCallback(
    (moduleId: number, totalLessons: number) => {
      if (totalLessons <= 0) return 0;
      const done = progress.lessons.filter(
        l => l.module_id === moduleId && l.status === "completed",
      ).length;
      return Math.min(100, Math.round((done / totalLessons) * 100));
    },
    [progress.lessons],
  );

  const completeLesson = useCallback(
    async (params: {
      courseId: number;
      key: string;
      title: string;
      moduleId: number;
      score?: number;
      total?: number;
    }) => {
      const token = getToken();
      if (!token || !PROGRESS_URL) return;
      // Оптимистично помечаем сразу
      setProgress(prev => {
        const others = prev.lessons.filter(l => l.lesson_key !== params.key);
        return {
          ...prev,
          lessons: [
            ...others,
            {
              lesson_key: params.key,
              lesson_title: params.title,
              module_id: params.moduleId,
              status: "completed",
              score: params.score ?? null,
              total: params.total ?? null,
            },
          ],
        };
      });
      try {
        await fetch(PROGRESS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Auth-Token": token },
          body: JSON.stringify({
            action: "complete_lesson",
            course_id: params.courseId,
            lesson_key: params.key,
            lesson_title: params.title,
            module_id: params.moduleId,
            score: params.score,
            total: params.total,
          }),
        });
      } catch {
        // тихо — оптимистичное состояние уже показано
      }
    },
    [],
  );

  const saveQuiz = useCallback(
    async (params: {
      courseId: number;
      key: string;
      title: string;
      moduleId: number;
      score: number;
      total: number;
    }) => {
      const token = getToken();
      if (!token || !PROGRESS_URL) return;
      try {
        const res = await fetch(PROGRESS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Auth-Token": token },
          body: JSON.stringify({
            action: "save_quiz",
            course_id: params.courseId,
            lesson_key: params.key,
            lesson_title: params.title,
            module_id: params.moduleId,
            score: params.score,
            total: params.total,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setProgress({
            lessons: Array.isArray(data.lessons) ? data.lessons : [],
            quizzes: Array.isArray(data.quizzes) ? data.quizzes : [],
          });
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  return {
    progress,
    loading,
    isLessonDone,
    getQuiz,
    moduleProgress,
    completeLesson,
    saveQuiz,
    reload: load,
  };
}
