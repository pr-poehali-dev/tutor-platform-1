/**
 * Превью для соцсетей (VK, Telegram, WhatsApp и т.д.) на красивом адресе домена.
 * Адрес вида:  https://учисьпро.рф/share/dobro
 *
 * Боты соцсетей не исполняют JavaScript и не видят мета-теги SPA, поэтому
 * этой Edge-функции отдаём ботам готовый HTML с Open Graph тегами,
 * а живых пользователей перенаправляем на саму страницу акции.
 *
 * Маршрут /share/:page настроен через rewrite в vercel.json.
 */

const SITE = "https://xn--h1agdcde2c.xn--p1ai";

interface Card {
  url: string;
  title: string;
  description: string;
  image: string;
}

const PAGES: Record<string, Card> = {
  dobro: {
    url: `${SITE}/promo/dobro`,
    title: "Акция ДОБРО — учись бесплатно до 15 июня 2026 · УЧИСЬПРО",
    description:
      "С 28 мая по 15 июня 2026 платежи на паузе. Полный доступ ко всем курсам, ИИ-репетитору и подготовке к ЕГЭ — бесплатно для каждого школьника.",
    image:
      "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/46b6c1c6-3ba8-49a9-a61c-ecadaca3d8a1.jpg",
  },
};

const DEFAULT: Card = {
  url: SITE,
  title: "УЧИСЬПРО — ИИ-репетитор для школьников 24/7",
  description:
    "Персональный ИИ-репетитор: голосовые уроки, подготовка к ЕГЭ и ОГЭ. Первый урок бесплатно.",
  image:
    "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/17bc9252-13b8-4e83-af00-e904346aa5a9.jpg",
};

const BOT_MARKERS = [
  "vkshare", "vkbot", "vk.com", "mail.ru", "telegrambot", "telegram",
  "whatsapp", "viber", "facebookexternalhit", "facebot", "twitterbot",
  "discordbot", "skypeuripreview", "slackbot", "linkedinbot", "pinterest",
  "googlebot", "yandex", "bingbot", "developers.google.com",
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(p: Card): string {
  const t = esc(p.title);
  const d = esc(p.description);
  const img = esc(p.image);
  const url = esc(p.url);
  return (
    `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/>` +
    `<meta name="viewport" content="width=device-width, initial-scale=1"/>` +
    `<title>${t}</title>` +
    `<meta name="description" content="${d}"/>` +
    `<meta property="og:type" content="website"/>` +
    `<meta property="og:site_name" content="УЧИСЬПРО"/>` +
    `<meta property="og:locale" content="ru_RU"/>` +
    `<meta property="og:title" content="${t}"/>` +
    `<meta property="og:description" content="${d}"/>` +
    `<meta property="og:url" content="${url}"/>` +
    `<meta property="og:image" content="${img}"/>` +
    `<meta property="og:image:secure_url" content="${img}"/>` +
    `<meta property="og:image:type" content="image/jpeg"/>` +
    `<meta property="og:image:width" content="1024"/>` +
    `<meta property="og:image:height" content="1024"/>` +
    `<meta property="og:image:alt" content="${t}"/>` +
    `<meta property="vk:image" content="${img}"/>` +
    `<meta name="twitter:card" content="summary_large_image"/>` +
    `<meta name="twitter:title" content="${t}"/>` +
    `<meta name="twitter:description" content="${d}"/>` +
    `<meta name="twitter:image" content="${img}"/>` +
    `<link rel="canonical" href="${url}"/>` +
    `<meta http-equiv="refresh" content="0; url=${url}"/>` +
    `</head><body><a href="${url}">${t}</a>` +
    `<script>location.replace(${JSON.stringify(p.url)});</script>` +
    `</body></html>`
  );
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  // Берём ключ страницы из ?page= или из последнего сегмента пути /share/dobro
  const fromQuery = url.searchParams.get("page");
  const fromPath = url.pathname.replace(/\/+$/, "").split("/").pop() || "";
  const key = (fromQuery || fromPath || "dobro").toLowerCase();
  const page = PAGES[key] || DEFAULT;

  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const isBot = BOT_MARKERS.some((m) => ua.includes(m));

  if (!isBot) {
    return new Response(null, {
      status: 302,
      headers: { Location: page.url, "Cache-Control": "no-cache" },
    });
  }

  return new Response(renderHtml(page), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const config = {
  runtime: "edge",
};
