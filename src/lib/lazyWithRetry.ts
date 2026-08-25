import { lazy, ComponentType } from "react";

// Ключи общие с ErrorBoundary: оба механизма ловят одну и ту же ошибку чанка,
// и счётчик попыток у них должен быть ОДИН. Иначе каждый считает свои попытки,
// и страница успевает перезагрузиться несколько раз подряд.
export const RELOAD_KEY = "uchispro_chunk_reload_count";
export const RELOAD_TS_KEY = "uchispro_chunk_reload_at";
/** Окно, внутри которого попытки считаются одной серией. */
export const RELOAD_WINDOW_MS = 30000;
/** Сколько перезагрузок подряд допустимо, прежде чем показать человеку экран ошибки. */
export const RELOAD_MAX = 2;

/**
 * Общая для обоих механизмов попытка «обновиться ради свежих файлов».
 * Возвращает true, если перезагрузка запущена, и false — если лимит исчерпан
 * и нужно показать пользователю понятный экран вместо бесконечного мигания.
 */
export function tryReloadForChunk(): boolean {
  try {
    const now = Date.now();
    const lastAt = Number(sessionStorage.getItem(RELOAD_TS_KEY) || "0");
    let count = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (now - lastAt > RELOAD_WINDOW_MS) count = 0;
    if (count >= RELOAD_MAX) return false;
    sessionStorage.setItem(RELOAD_KEY, String(count + 1));
    sessionStorage.setItem(RELOAD_TS_KEY, String(now));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

/**
 * Аккуратно перезагружает страницу, чтобы подтянуть свежие чанки после деплоя.
 * Защита от циклов: не больше 2 перезагрузок подряд в течение 30 секунд.
 */
function reloadForFreshChunks(): void {
  tryReloadForChunk();
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
      // Повторяем несколько раз с нарастающей паузой. Это лечит главный случай:
      // сервер отдаёт файл, но в момент первого запроса он был занят пересборкой
      // зависимостей. Простой повтор через 500 мс часто попадал в то же окно.
      const DELAYS = [400, 1200, 2500];
      let lastErr: unknown = firstErr;

      for (const wait of DELAYS) {
        await new Promise((r) => setTimeout(r, wait));
        try {
          if (chunkUrl) {
            const bust = `${chunkUrl}${chunkUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
            return (await import(/* @vite-ignore */ bust)) as { default: T };
          }
          return await factory();
        } catch (retryErr) {
          lastErr = retryErr;
        }
      }

      // Все попытки исчерпаны. Перезагружаем только при ошибке ЗАГРУЗКИ файла —
      // ошибку внутри самого компонента перезагрузка не вылечит.
      if (isChunkLoadError(firstErr) || isChunkLoadError(lastErr)) {
        reloadForFreshChunks();
      }
      throw lastErr;
    }
  });
}

export default lazyWithRetry;