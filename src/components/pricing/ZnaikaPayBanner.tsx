import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useZnaika, formatZnaika } from "@/context/ZnaikaContext";

// Баннер «Оплати ЗНАЙКАМИ — скидка до 30%» на странице тарифов.
// Для залогиненных показывает их баланс и реальную выгоду.
export default function ZnaikaPayBanner() {
  const { isAuthenticated } = useAuth();
  const { state, refresh } = useZnaika();

  useEffect(() => {
    if (isAuthenticated && !state) refresh();
  }, [isAuthenticated, state, refresh]);

  const balance = state?.balance ?? 0;
  const discountPercent = state?.discount_percent ?? 30;

  return (
    <div className="mb-10 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/12 via-orange-500/8 to-rose-500/10 p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
          <Icon name="Coins" size={28} className="text-slate-900" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-montserrat font-black text-white text-lg md:text-xl mb-1">
            Оплати ЗНАЙКАМИ — скидка до {discountPercent}%
          </h3>
          {isAuthenticated ? (
            <p className="text-white/70 text-sm">
              На балансе{" "}
              <span className="text-amber-300 font-bold">{formatZnaika(balance)} ЗНАЕК</span> ≈{" "}
              <span className="text-amber-300 font-bold">{formatZnaika(balance)} ₽</span> скидки.
              Можно покрыть до {discountPercent}% стоимости подписки.
            </p>
          ) : (
            <p className="text-white/70 text-sm">
              Учись, заходи каждый день и приглашай друзей — копи ЗНАЙКИ и оплачивай ими
              до {discountPercent}% подписки. 1 ЗНАЙКА = 1 ₽.
            </p>
          )}
        </div>

        <Link
          to="/znaika"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black text-sm px-5 py-3 rounded-2xl hover:scale-[1.03] transition-transform flex-shrink-0"
        >
          {isAuthenticated ? "Мои ЗНАЙКИ" : "Как копить ЗНАЙКИ"}
          <Icon name="ArrowRight" size={16} />
        </Link>
      </div>
    </div>
  );
}
