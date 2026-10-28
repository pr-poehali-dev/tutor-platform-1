import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

const CART_KEY = "uchispro_course_cart_v1";
export const CART_MAX_ITEMS = 10;

/** Скидка корзины — та же, что считает сервер: 2 курса −50%, 3 и больше −60%. */
export function cartDiscountPercent(count: number): number {
  if (count >= 3) return 60;
  if (count === 2) return 50;
  return 0;
}

interface CartState {
  ids: number[];
  loaded: boolean;
  has: (courseId: number) => boolean;
  add: (courseId: number) => void;
  remove: (courseId: number) => void;
  toggle: (courseId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setIds(parsed.map(Number).filter((n) => Number.isFinite(n)).slice(0, CART_MAX_ITEMS));
      }
    } catch { /* noop */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(ids)); } catch { /* noop */ }
  }, [ids, loaded]);

  const add = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) || prev.length >= CART_MAX_ITEMS ? prev : [...prev, id]));
  }, []);
  const remove = useCallback((id: number) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const toggle = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= CART_MAX_ITEMS ? prev : [...prev, id]));
  }, []);
  const clear = useCallback(() => setIds([]), []);
  const has = useCallback((id: number) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, loaded, has, add, remove, toggle, clear }), [ids, loaded, has, add, remove, toggle, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const CART_FALLBACK: CartState = {
  ids: [],
  loaded: false,
  has: () => false,
  add: () => {},
  remove: () => {},
  toggle: () => {},
  clear: () => {},
};

export function useCart(): CartState {
  return useContext(CartContext) ?? CART_FALLBACK;
}
