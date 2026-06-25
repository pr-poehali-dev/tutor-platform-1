import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { PaymentSteps } from "@/components/courses/CheckoutBoosters";

interface Props {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  userPhone?: string | null;
  isFree: boolean;
  displayError: string | null;
  isLoading: boolean;
  finalPrice: number;
  displayPrice: number;
  couponApplied: { code: string; percent: number; finalRub: number } | null;
  onActivateFree: () => void;
  handlePay: () => void;
}

export default function CheckoutContactForm({
  name,
  setName,
  email,
  setEmail,
  agree,
  setAgree,
  userPhone,
  isFree,
  displayError,
  isLoading,
  finalPrice,
  displayPrice,
  couponApplied,
  onActivateFree,
  handlePay,
}: Props) {
  return (
    <>
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

        {userPhone && (
          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/75">
            <Icon name="Phone" size={12} className="inline mr-1.5 text-purple-300" />
            Номер: <span className="text-white font-medium">{userPhone}</span>
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
          onClick={onActivateFree}
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
    </>
  );
}
