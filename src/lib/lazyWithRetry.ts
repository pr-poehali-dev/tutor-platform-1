import { lazy, ComponentType } from "react";

const RELOAD_KEY = "uchispro_chunk_reload_at";

function reloadOnce(): void {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (Date.now() - last > 10000) {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
    }
  } catch {
    /* noop */
  }
}

/**
 * Обёртка над React.lazy с повторной попыткой загрузки чанка.
 * Первый сбой (например, из-за сети или устаревшего чанка после деплоя)
 * не роняет страницу: делаем ещё одну попытку, а при повторной неудаче —
 * один раз перезагружаем страницу, чтобы подтянуть свежие файлы.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch {
      // Небольшая пауза и вторая попытка — покрывает случайные сетевые сбои.
      await new Promise((r) => setTimeout(r, 600));
      try {
        return await factory();
      } catch (err) {
        reloadOnce();
        throw err;
      }
    }
  });
}

export default lazyWithRetry;
