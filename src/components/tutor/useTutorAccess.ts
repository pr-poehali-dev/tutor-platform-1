import { useAccess } from "@/context/AccessContext";

// ID супер-курсов, которые входят в модуль «Репетитор» (разовая покупка предмета).
export const TUTOR_COURSE_IDS = [9001, 9002, 9003];

/**
 * Доступ к модулю «Репетитор».
 * Открыт, если есть активная подписка ЛИБО куплен любой супер-курс.
 */
export function useTutorAccess() {
  const { hasSubscription, purchasedCourseIds, loading } = useAccess();
  const hasPurchasedSubject = TUTOR_COURSE_IDS.some((id) => purchasedCourseIds.includes(id));
  return {
    loading,
    hasAccess: hasSubscription || hasPurchasedSubject,
    hasSubscription,
    hasPurchasedSubject,
  };
}
