import { getUserUid } from "@/lib/userUid";

const KIDS_URL = "https://functions.poehali.dev/ea709a00-437f-4596-a5ed-4c35ca44439a";

async function call<T>(action: string, body?: Record<string, unknown>, method: "GET" | "POST" = "POST"): Promise<T> {
  const uid = getUserUid();
  const res = await fetch(`${KIDS_URL}?action=${action}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-User-Uid": uid,
    },
    body: method === "POST" ? JSON.stringify(body || {}) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`kids ${action}: ${res.status} ${text.slice(0, 100)}`);
  }
  return res.json() as Promise<T>;
}

// ─── Прогресс ───
export interface RemoteProgress {
  stars: number;
  completedActivities: number[];
  streakDays: number;
  lastActivityDate: string | null;
  totalAnswers: number;
  correctAnswers: number;
}

export const kidsApi = {
  getProgress: () => call<RemoteProgress>("get_progress", undefined, "GET"),
  saveProgress: (p: RemoteProgress) => call<{ saved: boolean }>("save_progress", p as unknown as Record<string, unknown>),

  // ─── Родительский контроль ───
  getControls: () => call<ParentControls>("get_controls", undefined, "GET"),
  setControls: (data: Partial<ParentControls> & { pin?: string }) =>
    call<{ saved: boolean }>("set_controls", data as Record<string, unknown>),
  verifyPin: (pin: string) => call<{ ok: boolean; first?: boolean }>("verify_pin", { pin }),

  // ─── Экранное время ───
  getScreenTime: () => call<ScreenTimeState>("get_screen_time", undefined, "GET"),
  addScreenTime: (minutes: number) => call<ScreenTimeState>("add_screen_time", { minutes }),
};

export interface ParentControls {
  hasPin: boolean;
  consent436fz: boolean;
  consentDate: string | null;
  childAgeBand: "1-2" | "2-3" | "3-4" | "4-5" | "5-6" | "6-7";
  dailyLimitMinutes: number;
  sanpinLimit: number;
  bedtimeLockEnabled: boolean;
  bedtimeFrom: string;
  bedtimeTo: string;
  blockPurchases: boolean;
}

export interface ScreenTimeState {
  minutesUsed: number;
  dailyLimit: number;
  remaining: number;
  limitReached: boolean;
  bedtimeActive: boolean;
  blocked: boolean;
  reason: "bedtime" | "limit" | null;
}
