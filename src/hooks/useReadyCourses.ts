import { useEffect, useState } from "react";
import func2url from "../../backend/func2url.json";

const COURSE_BUILDER_URL = (func2url as Record<string, string>)["course-builder"];
const CACHE_KEY = "uchispro_ready_course_ids_v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  ids: number[];
  fetchedAt: number;
}

let inMemoryCache: CacheEntry | null = null;

function readCache(): CacheEntry | null {
  if (inMemoryCache && Date.now() - inMemoryCache.fetchedAt < CACHE_TTL_MS) {
    return inMemoryCache;
  }
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    inMemoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(ids: number[]) {
  const entry: CacheEntry = { ids, fetchedAt: Date.now() };
  inMemoryCache = entry;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* noop */ }
}

/**
 * Список id курсов, готовых к продаже (с реальной ИИ-программой, не fallback).
 * Используется во всех местах каталога, чтобы не показывать "пустые" курсы.
 *
 * Возвращает:
 * - readyIds: Set<number> — id курсов с качественной программой
 * - loaded: boolean — закончилась ли загрузка
 * - isReady(id): помощник для проверки конкретного курса
 */
export function useReadyCourses() {
  const [readyIds, setReadyIds] = useState<Set<number>>(() => {
    const cached = readCache();
    return cached ? new Set(cached.ids) : new Set();
  });
  const [loaded, setLoaded] = useState(() => !!readCache());

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setReadyIds(new Set(cached.ids));
      setLoaded(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${COURSE_BUILDER_URL}?action=ready_course_ids`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const ids = (data.ready_course_ids || []) as number[];
        if (cancelled) return;
        writeCache(ids);
        setReadyIds(new Set(ids));
      } catch {
        // При ошибке — пустой set: лучше показать "ничего нет в продаже"
        // чем продавать курсы без программы
        if (!cancelled) setReadyIds(new Set());
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const isReady = (courseId: number) => readyIds.has(courseId);

  return { readyIds, loaded, isReady };
}

export default useReadyCourses;
