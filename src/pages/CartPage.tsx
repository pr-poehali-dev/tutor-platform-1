import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { COURSES, getCoursePrice } from "@/components/courses/coursesData";
import { courseUrl } from "@/components/courses/courseSlug";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { useCart, cartDiscountPercent } from "@/context/CartContext";
import CartPromoBanner from "@/components/cart/CartPromoBanner";
import { buyCart, fetchCartQuote, CartQuote } from "@/components/cart/cartApi";

const rub = (v: number) => `${v.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function CartPage() {
  const { ids, loaded, remove, clear } = useCart();
  const { isAuthenticated, openLogin, user, token } = useAuth();
  const { canAccessCourse, syncPayment, confirmDemoPurchase } = useAccess();
  const [searchParams] = useSearchParams();
  const returned = searchParams.get("paid") === "1";

  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoPurchaseId, setDemoPurchaseId] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const courses = useMemo(
    () => ids.map((id) => COURSES.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c),
    [ids]
  );

  const key = ids.join(",");
  useEffect(() => {
    if (!loaded || ids.length === 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    fetchCartQuote(ids, token).then((q) => {
      if (cancelled) return;
      setQuote(q);
      setQuoting(false);
    });
    return () => { cancelled = true; };
  }, [key, loaded, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!returned || !isAuthenticated) return;
    let cancelled = false;
    let attempt = 0;
    const tick = async () => {
      const r = await syncPayment();
      if (cancelled) return;
      if (r.activated?.some((a) => a.kind === "course")) {
        setDone(true);
        clear();
        return;
      }
      if (++attempt < 15) setTimeout(tick, 3000);
    };
    tick();
    return () => { cancelled = true; };
  }, [returned, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loaded) return;
    ids.filter((id) => canAccessCourse(id)).forEach((id) => remove(id));
  }, [loaded, ids, canAccessCourse, remove]);

  const localTotal = courses.reduce((s, c) => s + getCoursePrice(c), 0);
  const localPct = cartDiscountPercent(courses.length);
  const total = quote?.total_rub ?? localTotal;
  const pct = quote?.discount_percent ?? localPct;
  const final = quote?.final_rub ?? Math.round(localTotal * (100 - localPct)) / 100;
  const discount = quote?.discount_rub ?? total - final;

  const handlePay = async () => {
    setError(null);
    if (!isAuthenticated || !token) {
      openLogin();
      return;
    }
    if (!isValidEmail(email)) {
      setError("Укажите действующий email — на него придёт чек по 54-ФЗ");
      return;
    }
    setProcessing(true);
    const res = await buyCart(ids, token, `${window.location.origin}/cart?paid=1`, email.trim());
    setProcessing(false);
    if (!res.ok) {
      setError(res.message || "Не получилось оформить заказ");
      return;
    }
    if (res.alreadyPurchased) {
      clear();
      setDone(true);
      return;
    }
    if (res.paymentUrl && /^https:\/\//.test(res.paymentUrl)) {
      window.location.href = res.paymentUrl;
      return;
    }
    if (res.demoMode && res.purchaseIds?.length) {
      setDemoPurchaseId(res.purchaseIds[0]);
      return;
    }
    setError("Не удалось перейти к оплате. Попробуйте ещё раз через минуту.");
  };

  const handleDemo = async () => {
    if (!demoPurchaseId) return;
    setProcessing(true);
    const r = await confirmDemoPurchase(demoPurchaseId, "cart");
    setProcessing(false);
    if (!r.ok) {
      setError(r.message || "Не удалось подтвердить оплату");
      return;
    }
    clear();
    setDone(true);
  };

  return (
    <main className="min-h-screen bg-background py-10 font-golos text-white">
      <Seo title="Корзина курсов — УЧИСЬПРО" description="Корзина курсов: 2 курса со скидкой 50%, 3 и больше — 60%." noindex />
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-white/45 hover:text-white/75 text-sm transition-colors">
          <Icon name="ArrowLeft" size={14} /> К каталогу курсов
        </Link>
        <h1 className="font-montserrat font-black text-3xl md:text-4xl mt-3">Корзина</h1>
      </div>

      <CartPromoBanner className="mb-8" />

      <div className="max-w-6xl mx-auto px-4">
        {done ? (
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
            <Icon name="CheckCircle2" size={40} className="text-emerald-300 mx-auto mb-3" />
            <p className="font-montserrat font-black text-2xl mb-2">Оплата прошла — курсы ваши</p>
            <p className="text-white/65 text-sm mb-5">Все купленные курсы уже открыты в личном кабинете.</p>
            <Link to="/cabinet" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-bold">
              <Icon name="User" size={16} /> В кабинет
            </Link>
          </div>
        ) : returned ? (
          <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-8 text-center">
            <Icon name="Loader2" size={32} className="animate-spin text-cyan-300 mx-auto mb-3" />
            <p className="font-bold">Проверяем оплату… Обычно это занимает до минуты.</p>
          </div>
        ) : !loaded ? null : courses.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-card p-10 text-center">
            <Icon name="ShoppingCart" size={40} className="text-white/30 mx-auto mb-3" />
            <p className="font-montserrat font-black text-xl mb-2">В корзине пока пусто</p>
            <p className="text-white/55 text-sm mb-5">Выберите 2 курса — скидка 50%, 3 и больше — 60% от общей стоимости.</p>
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-[#1a1030] px-6 py-3 font-black">
              Выбрать курсы <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            <ul className="flex flex-col gap-3">
              {courses.map((c) => {
                const q = quote?.items.find((i) => i.course_id === c.id);
                const base = q?.price_rub ?? getCoursePrice(c);
                const fin = q?.final_rub ?? base;
                return (
                  <li key={c.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-card p-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl flex-shrink-0`}>{c.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <Link to={courseUrl(c)} className="font-bold leading-snug hover:underline line-clamp-2">{c.title}</Link>
                      <p className="text-white/45 text-xs mt-0.5">{c.lessons} уроков · доступ навсегда</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {pct > 0 && <p className="text-white/40 text-xs line-through tabular-nums">{rub(base)}</p>}
                      <p className="font-montserrat font-black tabular-nums">{rub(pct > 0 ? fin : base)}</p>
                    </div>
                    <button onClick={() => remove(c.id)} aria-label="Убрать из корзины" className="p-2 text-white/40 hover:text-rose-300 transition-colors">
                      <Icon name="Trash2" size={18} />
                    </button>
                  </li>
                );
              })}
              {courses.length === 1 && (
                <li className="rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/5 p-4 text-sm text-amber-100 flex items-center gap-3">
                  <Icon name="Gift" size={18} className="text-amber-300 flex-shrink-0" />
                  Добавьте ещё один курс — и весь заказ станет дешевле в 2 раза.
                  <Link to="/courses" className="ml-auto font-bold underline whitespace-nowrap">Выбрать</Link>
                </li>
              )}
            </ul>

            <aside className="rounded-3xl border border-white/10 bg-card p-6 lg:sticky lg:top-24">
              <div className="flex justify-between text-sm text-white/65 mb-2">
                <span>Курсов: {courses.length}</span>
                <span className="tabular-nums">{rub(total)}</span>
              </div>
              {pct > 0 && (
                <div className="flex justify-between text-sm text-emerald-300 font-semibold mb-2">
                  <span>Скидка {pct}%</span>
                  <span className="tabular-nums">−{rub(discount)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3 mt-3 mb-5">
                <span className="text-white/55 text-sm">К оплате</span>
                <span className="font-montserrat font-black text-3xl gradient-text-purple tabular-nums">
                  {quoting && !quote ? "…" : rub(final)}
                </span>
              </div>

              {isAuthenticated && (
                <label className="block mb-4">
                  <span className="text-white/55 text-xs uppercase tracking-wider font-semibold">Email для чека</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@example.ru"
                    className="mt-1.5 w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/50"
                  />
                </label>
              )}

              {error && (
                <p className="mb-4 text-rose-300 text-sm flex items-center gap-1.5">
                  <Icon name="AlertCircle" size={14} /> {error}
                </p>
              )}

              {demoPurchaseId ? (
                <button onClick={handleDemo} disabled={processing} className="w-full rounded-2xl bg-emerald-500 py-3.5 font-black disabled:opacity-60">
                  {processing ? "Подтверждаем…" : "Подтвердить тестовую оплату"}
                </button>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={processing || quoting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 py-3.5 font-black hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  <Icon name={isAuthenticated ? "CreditCard" : "LogIn"} size={18} />
                  {processing ? "Переходим к оплате…" : isAuthenticated ? `Оплатить ${rub(final)}` : "Войти и оплатить"}
                </button>
              )}
              <p className="text-white/40 text-[11px] mt-3 text-center">Один платёж через ЮKassa · чек по 54-ФЗ · сумма проверяется на сервере</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
