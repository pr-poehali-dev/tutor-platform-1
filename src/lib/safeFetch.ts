// Надёжная обёртка над fetch: таймаут + единообразная обработка ошибок.
// Запрос не зависает навсегда, ответ не парсится при ошибочном статусе.

const DEFAULT_TIMEOUT_MS = 15000;

export interface SafeFetchResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  /** Человекочитаемая причина ошибки (для UI), пустая при успехе. */
  error: string;
}

/**
 * Делает запрос с таймаутом и возвращает разобранный результат.
 * Никогда не бросает исключение — всегда возвращает объект результата.
 */
export async function safeFetch<T = unknown>(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<SafeFetchResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg =
        (data && typeof data === "object" && "error" in (data as object)
          ? String((data as Record<string, unknown>).error)
          : "") || `Ошибка сервера (${res.status})`;
      return { ok: false, status: res.status, data, error: msg };
    }

    return { ok: true, status: res.status, data, error: "" };
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    return {
      ok: false,
      status: 0,
      data: null,
      error: aborted ? "Превышено время ожидания ответа" : "Нет связи с сервером",
    };
  } finally {
    clearTimeout(timer);
  }
}

export default safeFetch;
