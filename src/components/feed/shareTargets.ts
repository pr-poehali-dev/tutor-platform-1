export interface ShareTarget {
  name: string;
  icon: string;
  color: string;
  build: (url: string, title: string, summary: string) => string;
}

export const SHARE_TARGETS: ShareTarget[] = [
  {
    name: "Telegram",
    icon: "Send",
    color: "hover:bg-[#229ED9]/20 hover:border-[#229ED9]/40 hover:text-[#5dc1ee]",
    build: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    name: "ВКонтакте",
    icon: "Share2",
    color: "hover:bg-[#0077FF]/20 hover:border-[#0077FF]/40 hover:text-[#6aa8ff]",
    build: (u, t) => `https://vk.com/share.php?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    name: "WhatsApp",
    icon: "MessageCircle",
    color: "hover:bg-[#25D366]/20 hover:border-[#25D366]/40 hover:text-[#5ee88f]",
    build: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + " " + u)}`,
  },
  {
    name: "Одноклассники",
    icon: "Users",
    color: "hover:bg-[#EE8208]/20 hover:border-[#EE8208]/40 hover:text-[#ffae5c]",
    build: (u, t) => `https://connect.ok.ru/offer?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    name: "TenChat",
    icon: "Briefcase",
    color: "hover:bg-[#2B5CE6]/20 hover:border-[#2B5CE6]/40 hover:text-[#7d9bff]",
    build: (u, t) => `https://tenchat.ru/share?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    name: "Twitter / X",
    icon: "Twitter",
    color: "hover:bg-white/15 hover:border-white/30 hover:text-white",
    build: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
];

export function openShare(target: ShareTarget, url: string, title: string, summary = "") {
  const link = target.build(url, title, summary);
  window.open(link, "_blank", "noopener,noreferrer,width=640,height=560");
}

export const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

export function articleUrl(slug: string): string {
  return `${SITE_URL}/feed/${slug}`;
}
