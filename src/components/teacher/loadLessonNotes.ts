// Ленивая подгрузка конспектов уроков по предметам.
// Конспекты — большие данные (~5 тыс. строк), поэтому грузятся динамически
// только для нужного предмета в момент старта конкретного урока,
// а не при первом рендере страницы ИИ-преподавателя.
import type { LessonNotes } from "./lessonTypes";

type NotesMap = Record<string, LessonNotes>;

// Определяем предмет по префиксу id урока (ph-1, m-1, cs-1, chem-1, bio-1, rus-1, hist-1).
function subjectByLessonId(lessonId: string): keyof typeof LOADERS | null {
  if (lessonId.startsWith("ph-")) return "physics";
  if (lessonId.startsWith("m-")) return "math";
  if (lessonId.startsWith("cs-")) return "informatics";
  if (lessonId.startsWith("chem-")) return "chemistry";
  if (lessonId.startsWith("bio-")) return "biology";
  if (lessonId.startsWith("rus-")) return "russian";
  if (lessonId.startsWith("hist-")) return "history";
  return null;
}

const LOADERS = {
  physics: () => import("./lessonNotes/physics").then((m) => m.PHYSICS_NOTES),
  math: () => import("./lessonNotes/math").then((m) => m.MATH_NOTES),
  informatics: () => import("./lessonNotes/informatics").then((m) => m.INFORMATICS_NOTES),
  chemistry: () => import("./lessonNotes/chemistry").then((m) => m.CHEMISTRY_NOTES),
  biology: () => import("./lessonNotes/biology").then((m) => m.BIOLOGY_NOTES),
  russian: () => import("./lessonNotes/russian").then((m) => m.RUSSIAN_NOTES),
  history: () => import("./lessonNotes/history").then((m) => m.HISTORY_NOTES),
} as const;

const cache = new Map<string, NotesMap>();

/** Возвращает конспект конкретного урока, подгружая нужный предмет при необходимости. */
export async function loadLessonNotes(lessonId: string): Promise<LessonNotes | undefined> {
  const subject = subjectByLessonId(lessonId);
  if (!subject) return undefined;
  let map = cache.get(subject);
  if (!map) {
    try {
      map = await LOADERS[subject]();
      cache.set(subject, map);
    } catch {
      return undefined;
    }
  }
  return map[lessonId];
}
