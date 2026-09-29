import { useCallback } from "react";
import { useAccess } from "@/context/AccessContext";

/**
 * Гейт доступа к модулю «Малыш».
 *
 * Модуль изолирован от остальной платформы: его открывает только
 * подписка «Малыш» или бесплатный период на 3 месяца. Школьные тарифы
 * («Репетитор» и прочие) сюда доступа не дают — и наоборот, подписка
 * «Малыш» не открывает школьные курсы. Раньше любая подписка открывала
 * всё, из-за чего продавать разделы по отдельности было невозможно.
 *
 * Гостю без входа оставляем одно демонстрационное занятие: показать
 * ценность до регистрации.
 */
const FREE_KEY = "uchispro_kids_free_activity_v1";

export function useKidsAccess() {
  const { kids, startKidsTrial } = useAccess();
  const hasAccess = kids.access;

  // Какое именно занятие было открыто демонстрационно.
  const getFreeId = useCallback((): string | null => {
    try {
      return localStorage.getItem(FREE_KEY);
    } catch {
      return null;
    }
  }, []);

  // Можно ли открыть это занятие:
  // - есть доступ к «Малышу» → всё открыто;
  // - демо ещё не тратили → можно (это занятие станет демонстрационным);
  // - демо уже потрачено на него же → можно повторно;
  // - иначе → закрыто.
  const canOpen = useCallback(
    (activityId: string): boolean => {
      if (hasAccess) return true;
      const freeId = getFreeId();
      if (!freeId) return true;
      return freeId === activityId;
    },
    [hasAccess, getFreeId]
  );

  const markOpened = useCallback(
    (activityId: string): void => {
      if (hasAccess) return;
      try {
        if (!localStorage.getItem(FREE_KEY)) {
          localStorage.setItem(FREE_KEY, activityId);
        }
      } catch {
        /* noop */
      }
    },
    [hasAccess]
  );

  const freeUsed = !hasAccess && !!getFreeId();

  return {
    /** Открыт ли детский раздел целиком. */
    hasAccess,
    /** Оставлено для совместимости со старыми вызовами. */
    hasSubscription: hasAccess,
    /** subscription — оплачено, trial — идёт бесплатный период. */
    source: kids.source,
    expiresAt: kids.expiresAt,
    trialUsed: kids.trialUsed,
    startKidsTrial,
    canOpen,
    markOpened,
    freeUsed,
  };
}
