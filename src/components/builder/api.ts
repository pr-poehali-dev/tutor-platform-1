import func2url from "../../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["school-builder"];

export interface Quiz {
  q: string;
  options: string[];
  correct: number;
}

export interface BuilderLesson {
  title: string;
  type: "theory" | "practice" | "test" | "project" | string;
  summary: string[];
  task: string;
  quiz: Quiz;
}

export interface BuilderModule {
  title: string;
  lessons: BuilderLesson[];
}

export interface EmailStep {
  subject: string;
  goal: string;
}

export interface BuilderCourse {
  course_title: string;
  tagline: string;
  description: string;
  target_audience: string;
  outcomes: string[];
  estimated_hours: number;
  modules: BuilderModule[];
  marketing: {
    headlines: string[];
    social_posts: string[];
    email_sequence: EmailStep[];
  };
  business: {
    price_recommendation: string;
    usp: string;
    channels: string[];
  };
}

export interface GenerateResult {
  ok: boolean;
  id: number;
  is_fallback: boolean;
  lessons_count: number;
  modules_count: number;
  course: BuilderCourse;
}

export interface GeneratePayload {
  topic: string;
  audience?: string;
  level?: string;
  lessons_count?: number;
  lead_id?: number;
}

export async function generateCourse(
  payload: GeneratePayload
): Promise<{ ok: boolean; data?: GenerateResult; error?: string }> {
  try {
    const res = await fetch(`${URL}?action=generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error || `Ошибка ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Сеть недоступна. Попробуйте ещё раз." };
  }
}
