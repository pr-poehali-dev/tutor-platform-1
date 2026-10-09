/** Лёгкие флаги доступа к курсам — БЕЗ тяжёлого каталога COURSES.
 *  Вынесено в отдельный модуль, чтобы глобальный AccessContext не тянул
 *  весь coursesData.ts (~124 КБ) в главный бандл на каждой странице. */

/** Список курсов, бесплатных навсегда (доступ без оплаты и без подписки).
 *  Намеренно оставляем мало: бесплатное не ценится. 2 школьных «магнита» + 1 взрослый. */
export const FREE_FOREVER_COURSE_IDS = [2, 37, 76];

/** Хиты продаж — самые модные курсы для витрины каталога (на видном месте). */
export const BESTSELLER_COURSE_IDS = [78, 77, 17, 57, 65];

export function isCourseBestseller(courseId: number): boolean {
  return BESTSELLER_COURSE_IDS.includes(courseId);
}

export function isCourseFreeForever(courseId: number): boolean {
  return FREE_FOREVER_COURSE_IDS.includes(courseId);
}
/** Курсы раздела «Школьникам»: каталог (кроме взрослых) + предметы репетитора.
 *  Их открывает промокод доступа «САМАРА». СИНХРОНИЗИРОВАНО с SCHOOL_COURSE_IDS
 *  в backend/access/index.py — при изменении править в обоих местах. */
const SCHOOL_COURSE_ID_LIST = [
  ...Array.from({ length: 47 }, (_, i) => i + 1),
  49, 56, 58, 59, 60, 61,
  9001, 9002, 9003, 9004, 9005, 9006, 9007,
];
export const SCHOOL_COURSE_IDS = new Set<number>(SCHOOL_COURSE_ID_LIST);

export function isSchoolCourse(courseId: number): boolean {
  return SCHOOL_COURSE_IDS.has(courseId);
}
