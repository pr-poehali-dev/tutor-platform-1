import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { isValidEmail } from "@/components/extensions/yookassa/useYookassa";
import { isPromoActive } from "@/components/promo/dobroConfig";
import {
  PlanDef,
  PlanId,
  PLANS,
  KIDS_INTRO_PRICE,
  yearPrice,
} from "@/components/checkout/checkoutPlans";
import CheckoutPlanCard from "@/components/checkout/CheckoutPlanCard";
import CheckoutCouponForm from "@/components/checkout/CheckoutCouponForm";
import CheckoutContactForm from "@/components/checkout/CheckoutContactForm";

export default function Checkout() {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const period: "month" | "year" = searchParams.get("period") === "year" ? "year" : "month";
  // Откуда пользователь пришёл оформлять подписку (например, страница курса).
  // Принимаем только относительный внутренний путь — для безопасности.
  const rawFrom = searchParams.get("from") || "";
  const fromPath = /^\/[^/]/.test(rawFrom) ? rawFrom : "";
  const fromQuery = fromPath ? `&from=${encodeURIComponent(fromPath)}` : "";
  const { user, isAuthenticated, loading, openLogin } = useAuth();
  const navigate = useNavigate();
  const plan = useMemo<PlanDef | null>(() => (planId && (planId in PLANS) ? PLANS[planId as PlanId] : null), [planId]);
  // Абонемент «Малыш» с акцией: первые 3 месяца за 1 ₽ (без годовой опции).
  const isKids = plan?.id === "kids";
  // Год доступен только для платных тарифов (кроме «Малыша»)
  const isYear = period === "year" && !!plan && plan.price > 0 && !isKids;
  const displayPrice = isKids
    ? KIDS_INTRO_PRICE
    : isYear && plan
    ? yearPrice(plan.price, plan)
    : plan?.price ?? 0;
  const displayPeriod = isKids ? "3 месяца" : isYear ? "год" : plan?.period ?? "";

  const { buySubscription, validateCoupon } = useAccess();
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [name, setName] = useState<string>(user?.name ?? "");
  const [agree, setAgree] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; percent: number; finalRub: number } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    if (user?.name && !name) setName(user.name);
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (!loading && !isAuthenticated) openLogin();
  }, [loading, isAuthenticated, openLogin]);

  // Во время акции «ДОБРО» все оплаты заблокированы — отправляем на лендинг акции
  useEffect(() => {
    if (isPromoActive()) {
      navigate("/promo/dobro", { replace: true });
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Icon name="Loader2" size={28} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🤔</div>
          <h1 className="font-montserrat font-black text-2xl mb-2">Такого тарифа нет</h1>
          <Link to="/courses" className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm">
            <Icon name="ArrowLeft" size={14} />
            К курсам
          </Link>
        </div>
      </div>
    );
  }

  const isFree = plan.price === 0;
  // Итоговая цена с учётом применённого промокода
  const finalPrice = couponApplied ? couponApplied.finalRub : displayPrice;

  const handleApplyCoupon = async () => {
    const code = coupon.trim();
    if (!code) return;
    setCouponError(null);
    setCouponChecking(true);
    const res = await validateCoupon(code, displayPrice);
    setCouponChecking(false);
    if (res.valid) {
      setCouponApplied({
        code: code.toUpperCase(),
        percent: res.percent ?? 0,
        finalRub: res.finalRub ?? displayPrice,
      });
    } else {
      setCouponApplied(null);
      setCouponError(res.message || "Промокод не найден или уже использован");
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCoupon("");
    setCouponError(null);
  };

  const handlePay = async () => {
    setLocalError(null);
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError("Введи корректный email — он нужен для чека");
      return;
    }
    if (!agree) {
      setLocalError("Подтверди согласие с условиями");
      return;
    }

    const returnUrl = `${window.location.origin}/checkout/success?plan=${plan.id}${fromQuery}`;
    setIsLoading(true);
    const res = await buySubscription(plan.id, returnUrl, email, isYear ? "year" : "month", couponApplied?.code);
    setIsLoading(false);

    if (!res.ok) {
      setLocalError(res.message || "Не получилось оформить подписку");
      return;
    }
    if (res.alreadySubscribed) {
      navigate(`/checkout/success?plan=${plan.id}${fromQuery}`);
      return;
    }
    if (res.paymentUrl && /^https:\/\//.test(res.paymentUrl)) {
      window.location.href = res.paymentUrl;
      return;
    }
    if (res.demoMode) {
      // ЮKassa не настроена — отправляем на success, там есть демо-активация
      navigate(`/checkout/success?plan=${plan.id}&demo=${res.subscriptionId}${fromQuery}`);
      return;
    }
    setLocalError("Не удалось перейти к оплате. Попробуй ещё раз через минуту.");
  };

  const displayError = localError;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white pb-16">
      <Seo
        title={`Оплата тарифа «${plan.name}» — УЧИСЬПРО`}
        description={`Оформление подписки «${plan.name}» через ЮKassa. Безопасная оплата картой Visa, Mastercard, МИР или СБП.`}
        canonical={`https://xn--h1agdcde2c.xn--p1ai/checkout/${plan.id}`}
        noindex
      />

      <div className="max-w-3xl mx-auto px-4 pt-10 md:pt-14">
        <Link to={fromPath || "/kids"} className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={16} />
          Назад
        </Link>

        <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Оформление подписки</p>
        <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-6">
          Тариф «{plan.name}»
        </h1>

        <CheckoutPlanCard
          plan={plan}
          displayPrice={displayPrice}
          displayPeriod={displayPeriod}
          isYear={isYear}
          isKids={isKids}
          isFree={isFree}
        />

        {/* Промокод из магазина ЗНАЕК */}
        {!isFree && (
          <CheckoutCouponForm
            coupon={coupon}
            setCoupon={setCoupon}
            couponApplied={couponApplied}
            couponChecking={couponChecking}
            couponError={couponError}
            setCouponError={setCouponError}
            handleApplyCoupon={handleApplyCoupon}
            removeCoupon={removeCoupon}
          />
        )}

        <CheckoutContactForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          agree={agree}
          setAgree={setAgree}
          userPhone={user?.phone}
          isFree={isFree}
          displayError={displayError}
          isLoading={isLoading}
          finalPrice={finalPrice}
          displayPrice={displayPrice}
          couponApplied={couponApplied}
          onActivateFree={() => navigate("/cabinet")}
          handlePay={handlePay}
        />
      </div>
    </div>
  );
}