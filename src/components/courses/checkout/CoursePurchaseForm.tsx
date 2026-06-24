import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import ZnaikaCheckoutWidget from "@/components/znaika/ZnaikaCheckoutWidget";
import {
  SocialProof,
  DiscountTimer,
  MoneyBackGuarantee,
  TrustBadges,
  SecurePaymentBadge,
  PaymentSteps,
} from "@/components/courses/CheckoutBoosters";

interface CoursePurchaseFormProps {
  course: Course;
  price: number;
  amount: number | null;
  discountPercent: number;
  isAuthenticated: boolean;
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  processing: boolean;
  demoMode: boolean;
  purchaseId: number | null;
  openLogin: () => void;
  onPay: () => void;
  onDemoConfirm: () => void;
}

export default function CoursePurchaseForm({
  course,
  price,
  amount,
  discountPercent,
  isAuthenticated,
  email,
  setEmail,
  error,
  processing,
  demoMode,
  purchaseId,
  openLogin,
  onPay,
  onDemoConfirm,
}: CoursePurchaseFormProps) {
  return (
    <>
      {/* Социальное доказательство */}
      <SocialProof courseId={course.id} popularity={course.students} />

      {/* Таймер скидки */}
      <DiscountTimer percent={discountPercent} />

      {/* Цена со скидкой */}
      <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
            −{discountPercent}% сегодня
          </span>
          <span className="text-white/45 text-xs">экономия {Math.round((amount ?? price) * discountPercent / 100 / (1 - discountPercent / 100)).toLocaleString("ru-RU")} ₽</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-white/55 text-sm">К оплате сейчас</span>
          <div className="flex items-baseline gap-2.5">
            <span className="text-white/35 text-lg line-through tabular-nums">
              {Math.round((amount ?? price) / (1 - discountPercent / 100)).toLocaleString("ru-RU")} ₽
            </span>
            <span className="font-montserrat font-black text-3xl md:text-4xl gradient-text-purple tabular-nums">
              {(amount ?? price).toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
        <p className="text-white/45 text-xs mt-2">Разовая оплата · доступ навсегда · {course.lessons} уроков</p>
      </div>

      {/* Виджет ЗНАЕК — скидка и кэшбек */}
      <ZnaikaCheckoutWidget price={amount ?? price} />

      {/* Email для чека 54-ФЗ */}
      {isAuthenticated && (
        <div className="mb-4">
          <label className="text-white/55 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 mb-2">
            <Icon name="Mail" size={12} />
            Email для чека
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ivan@example.ru"
            className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-colors"
          />
          <p className="text-white/40 text-[11px] mt-1.5">На него придёт электронный чек после оплаты (закон 54-ФЗ).</p>
        </div>
      )}

      {/* Гарантия возврата */}
      <MoneyBackGuarantee />

      {/* Подписка-альтернатива */}
      <div className="bg-purple-500/10 border border-purple-500/25 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Icon name="Sparkles" size={16} className="text-purple-300 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-white/85 font-semibold mb-1">Хочешь сразу все курсы?</p>
          <p className="text-white/55 text-xs leading-relaxed">
            Подписка от 590 ₽/мес открывает доступ ко всему каталогу и индивидуальному маршруту.{" "}
            <Link to="/pricing" className="text-purple-300 underline">Посмотреть тарифы →</Link>
          </p>
        </div>
      </div>

      {/* Простые 3 шага + защита платежа ЮKassa */}
      <PaymentSteps />
      <SecurePaymentBadge />

      {error && (
        <p className="mb-4 text-rose-300 text-sm flex items-center gap-1.5">
          <Icon name="AlertCircle" size={14} />
          {error}
        </p>
      )}

      {!isAuthenticated ? (
        <button
          onClick={openLogin}
          className="group w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-purple-500 to-cyan-500 text-white text-base font-black px-5 py-5 rounded-2xl hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/30 transition-all glow-purple"
        >
          <Icon name="LogIn" size={18} />
          Войти и купить за {(amount ?? price).toLocaleString("ru-RU")} ₽
          <Icon name="ArrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      ) : demoMode && purchaseId ? (
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 text-sm">
            <p className="font-semibold mb-1">Заказ создан, № {purchaseId}</p>
            <p className="text-amber-200/80 text-xs">
              ЮKassa временно не подключена — активируй доступ вручную для демонстрации.
            </p>
          </div>
          <button
            onClick={onDemoConfirm}
            disabled={processing}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {processing ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="CheckCircle2" size={16} />}
            Активировать доступ
          </button>
        </div>
      ) : (
        <button
          onClick={onPay}
          disabled={processing}
          className="group w-full relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-purple-500 to-cyan-500 text-white text-base font-black px-5 py-5 rounded-2xl hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/30 transition-all disabled:opacity-60 disabled:hover:scale-100 glow-purple"
        >
          {processing ? (
            <Icon name="Loader2" size={18} className="animate-spin" />
          ) : (
            <>
              <Icon name="CreditCard" size={18} />
              Купить за {(amount ?? price).toLocaleString("ru-RU")} ₽
              <Icon name="ArrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      )}

      <TrustBadges />

      <p className="text-white/35 text-[11px] text-center mt-4 leading-relaxed">
        Оплачивая, ты соглашаешься с{" "}
        <Link to="/legal/offer" className="text-purple-300/70 hover:text-purple-200 underline">офертой</Link>{" "}
        и{" "}
        <Link to="/legal/privacy" className="text-purple-300/70 hover:text-purple-200 underline">политикой обработки данных</Link>.
      </p>
    </>
  );
}
