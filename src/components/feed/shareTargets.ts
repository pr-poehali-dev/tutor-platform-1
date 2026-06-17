export interface ShareTarget {
  name: string;
  icon: string;
  color: string;
  build: (url: string, title: string, summary: string) => string;
}

/**
 * Собирает «текст для шеринга»: заголовок + краткий анонс.
 * Передаётся в соцсети, где есть поле текста, и в копирование/нативный шеринг.
 */
export function buildShareText(title: string, summary = ""): string {
  const clean = (summary || "").trim();
  const short = clean.length > 220 ? clean.slice(0, 217).trimEnd() + "…" : clean;
  return short ? `${title}\n\n${short}` : title;
}

/** Полное сообщение с текстом и ссылкой (для WhatsApp, копирования, нативного шеринга). */
export function buildShareMessage(url: string, title: string, summary = ""): string {
  return `${buildShareText(title, summary)}\n\n${url}`;
}

export const SHARE_TARGETS: ShareTarget[] = [
  {
    name: "Telegram",
    icon: "Send",
    color: "hover:bg-[#229ED9]/20 hover:border-[#229ED9]/40 hover:text-[#5dc1ee]",
    build: (u, t, s) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(buildShareText(t, s))}`,
  },
  {
    name: "ВКонтакте",
    icon: "Share2",
    color: "hover:bg-[#0077FF]/20 hover:border-[#0077FF]/40 hover:text-[#6aa8ff]",
    build: (u) => `https://vk.com/share.php?url=${encodeURIComponent(u)}`,
  },
  {
    name: "WhatsApp",
    icon: "MessageCircle",
    color: "hover:bg-[#25D366]/20 hover:border-[#25D366]/40 hover:text-[#5ee88f]",
    build: (u, t, s) => `https://api.whatsapp.com/send?text=${encodeURIComponent(buildShareMessage(u, t, s))}`,
  },
  {
    name: "Одноклассники",
    icon: "Users",
    color: "hover:bg-[#EE8208]/20 hover:border-[#EE8208]/40 hover:text-[#ffae5c]",
    build: (u, t, s) =>
      `https://connect.ok.ru/offer?url=${encodeURIComponent(u)}&title=${encodeURIComponent(buildShareText(t, s))}`,
  },
  {
    name: "TenChat",
    icon: "Briefcase",
    color: "hover:bg-[#2B5CE6]/20 hover:border-[#2B5CE6]/40 hover:text-[#7d9bff]",
    build: (u) => `https://tenchat.ru/?share=${encodeURIComponent(u)}`,
  },
  {
    name: "Twitter / X",
    icon: "Twitter",
    color: "hover:bg-white/15 hover:border-white/30 hover:text-white",
    build: (u, t, s) => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(buildShareText(t, s))}`,
  },
];

export function openShare(target: ShareTarget, url: string, title: string, summary = "") {
  const link = target.build(url, title, summary);
  window.open(link, "_blank", "noopener,noreferrer,width=640,height=560");
}

// Кириллический домен — в соцсетях выглядит понятно и вызывает доверие.
export const SITE_URL = "https://учисьпро.рф";

export function articleUrl(slug: string): string {
  return `${SITE_URL}/feed/${slug}`;
}