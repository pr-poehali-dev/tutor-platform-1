import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useZnaika, formatZnaika } from "@/context/ZnaikaContext";

/** Маленький виджет баланса ЗНАЕК для шапки. */
export default function ZnaikaBadge() {
  const { state } = useZnaika();
  const balance = state?.balance ?? 0;
  return (
    <Link
      to="/znaika"
      aria-label={`Мои ЗНАЙКИ: ${formatZnaika(balance)}`}
      title="Мои ЗНАЙКИ"
      className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/25 hover:from-amber-500/25 hover:to-orange-500/20 transition-all"
    >
      <Icon name="Coins" size={14} className="text-amber-300" />
      <span className="font-montserrat font-bold text-sm text-amber-100 tabular-nums">
        {formatZnaika(balance)}
      </span>
    </Link>
  );
}
