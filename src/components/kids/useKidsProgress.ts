import { useCallback, useEffect, useRef, useState } from "react";
import { kidsApi } from "./kidsApi";

const STORAGE_KEY = "uchispro_kids_progress_v1";

export interface KidsProgress {
  stars: number;
  completedActivities: number[]; // ID завершённых занятий
  streakDays: number;
  lastActivityDate: string | null; // ISO date YYYY-MM-DD
  totalAnswers: number;
  correctAnswers: number;
}

const DEFAULT_PROGRESS: KidsProgress = {
  stars: 0,
  completedActivities: [],
  streakDays: 0,
  lastActivityDate: null,
  totalAnswers: 0,
  correctAnswers: 0,
};

function load(): KidsProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

const EVENT_NAME = "uchispro_kids_progress_change";

function save(p: KidsProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch { /* noop */ }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useKidsProgress() {
  const [progress, setProgress] = useState<KidsProgress>(() => load());
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRemoteLoadedRef = useRef(false);

  useEffect(() => {
    save(progress);
    // Debounced sync to backend (раз в 2 сек после последнего изменения)
    if (!hasRemoteLoadedRef.current) return; // не пушим до первой загрузки с сервера
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      kidsApi.saveProgress(progress).catch(() => { /* offline ok */ });
    }, 2000);
  }, [progress]);

  // При монтировании — подтягиваем прогресс с сервера и сливаем с локальным (берём max)
  useEffect(() => {
    let cancelled = false;
    kidsApi.getProgress().then((remote) => {
      if (cancelled) return;
      setProgress((local) => {
        const merged: KidsProgress = {
          stars: Math.max(local.stars, remote.stars || 0),
          completedActivities: Array.from(
            new Set([...(local.completedActivities || []), ...(remote.completedActivities || [])]),
          ),
          streakDays: Math.max(local.streakDays, remote.streakDays || 0),
          lastActivityDate: [local.lastActivityDate, remote.lastActivityDate]
            .filter(Boolean)
            .sort()
            .reverse()[0] || null,
          totalAnswers: Math.max(local.totalAnswers, remote.totalAnswers || 0),
          correctAnswers: Math.max(local.correctAnswers, remote.correctAnswers || 0),
        };
        return merged;
      });
      hasRemoteLoadedRef.current = true;
    }).catch(() => {
      // offline — продолжаем работать с localStorage, но включаем sync
      hasRemoteLoadedRef.current = true;
    });
    return () => { cancelled = true; };
  }, []);

  // Слушаем изменения прогресса из других компонентов (синхронизация в рамках вкладки)
  useEffect(() => {
    const onChange = () => setProgress(load());
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const addStars = useCallback((n: number) => {
    setProgress((p) => ({ ...p, stars: p.stars + Math.max(0, n) }));
  }, []);

  const recordAnswer = useCallback((correct: boolean) => {
    setProgress((p) => ({
      ...p,
      totalAnswers: p.totalAnswers + 1,
      correctAnswers: p.correctAnswers + (correct ? 1 : 0),
    }));
  }, []);

  const completeActivity = useCallback((activityId: number) => {
    setProgress((p) => {
      const today = todayIso();
      const yesterday = yesterdayIso();
      let nextStreak = p.streakDays;
      if (p.lastActivityDate === today) {
        // тот же день — серия не меняется
      } else if (p.lastActivityDate === yesterday) {
        nextStreak = p.streakDays + 1;
      } else {
        nextStreak = 1;
      }
      const completed = p.completedActivities.includes(activityId)
        ? p.completedActivities
        : [...p.completedActivities, activityId];
      return {
        ...p,
        completedActivities: completed,
        streakDays: nextStreak,
        lastActivityDate: today,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return { progress, addStars, recordAnswer, completeActivity, reset };
}