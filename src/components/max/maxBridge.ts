/** MAX Bridge (dev.max.ru/docs/webapps/bridge): библиотека st.max.ru/js/max-web-app.js даёт window.WebApp. */

interface MaxBackButton {
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
}

export interface MaxWebApp {
  initData: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string; last_name?: string }; start_param?: string };
  platform?: string;
  version?: string;
  BackButton?: MaxBackButton;
  HapticFeedback?: { impactOccurred: (style: string, disableVibrationFallback?: boolean) => void };
  openLink?: (url: string) => void;
}

declare global {
  interface Window {
    WebApp?: MaxWebApp;
  }
}

const BRIDGE_SRC = "https://st.max.ru/js/max-web-app.js";

/** Данные запуска есть в URL-фрагменте (#WebAppData=...) — так понимаем, что страницу открыли из MAX. */
export function launchedFromMax(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hash.includes("WebAppData=") || !!window.WebApp?.initData;
}

function initDataFromHash(): string {
  const p = new URLSearchParams(window.location.hash.slice(1));
  return p.get("WebAppData") || "";
}

let loading: Promise<MaxWebApp | null> | null = null;

export function loadMaxBridge(): Promise<MaxWebApp | null> {
  if (window.WebApp?.initData) return Promise.resolve(window.WebApp);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const done = () => resolve(window.WebApp || null);
    const s = document.createElement("script");
    s.src = BRIDGE_SRC;
    s.async = true;
    s.onload = done;
    s.onerror = done;
    document.head.appendChild(s);
    setTimeout(done, 4000);
  });
  return loading;
}

/** Строка для проверки подписи на сервере: из MAX Bridge, а если он не загрузился — из URL-фрагмента. */
export async function getMaxInitData(): Promise<{ initData: string; platform: string }> {
  const app = await loadMaxBridge();
  return { initData: app?.initData || initDataFromHash(), platform: app?.platform || new URLSearchParams(window.location.hash.slice(1)).get("WebAppPlatform") || "" };
}

export function haptic(style: "light" | "medium" = "light") {
  try {
    window.WebApp?.HapticFeedback?.impactOccurred(style, true);
  } catch {
    /* вибрация не поддерживается — не страшно */
  }
}

export function openExternal(url: string) {
  if (window.WebApp?.openLink) window.WebApp.openLink(url);
  else window.open(url, "_blank", "noopener");
}
