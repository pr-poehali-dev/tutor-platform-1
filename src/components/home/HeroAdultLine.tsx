import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/** Быстрые входы для взрослых — по цели, а не по предмету. */
const LINKS = [
  { to: "/courses/ai", icon: "Sparkles", label: "Нейросети для работы" },
  { to: "/remote-professions", icon: "Laptop", label: "Удалённые профессии" },
  { to: "/courses/business", icon: "Briefcase", label: "Бизнес и MBA" },
];

/**
 * Линия «взрослым» на первом экране: посетитель старше школьного возраста
 * должен понять, что платформа и для него, ещё до прокрутки.
 */
export default function HeroAdultLine() {
  return (
    <div className="mb-4 animate-fade-in-up animate-delay-200">
      <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.07] px-3.5 py-2.5 backdrop-blur-sm">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-cyan-200">
          <Icon name="Briefcase" size={14} className="text-cyan-300" />
          Взрослым
        </span>

        <span className="hidden sm:inline text-white/25" aria-hidden="true">
          ·
        </span>

        {LINKS.map((l) => (
          <Link
            key={l.to + l.label}
            to={l.to}
            onClick={() => trackGoal("hero_adult_link")}
            className="group inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] hover:border-cyan-400/40 px-2.5 py-1.5 text-[12.5px] font-semibold text-white/85 hover:text-white transition-all"
          >
            <Icon name={l.icon} size={13} className="text-cyan-300/90" />
            {l.label}
          </Link>
        ))}

        <Link
          to="/courses?grade=adult"
          onClick={() => trackGoal("hero_adult_all")}
          className="group inline-flex items-center gap-1 text-[12.5px] font-semibold text-cyan-200 hover:text-white transition-colors"
        >
          все 35 курсов
          <Icon
            name="ArrowRight"
            size={13}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}