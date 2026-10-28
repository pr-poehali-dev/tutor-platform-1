import Icon from "@/components/ui/icon";
import { useCart, CART_MAX_ITEMS } from "@/context/CartContext";
import { useAccess } from "@/context/AccessContext";
import { isPromoActive } from "@/components/promo/dobroConfig";
import { Course, getCoursePrice } from "@/components/courses/coursesData";

interface Props {
  course: Course;
  size?: "sm" | "md";
  className?: string;
}

/** Кнопка «В корзину» — не показывается для бесплатных и уже купленных курсов. */
export default function AddToCartButton({ course, size = "sm", className = "" }: Props) {
  const { has, toggle, ids, loaded } = useCart();
  const { canAccessCourse } = useAccess();
  if (!loaded || isPromoActive() || getCoursePrice(course) <= 0 || canAccessCourse(course.id)) return null;

  const inCart = has(course.id);
  const full = !inCart && ids.length >= CART_MAX_ITEMS;
  const pad = size === "md" ? "px-4 py-3 text-sm rounded-2xl" : "px-2.5 py-2 text-xs rounded-xl";

  return (
    <button
      type="button"
      disabled={full}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(course.id);
      }}
      aria-pressed={inCart}
      title={inCart ? "Убрать из корзины" : "Добавить в корзину: 2 курса −50%, 3 и больше −60%"}
      className={`inline-flex items-center justify-center gap-1.5 font-bold border transition-colors flex-shrink-0 disabled:opacity-40 ${pad} ${
        inCart
          ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30"
          : "bg-amber-400/15 border-amber-400/40 text-amber-100 hover:bg-amber-400/25"
      } ${className}`}
    >
      <Icon name={inCart ? "Check" : "ShoppingCart"} size={size === "md" ? 16 : 13} />
      {size === "md" ? (inCart ? "В корзине" : "В корзину") : <span className="sr-only sm:not-sr-only">{inCart ? "В корзине" : "В корзину"}</span>}
    </button>
  );
}
