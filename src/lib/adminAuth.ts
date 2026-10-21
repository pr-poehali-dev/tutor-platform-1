import func2url from "../../backend/func2url.json";

const URL = (func2url as Record<string, string>)["edu-institutions"];
export const ADMIN_PIN_KEY = "uchispro_admin_pin_v1";

/** Проверяет PIN на сервере. В коде сайта PIN не хранится. */
export async function verifyAdminPin(pin: string): Promise<"ok" | "wrong" | "network"> {
  if (!pin.trim()) return "wrong";
  try {
    const res = await fetch(`${URL}?action=admin_login`, { headers: { "X-Admin-Pin": pin.trim() } });
    return res.ok ? "ok" : "wrong";
  } catch {
    return "network";
  }
}

export function savedAdminPin(): string {
  return sessionStorage.getItem(ADMIN_PIN_KEY) || localStorage.getItem(ADMIN_PIN_KEY) || "";
}

export function forgetAdminPin() {
  sessionStorage.removeItem(ADMIN_PIN_KEY);
  localStorage.removeItem(ADMIN_PIN_KEY);
}
