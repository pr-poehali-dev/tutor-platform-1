import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const PENDING_KEY = "uchispro_trial_pending_v1";
const HERO_IMG = "https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/ffeb04f8-8c69-4da8-8c6f-a352b52a50e7.jpg";

const POINTS = [
  "Все предметы 1–11 класса, ОГЭ и ЕГЭ",
  "Объясняет по шагам, голосом и текстом — 24/7",
  "Проверяет домашку по фото, родитель видит прогресс",
];

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

/** Первый экран для родителей школьников: одна кнопка — 7 дней ИИ-репетитора без карты. */
export default function TrialHero() {
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const { hasSubscription, tutorTrial, startTutorTrial, loading } = useAccess();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resumed = useRef(false);

  const activate = async () => {
    setBusy(true);
    setError(null);
    const r = await startTutorTrial("home_hero");
    setBusy(false);
    try { sessionStorage.removeItem(PENDING_KEY); } catch { /* noop */ }
    if (!r.ok) { setError(r.message || "Не получилось включить пробную неделю"); return; }
    if (!r.already) trackGoal("tutor_trial_start", { source: "home_hero" });
    navigate("/tutor?trial=1");
  };

  // Вернулся после входа — включаем неделю сам, без второго нажатия.
  useEffect(() => {
    let pending = false;
    try { pending = sessionStorage.getItem(PENDING_KEY) === "1"; } catch { /* noop */ }
    if (isAuthenticated && pending && !loading && !resumed.current) {
      resumed.current = true;
      activate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading]);

  const onClick = () => {
    trackGoal("tutor_trial_click", { source: "home_hero" });
    if (hasSubscription || tutorTrial.active) { navigate("/tutor"); return; }
    if (!isAuthenticated) {
      try { sessionStorage.setItem(PENDING_KEY, "1"); } catch { /* noop */ }
      openLogin();
      return;
    }
    activate();
  };

  const trialEnded = tutorTrial.used && !tutorTrial.active && !hasSubscription;
  const label = hasSubscription
    ? "Открыть репетитора"
    : tutorTrial.active
      ? `Продолжить — бесплатно до ${fmtDate(tutorTrial.until)}`
      : trialEnded
        ? "Открыть репетитора"
        : "Попробовать 7 дней бесплатно";

  return (
    <section id="hero" className="relative px-4 pt-6 md:pt-12 pb-10 md:pb-14">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100 mb-4">
            <Icon name="GraduationCap" size={13} /> Для родителей школьников
          </span>
          <h1 className="font-montserrat font-black text-[2rem] sm:text-5xl lg:text-[3.4rem] leading-[1.05] mb-4">
            ИИ-репетитор —{" "}
            <span className="gradient-text-purple">7 дней бесплатно</span>,{" "}
            без карты
          </h1>
          <p className="text-white/75 text-base md:text-lg mb-5 max-w-xl mx-auto lg:mx-0">
            Ребёнок занимается когда удобно, а вы видите, какие темы он понял. Понравится — подписка 1 490 ₽ в месяц за все предметы.
          </p>
          <ul className="space-y-2 mb-7 max-w-md mx-auto lg:mx-0 text-left">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm md:text-base text-white/85">
                <Icon name="Check" size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>

          <button
            onClick={onClick}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.99] transition-transform disabled:opacity-70"
          >
            {busy ? <Icon name="Loader2" size={20} className="animate-spin" /> : <Icon name="Sparkles" size={20} />}
            {busy ? "Включаю неделю…" : label}
          </button>
          {error && <p className="text-rose-300 text-sm mt-3">{error}</p>}
          <p className="text-white/50 text-xs mt-3">
            {trialEnded
              ? "Пробная неделя уже использована на этом аккаунте."
              : "Карта не нужна · списаний не будет · отключать ничего не надо"}
          </p>
        </div>

        <div className="lg:col-span-5 hidden sm:block">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] lg:aspect-[4/5]">
            <img src={HERO_IMG} alt="Школьница занимается с ИИ-репетитором дома" loading="eager" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1f] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/50 backdrop-blur border border-white/10 p-3 text-sm">
              <p className="text-white/60 text-xs mb-1">Пример вопроса</p>
              <p className="text-white font-semibold">«Объясни, как решать задачи на проценты»</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
