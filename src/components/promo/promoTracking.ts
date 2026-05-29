import func2url from "../../../backend/func2url.json";

const REF_URL = (func2url as Record<string, string>)["referrals"];

type Channel = "vk" | "tg" | "wa" | "copy" | "direct";

function getRef(): string | undefined {
  try {
    const usp = new URLSearchParams(window.location.search);
    return usp.get("ref") || usp.get("utm_source") || undefined;
  } catch {
    return undefined;
  }
}

// Клик по кнопке «Поделиться»
export function trackShare(channel: Channel, promo = "dobro") {
  if (!REF_URL) return;
  const payload = JSON.stringify({ promo, event: "share", channel, ref: getRef() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${REF_URL}?action=promo_track`, payload);
      return;
    }
  } catch {
    /* ignore */
  }
  fetch(`${REF_URL}?action=promo_track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

// Переход на страницу акции по ссылке (визит). Считаем 1 раз на сессию.
export function trackVisit(promo = "dobro") {
  if (!REF_URL) return;
  const key = `promo_visit_${promo}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
  const usp = new URLSearchParams(window.location.search);
  const ref = getRef();
  const channel = usp.get("from") || (ref ? "vk" : "direct");
  fetch(`${REF_URL}?action=promo_track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ promo, event: "visit", channel, ref }),
  }).catch(() => undefined);
}
