import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const STATS = [
  { value: "12 000+", label: "учеников готовятся", icon: "Users", color: "#a78bfa" },
  { value: "82", label: "средний балл ЕГЭ", icon: "TrendingUp", color: "#34d399" },
  { value: "24/7", label: "доступ к ИИ-репетитору", icon: "Bot", color: "#60a5fa" },
  { value: "4.9★", label: "оценка платформы", icon: "Star", color: "#fbbf24" },
];

const TOOLS = [
  {
    label: "Сборник ОГЭ и ЕГЭ",
    description: "22+ задания с разбором",
    icon: "Library",
    to: "/exam-bank",
    accent: "from-purple-500/25 to-pink-500/15",
    border: "border-purple-500/30",
  },
  {
    label: "Калькулятор баллов",
    description: "Первичные → тестовые",
    icon: "Calculator",
    to: "/score-calculator",
    accent: "from-cyan-500/25 to-blue-500/15",
    border: "border-cyan-500/30",
  },
  {
    label: "Подбор тарифа",
    description: "От 590 ₽ в месяц",
    icon: "Sparkles",
    to: "/pricing",
    accent: "from-amber-500/25 to-rose-500/15",
    border: "border-amber-500/30",
  },
];

export default function SocialProofStrip() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8" aria-label="Социальные доказательства и бесплатные инструменты">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur-sm hover:border-white/20 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}35` }}
            >
              <Icon name={s.icon} size={16} style={{ color: s.color }} />
            </div>
            <p className="font-montserrat font-black text-xl md:text-2xl text-white leading-tight">
              {s.value}
            </p>
            <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`group rounded-2xl border ${t.border} bg-gradient-to-br ${t.accent} p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform`}
          >
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
              <Icon name={t.icon} size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-montserrat font-bold text-sm text-white">{t.label}</p>
              <p className="text-xs text-white/70 mt-0.5">{t.description}</p>
            </div>
            <Icon
              name="ArrowRight"
              size={16}
              className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
