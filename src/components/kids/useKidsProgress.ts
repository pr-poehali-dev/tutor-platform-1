import { useCallback, useEffect, useState } from "react";

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

  useEffect(() => { save(progress); }, [progress]);

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