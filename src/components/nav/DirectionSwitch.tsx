import { Link } from "react-router-dom";
import { DIRECTIONS, LEARNER_ORDER, LearnerDirection, saveDirection } from "@/lib/directions";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  active: LearnerDirection | null;
  /** compact — для шапки, wide — для мобильного меню */
  variant?: "compact" | "wide";
  onNavigate?: () => void;
}

/** Переключатель «Малыш · Школа · Взрослые» — переход в другое направление в один клик. */
export default function DirectionSwitch({ active, variant = "compact", onNavigate }: Props) {
  const wide = variant === "wide";
  return (
    <nav
      aria-label="Направления обучения"
      className={`inline-flex items-center gap-0.5 rounded-xl border border-white/10 bg-white/[0.04] p-0.5 ${wide ? "w-full" : ""}`}
    >
      {LEARNER_ORDER.map((id) => {
        const d = DIRECTIONS[id];
        const isActive = active === id;
        return (
          <Link
            key={id}
            to={d.home}
            onClick={() => {
              saveDirection(id);
              trackGoal("direction_switch", { direction: id });
              onNavigate?.();
            }}
            aria-current={isActive ? "page" : undefined}
            title={`${d.label} · ${d.age}`}
            className={`flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
              wide ? "flex-1 px-2 py-2.5 text-sm" : "px-2.5 py-1.5 text-xs lg:text-[13px]"
            } ${
              isActive
                ? `bg-gradient-to-r ${d.gradient} text-white shadow-md`
                : "text-white/65 hover:text-white hover:bg-white/8"
            }`}
          >
            <span aria-hidden="true">{d.emoji}</span>
            <span>{d.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
