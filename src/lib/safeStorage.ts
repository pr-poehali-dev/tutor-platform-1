// Безопасная обёртка над localStorage.
// Не падает в приватном режиме Safari, при выключенном хранилище и переполнении.
// Используем везде вместо прямого localStorage.

export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },

  /** Прочитать и распарсить JSON. При любой ошибке вернёт fallback. */
  getJSON<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  /** Сериализовать и сохранить JSON. Возвращает успех. */
  setJSON(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

export default safeStorage;
