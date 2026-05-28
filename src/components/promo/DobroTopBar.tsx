import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { isPromoActive, timeLeft, PROMO_CODE } from "./dobroConfig";

/**
 * Тонкая верхняя полоска с обратным отсчётом акции «ДОБРО».
 * Скрывается, если акция закончилась. Запоминает закрытие на сутки.
 */
const HIDE_KEY = "uchispro_dobro_top_hidden_until";

export default function DobroTopBar() {
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setActive(isPromoActive());
    try {
      const until = Number(localStorage.getItem(HIDE_KEY) || "0");
      if (until > Date.now()) setHidden(true);
    } catch { /* noop */ }
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!active || hidden) return null;

  const tl = timeLeft();
  if (tl.expired) return null;

  const handleClose = () => {
    try {
      localStorage.setItem(HIDE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch { /* noop */ }
    setHidden(true);
  };

  return (
    <div className="relative z-50 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white" data-tick={tick}>
      <Link
        to="/promo/dobro"
        className="block px-4 py-2 hover:bg-black/10 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap text-center">
          <span className="text-xl animate-pulse">❤️</span>
          <span className="font-montserrat font-black text-xs md:text-sm uppercase tracking-wider">
            Акция «{PROMO_CODE}»
          </span>
          <span className="hidden sm:inline text-white/90 text-xs md:text-sm font-bold">
            — всё бесплатно для всех учеников
          </span>
          <span className="inline-flex items-center gap-1 bg-black/25 rounded-lg px-2 py-1 font-mono font-black text-xs tabular-nums">
            <Icon name="Clock" size={11} />
            {tl.days}д {String(tl.hours).padStart(2, "0")}:{String(tl.minutes).padStart(2, "0")}:{String(tl.seconds).padStart(2, "0")}
          </span>
          <span className="hidden md:inline text-white/85 text-xs font-bold underline underline-offset-2">
            Узнать подробнее →
          </span>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClose(); }}
        aria-label="Скрыть на сутки"
        className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white/85"
      >
        <Icon name="X" size={12} />
      </button>
    </div>
  );
}
