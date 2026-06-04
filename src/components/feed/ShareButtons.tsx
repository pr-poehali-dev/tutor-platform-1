import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  url: string;
  title: string;
  summary?: string;
}

interface ShareTarget {
  name: string;
  icon: string;
  color: string;
  build: (url: string, title: string, summary: string) => string;
}

const TARGETS: ShareTarget[] = [
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
    build: (u, t) =>
      `https://connect.ok.ru/offer?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    name: "TenChat",
    icon: "Briefcase",
    color: "hover:bg-[#2B5CE6]/20 hover:border-[#2B5CE6]/40 hover:text-[#7d9bff]",
    build: (u, t) =>
      `https://tenchat.ru/share?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    name: "Twitter / X",
    icon: "Twitter",
    color: "hover:bg-white/15 hover:border-white/30 hover:text-white",
    build: (u, t) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
];

export default function ShareButtons({ url, title, summary = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const open = (target: ShareTarget) => {
    const link = target.build(url, title, summary);
    window.open(link, "_blank", "noopener,noreferrer,width=640,height=560");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* empty */
    }
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: summary || title, url });
      } else {
        copy();
      }
    } catch {
      /* empty */
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Share2" size={16} className="text-cyan-300" />
        <p className="text-white font-bold text-sm">Поделиться статьёй</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TARGETS.map((t) => (
          <button
            key={t.name}
            onClick={() => open(t)}
            title={`Поделиться в ${t.name}`}
            aria-label={`Поделиться в ${t.name}`}
            className={`flex items-center gap-2 bg-white/[0.04] border border-white/10 text-white/70 text-xs font-bold px-3 h-9 rounded-xl transition-all ${t.color}`}
          >
            <Icon name={t.icon} size={15} />
            <span className="hidden sm:inline">{t.name}</span>
          </button>
        ))}

        {canNativeShare && (
          <button
            onClick={nativeShare}
            title="Другие приложения"
            aria-label="Поделиться через другие приложения"
            className="flex items-center gap-2 bg-white/[0.04] border border-white/10 text-white/70 text-xs font-bold px-3 h-9 rounded-xl transition-all hover:bg-white/15 hover:border-white/30 hover:text-white"
          >
            <Icon name="MoreHorizontal" size={15} />
            <span className="hidden sm:inline">Ещё</span>
          </button>
        )}

        <button
          onClick={copy}
          title="Скопировать ссылку"
          aria-label="Скопировать ссылку"
          className={`flex items-center gap-2 border text-xs font-bold px-3 h-9 rounded-xl transition-all ${
            copied
              ? "bg-green-500/15 border-green-500/40 text-green-300"
              : "bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/15 hover:border-white/30 hover:text-white"
          }`}
        >
          <Icon name={copied ? "Check" : "Link"} size={15} />
          <span className="hidden sm:inline">{copied ? "Скопировано" : "Ссылка"}</span>
        </button>
      </div>
    </div>
  );
}
