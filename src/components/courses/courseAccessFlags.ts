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