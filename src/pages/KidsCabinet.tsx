import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { useKidsProgress } from "@/components/kids/useKidsProgress";
import ParentGate from "@/components/kids/ParentGate";
import ParentSettingsModal from "@/components/kids/ParentSettingsModal";
import { KIDS_MONTHLY_PRICE, KIDS_TRIAL_MONTHS, kidsTrialTimeLeft } from "@/components/promo/kidsPromoConfig";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Родительский кабинет модуля «Малыш».
 *
 * Отдельный от общего /cabinet: у детского раздела своя подписка, свой срок
 * и свои настройки (PIN, экранное время, возраст). Смешивать это с ЕГЭ
 * и курсами для взрослых незачем — родитель дошкольника туда не ходит.
 */
export default function KidsCabinet() {
  const { user, isAuthenticated, loading: authLoading, openLogin } = useAuth();
  const { kids, startKidsTrial, refreshAccess } = useAccess();
  const { progress } = useKidsProgress();
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) refreshAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleTrial = async () => {
    setBusy(true);
    const res = await startKidsTrial();
    setBusy(false);
    if (res.ok) trackGoal("kids_trial_started", { place: "cabinet" });
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Кабинет родителя — УЧИСЬПРО Малыш"
        description="Абонемент «Малыш», прогресс ребёнка и родительские настройки."
        noindex
      />
      <main className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-8 pb-16">{children}</main>
      <SiteFooter />
    </div>
  );

  if (authLoading) {
    return shell(
      <div className="text-center py-20">
        <Icon name="Loader2" size={28} className="animate-spin text-pink-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return shell(
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-5xl mb-4">🧸</div>
        <h1 className="font-montserrat font-black text-2xl mb-2">Кабинет родителя</h1>
        <p className="text-white/65 text-sm mb-5">
          Войдите, чтобы открыть занятия и видеть прогресс ребёнка.
        </p>
        <button
          onClick={openLogin}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm"
        >
          <Icon name="LogIn" size={16} /> Войти
        </button>
      </div>
    );
  }

  const tl = kidsTrialTimeLeft(kids.expiresAt);
  const isTrial = kids.source === "trial";

  return shell(
    <>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-pink-300 text-xs font-bold uppercase tracking-widest mb-1">
            УЧИСЬПРО Малыш
          </p>
          <h1 className="font-montserrat font-black text-3xl">
            Кабинет родителя{user?.name ? `, ${user.name}` : ""}
          </h1>
        </div>
        <Link
          to="/kids"
          className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm"
        >
          <Icon name="ArrowLeft" size={14} /> К занятиям
        </Link>
      </div>

      {/* Статус доступа */}
      {kids.access ? (
        <div
          className={`rounded-3xl border p-6 mb-6 ${
            isTrial
              ? "border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-teal-500/10"
              : "border-pink-400/30 bg-gradient-to-br from-pink-500/15 to-rose-500/10"
          }`}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/55 text-xs uppercase tracking-wider font-bold mb-1.5">
                Абонемент
              </p>
              <h2 className="font-montserrat font-black text-2xl mb-1">
                {isTrial ? "Бесплатный период" : "Малыш — активен"}
              </h2>
              <p className="text-white/70 text-sm">
                {tl.expired
                  ? "Срок закончился"
                  : `Осталось ${tl.days} дн. ${String(tl.hours).padStart(2, "0")} ч.`}
              </p>
            </div>
            {isTrial && (
              <Link
                to="/checkout/kids"
                onClick={() => trackGoal("kids_checkout_click", { place: "cabinet" })}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm px-5 py-3 rounded-xl"
              >
                Продолжить за {KIDS_MONTHLY_PRICE} ₽/мес
              </Link>
            )}
          </div>
          {isTrial && (
            <p className="text-white/45 text-xs mt-4">
              Оплата не спишется автоматически — карта не привязана. Когда период закончится,
              решите сами, продолжать или нет.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 mb-6">
          <h2 className="font-montserrat font-black text-2xl mb-2">
            {kids.trialUsed ? "Бесплатный период закончился" : `Первые ${KIDS_TRIAL_MONTHS} месяца бесплатно`}
          </h2>
          <p className="text-white/70 text-sm mb-5">
            {kids.trialUsed
              ? `Оформите абонемент, чтобы продолжить занятия — ${KIDS_MONTHLY_PRICE} ₽ в месяц.`
              : "Все занятия, сказки, игры и обучение чтению. Карта не нужна."}
          </p>
          {kids.trialUsed ? (
            <Link
              to="/checkout/kids"
              onClick={() => trackGoal("kids_checkout_click", { place: "cabinet" })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black px-6 py-3.5 rounded-2xl"
            >
              <Icon name="Heart" size={18} /> Оформить за {KIDS_MONTHLY_PRICE} ₽
            </Link>
          ) : (
            <button
              onClick={handleTrial}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black px-6 py-3.5 rounded-2xl disabled:opacity-60"
            >
              {busy ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : (
                <Icon name="Gift" size={18} />
              )}
              Открыть бесплатно
            </button>
          )}
        </div>
      )}

      {/* Прогресс ребёнка */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <Icon name="Star" size={20} className="text-amber-300 mb-2" />
          <p className="font-montserrat font-black text-3xl">{progress?.stars ?? 0}</p>
          <p className="text-white/50 text-xs mt-0.5">звёздочек собрано</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <Icon name="CheckCircle2" size={20} className="text-emerald-300 mb-2" />
          <p className="font-montserrat font-black text-3xl">
            {progress?.completedActivities?.length ?? 0}
          </p>
          <p className="text-white/50 text-xs mt-0.5">занятий пройдено</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <Icon name="Flame" size={20} className="text-orange-300 mb-2" />
          <p className="font-montserrat font-black text-3xl">{progress?.streakDays ?? 0}</p>
          <p className="text-white/50 text-xs mt-0.5">дней подряд</p>
        </div>
      </div>

      {/* Настройки родителя */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-montserrat font-bold text-lg mb-1">Родительский контроль</h2>
            <p className="text-white/60 text-sm">
              Возраст ребёнка, лимит экранного времени по СанПиН, время сна и PIN-код.
            </p>
          </div>
          <button
            onClick={() => setGateOpen(true)}
            className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Icon name="Settings" size={15} /> Настроить
          </button>
        </div>
      </div>

      {/* Разделы */}
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { to: "/kids/library", icon: "BookOpen", title: "Сказки", desc: "С озвучкой" },
          { to: "/kids/reading", icon: "Type", title: "Чтение", desc: "Буквы и слоги" },
          { to: "/kids/games", icon: "Gamepad2", title: "Игры", desc: "Развивающие" },
          { to: "/kids/songs", icon: "Music", title: "Песенки", desc: "С мультиками" },
        ].map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/25 p-4 flex items-center gap-3 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-pink-500/15 border border-pink-400/25 flex items-center justify-center shrink-0">
              <Icon name={s.icon} size={19} className="text-pink-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{s.title}</p>
              <p className="text-white/50 text-xs">{s.desc}</p>
            </div>
            <Icon
              name="ChevronRight"
              size={16}
              className="text-white/30 group-hover:text-white/60 transition-colors"
            />
          </Link>
        ))}
      </div>

      {gateOpen && (
        <ParentGate
          title="Настройки родителя"
          description="Подтвердите, что вы взрослый. Это защита по 436-ФЗ."
          onPass={() => {
            setGateOpen(false);
            setSettingsOpen(true);
          }}
          onCancel={() => setGateOpen(false)}
        />
      )}
      {settingsOpen && <ParentSettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}