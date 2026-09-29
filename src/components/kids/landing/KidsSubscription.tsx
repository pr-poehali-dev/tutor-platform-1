import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { KIDS_MONTHLY_PRICE, KIDS_TRIAL_MONTHS } from "@/components/promo/kidsPromoConfig";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Блок абонемента «Малыш» на лендинге.
 *
 * Первый шаг для родителя — бесплатные 3 месяца без карты, а не оплата.
 * Раньше предлагалось «3 месяца за 1 ₽»: даже рубль требует ввода карты,
 * и на этом шаге терялась часть родителей.
 */
export default function KidsSubscription() {
  const { isAuthenticated, openLogin } = useAuth();
  const { kids, startKidsTrial } = useAccess();
  const [busy, setBusy] = useState(false);

  const handleTrial = async () => {
    if (!isAuthenticated) {
      trackGoal("kids_trial_login_required", { place: "landing" });
      openLogin();
      return;
    }
    setBusy(true);
    const res = await startKidsTrial();
    setBusy(false);
    if (res.ok) trackGoal("kids_trial_started", { place: "landing" });
  };

  // Доступ уже есть — вместо продажи показываем путь к занятиям.
  if (kids.access) {
    return (
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-12">
        <div className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-600/20 via-teal-500/10 to-cyan-500/10 p-6 md:p-8 text-center">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
            Доступ открыт — можно заниматься
          </h2>
          <p className="text-white/70 text-sm md:text-base mb-6">
            {kids.source === "trial"
              ? "Идёт бесплатный период. Оплата сама не спишется — карта не привязана."
              : "Абонемент «Малыш» активен."}
          </p>
          <Link
            to="/kids/cabinet"
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold px-6 py-3 rounded-2xl transition-colors"
          >
            <Icon name="UserCircle" size={18} />
            Кабинет родителя
          </Link>
        </div>
      </section>
    );
  }

  const trialUsed = kids.trialUsed;

  return (
    <section
      className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-16"
      aria-labelledby="kids-sub-title"
    >
      <div className="relative overflow-hidden rounded-3xl border border-pink-400/30 bg-gradient-to-br from-pink-600/25 via-rose-500/15 to-amber-500/15 p-6 md:p-10">
        <div
          className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3.5 py-1 mb-4">
            <Icon name="Gift" size={13} className="text-emerald-200" />
            <span className="text-[11px] text-white font-black uppercase tracking-wider">
              {trialUsed
                ? `Абонемент · ${KIDS_MONTHLY_PRICE} ₽/мес`
                : `Первые ${KIDS_TRIAL_MONTHS} месяца бесплатно`}
            </span>
          </div>

          <h2
            id="kids-sub-title"
            className="font-montserrat font-black text-3xl md:text-4xl text-white leading-tight mb-3"
          >
            Абонемент «Малыш» — всё для развития ребёнка
          </h2>
          <p className="text-white/75 text-sm md:text-base max-w-2xl mb-6">
            Сказки с озвучкой, обучение чтению, развивающие игры, песни и занятия по методикам
            Монтессори.{" "}
            {trialUsed
              ? `Всего ${KIDS_MONTHLY_PRICE} ₽ в месяц, отменить можно в любой момент.`
              : `Первые ${KIDS_TRIAL_MONTHS} месяца — бесплатно, карта не нужна. Дальше ${KIDS_MONTHLY_PRICE} ₽ в месяц, если захотите продолжить.`}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-7">
            <div>
              {trialUsed ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-montserrat font-black text-5xl text-white">
                    {KIDS_MONTHLY_PRICE}
                  </span>
                  <span className="text-white/80 text-lg">₽ в месяц</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-montserrat font-black text-5xl text-white">0</span>
                    <span className="text-white/80 text-lg">₽ за {KIDS_TRIAL_MONTHS} месяца</span>
                  </div>
                  <p className="text-white/55 text-sm mt-1">далее {KIDS_MONTHLY_PRICE} ₽/мес</p>
                </>
              )}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 flex-1">
              {[
                "Все занятия и аудиосказки",
                "Игры, песни, обучение чтению",
                "Контроль экранного времени",
                "Советы родителям",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/85">
                  <Icon name="Check" size={14} className="text-emerald-300 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {trialUsed ? (
            <Link
              to="/checkout/kids"
              onClick={() => trackGoal("kids_checkout_click", { place: "landing" })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-base px-7 py-4 rounded-2xl hover:opacity-95 transition-opacity shadow-lg shadow-pink-500/25"
            >
              <Icon name="Heart" size={18} />
              Оформить за {KIDS_MONTHLY_PRICE} ₽
              <Icon name="ArrowRight" size={18} />
            </Link>
          ) : (
            <button
              onClick={handleTrial}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base px-7 py-4 rounded-2xl hover:opacity-95 transition-opacity shadow-lg shadow-emerald-500/25 disabled:opacity-60"
            >
              {busy ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : (
                <Icon name="Gift" size={18} />
              )}
              {isAuthenticated ? "Открыть бесплатно" : "Войти и открыть бесплатно"}
              <Icon name="ArrowRight" size={18} />
            </button>
          )}

          <div className="mt-4 flex items-center gap-2 text-white/50 text-xs">
            <Icon name="ShieldCheck" size={14} className="text-emerald-300" />
            {trialUsed
              ? "Безопасная оплата через ЮKassa, чек по 54-ФЗ. Без скрытых платежей."
              : "Карта не нужна. Ничего не спишется автоматически."}
          </div>
        </div>
      </div>
    </section>
  );
}
