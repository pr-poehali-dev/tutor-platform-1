/** Регистрация service worker для PWA (офлайн + установка).
 *  Регистрируем только в production и только по https — чтобы не мешать
 *  dev-режиму Vite (HMR) и локальной разработке. */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const host = window.location.hostname;
  const isLocalhost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local");

  // В dev (localhost) не регистрируем, чтобы не кэшировать модули и не ломать HMR.
  // Service Worker работает только по https — иначе выходим.
  if (isLocalhost) return;
  if (window.location.protocol !== "https:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Тихо игнорируем — отсутствие SW не должно ломать сайт.
    });
  });
}