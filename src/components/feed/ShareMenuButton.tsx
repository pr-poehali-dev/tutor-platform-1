import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { SHARE_TARGETS, openShare, buildShareText, buildShareMessage } from "./shareTargets";

interface Props {
  url: string;
  title: string;
  summary?: string;
  className?: string;
}

export default function ShareMenuButton({ url, title, summary = "", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Останавливаем переход по родительской ссылке-карточке
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggle = (e: React.MouseEvent) => {
    stop(e);
    if (navigator.share && !open) {
      navigator.share({ title, text: buildShareText(title, summary), url }).catch(() => setOpen(true));
      return;
    }
    setOpen((v) => !v);
  };

  const copy = async (e: React.MouseEvent) => {
    stop(e);
    try {
      await navigator.clipboard.writeText(buildShareMessage(url, title, summary));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* empty */ }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={toggle}
        title="Поделиться"
        aria-label="Поделиться статьёй"
        className="w-9 h-9 rounded-full bg-black/45 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
      >
        <Icon name="Share2" size={15} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-30 w-52 bg-[#161425] border border-white/15 rounded-2xl p-2 shadow-2xl animate-fade-in"
          onClick={stop}
        >
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider px-2 py-1">Поделиться</p>
          {SHARE_TARGETS.map((t) => (
            <button
              key={t.name}
              onClick={(e) => { stop(e); openShare(t, url, title, summary); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-white/80 text-sm hover:bg-white/10 transition-colors text-left"
            >
              <Icon name={t.icon} size={15} className="flex-shrink-0" />
              {t.name}
            </button>
          ))}
          <button
            onClick={copy}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm transition-colors text-left ${
              copied ? "text-green-300" : "text-white/80 hover:bg-white/10"
            }`}
          >
            <Icon name={copied ? "Check" : "Copy"} size={15} className="flex-shrink-0" />
            {copied ? "Скопировано" : "Скопировать текст"}
          </button>
        </div>
      )}
    </div>
  );
}