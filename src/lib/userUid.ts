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

export const USER_DATA_URL = "https://functions.poehali.dev/fdcd883a-900e-4cff-b647-569675544e74";
