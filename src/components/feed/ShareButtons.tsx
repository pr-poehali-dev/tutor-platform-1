import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SHARE_TARGETS, ShareTarget, openShare, buildShareText, buildShareMessage } from "./shareTargets";

interface Props {
  url: string;
  title: string;
  summary?: string;
}

export default function ShareButtons({ url, title, summary = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const open = (target: ShareTarget) => openShare(target, url, title, summary);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareMessage(url, title, summary));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* empty */
    }
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: buildShareText(title, summary), url });
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
        {SHARE_TARGETS.map((t) => (
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
          title="Скопировать текст со ссылкой"
          aria-label="Скопировать текст со ссылкой"
          className={`flex items-center gap-2 border text-xs font-bold px-3 h-9 rounded-xl transition-all ${
            copied
              ? "bg-green-500/15 border-green-500/40 text-green-300"
              : "bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/15 hover:border-white/30 hover:text-white"
          }`}
        >
          <Icon name={copied ? "Check" : "Copy"} size={15} />
          <span className="hidden sm:inline">{copied ? "Скопировано" : "Копировать текст"}</span>
        </button>
      </div>
    </div>
  );
}