import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Course } from "@/components/courses/coursesData";
import {
  SecurePaymentBadge,
  CourseValueBlock,
  SocialProof,
  MoneyBackGuarantee,
  PaymentSteps,
} from "@/components/courses/CheckoutBoosters";

interface CoursePurchaseFormProps {
  course: Course;
  price: number;
  amount: number | null;
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
      {/* Цена */}
      <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-white/55 text-sm">К оплате</span>
          <span className="font-montserrat font-black text-3xl md:text-4xl gradient-text-purple tabular-nums">
            {(amount ?? price).toLocaleString("ru-RU")} ₽
          </span>
        </div>
        <p className="text-white/45 text-xs mt-2">Разовая оплата · доступ навсегда · {course.lessons} уроков</p>
      </div>

      {/* Обоснование ценности и доверие — ДО кнопки, чтобы снять страх покупки */}
      <CourseValueBlock lessons={course.lessons} />
      <SocialProof courseId={course.id} popularity={course.students} />
      <PaymentSteps />
      <MoneyBackGuarantee />

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

      {/* Защита платежа ЮKassa */}
      <div className="mt-4">
        <SecurePaymentBadge />
      </div>

      <p className="text-white/35 text-[11px] text-center mt-4 leading-relaxed">
        Оплачивая, ты соглашаешься с{" "}
        <Link to="/legal/offer" className="text-purple-300/70 hover:text-purple-200 underline">офертой</Link>{" "}
        и{" "}
        <Link to="/legal/privacy" className="text-purple-300/70 hover:text-purple-200 underline">политикой обработки данных</Link>.
      </p>
    </>
  );
}