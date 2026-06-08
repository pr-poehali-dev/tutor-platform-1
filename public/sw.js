/* УЧИСЬПРО Service Worker — офлайн-поддержка PWA.
   Стратегия:
   - навигации (HTML): network-first, при офлайне — кэш/офлайн-страница;
   - статика (js/css/шрифты/картинки): stale-while-revalidate;
   - запросы к API (functions.poehali.dev) и аналитике — НЕ кэшируем (всегда сеть).
*/
const VERSION = 'uchispro-v1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/', '/manifest.webmanifest', '/favicon.svg']).catch(() => undefined),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

function isApiOrAnalytics(url) {
  return (
    url.hostname.includes('functions.poehali.dev') ||
    url.hostname.includes('mc.yandex.ru') ||
    url.hostname.includes('mc.webvisor') ||
    url.pathname.startsWith('/api')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // API и аналитику не трогаем — всегда живая сеть.
  if (isApiOrAnalytics(url)) return;

  // Навигация (открытие страниц SPA): network-first.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL)) || Response.error();
        }),
    );
    return;
  }

  // Прочие GET (статика, шрифты, картинки): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
