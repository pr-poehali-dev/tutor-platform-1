import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import { useCart, cartDiscountPercent } from "@/context/CartContext";
import { isPromoActive } from "@/components/promo/dobroConfig";

interface Props {
  className?: string;
  /** Показывать кнопку «Выбрать курсы» — для страниц без карточек курсов (например, главной). */
  catalogLink?: boolean;
  /** Куда ведёт кнопка «Выбрать курсы». */
  catalogHref?: string;
  /** Узкая колонка: заголовок сверху, скидки и кнопка — строкой ниже. */
  narrow?: boolean;
}

/** Баннер акции «Больше курсов — больше скидка»: 2 курса −50%, 3 и больше −60%. */
export default function CartPromoBanner({ className = "", catalogLink = false, catalogHref = "/courses", narrow = false }: Props) {
  const { ids, loaded } = useCart();
  if (isPromoActive()) return null;
  const n = loaded ? ids.length : 0;
  const pct = cartDiscountPercent(n);

  const status =
    n === 0
      ? catalogLink
        ? "Выберите 2 и больше курса в каталоге — скидка применится автоматически"
        : "Нажмите «В корзину» на карточках курсов"
      : n === 1
      ? "В корзине 1 курс — добавьте ещё один и получите −50%"
      : n === 2
      ? "Скидка 50% уже ваша — третий курс даст −60% на всё"
      : `Максимальная скидка ${pct}% на ${n} курса(ов) — оформляйте`;

  return (
    <section className={`max-w-6xl mx-auto px-4 ${className}`} aria-label="Скидка за несколько курсов">
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-rose-500/20 p-5 md:p-7">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className={`relative flex flex-col gap-5 ${narrow ? "" : "md:flex-row md:items-center"}`}>
          <div className="flex-1 min-w-0">
            <p className="inline-flex items-center gap-1.5 text-amber-200 text-[11px] font-black uppercase tracking-widest mb-2">
              <Icon name="Percent" size={12} /> Акция
            </p>
            <h2 className="font-montserrat font-black text-white text-2xl md:text-3xl leading-tight">
              Больше курсов — больше скидка
            </h2>
            <p className="text-white/70 text-sm mt-2">{status}</p>
          </div>

          <div className={`flex gap-3 ${narrow ? "flex-wrap items-center" : ""}`}>
            <div className={`rounded-2xl px-4 py-3 text-center border ${n === 2 ? "bg-amber-400 text-[#1a1030] border-amber-300" : "bg-white/5 border-white/15 text-white"}`}>
              <p className="font-montserrat font-black text-3xl leading-none">−50%</p>
              <p className="text-xs font-semibold mt-1 opacity-80">за 2 курса</p>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-center border ${n >= 3 ? "bg-amber-400 text-[#1a1030] border-amber-300" : "bg-white/5 border-white/15 text-white"}`}>
              <p className="font-montserrat font-black text-3xl leading-none">−60%</p>
              <p className="text-xs font-semibold mt-1 opacity-80">за 3 и больше</p>
            </div>
          </div>

          {n === 0 && catalogLink && (
            <Link
              to={catalogHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-[#1a1030] font-black px-5 py-3.5 hover:opacity-90 transition-opacity"
            >
              Выбрать курсы
              <Icon name="ArrowRight" size={18} />
            </Link>
          )}

          {n > 0 && (
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-[#1a1030] font-black px-5 py-3.5 hover:opacity-90 transition-opacity"
            >
              <Icon name="ShoppingCart" size={18} />
              Корзина ({n})
            </Link>
          )}
        </div>
        <p className="relative text-white/45 text-[11px] mt-4">Скидка считается от общей стоимости всех курсов в корзине и применяется автоматически при оплате.</p>
      </div>
    </section>
  );
}
