import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useZnaika, formatZnaika } from "@/context/ZnaikaContext";
import { useAuth } from "@/context/AuthContext";

interface Props {
  price: number;
}

/**
 * Виджет ЗНАЕК на странице оплаты курса.
 * Показывает баланс, максимально доступную скидку (до 30% стоимости)
 * и итоговую цену после применения.
 *
 * Сама оплата ЗНАЙКАМИ происходит через бэкенд (списание после успеха ЮKassa
 * по cashback-схеме). На этом этапе виджет — мотиватор копить.
 */
export default function ZnaikaCheckoutWidget({ price }: Props) {
  const { isAuthenticated } = useAuth();
  const { state, quoteDiscount } = useZnaika();
  const [quote, setQuote] = useState<{ max_discount: number; final_price: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !price) return;
    quoteDiscount(price).then((q) => {
      if (q) setQuote({ max_discount: q.max_discount, final_price: q.final_price });
    });
  }, [isAuthenticated, price, quoteDiscount, state?.balance]);

  if (!isAuthenticated) return null;

  const balance = state?.balance ?? 0;
  const limit = state?.discount_percent ?? 30;
  const maxDiscount = quote?.max_discount ?? Math.min(balance, Math.floor(price * limit / 100));
  const finalPrice = quote?.final_price ?? Math.max(0, price - maxDiscount);

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/8 via-orange-500/5 to-rose-500/8 p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
          <Icon name="Coins" size={18} className="text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="font-semibold text-white text-sm">Скидка ЗНАЙКАМИ</div>
            <Link to="/znaika" className="text-xs text-amber-200 hover:text-amber-100 underline">
              Мой баланс
            </Link>
          </div>
          {maxDiscount > 0 ? (
            <>
              <div className="text-white/75 text-sm leading-snug">
                Можно применить <span className="font-bold text-amber-200">{formatZnaika(maxDiscount)} ЗНАЕК</span> ={" "}
                <span className="font-bold text-amber-200">−{formatZnaika(maxDiscount)} ₽</span> к этой покупке.
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-white/50 text-xs">Итого к оплате:</span>
                <span className="font-montserrat font-bold text-lg text-white">{formatZnaika(finalPrice)} ₽</span>
                <span className="text-white/40 text-xs line-through">{formatZnaika(price)} ₽</span>
              </div>
              <div className="text-white/45 text-xs mt-1">
                Скидка применяется автоматически (лимит {limit}% от стоимости). Кэшбек 2% ЗНАЙКАМИ вернётся после покупки.
              </div>
            </>
          ) : (
            <div className="text-white/65 text-sm leading-snug">
              У тебя <span className="font-bold text-amber-200">{formatZnaika(balance)}</span> ЗНАЕК.
              Копи через ежедневные входы, уроки и приглашения — и оплачивай до {limit}% курса.
              После этой покупки получишь <span className="text-amber-200 font-semibold">+{formatZnaika(Math.floor(price * 0.02))} ЗНАЕК</span> кэшбеком.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}