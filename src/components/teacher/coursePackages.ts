// Пакеты предметов для репетитора.
// Модель оплаты: разовая покупка даёт доступ до конца учебного года (31 мая след. года).
// НИКАКОГО общего безлимита/подписки — только конкретные предметы и пакеты.
import { SUPER_COURSES } from "./superCourses";

export interface CoursePackage {
  id: string;
  courseId: number; // числовой ID для оплаты через кассу (как у супер-курса)
  title: string;
  emoji: string;
  accent: string;
  tagline: string;
  price: number; // ₽
  oldPrice: number; // зачёркнутая цена (сумма предметов по отдельности)
  includedCourseIds: number[]; // какие предметные курсы открывает пакет
  highlight?: boolean; // выделить как «выгодный»
}

/** Доступ до конца текущего/ближайшего учебного года — 31 мая. */
export function accessUntilLabel(): string {
  const now = new Date();
  // Учебный год заканчивается 31 мая. Если сейчас июнь-декабрь — конец 31 мая следующего года.
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  return `до 31 мая ${year} года`;
}

// Предметные courseId (совпадают с superCourses.ts)
const ID = {
  physics: 9001,
  math: 9002,
  informatics: 9003,
  chemistry: 9004,
  biology: 9005,
  russian: 9006,
  history: 9007,
};

export const COURSE_PACKAGES: CoursePackage[] = [
  {
    id: "pack-tech",
    courseId: 9101,
    title: "Технический профиль",
    emoji: "🚀",
    accent: "#00d4ff",
    tagline: "Физика, математика и информатика — для поступления в технический вуз",
    price: 4490,
    oldPrice: 5970,
    includedCourseIds: [ID.physics, ID.math, ID.informatics],
    highlight: true,
  },
  {
    id: "pack-medic",
    courseId: 9102,
    title: "Медико-биологический профиль",
    emoji: "🧬",
    accent: "#10b981",
    tagline: "Химия, биология и математика — для поступления в медицинский вуз",
    price: 4490,
    oldPrice: 5970,
    includedCourseIds: [ID.chemistry, ID.biology, ID.math],
  },
  {
    id: "pack-human",
    courseId: 9103,
    title: "Гуманитарный профиль",
    emoji: "📜",
    accent: "#f59e0b",
    tagline: "Русский язык, история и математика — для гуманитарных направлений",
    price: 4490,
    oldPrice: 5970,
    includedCourseIds: [ID.russian, ID.history, ID.math],
  },
  {
    id: "pack-all",
    courseId: 9100,
    title: "Комплекс: все предметы",
    emoji: "👑",
    accent: "#a855f7",
    tagline: "Полный доступ ко всем 7 предметам — максимальная подготовка и выгода",
    price: 8990,
    oldPrice: 13930,
    includedCourseIds: [
      ID.physics, ID.math, ID.informatics, ID.chemistry, ID.biology, ID.russian, ID.history,
    ],
    highlight: true,
  },
];

/**
 * Проверяет доступ к предмету с учётом пакетов.
 * Предмет открыт, если куплен сам предмет ИЛИ куплен любой пакет, куда он входит.
 */
export function hasSubjectAccess(
  subjectCourseId: number,
  purchasedCourseIds: number[]
): boolean {
  if (purchasedCourseIds.includes(subjectCourseId)) return true;
  return COURSE_PACKAGES.some(
    (pkg) =>
      purchasedCourseIds.includes(pkg.courseId) &&
      pkg.includedCourseIds.includes(subjectCourseId)
  );
}

/** Названия предметов, входящих в пакет (для отображения на карточке). */
export function packageSubjectNames(pkg: CoursePackage): string[] {
  return pkg.includedCourseIds.map((cid) => {
    const c = SUPER_COURSES.find((sc) => sc.courseId === cid);
    return c ? c.subject : "";
  }).filter(Boolean);
}
