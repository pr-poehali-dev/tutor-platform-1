// Единый перехват сбоя загрузки ленивых чанков (lazy import).
// После нового деплоя старая вкладка запрашивает уже несуществующие
// имена чанков и падает с "Failed to fetch dynamically imported module".
// В этом случае один раз молча перезагружаем страницу, чтобы подтянуть свежую версию.

const RELOAD_KEY = "uchispro_chunk_reload_at";

function isChunkError(message: string): boolean {
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk .* failed/i.test(
    message
  );
}

/** Пытается один раз перезагрузить страницу (не чаще раза в 10 секунд). */
function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
    if (Date.now() - last > 10000) {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
      return true;
    }
  } catch {
    /* noop */
  }
  return false;
}

/** Ставит глобальные слушатели на ошибки загрузки чанков. Вызывать один раз при старте. */
export function setupChunkReload(): void {
  if (typeof window === "undefined") return;

  // Ошибка приходит как отклонённый промис из динамического import().
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e?.reason;
    const msg =
      (reason && (reason.message || reason.toString?.())) || String(reason || "");
    if (isChunkError(msg)) {
      e.preventDefault();
      reloadOnce();
    }
  });

  // Резервный перехват через onerror (некоторые браузеры кидают сюда).
  window.addEventListener("error", (e) => {
    const msg = e?.message || (e?.error && e.error.message) || "";
    if (isChunkError(msg)) {
      reloadOnce();
    }
  });
}
