import Icon from "@/components/ui/icon";

interface Props {
  coupon: string;
  setCoupon: (v: string) => void;
  couponApplied: { code: string; percent: number; finalRub: number } | null;
  couponChecking: boolean;
  couponError: string | null;
  setCouponError: (v: string | null) => void;
  handleApplyCoupon: () => void;
  removeCoupon: () => void;
}

export default function CheckoutCouponForm({
  coupon,
  setCoupon,
  couponApplied,
  couponChecking,
  couponError,
  setCouponError,
  handleApplyCoupon,
  removeCoupon,
}: Props) {
  return (
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
  );
}
