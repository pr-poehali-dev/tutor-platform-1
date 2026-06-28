import { useCallback, useEffect, useState } from "react";

// Локальный прогресс по супер-курсам — без авторизации, мгновенно.
// Хранит ID пройденных уроков, чтобы клиент видел рост своих знаний.

const KEY = "uchispro_super_progress";

type ProgressMap = Record<string, true>; // lessonId -> пройдено

function read(): ProgressMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function useSuperProgress() {
  const [done, setDone] = useState<ProgressMap>(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch {
      // ignore
    }
  }, [done]);

  // Синхронизация между вкладками
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setDone(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const markDone = useCallback((lessonId: string) => {
    setDone(prev => (prev[lessonId] ? prev : { ...prev, [lessonId]: true }));
  }, []);

  const isDone = useCallback((lessonId: string) => !!done[lessonId], [done]);

  const countDone = useCallback(
    (lessonIds: string[]) => lessonIds.filter(id => done[id]).length,
    [done],
  );

  return { done, markDone, isDone, countDone };
}
