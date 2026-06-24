import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  KIDS_PROMO_MONTHLY_PRICE,
  KIDS_PROMO_INTRO_MONTHS,
  isKidsPromoActive,
} from "@/components/promo/kidsPromoConfig";

interface Props {
  onClose: () => void;
}

// Окно «доступ по подписке» для модуля «Малыш».
// Показывается, когда бесплатное занятие уже использовано.
export default function KidsPaywall({ onClose }: Props) {
  const promo = isKidsPromoActive();

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full rounded-3xl border border-pink-400/30 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 p-6 md:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
        >
          <Icon name="X" size={16} />
        </button>

        <div className="text-5xl mb-3">🧸</div>
        <h2 className="font-montserrat font-black text-2xl text-white mb-2">
          Первое занятие — бесплатно. Понравилось?
        </h2>
        <p className="text-white/70 text-sm md:text-base mb-5">
          Открой все занятия, сказки, игры и обучение чтению по абонементу «Малыш».
          {promo && ` Первые ${KIDS_PROMO_INTRO_MONTHS} месяца за 1 ₽, далее ${KIDS_PROMO_MONTHLY_PRICE} ₽/мес.`}
          {!promo && ` Всего ${KIDS_PROMO_MONTHLY_PRICE} ₽ в месяц.`}
        </p>

        <Link
          to="/checkout/kids"
          className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-base px-6 py-4 rounded-2xl hover:opacity-95 transition-opacity shadow-lg shadow-pink-500/25 mb-3"
        >
          <Icon name="Heart" size={18} />
          {promo ? "Оформить за 1 ₽" : `Оформить за ${KIDS_PROMO_MONTHLY_PRICE} ₽`}
          <Icon name="ArrowRight" size={18} />
        </Link>

        <button
          onClick={onClose}
          className="text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          Не сейчас
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
          <Icon name="ShieldCheck" size={13} className="text-emerald-400" />
          Отменить можно в любой момент. Оплата защищена ЮKassa.
        </div>
      </div>
    </div>
  );
}
