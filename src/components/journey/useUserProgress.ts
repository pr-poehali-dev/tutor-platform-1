import { useState, useEffect, useCallback } from "react";

export const PROGRESS_URL = "https://functions.poehali.dev/4e7b32c4-e089-43b4-8fb5-6cf240f7915e";

export interface User {
  id: number;
  nickname: string;
  display_name: string;
  avatar_emoji: string;
  total_xp: number;
  streak_days: number;
}

export interface SavedJourney {
  id: number;
  subject: string;
  grade: string;
  level_assessment: string;
  initial_score_percent: number;
  program_data: {
    program_title: string;
    estimated_days: number;
    total_modules: number;
    modules: Array<{ id: number; topic: string; title: string; description: string; skills: string[]; tasks_count: number; difficulty: string; estimated_minutes: number; repeat_after_days: number[] }>;
    tips: string[];
  };
  weak_topics: Array<{ topic: string; severity: string; reason: string }>;
  strong_topics: string[];
  completed_module_ids: number[];
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "uchispro_user";

export function useUserProgress() {
  const [user, setUser] = useState<User | null>(null);
  const [savedJourneys, setSavedJourneys] = useState<SavedJourney[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as User;
        setUser(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const callAPI = useCallback(async <T,>(body: Record<string, unknown>): Promise<T> => {
    const res = await fetch(PROGRESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка прогресса");
    return data;
  }, []);

  const login = useCallback(async (nickname: string, displayName?: string, avatar?: string) => {
    setIsLoading(true);
    try {
      const u = await callAPI<User>({
        action: "login",
        nickname,
        display_name: displayName,
        avatar_emoji: avatar || "🦁",
      });
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      return u;
    } finally {
      setIsLoading(false);
    }
  }, [callAPI]);

  const logout = useCallback(() => {
    setUser(null);
    setSavedJourneys([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loadJourneys = useCallback(async (userId: number) => {
    try {
      const data = await callAPI<{ journeys: SavedJourney[] }>({
        action: "get_journeys",
        user_id: userId,
      });
      setSavedJourneys(data.journeys);
      return data.journeys;
    } catch {
      return [];
    }
  }, [callAPI]);

  const saveJourney = useCallback(async (params: {
    user_id: number;
    subject: string;
    grade: string;
    level_assessment: string;
    initial_score_percent: number;
    program_data: unknown;
    weak_topics: unknown;
    strong_topics: unknown;
  }) => {
    const data = await callAPI<{ journey_id: number }>({
      action: "save_journey",
      ...params,
    });
    return data.journey_id;
  }, [callAPI]);

  const completeModule = useCallback(async (params: {
    user_id: number;
    journey_id: number;
    module_id: number;
    repeat_after_days: number[];
    topic: string;
  }) => {
    return await callAPI<{ ok: boolean; completed_module_ids: number[]; is_complete: boolean }>({
      action: "complete_module",
      ...params,
    });
  }, [callAPI]);

  const logTask = useCallback(async (params: {
    user_id: number;
    journey_id: number;
    module_id: number;
    topic: string;
    question: string;
    is_correct: boolean;
    hints_used: number;
    xp: number;
  }) => {
    try {
      return await callAPI<{ ok: boolean }>({
        action: "log_task",
        ...params,
      });
    } catch {
      return { ok: false };
    }
  }, [callAPI]);

  const getCompletedTitles = useCallback(async (
    userId: number, journeyId: number, moduleId?: number
  ): Promise<string[]> => {
    try {
      const data = await callAPI<{ titles: string[] }>({
        action: "completed_titles",
        user_id: userId,
        journey_id: journeyId,
        module_id: moduleId,
      });
      return data.titles;
    } catch {
      return [];
    }
  }, [callAPI]);

  return {
    user,
    setUser,
    savedJourneys,
    isLoading,
    login,
    logout,
    loadJourneys,
    saveJourney,
    completeModule,
    logTask,
    getCompletedTitles,
  };
}
