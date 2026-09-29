import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useKidsAccess } from "@/components/kids/useKidsAccess";
import { KIDS_MONTHLY_PRICE, KIDS_TRIAL_MONTHS } from "@/components/promo/kidsPromoConfig";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  onClose: () => void;
}

/**
 * Окно доступа к модулю «Малыш».
 *
 * Показывается, когда демонстрационное занятие уже использовано.
 * Первый шаг — не оплата, а бесплатные 3 месяца: карта не нужна,
 * достаточно войти. Оплату предлагаем только тем, кто этот период
 * уже израсходовал.
 */
export default function KidsPaywall({ onClose }: Props) {
  const { isAuthenticated, openLogin } = useAuth();
  const { trialUsed, startKidsTrial } = useKidsAccess();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrial = async () => {
    if (!isAuthenticated) {
      trackGoal("kids_trial_login_required");
      openLogin();
      return;
    }
    setBusy(true);
    setError(null);
    const res = await startKidsTrial();
    setBusy(false);
    if (res.ok) {
      trackGoal("kids_trial_started");
      onClose();
    } else {
      setError(res.message || "Не удалось включить доступ");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full rounded-3xl border border-pink-400/30 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 p-6 md:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
        >
          <Icon name="X" size={16} />
        </button>

        <div className="text-5xl mb-3">🧸</div>

        {!trialUsed ? (
          <>
            <h2 className="font-montserrat font-black text-2xl text-white mb-2">
              Первые {KIDS_TRIAL_MONTHS} месяца — бесплатно
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-5">
              Все занятия, сказки с озвучкой, игры и обучение чтению.
              Карта не нужна, платить сейчас ничего не надо — просто начните заниматься.
            </p>

            <button
              onClick={handleTrial}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base px-6 py-4 rounded-2xl hover:opacity-95 transition-opacity shadow-lg shadow-emerald-500/25 mb-3 disabled:opacity-60"
            >
              {busy ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : (
                <Icon name="Gift" size={18} />
              )}
              {isAuthenticated ? "Открыть бесплатно на 3 месяца" : "Войти и открыть бесплатно"}
            </button>

            <p className="text-white/45 text-xs mb-1">
              Через {KIDS_TRIAL_MONTHS} месяца — {KIDS_MONTHLY_PRICE} ₽ в месяц, если захотите продолжить.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-montserrat font-black text-2xl text-white mb-2">
              Бесплатный период закончился
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-5">
              Чтобы продолжить занятия, оформите абонемент «Малыш» —
              всего {KIDS_MONTHLY_PRICE} ₽ в месяц. Отменить можно в любой момент.
            </p>

            <Link
              to="/checkout/kids"
              onClick={() => trackGoal("kids_checkout_click", { place: "paywall" })}
              className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-base px-6 py-4 rounded-2xl hover:opacity-95 transition-opacity shadow-lg shadow-pink-500/25 mb-3"
            >
              <Icon name="Heart" size={18} />
              Оформить за {KIDS_MONTHLY_PRICE} ₽
              <Icon name="ArrowRight" size={18} />
            </Link>
          </>
        )}

        {error && <p className="text-rose-300 text-xs mb-2">{error}</p>}

        <button
          onClick={onClose}
          className="text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          Не сейчас
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
          <Icon name="ShieldCheck" size={13} className="text-emerald-400" />
          Без скрытых платежей. Оплата защищена ЮKassa.
        </div>
      </div>
    </div>
  );
}
