import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  isPromoActive, timeLeft, formatEndDate, PROMO_CODE,
} from "./dobroConfig";

/**
 * Главный баннер акции «ДОБРО» — большой, акцентный, с обратным отсчётом.
 * Ставится на главной странице между hero и каталогом.
 */
export default function DobroBanner() {
  const [active, setActive] = useState(false);
  const [tl, setTl] = useState(() => timeLeft());

  useEffect(() => {
    setActive(isPromoActive());
    const t = setInterval(() => setTl(timeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!active || tl.expired) return null;

  const countdown =
    tl.days > 0
      ? `${tl.days} дн ${String(tl.hours).padStart(2, "0")}:${String(tl.minutes).padStart(2, "0")}`
      : `${String(tl.hours).padStart(2, "0")}:${String(tl.minutes).padStart(2, "0")}:${String(tl.seconds).padStart(2, "0")}`;

  return (
    <section className="relative max-w-6xl mx-auto px-4 md:px-6 mt-3">
      <Link
        to="/promo/dobro"
        className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-orange-500/20 backdrop-blur-sm px-4 py-2.5 hover:border-rose-400/60 transition-colors"
      >
        <span className="text-xl shrink-0">❤️</span>

        <div className="min-w-0 flex-1">
          <p className="text-white font-bold text-sm md:text-base leading-tight truncate">
            Акция «{PROMO_CODE}»: учись <span className="text-yellow-200">бесплатно</span> — все курсы и ИИ-репетитор
          </p>
          <p className="text-white/70 text-[11px] md:text-xs leading-tight">
            До {formatEndDate()} · осталось <span className="tabular-nums font-semibold text-white/90">{countdown}</span>
          </p>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0 bg-white text-rose-600 font-bold text-xs md:text-sm px-4 py-2 rounded-xl group-hover:scale-[1.03] transition-transform">
          Начать
          <Icon name="ArrowRight" size={14} />
        </span>
        <Icon name="ChevronRight" size={20} className="sm:hidden text-white/70 shrink-0" />
      </Link>
    </section>
  );
}