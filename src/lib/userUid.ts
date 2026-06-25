import func2url from "../../backend/func2url.json";

const KEY = "user_uid";

/**
 * Возвращает (создаёт при необходимости) анонимный UID пользователя.
 * Хранится в localStorage. При появлении настоящей авторизации легко смигрировать.
 */
export function getUserUid(): string {
  try {
    let uid = localStorage.getItem(KEY);
    if (!uid) {
      uid = "u_" + crypto.randomUUID();
      localStorage.setItem(KEY, uid);
    }
    return uid;
  } catch {
    return "u_anonymous";
  }
}

export const USER_DATA_URL = (func2url as Record<string, string>)["user-data"];