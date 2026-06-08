import Icon from "@/components/ui/icon";

const STATS = [
  { value: "12 000+", label: "учеников готовятся", icon: "Users", color: "#a78bfa" },
  { value: "82", label: "средний балл ЕГЭ", icon: "TrendingUp", color: "#34d399" },
  { value: "24/7", label: "доступ к ИИ-репетитору", icon: "Bot", color: "#60a5fa" },
  { value: "4.9★", label: "оценка платформы", icon: "Star", color: "#fbbf24" },
];

export default function SocialProofStrip() {
  return (
    <section className="max-w-6xl mx-auto px-4 -mt-2" aria-label="Цифры и результаты платформы">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/40 px-4 py-3 backdrop-blur-sm hover:border-white/20 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}35` }}
            >
              <Icon name={s.icon} size={16} style={{ color: s.color }} />
            </div>
            <div className="min-w-0">
              <p className="font-montserrat font-black text-lg md:text-xl text-white leading-tight">
                {s.value}
              </p>
              <p className="text-[11px] md:text-xs text-white/70 leading-tight truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}