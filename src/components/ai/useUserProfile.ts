import { useCallback, useEffect, useState } from "react";

/**
 * Долговременная память для ИИ-агентов: профиль ученика/родителя.
 * Передаётся в каждый запрос к ai-chat — модель учитывает имя, возраст, цели, слабые места.
 * Хранится в localStorage, обновляется через UI или автоматически после диагностики.
 */

const STORAGE_KEY = "uchispro_user_profile_v1";

export interface UserProfile {
  name?: string;
  age?: number;
  grade?: string; // "5", "9", "11", "ege", "oge"
  goal?: string;  // "Сдать ЕГЭ на 80+", "Подтянуть математику"
  weakTopics?: string[];
  strengths?: string[];
  /** Для модуля Малыш — возраст ребёнка */
  kidAge?: string; // "1-2", "2-3", ...
  updatedAt?: number;
}

function load(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function save(p: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, updatedAt: Date.now() }));
    window.dispatchEvent(new CustomEvent("uchispro_user_profile_change"));
  } catch { /* noop */ }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => load());

  useEffect(() => { save(profile); }, [profile]);

  useEffect(() => {
    const onChange = () => setProfile(load());
    window.addEventListener("uchispro_user_profile_change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("uchispro_user_profile_change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const addWeakTopic = useCallback((topic: string) => {
    setProfile((prev) => {
      const set = new Set(prev.weakTopics ?? []);
      set.add(topic);
      return { ...prev, weakTopics: [...set].slice(0, 10) };
    });
  }, []);

  const addStrength = useCallback((s: string) => {
    setProfile((prev) => {
      const set = new Set(prev.strengths ?? []);
      set.add(s);
      return { ...prev, strengths: [...set].slice(0, 10) };
    });
  }, []);

  const reset = useCallback(() => setProfile({}), []);

  return { profile, update, addWeakTopic, addStrength, reset };
}

/** Для использования вне React-компонентов: чтение синхронно. */
export function readUserProfile(): UserProfile {
  return load();
}

/** Преобразует в payload для ai-chat */
export function profileForApi(p: UserProfile): Record<string, unknown> | undefined {
  if (!p || Object.keys(p).length === 0) return undefined;
  const out: Record<string, unknown> = {};
  if (p.name) out.name = p.name;
  if (p.age) out.age = p.age;
  if (p.grade) out.grade = p.grade;
  if (p.goal) out.goal = p.goal;
  if (p.weakTopics?.length) out.weak_topics = p.weakTopics;
  if (p.strengths?.length) out.strengths = p.strengths;
  if (p.kidAge) out.kid_age = p.kidAge;
  return Object.keys(out).length > 0 ? out : undefined;
}
