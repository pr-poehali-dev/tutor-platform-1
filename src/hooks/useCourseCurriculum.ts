import { useEffect, useState } from "react";
import func2url from "../../backend/func2url.json";
import { CourseModule, ModuleLesson } from "@/components/courses/courseDetailsData";

const COURSE_BUILDER_URL = (func2url as Record<string, string>)["course-builder"];

export interface RealCurriculum {
  id: number;
  course_id: number;
  course_title: string;
  total_lessons: number;
  total_modules: number;
  estimated_hours: number;
  program_description: string;
  learning_outcomes: string[];
  target_audience: string;
  prerequisites: string[];
  methodology: string;
  final_project: string;
  certificate_available: boolean;
}

export interface RealLesson {
  id: number;
  module_index: number;
  module_title: string;
  module_description: string;
  lesson_index: number;
  lesson_title: string;
  lesson_summary: string;
  lesson_type: string;
  estimated_minutes: number;
  topics: string[];
  skills_acquired: string[];
  homework_description: string | null;
  is_preview: boolean;
  sort_order: number;
}

interface CourseInfo {
  id: number;
  title: string;
  subject: string;
  grade: string;
  lessons: number;
  duration?: string;
  description?: string;
  format?: string;
}

interface State {
  loading: boolean;
  curriculum: RealCurriculum | null;
  lessons: RealLesson[];
  modules: CourseModule[];
  needsGeneration: boolean;
  error: string | null;
  generating: boolean;
}

/** Загружает РЕАЛЬНУЮ программу курса из БД (course_curricula).
 *  Если её ещё нет — может запросить генерацию ИИ через course-builder.
 *  Возвращает структуру совместимую с CourseModule для совместимости со старым UI. */
export default function useCourseCurriculum(courseInfo: CourseInfo, autoGenerate = false) {
  const [state, setState] = useState<State>({
    loading: true,
    curriculum: null,
    lessons: [],
    modules: [],
    needsGeneration: false,
    error: null,
    generating: false,
  });

  const lessonsToModules = (lessons: RealLesson[]): CourseModule[] => {
    const grouped = new Map<number, { title: string; lessons: ModuleLesson[] }>();
    lessons.forEach((l) => {
      if (!grouped.has(l.module_index)) {
        grouped.set(l.module_index, { title: l.module_title, lessons: [] });
      }
      grouped.get(l.module_index)!.lessons.push({
        num: l.lesson_index,
        title: l.lesson_title,
        duration: `${l.estimated_minutes} мин`,
        topics: l.topics || [],
      });
    });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([id, m]) => ({ id, title: m.title, lessons: m.lessons }));
  };

  const fetchOrGenerate = async (generate: boolean) => {
    setState((s) => ({ ...s, loading: !generate, generating: generate, error: null }));
    try {
      const payload: Record<string, unknown> = { course_id: courseInfo.id };
      if (generate) {
        payload.course_info = courseInfo;
      }
      const res = await fetch(`${COURSE_BUILDER_URL}?action=get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) {
        setState((s) => ({ ...s, loading: false, generating: false, error: data.error }));
        return;
      }
      if (data.needs_generation) {
        setState((s) => ({ ...s, loading: false, needsGeneration: true }));
        if (autoGenerate) {
          await fetchOrGenerate(true);
        }
        return;
      }
      const lessons: RealLesson[] = (data.lessons || []).map((l: RealLesson) => ({
        ...l,
        topics: Array.isArray(l.topics) ? l.topics : [],
        skills_acquired: Array.isArray(l.skills_acquired) ? l.skills_acquired : [],
      }));
      setState({
        loading: false,
        generating: false,
        needsGeneration: false,
        error: null,
        curriculum: data.curriculum
          ? {
              ...data.curriculum,
              learning_outcomes: Array.isArray(data.curriculum.learning_outcomes)
                ? data.curriculum.learning_outcomes
                : [],
              prerequisites: Array.isArray(data.curriculum.prerequisites)
                ? data.curriculum.prerequisites
                : [],
            }
          : null,
        lessons,
        modules: lessonsToModules(lessons),
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        generating: false,
        error: e instanceof Error ? e.message : "network error",
      }));
    }
  };

  useEffect(() => {
    fetchOrGenerate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseInfo.id]);

  const generate = () => fetchOrGenerate(true);

  return { ...state, generate };
}
