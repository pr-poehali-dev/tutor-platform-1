import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { isValidEmail } from "@/components/extensions/yookassa/useYookassa";
import { isPromoActive } from "@/components/promo/dobroConfig";
import { PaymentSteps } from "@/components/courses/CheckoutBoosters";

type PlanId = "trial" | "base" | "pro" | "family";

interface PlanDef {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  gradient: string;
}

const PLANS: Record<PlanId, PlanDef> = {
  trial: {
    id: "trial",
    name: "Пробный",
    price: 0,
    period: "7 дней",
    description: "Знакомство с платформой без оплаты",
    features: ["3 курса на выбор", "20 сообщений ИИ в день", "Базовая аналитика"],
    gradient: "from-white/12 to-white/5",
  },
  base: {
    id: "base",
    name: "Базовый",
    price: 590,
    period: "месяц",
    description: "Все курсы + ИИ-методист",
    features: ["Все 36+ курсов", "200 сообщений ИИ в день", "Голосовые ответы", "Полная аналитика"],
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  pro: {
    id: "pro",
    name: "Профи",
    price: 1290,
    period: "месяц",
    description: "Полная подготовка к ЕГЭ и ОГЭ",
    features: ["Всё из «Базового»", "Безлимитные сообщения ИИ", "Подготовка к ЕГЭ/ОГЭ", "Разбор сочинений", "Пробные экзамены"],
    gradient: "from-purple-500/25 to-pink-500/15",
  },
  family: {
    id: "family",
    name: "Семейный",
    price: 1990,
    period: "месяц",
    description: "До 3 учеников на одной подписке",
    features: ["Всё из «Профи»", "До 3 учеников", "Отдельный прогресс", "Родительский кабинет"],
    gradient: "from-emerald-500/20 to-green-500/10",
  },
};

const YEAR_DISCOUNT = 0.4;
function yearPrice(monthly: number): number {
  return Math.round(monthly * 12 * (1 - YEAR_DISCOUNT));
}

export default function Checkout() {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const period: "month" | "year" = searchParams.get("period") === "year" ? "year" : "month";
  const { user, isAuthenticated, loading, openLogin } = useAuth();
  const navigate = useNavigate();
  const plan = useMemo<PlanDef | null>(() => (planId && (planId in PLANS) ? PLANS[planId as PlanId] : null), [planId]);
  // Год доступен только для платных тарифов
  const isYear = period === "year" && !!plan && plan.price > 0;
  const displayPrice = isYear && plan ? yearPrice(plan.price) : plan?.price ?? 0;
  const displayPeriod = isYear ? "год" : plan?.period ?? "";

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
          <Link to="/pricing" className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm">
            <Icon name="ArrowLeft" size={14} />
            К тарифам
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

    const returnUrl = `${window.location.origin}/checkout/success?plan=${plan.id}`;
    setIsLoading(true);
    const res = await buySubscription(plan.id, returnUrl, email, isYear ? "year" : "month", couponApplied?.code);
    setIsLoading(false);

    if (!res.ok) {
      setLocalError(res.message || "Не получилось оформить подписку");
      return;
    }
    if (res.alreadySubscribed) {
      navigate(`/checkout/success?plan=${plan.id}`);
      return;
    }
    if (res.paymentUrl) {
      window.location.href = res.paymentUrl;
      return;
    }
    if (res.demoMode) {
      // ЮKassa не настроена — отправляем на success, там есть демо-активация
      navigate(`/checkout/success?plan=${plan.id}&demo=${res.subscriptionId}`);
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
        <Link to="/pricing" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={16} />
          К тарифам
        </Link>

        <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Оформление подписки</p>
        <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-6">
          Тариф «{plan.name}»
        </h1>

        <div className={`rounded-3xl border border-white/12 bg-gradient-to-br ${plan.gradient} p-6 md:p-7 mb-6`}>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-montserrat font-black text-4xl md:text-5xl text-white">
              {displayPrice === 0 ? "0" : displayPrice.toLocaleString("ru-RU")}
            </span>
            <span className="text-white/65 text-base">₽ / {displayPeriod}</span>
          </div>
          {isYear && plan && (
            <p className="text-emerald-300 text-sm font-bold mb-3">
              ≈ {Math.round(displayPrice / 12).toLocaleString("ru-RU")} ₽/мес · экономия{" "}
              {(plan.price * 12 - displayPrice).toLocaleString("ru-RU")} ₽ против помесячной оплаты
            </p>
          )}
          <p className="text-white/70 text-sm md:text-base mb-4 mt-2">{plan.description}</p>
          <ul className="space-y-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                <Icon name="Check" size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Блок доверия — гарантия возврата + безопасность */}
        {!isFree && (
          <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-5 md:p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Icon name="ShieldCheck" size={24} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-montserrat font-black text-white text-base md:text-lg mb-1">
                  Гарантия возврата 7 дней
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Если платформа не подойдёт — вернём деньги в течение 7 дней без вопросов
                  (ст. 32 ЗоЗПП). Отмена подписки в любой момент из личного кабинета.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10">
              {[
                { icon: "Lock", text: "Оплата через ЮKassa" },
                { icon: "FileCheck", text: "Чек по 54-ФЗ" },
                { icon: "MapPin", text: "Серверы в РФ" },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center text-center gap-1.5">
                  <Icon name={b.icon} size={16} className="text-emerald-300" />
                  <span className="text-white/60 text-[11px] leading-tight">{b.text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap mt-4 pt-4 border-t border-white/10">
              <span className="text-white/40 text-[11px] mr-1">Принимаем:</span>
              {["Мир", "Visa", "Mastercard", "СБП"].map((m) => (
                <span
                  key={m}
                  className="bg-white/8 border border-white/12 rounded-lg px-2.5 py-1 text-white/75 text-[11px] font-semibold"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Промокод из магазина ЗНАЕК */}
        {!isFree && (
          <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-7 mb-6">
            <h2 className="font-montserrat font-black text-lg text-white mb-1 flex items-center gap-2">
              <Icon name="Ticket" size={18} className="text-amber-300" />
              Промокод
            </h2>
            <p className="text-white/50 text-xs mb-4">
              Есть купон из магазина ЗНАЕК? Введи код — скидка применится автоматически.
            </p>

            {couponApplied ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="CheckCircle2" size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="font-mono font-bold text-white text-sm tracking-wider truncate">
                    {couponApplied.code}
                  </span>
                  <span className="text-emerald-300 text-xs font-bold whitespace-nowrap">
                    −{couponApplied.percent}%
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-white/50 hover:text-white text-xs font-medium flex items-center gap-1 flex-shrink-0"
                >
                  <Icon name="X" size={13} />
                  Убрать
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="ZN-XXXX-XXXX"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white font-mono tracking-wider placeholder:text-white/25 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-amber-400/60 focus:bg-white/8 transition-colors uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponChecking || !coupon.trim()}
                  className={`px-5 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
                    couponChecking || !coupon.trim()
                      ? "bg-white/8 text-white/40"
                      : "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:opacity-90"
                  }`}
                >
                  {couponChecking ? <Icon name="Loader2" size={16} className="animate-spin" /> : "Применить"}
                </button>
              </div>
            )}

            {couponError && (
              <p className="text-rose-300 text-xs mt-2 flex items-center gap-1.5">
                <Icon name="AlertCircle" size={12} />
                {couponError}
              </p>
            )}
          </div>
        )}

        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-7 mb-6">
          <h2 className="font-montserrat font-black text-lg text-white mb-4">Контактные данные</h2>

          <label className="block mb-4">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Имя</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как тебя зовут"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
              Email <span className="text-rose-300">*</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors"
              required
            />
            <span className="text-white/45 text-xs mt-1.5 block">Сюда пришлём чек об оплате</span>
          </label>

          {user?.phone && (
            <div className="mt-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/75">
              <Icon name="Phone" size={12} className="inline mr-1.5 text-purple-300" />
              Номер: <span className="text-white font-medium">{user.phone}</span>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-purple-500"
          />
          <span className="text-white/65 text-xs leading-relaxed">
            Согласен с{" "}
            <Link to="/legal/offer" className="text-purple-300 hover:text-purple-200 underline">
              офертой
            </Link>
            ,{" "}
            <Link to="/legal/terms" className="text-purple-300 hover:text-purple-200 underline">
              условиями использования
            </Link>{" "}
            и{" "}
            <Link to="/legal/privacy" className="text-purple-300 hover:text-purple-200 underline">
              политикой обработки персональных данных
            </Link>
            . Подтверждаю, что мне больше 14 лет или согласие даёт законный представитель.
          </span>
        </label>

        {!isFree && <PaymentSteps />}

        {displayError && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200 text-sm flex items-start gap-2">
            <Icon name="AlertCircle" size={14} className="mt-0.5 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {isFree ? (
          <button
            onClick={() => navigate("/cabinet")}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-base hover:scale-[1.01] shadow-lg shadow-purple-500/30 transition-all"
          >
            <Icon name="Rocket" size={16} />
            Активировать пробный период
          </button>
        ) : (
          <button
            onClick={handlePay}
            disabled={isLoading}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-base transition-all ${
              isLoading
                ? "bg-white/10 text-white/40 cursor-wait"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:scale-[1.01] shadow-lg shadow-purple-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Готовим оплату...
              </>
            ) : (
              <>
                <Icon name="CreditCard" size={16} />
                Оплатить {finalPrice.toLocaleString("ru-RU")} ₽
                {couponApplied && (
                  <span className="text-white/60 text-sm line-through font-normal ml-1">
                    {displayPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </>
            )}
          </button>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="ShieldCheck" size={12} className="text-emerald-400" />
            Платёж через ЮKassa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="CreditCard" size={12} className="text-purple-300" />
            Visa, Mastercard, МИР, СБП
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="RotateCcw" size={12} className="text-cyan-300" />
            Возврат по 7-дневному правилу
          </span>
        </div>
      </div>
    </div>
  );
}