import Icon from "@/components/ui/icon";

interface Props {
  label: string;
  emoji: string;
  value: number; // 0..100
  description?: string;
  highlighted?: boolean;
  tone?: "cyan" | "purple" | "emerald" | "amber";
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  cyan:    "from-cyan-500 to-blue-500",
  purple:  "from-purple-500 to-pink-500",
  emerald: "from-emerald-500 to-teal-500",
  amber:   "from-amber-500 to-orange-500",
};

export default function ScaleBar({ label, emoji, value, description, highlighted, tone = "cyan" }: Props) {
  return (
    <div className={`bg-white/[0.03] border rounded-2xl p-3 md:p-4 ${highlighted ? "border-amber-500/35 bg-amber-500/[0.05]" : "border-white/10"}`}>
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <p className="font-montserrat font-bold text-white text-sm">{label}</p>
          {highlighted && (
            <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
              <Icon name="Crown" size={9} />
              Топ
            </span>
          )}
        </div>
        <span className="font-montserrat font-black text-white text-base tabular-nums">{value}%</span>
      </div>
      <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r ${TONE[tone]} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      {description && <p className="text-white/55 text-[11px] leading-snug">{description}</p>}
    </div>
  );
}
