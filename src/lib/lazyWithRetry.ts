import { lazy, ComponentType } from "react";

const RELOAD_KEY = "uchispro_chunk_reload_count";
const RELOAD_TS_KEY = "uchispro_chunk_reload_at";

/**
 * Аккуратно перезагружает страницу, чтобы подтянуть свежие чанки после деплоя.
 * Защита от циклов: не больше 2 перезагрузок подряд в течение 30 секунд.
 */
function reloadForFreshChunks(): void {
  try {
    const now = Date.now();
    const lastAt = Number(sessionStorage.getItem(RELOAD_TS_KEY) || "0");
    let count = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    // Если с прошлой перезагрузки прошло много времени — считаем ситуацию новой.
    if (now - lastAt > 30000) count = 0;
    if (count >= 2) return; // уже пробовали — не зацикливаемся
    sessionStorage.setItem(RELOAD_KEY, String(count + 1));
    sessionStorage.setItem(RELOAD_TS_KEY, String(now));
    window.location.reload();
  } catch {
    /* noop */
  }
}

/** Признак ошибки загрузки JS-модуля/чанка (а не ошибки внутри компонента). */
function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /dynamically imported module|Failed to fetch|Importing a module script failed|ChunkLoadError|error loading dynamically/i.test(
    msg
  );
}

/**
 * Обёртка над React.lazy с устойчивой повторной загрузкой чанка.
 *
 * Почему так: после нового деплоя старые URL чанков могут исчезнуть, а браузер
 * держит их в кеше — тогда динамический import падает с «Failed to fetch
 * dynamically imported module». Мы:
 *  1) делаем вторую попытку с обходом HTTP-кеша (добавляем ?v=timestamp),
 *  2) если и она не удалась и это именно ошибка загрузки чанка — один раз
 *     перезагружаем страницу, чтобы подтянуть свежие файлы.
 * Ошибки ВНУТРИ компонента (не загрузки) пробрасываются как есть — их ловит
 * ErrorBoundary, перезагрузка их не чинит.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  chunkUrl?: string
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (firstErr) {
      // Небольшая пауза и вторая попытка — покрывает случайные сетевые сбои.
      await new Promise((r) => setTimeout(r, 500));
      try {
        // Пробуем обойти кеш браузера: подгружаем модуль по URL с новым query.
        if (chunkUrl) {
          const bust = `${chunkUrl}${chunkUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
          return (await import(/* @vite-ignore */ bust)) as { default: T };
        }
        return await factory();
      } catch (secondErr) {
        // Перезагружаем только если проблема именно в загрузке чанка.
        if (isChunkLoadError(firstErr) || isChunkLoadError(secondErr)) {
          reloadForFreshChunks();
        }
        throw secondErr;
      }
    }
  });
}

export default lazyWithRetry;
