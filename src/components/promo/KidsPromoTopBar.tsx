import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  isKidsPromoActive,
  kidsPromoTimeLeft,
  KIDS_PROMO_INTRO_MONTHS,
  KIDS_PROMO_MONTHLY_PRICE,
} from "./kidsPromoConfig";

/**
 * Верхняя полоса с акцией «Малыш»: 3 месяца за 1 ₽.
 * Видна на каждой странице. Скрывается, если акция закончилась.
 * Запоминает закрытие на сутки.
 */
const HIDE_KEY = "uchispro_kids_promo_top_hidden_until";

export default function KidsPromoTopBar() {
  const [active, setActive] = useState(false);
  const [tick, setTick] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setActive(isKidsPromoActive());
    try {
      const until = Number(localStorage.getItem(HIDE_KEY) || "0");
      if (until > Date.now()) setHidden(true);
    } catch { /* noop */ }
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!active || hidden) return null;

  const tl = kidsPromoTimeLeft();
  if (tl.expired) return null;

  const handleClose = () => {
    try {
      localStorage.setItem(HIDE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch { /* noop */ }
    setHidden(true);
  };

  return (
    <div className="relative z-50 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white" data-tick={tick}>
      <Link
        to="/checkout/kids"
        className="block px-4 py-2 hover:bg-black/10 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap text-center">
          <span className="text-xl">🧸</span>
          <span className="font-montserrat font-black text-xs md:text-sm uppercase tracking-wider">
            Акция «Малыш»
          </span>
          <span className="hidden sm:inline text-white/95 text-xs md:text-sm font-bold">
            — {KIDS_PROMO_INTRO_MONTHS} месяца за 1 ₽, далее {KIDS_PROMO_MONTHLY_PRICE} ₽/мес
          </span>
          <span className="inline-flex items-center gap-1 bg-black/25 rounded-lg px-2 py-1 font-mono font-black text-xs tabular-nums">
            <Icon name="Clock" size={11} />
            {tl.days}д {String(tl.hours).padStart(2, "0")}:{String(tl.minutes).padStart(2, "0")}:{String(tl.seconds).padStart(2, "0")}
          </span>
          <span className="hidden md:inline text-white/90 text-xs font-bold underline underline-offset-2">
            Оформить за 1 ₽ →
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
