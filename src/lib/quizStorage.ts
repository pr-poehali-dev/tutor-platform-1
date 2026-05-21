const STORAGE_KEY = "uchispro_quiz_state_v1";

export interface SavedQuizState {
  answers: Record<string, string[]>;
  stepIndex: number;
  finished: boolean;
  savedAt: number;
}

export function loadQuizState(): SavedQuizState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedQuizState;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.answers || typeof parsed.answers !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveQuizState(state: Omit<SavedQuizState, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: SavedQuizState = { ...state, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage недоступен — молча игнорируем
  }
}

export function clearQuizState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн назад`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} нед назад`;
  return `давно`;
}
