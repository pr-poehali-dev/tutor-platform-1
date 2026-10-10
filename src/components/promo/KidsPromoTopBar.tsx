import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { KIDS_TRIAL_MONTHS, KIDS_MONTHLY_PRICE } from "./kidsPromoConfig";
import { directionForPath } from "@/lib/directions";

/**
 * Верхняя полоса модуля «Малыш»: первые 3 месяца бесплатно.
 *
 * Раньше здесь был обратный отсчёт до конца акции «3 месяца за 1 ₽».
 * Теперь бесплатный период постоянный, поэтому таймер убран: торопить
 * родителя нечем, а фальшивый дедлайн подрывает доверие.
 *
 * Видна на каждой странице, кроме оплаты и разделов другой аудитории.
 * Закрытие запоминается на сутки.
 */
const HIDE_KEY = "uchispro_kids_promo_top_hidden_until";

export default function KidsPromoTopBar() {
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(HIDE_KEY) || "0");
      if (until > Date.now()) setHidden(true);
    } catch {
      /* noop */
    }
  }, []);

  // На странице оплаты человек уже принял решение — посторонний баннер
  // сбивает его и уводит с полпути.
  const isCheckout = /^\/(course-checkout|checkout|pay)/.test(pathname);
  // На рекламных лендингах и в разделах для репетиторов детский баннер
  // не к месту: за клик заплачено по своей цели, а он уводит в другой продукт.
  const isWrongAudience =
    /^\/(ads|repetitoram|school-builder|school|for-schools|for-business|partner|samara)/.test(pathname);
  // Внутри самого раздела «Малыш» звать в «Малыш» незачем.
  const isInsideKids = /^\/kids/.test(pathname);
  // Взрослому, который пришёл за профессией, и партнёру детский баннер не нужен:
  // показываем его только на главной, в «Школе» и на общих страницах.
  const dir = directionForPath(pathname);
  const isOtherDirection = dir === "adult" || dir === "business";

  if (hidden || isCheckout || isWrongAudience || isInsideKids || isOtherDirection) return null;

  const handleClose = () => {
    try {
      localStorage.setItem(HIDE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch {
      /* noop */
    }
    setHidden(true);
  };

  return (
    <div className="relative z-50 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
      <Link to="/kids" className="block px-4 py-2 hover:bg-black/10 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap text-center">
          <span className="text-xl">🧸</span>
          <span className="font-montserrat font-black text-xs md:text-sm uppercase tracking-wider">
            УЧИСЬПРО Малыш
          </span>
          <span className="hidden sm:inline text-white/95 text-xs md:text-sm font-bold">
            — первые {KIDS_TRIAL_MONTHS} месяца бесплатно, далее {KIDS_MONTHLY_PRICE} ₽/мес
          </span>
          <span className="inline-flex items-center gap-1 bg-black/25 rounded-lg px-2 py-1 text-xs font-bold">
            <Icon name="CreditCard" size={11} />
            Без карты
          </span>
          <span className="hidden md:inline text-white/90 text-xs font-bold underline underline-offset-2">
            Открыть бесплатно →
          </span>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Скрыть на сутки"
        className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white/85"
      >
        <Icon name="X" size={12} />
      </button>
    </div>
  );
}