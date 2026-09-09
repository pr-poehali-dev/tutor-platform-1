import { Course, COURSES } from "./coursesData";

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** Человекопонятный адрес курса: заголовок → латиница через дефис.
 *  Поисковику такой адрес говорит о содержании страницы больше, чем номер. */
export function slugifyCourse(title: string): string {
  return title
    .toLowerCase()
    .split("")
    .map((ch) => (TRANSLIT[ch] !== undefined ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 9)
    .join("-");
}

/** Адрес курса вида /kurs/promt-inzhener-novaya-professiya-77 */
export function courseUrl(course: Course): string {
  return `/kurs/${slugifyCourse(course.title)}-${course.id}`;
}

/** Из адреса достаём id — он всегда последним числом после дефиса. */
export function courseIdFromSlug(slug: string): number | null {
  const m = slug.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}

export function findCourseBySlug(slug: string): Course | undefined {
  const id = courseIdFromSlug(slug);
  if (id === null) return undefined;
  return COURSES.find((c) => c.id === id);
}
