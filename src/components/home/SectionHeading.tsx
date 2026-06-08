import { ReactNode } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  /** Иконка-бейдж (lucide). */
  badgeIcon?: string;
  /** Текст бейджа над заголовком. */
  badge?: string;
  /** Цвет акцента бейджа: tailwind-цвет без префикса, напр. "purple", "emerald". */
  accent?: string;
  /** Заголовок секции (может содержать <span> для градиента). */
  title: ReactNode;
  /** Подзаголовок-описание. */
  subtitle?: ReactNode;
  /** Выравнивание: по центру (по умолчанию) или слева. */
  align?: "center" | "left";
  className?: string;
}

const ACCENTS: Record<string, { badge: string; icon: string }> = {
  purple: { badge: "bg-purple-500/15 border-purple-500/30 text-purple-200", icon: "text-purple-300" },
  emerald: { badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200", icon: "text-emerald-300" },
  amber: { badge: "bg-amber-500/15 border-amber-500/30 text-amber-200", icon: "text-amber-300" },
  cyan: { badge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200", icon: "text-cyan-300" },
  rose: { badge: "bg-rose-500/15 border-rose-500/30 text-rose-200", icon: "text-rose-300" },
};

export default function SectionHeading({
  badgeIcon,
  badge,
  accent = "purple",
  title,
  subtitle,
  align = "center",
  className = "",
}: Props) {
  const a = ACCENTS[accent] || ACCENTS.purple;
  const isCenter = align === "center";

  return (
    <div className={`${isCenter ? "text-center mx-auto" : "text-left"} max-w-3xl ${isCenter ? "" : "max-w-3xl"} mb-8 md:mb-10 ${className}`}>
      {badge && (
        <div
          className={`inline-flex items-center gap-2 border rounded-full px-3.5 py-1 mb-3 ${a.badge}`}
        >
          {badgeIcon && <Icon name={badgeIcon} size={13} className={a.icon} />}
          <span className="text-[11px] font-bold uppercase tracking-wider">{badge}</span>
        </div>
      )}
      <h2 className="font-montserrat font-black text-white text-3xl md:text-4xl leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-white/65 text-sm md:text-base mt-3 ${isCenter ? "mx-auto" : ""} max-w-2xl`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
