import { Link, useLocation } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import { useCart, cartDiscountPercent } from "@/context/CartContext";

/** Плавающая кнопка корзины — видна на всех страницах, когда в корзине есть курсы. */
export default function CartFloatingButton() {
  const { ids, loaded } = useCart();
  const location = useLocation();
  if (!loaded || ids.length === 0 || location.pathname.startsWith("/cart")) return null;

  const n = ids.length;
  const pct = cartDiscountPercent(n);
  const hint = pct ? `скидка ${pct}%` : "добавьте ещё 1 — скидка 50%";

  return (
    <Link
      to="/cart"
      className="fixed bottom-24 right-4 z-[110] flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-[#1a1030] pl-3 pr-4 py-2.5 shadow-xl shadow-orange-500/30 hover:opacity-95 transition-opacity"
      aria-label={`Корзина: ${n} курс(а), ${hint}`}
    >
      <span className="relative">
        <Icon name="ShoppingCart" size={22} />
        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1a1030] text-amber-300 text-[11px] font-black flex items-center justify-center">
          {n}
        </span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-black">Корзина</span>
        <span className="block text-[11px] font-semibold opacity-80">{hint}</span>
      </span>
    </Link>
  );
}
