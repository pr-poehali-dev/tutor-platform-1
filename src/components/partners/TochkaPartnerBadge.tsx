import Icon from "@/components/ui/icon";
import { TOCHKA_PARTNER_URL } from "@/components/partners/tochkaLinks";

interface Props {
  className?: string;
}

/**
 * Неброский маркер доверия: партнёрство с Точка Банк.
 * Используется на первом экране — сигнал «нам доверяет банк».
 */
export default function TochkaPartnerBadge({ className = "" }: Props) {
  return (
    <a
      href={TOCHKA_PARTNER_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label="Партнёр проекта — Точка Банк"
      title="Партнёр проекта — Точка Банк"
      className={`group inline-flex items-center gap-2.5 bg-[#7c4dff]/12 border border-[#7c4dff]/30 rounded-full pl-1.5 pr-3.5 py-1.5 backdrop-blur-sm hover:bg-[#7c4dff]/20 hover:border-[#7c4dff]/50 transition-all ${className}`}
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c4dff] text-white text-[13px] font-black leading-none" aria-hidden="true">
        т
      </span>
      <span className="flex items-center gap-1.5 text-xs md:text-[13px] font-medium text-white/85">
        <Icon name="ShieldCheck" size={13} className="text-[#b39dff] flex-shrink-0" aria-hidden="true" />
        Партнёр проекта — <span className="font-bold text-white">Точка Банк</span>
      </span>
    </a>
  );
}