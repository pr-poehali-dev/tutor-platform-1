import func2url from "../../../backend/func2url.json";
import type { BuilderCourse } from "@/components/builder/api";

const URL = (func2url as Record<string, string>)["school-cabinet"];
const TOKEN_KEY = "uchispro_auth_token_v1";

function token(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export interface School {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  brand_logo_url: string | null;
  brand_color: string | null;
  custom_domain: string | null;
  domain_verified: boolean;
  payments_enabled: boolean;
  platform_fee_percent: number;
  ai_teacher_enabled: boolean;
  ai_teacher_persona: string | null;
  status: string;
  created_at: string | null;
  courses_count?: number;
}

export interface SchoolCourseListItem {
  id: number;
  title: string;
  topic: string | null;
  lessons_count: number;
  modules_count: number;
  price_kopecks: number;
  is_published: boolean;
  status: string;
  created_at: string | null;
}

export interface SchoolCourseFull extends SchoolCourseListItem {
  data: BuilderCourse;
}

async function req<T>(
  action: string,
  opts: { method?: string; body?: unknown; query?: Record<string, string> } = {}
): Promise<{ ok: boolean; data?: T; error?: string; needAuth?: boolean }> {
  const t = token();
  if (!t) return { ok: false, error: "Войдите в аккаунт", needAuth: true };
  const params = new URLSearchParams({ action, ...(opts.query || {}) });
  try {
    const res = await fetch(`${URL}?${params.toString()}`, {
      method: opts.method || "GET",
      headers: { "Content-Type": "application/json", "X-Auth-Token": t },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error || `Ошибка ${res.status}`, needAuth: res.status === 401 };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Сеть недоступна" };
  }
}

export function fetchMySchool() {
  return req<{ school: School }>("my_school");
}

export function updateSchool(patch: Partial<Pick<School, "name" | "description" | "brand_color" | "brand_logo_url">>) {
  return req<{ ok: boolean; school: School }>("update_school", { method: "POST", body: patch });
}

export function fetchSchoolCourses() {
  return req<{ items: SchoolCourseListItem[]; total: number }>("courses");
}

export function saveCourseToSchool(course: BuilderCourse, builderCourseId?: number) {
  return req<{ ok: boolean; id: number; school_id: number }>("save_course", {
    method: "POST",
    body: { course, builder_course_id: builderCourseId },
  });
}

export function fetchSchoolCourse(id: number) {
  return req<{ course: SchoolCourseFull }>("course", { query: { id: String(id) } });
}

export function updateSchoolCourse(
  id: number,
  patch: { title?: string; price_kopecks?: number; is_published?: boolean; data?: BuilderCourse }
) {
  return req<{ ok: boolean; id: number }>("update_course", { method: "POST", body: { id, ...patch } });
}

export function deleteSchoolCourse(id: number) {
  return req<{ ok: boolean }>("delete_course", { method: "POST", body: { id } });
}

// ---------- Публичная витрина и оплата (Этап 3) ----------

export interface PublicCoursePreviewLesson {
  title: string;
  type: string;
}
export interface PublicCourseModule {
  title: string;
  lessons: PublicCoursePreviewLesson[];
}
export interface PublicCourse {
  id: number;
  title: string;
  topic: string | null;
  lessons_count: number;
  modules_count: number;
  price_kopecks: number;
  description: string | null;
  tagline: string | null;
  outcomes: string[];
  target_audience: string | null;
  estimated_hours: number;
  modules: PublicCourseModule[];
  school: { id: number; name: string; brand_color: string | null; brand_logo_url: string | null };
}

export async function fetchPublicCourse(
  id: number
): Promise<{ ok: boolean; data?: { course: PublicCourse }; error?: string }> {
  try {
    const res = await fetch(`${URL}?action=public_course&id=${id}`);
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error || `Ошибка ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Сеть недоступна" };
  }
}

export function buySchoolCourse(courseId: number, returnUrl: string) {
  return req<{ ok?: boolean; already_owned?: boolean; confirmation_url?: string; purchase_id?: number }>(
    "buy_course",
    { method: "POST", body: { course_id: courseId, return_url: returnUrl } }
  );
}

export function syncSchoolPayment() {
  return req<{ synced: boolean; activated: number[] }>("sync_payment", { method: "POST" });
}

export interface EnrollmentItem {
  id: number;
  title: string;
  lessons_count: number;
  modules_count: number;
  school_name: string;
}

export function fetchMyEnrollments() {
  return req<{ items: EnrollmentItem[]; total: number }>("my_enrollments");
}

// ---------- Этап 4: бренд ----------

export function uploadSchoolLogo(imageBase64: string, contentType: string) {
  return req<{ ok: boolean; brand_logo_url: string }>("upload_logo", {
    method: "POST",
    body: { image_base64: imageBase64, content_type: contentType },
  });
}

// ---------- Этап 2: ученики ----------

export interface StudentItem {
  id: number;
  email: string | null;
  name: string | null;
  source: string;
  status: string;
  course_title: string;
  created_at: string | null;
}

export function fetchStudents() {
  return req<{ items: StudentItem[]; total: number }>("students");
}

export function inviteStudent(courseId: number, email: string) {
  return req<{ ok: boolean; id: number }>("invite_student", {
    method: "POST",
    body: { course_id: courseId, email },
  });
}

export function removeStudent(id: number) {
  return req<{ ok: boolean }>("remove_student", { method: "POST", body: { id } });
}