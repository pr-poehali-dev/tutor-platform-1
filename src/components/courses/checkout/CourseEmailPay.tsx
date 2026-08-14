import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useYookassa, isValidEmail } from "@/components/extensions/yookassa/useYookassa";
import { setPaidEmail } from "@/components/intensive/api";
import type { Course } from "@/components/courses/coursesData";
import {
  CourseValueBlock,
  SocialProof,
  PaymentSteps,
  MoneyBackGuarantee,
  SecurePaymentBadge,
} from "@/components/courses/CheckoutBoosters";
import { ACTIVE_PROMO_CODE } from "@/components/checkout/CheckoutCouponForm";
import func2url from "../../../../backend/func2url.json";

const YOOKASSA_URL = (func2url as Record<string, string>)["yookassa-yookassa"];
const ACCESS_URL = (func2url as Record<string, string>)["access"];

interface Props {
  course: Course;
  price: number;
}

/**
 * Оплата платного курса по email без обязательного логина.
 * Переиспользует механизм интенсива: после оплаты webhook (kind='intensive')
 * пишет доступ в intensive_access с track=`course-${id}`.
 */
export default function CourseEmailPay({ course, price }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  // Промокод для покупателя без входа. Раньше эта форма скидку не поддерживала:
  // гость платил полную цену, даже когда действовала скидка 30%.
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; percent: number; finalRub: number } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { createPayment, isLoading, error } = useYookassa({ apiUrl: YOOKASSA_URL });

  const track = `course-${course.id}`;
  const finalPrice = couponApplied ? couponApplied.finalRub : price;

  const applyCoupon = async (raw?: string) => {
    const code = (raw ?? coupon).trim();
    if (!code) return;
    setCouponChecking(true);
    setCouponError(null);
    try {
      const res = await fetch(`${ACCESS_URL}?action=validate_coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon_code: code, amount_rub: price }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.message || "Промокод не найден или недействителен");
        return;
      }
      setCouponApplied({
        code: code.toUpperCase(),
        percent: data.percent ?? 0,
        finalRub: data.final_rub ?? price,
      });
    } catch {
      setCouponError("Не удалось проверить промокод, попробуй ещё раз");
    } finally {
      setCouponChecking(false);
    }
  };

  const handlePay = async () => {
    setLocalError(null);
    if (!isValidEmail(email)) {
      setLocalError("Введи корректный email — на него придёт чек и доступ");
      return;
    }
    if (!agree) {
      setLocalError("Подтверди согласие с условиями");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    setPaidEmail(cleanEmail, track);
    const returnUrl = `${window.location.origin}/course-checkout/${course.id}?paid=1`;
    const res = await createPayment({
      amount: finalPrice,
      userEmail: cleanEmail,
      userName: name.trim(),
      description: `Курс «${course.title}»`,
      returnUrl,
      cartItems: [
        { id: `course-${course.id}`, name: course.title, price: finalPrice, quantity: 1 },
      ],
      metadata: {
        kind: "intensive",
        email: cleanEmail,
        name: name.trim(),
        track,
      },
    });
    if (res?.payment_url && /^https:\/\//.test(res.payment_url)) {
      window.location.href = res.payment_url;
    }
  };

  const displayError = localError || (error ? error.message : null);

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
      <div className="flex items-end gap-3 mb-1 flex-wrap">
        <span className="font-montserrat font-black text-4xl md:text-5xl text-white">
          {finalPrice.toLocaleString("ru-RU")} ₽
        </span>
        {couponApplied && (
          <span className="flex items-center gap-2 pb-1.5">
            <span className="text-white/35 text-xl line-through">{price.toLocaleString("ru-RU")} ₽</span>
            <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold rounded-lg px-2 py-1">
              −{couponApplied.percent}%
            </span>
          </span>
        )}
      </div>
      <p className="text-white/50 text-xs mb-5">
        Доступ навсегда · оплата картой или СБП · чек по 54-ФЗ
      </p>

      {/* Скидка для покупателя без входа: подставляем действующий промокод одним нажатием */}
      {couponApplied ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 mb-5">
          <span className="flex items-center gap-2 min-w-0">
            <Icon name="CheckCircle2" size={16} className="text-emerald-400 flex-shrink-0" />
            <span className="font-mono font-bold text-white text-sm tracking-wider truncate">
              {couponApplied.code}
            </span>
            <span className="text-emerald-300 text-xs font-bold whitespace-nowrap">применён</span>
          </span>
          <button
            onClick={() => { setCouponApplied(null); setCoupon(""); setCouponError(null); }}
            className="text-white/50 hover:text-white text-xs font-medium flex-shrink-0"
          >
            Убрать
          </button>
        </div>
      ) : (
        <div className="mb-5">
          <button
            onClick={() => { setCoupon(ACTIVE_PROMO_CODE); applyCoupon(ACTIVE_PROMO_CODE); }}
            disabled={couponChecking}
            className="w-full flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/15 disabled:opacity-60 px-4 py-3 text-left transition-colors"
          >
            <span className="text-xl leading-none">🎒</span>
            <span className="min-w-0 flex-1">
              <span className="block text-white font-bold text-sm">К учебному году — скидка 30%</span>
              <span className="block text-white/55 text-xs mt-0.5">
                Промокод{" "}
                <span className="font-mono font-bold text-amber-300 tracking-wider">{ACTIVE_PROMO_CODE}</span>
                {" "}— нажми, чтобы применить
              </span>
            </span>
            {couponChecking
              ? <Icon name="Loader2" size={16} className="text-amber-300 animate-spin flex-shrink-0" />
              : <Icon name="ChevronRight" size={16} className="text-amber-300 flex-shrink-0" />}
          </button>
          {couponError && (
            <p className="text-rose-300 text-xs mt-2 flex items-center gap-1.5">
              <Icon name="AlertCircle" size={12} />
              {couponError}
            </p>
          )}
        </div>
      )}

      {/* Ценность и доверие — ДО формы, чтобы снять страх перед оплатой */}
      <CourseValueBlock lessons={course.lessons} />
      <SocialProof lessons={course.lessons} duration={course.duration} />
      <PaymentSteps />
      <MoneyBackGuarantee />

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя (необязательно)"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email для чека и доступа"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
      </div>

      <label className="flex items-start gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 accent-purple-500"
        />
        <span className="text-white/45 text-xs">
          Согласен с условиями оферты и обработкой персональных данных
        </span>
      </label>

      {displayError && <div className="mt-3 text-rose-300 text-xs">{displayError}</div>}

      <button
        onClick={handlePay}
        disabled={isLoading}
        className={`mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${course.color} text-white font-bold py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform`}
      >
        {isLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="CreditCard" size={18} />}
        {isLoading ? "Переходим к оплате..." : "Оплатить и получить доступ"}
      </button>

      <div className="mt-4">
        <SecurePaymentBadge />
      </div>
    </div>
  );
}