import { useCallback, useEffect, useState } from "react";
import { getUserUid, USER_DATA_URL } from "@/lib/userUid";
import { safeFetch } from "@/lib/safeFetch";

export interface UserStats {
  total_xp: number;
  level: number;
  lessons_completed: number;
  tasks_solved: number;
  streak_days: number;
  last_active_date: string | null;
}

export interface ActivityDay {
  date: string;
  minutes: number;
  lessons: number;
  tasks: number;
  xp: number;
}

export interface MyCourse {
  course_id: number;
  subject: string;
  grade: string;
  title: string;
  status: "active" | "completed";
  progress: number;
  last_activity_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

interface Cache {
  favorites: number[];
  history: number[];
  myCourses: MyCourse[];
  stats: UserStats | null;
  activity: ActivityDay[];
  badges: { id: string; earned_at: string }[];
}

const emptyCache: Cache = {
  favorites: [],
  history: [],
  myCourses: [],
  stats: null,
  activity: [],
  badges: [],
};

async function call<T = Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<Partial<T>> {
  const uid = getUserUid();
  const res = await safeFetch<T>(USER_DATA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, user_uid: uid, ...payload }),
  });
  // Возвращаем пустой объект при сбое/таймауте — вызывающий код устойчив к этому.
  return res.data || {};
}

export default function useUserData() {
  const [data, setData] = useState<Cache>(emptyCache);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [favs, hist, mine, stats] = await Promise.all([
        call<{ course_ids: number[] }>("list_favorites"),
        call<{ history: { course_id: number }[] }>("list_history", { limit: 12 }),
        call<{ courses: MyCourse[] }>("list_my_courses"),
        call<{
          stats: UserStats | null;
          activity: ActivityDay[];
          badges: { id: string; earned_at: string }[];
        }>("get_stats"),
      ]);
      setData({
        favorites: favs.course_ids || [],
        history: (hist.history || []).map((h) => h.course_id),
        myCourses: mine.courses || [],
        stats: stats.stats || null,
        activity: stats.activity || [],
        badges: stats.badges || [],
      });
    } catch {
      // тихо
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleFavorite = useCallback(async (courseId: number) => {
    // оптимистичное обновление
    setData((d) => ({
      ...d,
      favorites: d.favorites.includes(courseId)
        ? d.favorites.filter((id) => id !== courseId)
        : [courseId, ...d.favorites],
    }));
    try { await call("toggle_favorite", { course_id: courseId }); } catch { refresh(); }
  }, [refresh]);

  const trackView = useCallback(async (courseId: number) => {
    setData((d) => ({
      ...d,
      history: [courseId, ...d.history.filter((id) => id !== courseId)].slice(0, 12),
    }));
    try { await call("track_view", { course_id: courseId }); } catch { /* empty */ }
  }, []);

  const startCourse = useCallback(async (
    courseId: number, subject: string, grade: string, title: string,
  ) => {
    try {
      await call("start_course", {
        course_id: courseId, subject, grade, course_title: title,
      });
      refresh();
    } catch { /* empty */ }
  }, [refresh]);

  const updateProgress = useCallback(async (courseId: number, progress: number) => {
    try {
      await call("update_progress", { course_id: courseId, progress });
      refresh();
    } catch { /* empty */ }
  }, [refresh]);

  const logActivity = useCallback(async (payload: {
    minutes?: number; lessons?: number; tasks?: number; xp?: number;
  }) => {
    try {
      await call("log_activity", payload);
      refresh();
    } catch { /* empty */ }
  }, [refresh]);

  const awardBadge = useCallback(async (badgeId: string) => {
    try {
      const res = await call("award_badge", { badge_id: badgeId });
      if (res?.awarded) refresh();
      return !!res?.awarded;
    } catch { return false; }
  }, [refresh]);

  return {
    ...data,
    loaded,
    refresh,
    toggleFavorite,
    isFavorite: (id: number) => data.favorites.includes(id),
    trackView,
    startCourse,
    updateProgress,
    logActivity,
    awardBadge,
  };
}