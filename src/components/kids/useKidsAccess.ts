import { useCallback } from "react";
import { useAccess } from "@/context/AccessContext";

// Гейт доступа к модулю «Малыш».
// Правило: 1 занятие бесплатно (демо), дальше — только по подписке.
// Подписка «Малыш» (как и любая активная подписка) открывает всё.
const FREE_KEY = "uchispro_kids_free_activity_v1";

export function useKidsAccess() {
  const { hasSubscription } = useAccess();

  // Какое именно занятие было открыто бесплатно (по id раздела/занятия).
  const getFreeId = useCallback((): string | null => {
    try {
      return localStorage.getItem(FREE_KEY);
    } catch {
      return null;
    }
  }, []);

  // Можно ли открыть это занятие.
  // - есть подписка → всё открыто;
  // - бесплатного ещё не тратили → можно (и это станет бесплатным);
  // - бесплатное уже потрачено на это же занятие → можно повторно;
  // - иначе → закрыто.
  const canOpen = useCallback(
    (activityId: string): boolean => {
      if (hasSubscription) return true;
      const freeId = getFreeId();
      if (!freeId) return true;
      return freeId === activityId;
    },
    [hasSubscription, getFreeId]
  );

  // Зафиксировать, что бесплатное занятие открыто (если ещё не зафиксировано и нет подписки).
  const markOpened = useCallback(
    (activityId: string): void => {
      if (hasSubscription) return;
      try {
        if (!localStorage.getItem(FREE_KEY)) {
          localStorage.setItem(FREE_KEY, activityId);
        }
      } catch {
        /* noop */
      }
    },
    [hasSubscription]
  );

  // Доступна ли ещё бесплатная попытка (для подсказок в UI).
  const freeUsed = !hasSubscription && !!getFreeId();

  return { hasSubscription, canOpen, markOpened, freeUsed };
}
