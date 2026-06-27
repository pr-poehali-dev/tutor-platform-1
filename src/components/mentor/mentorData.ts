import { AI_CHAT_URL } from "@/components/teacher/teachersData";

/** Возрастные группы наставника — определяют тон общения. */
export type AgeGroup = "kid" | "school" | "teen" | "adult" | "senior";

export interface AgeOption {
  id: AgeGroup;
  label: string;
  /** Примерный возраст для профиля ИИ (середина диапазона). */
  age: number;
  emoji: string;
}

export const AGE_OPTIONS: AgeOption[] = [
  { id: "kid", label: "Малышу (2–6)", age: 5, emoji: "🧸" },
  { id: "school", label: "Школьнику (7–13)", age: 10, emoji: "🎒" },
  { id: "teen", label: "Подростку (14–17)", age: 16, emoji: "🎓" },
  { id: "adult", label: "Взрослому (18–59)", age: 30, emoji: "💼" },
  { id: "senior", label: "60+", age: 65, emoji: "🌳" },
];

const AGE_KEY = "mentor_age_group";
const LAST_SEEN_KEY = "mentor_last_seen";

export function getAgeGroup(): AgeGroup | null {
  try {
    const v = localStorage.getItem(AGE_KEY);
    if (v && AGE_OPTIONS.some((o) => o.id === v)) return v as AgeGroup;
  } catch {
    /* ignore */
  }
  return null;
}

export function setAgeGroup(group: AgeGroup): void {
  try {
    localStorage.setItem(AGE_KEY, group);
  } catch {
    /* ignore */
  }
}

export function ageForGroup(group: AgeGroup): number {
  return AGE_OPTIONS.find((o) => o.id === group)?.age ?? 30;
}

/** Отметить, что пользователь сегодня видел наставника (для проактивности). */
export function markSeen(): void {
  try {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString().slice(0, 10));
  } catch {
    /* ignore */
  }
}

/** Сколько дней пользователь не открывал наставника (по локальной метке). */
export function daysSinceSeen(): number {
  try {
    const v = localStorage.getItem(LAST_SEEN_KEY);
    if (!v) return 0;
    const last = new Date(v + "T00:00:00").getTime();
    const now = Date.now();
    const diff = Math.floor((now - last) / 86_400_000);
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

export interface MentorProfile {
  name?: string;
  age?: number;
  streak?: number;
  znaika?: number;
  lessons_done?: number;
  days_inactive?: number;
  last_course?: string;
}

export interface MentorMessage {
  from: "mentor" | "user";
  text: string;
}

/**
 * Запрос к ИИ-наставнику «Маяк».
 * Переиспользует backend ai-chat с teacher_id="mentor".
 */
export async function askMentor(
  message: string,
  history: MentorMessage[],
  profile: MentorProfile,
): Promise<string> {
  const res = await fetch(AI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teacher_id: "mentor",
      message,
      voice_mode: false,
      history: history.map((m) => ({
        from: m.from === "mentor" ? "teacher" : "student",
        text: m.text,
      })),
      user_profile: profile,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Наставник недоступен");
  }
  return data.reply || "Давай начнём с малого — открой любой курс и сделай один шаг.";
}

/** Стартовые быстрые запросы к наставнику. */
export const QUICK_PROMPTS = [
  "Поставь мне цель на сегодня",
  "Не хочу учиться, помоги настроиться",
  "Чем заняться за 10 минут?",
  "Подбодри меня",
];
