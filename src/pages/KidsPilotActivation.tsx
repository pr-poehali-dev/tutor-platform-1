import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import {
  CARE_PATH,
  CARE_PROMO,
  KIDS_FACTS,
  KIDS_PILOT_PATH,
  KIDS_PROMO,
  KIDS_PROMO_UNTIL,
} from "@/data/kidsPilot";

type Mode = "kindergarten" | "care";

const CONFIG: Record<Mode, {
  promo: string;
  path: string;
  badge: string;
  title: string;
  accent: string;
  lead: string;
  included: { icon: string; text: string }[];
  seoTitle: string;
  seoDesc: string;
}> = {
  kindergarten: {
    promo: KIDS_PROMO,
    path: KIDS_PILOT_PATH,
    badge: "Пилотный проект детских садов",
    title: "«Малыш» —",
    accent: "бесплатно до 31 мая 2027",
    lead: "Ваш детский сад участвует в пилотном проекте УЧИСЬПРО. Активируйте промокод — и занимайтесь с ребёнком дома весь учебный год без оплаты.",
    included: [
      { icon: "Sparkles", text: `${KIDS_FACTS.lessons} развивающих занятий для детей ${KIDS_FACTS.ages}: речь, логика, моторика, окружающий мир` },
      { icon: "BookOpen", text: `Библиотека: ${KIDS_FACTS.tales} сказки и стихи с озвучкой, песенки и потешки` },
      { icon: "Type", text: `Обучение чтению: ${KIDS_FACTS.readingSteps} ступенек от звуков до предложений` },
      { icon: "Gamepad2", text: `${KIDS_FACTS.games} игр на внимание, память и логику` },
      { icon: "ShieldCheck", text: "Без рекламы, с контролем экранного времени по СанПиН" },
    ],
    seoTitle: "Пилотный проект «Малыш» для детских садов: активация промокода МАЛЫШ",
    seoDesc: "Страница для родителей детских садов — участников пилотного проекта УЧИСЬПРО. Промокод МАЛЫШ открывает раздел «Малыш» бесплатно до 31.05.2027.",
  },
  care: {
    promo: CARE_PROMO,
    path: CARE_PATH,
    badge: "Программа «Каждый ребёнок»",
    title: "Всё обучение —",
    accent: "бесплатно и без срока",
    lead: "Для воспитанников детских домов, школ-интернатов и центров содействия семейному устройству. Мы убеждены: каждый ребёнок достоин хорошего образования.",
    included: [
      { icon: "Baby", text: `Раздел «Малыш» для детей ${KIDS_FACTS.ages}: занятия, сказки, игры, обучение чтению` },
      { icon: "BookOpen", text: "Все курсы раздела «Школьникам»: 1–11 класс, подготовка к ОГЭ и ЕГЭ" },
      { icon: "GraduationCap", text: "ИИ-наставник по школьным предметам 24/7 — объясняет, а не решает за ребёнка" },
      { icon: "Infinity", text: "Без ограничения срока — доступ не закончится" },
      { icon: "ShieldCheck", text: "Без рекламы и платежей" },
    ],
    seoTitle: "Программа «Каждый ребёнок»: бесплатное обучение для детских домов и интернатов",
    seoDesc: "УЧИСЬПРО бесплатно и без ограничения срока для детских домов, школ-интернатов и центров содействия семейному устройству.",
  },
};

function formatDate(iso: string | null | undefined, fallback: string) {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (d.getFullYear() > 2090) return null;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Moscow" });
}

export default function KidsPilotActivation({ mode = "kindergarten" }: { mode?: Mode }) {
  const cfg = CONFIG[mode];
  const { isAuthenticated, openLogin } = useAuth();
  const { kids, redeemAccessCode } = useAccess();
  const [code, setCode] = useState(cfg.promo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneUntil, setDoneUntil] = useState<string | null>(null);

  const promoActive = kids.access && kids.source === "promo";
  const activeUntil = doneUntil || (promoActive ? kids.expiresAt : null);
  const until = formatDate(activeUntil, KIDS_PROMO_UNTIL);

  const activate = async () => {
    setError(null);
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setBusy(true);
    const res = await redeemAccessCode(code.trim());
    setBusy(false);
    if (!res.ok) {
      setError(res.message || "Не удалось активировать промокод");
      return;
    }
    trackGoal(mode === "care" ? "care_promo_activated" : "kids_promo_activated", { already: !!res.alreadyActive });
    setDoneUntil(res.expiresAt || "2027-05-31T23:59:59+03:00");
  };

  return (
    <div className="min-h-screen bg-mesh text-white font-golos">
      <Seo title={cfg.seoTitle} description={cfg.seoDesc} canonical={`https://учисьпро.рф${cfg.path}`} noindex />

      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 flex items-center justify-center text-lg">🦊</div>
            <span className="font-montserrat font-black gradient-text-purple">УЧИСЬПРО</span>
          </Link>
          <Link to="/kids" className="text-sm font-bold text-pink-200 hover:text-white transition-colors">Малыш</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 md:py-12">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Главная", href: "/" },
            { label: "Малыш", href: "/kids" },
            { label: cfg.badge, href: cfg.path },
          ]}
        />
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-500/15 border border-pink-400/35 rounded-full px-4 py-1.5 mb-5">
            <Icon name={mode === "care" ? "HeartHandshake" : "Baby"} size={13} className="text-pink-200" />
            <span className="text-xs text-pink-100 font-bold uppercase tracking-wider">{cfg.badge}</span>
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-5xl leading-tight mb-4">
            {cfg.title}{" "}
            <span className="bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">{cfg.accent}</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">{cfg.lead}</p>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-8 mb-8">
          {activeUntil ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle2" size={30} className="text-emerald-400" />
              </div>
              <h2 className="font-montserrat font-black text-2xl mb-2">Доступ открыт</h2>
              <p className="text-white/70 mb-6">
                {until ? (
                  <>Раздел «Малыш» бесплатен для вас до <b className="text-white">{until}</b>.</>
                ) : (
                  <>«Малыш» и курсы «Школьникам» открыты <b className="text-white">без ограничения срока</b>.</>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/kids" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black py-3.5 px-6 rounded-xl hover:scale-[1.02] transition-transform">
                  <Icon name="Sparkles" size={18} /> Начать занятия
                </Link>
                {mode === "care" ? (
                  <Link to="/courses" className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-xl transition-colors">
                    <Icon name="BookOpen" size={18} /> Курсы для школьников
                  </Link>
                ) : (
                  <Link to="/kids/cabinet" className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-xl transition-colors">
                    <Icon name="UserCircle" size={18} /> Кабинет родителя
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-montserrat font-black text-xl mb-1 flex items-center gap-2">
                <Icon name="Ticket" size={20} className="text-amber-300" /> Активация промокода
              </h2>
              <p className="text-white/55 text-sm mb-5">
                {isAuthenticated ? "Промокод уже подставлен — нажмите кнопку." : "Сначала войдите или зарегистрируйтесь — это займёт минуту."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                  className="flex-1 rounded-xl bg-background/70 border border-white/15 px-4 py-3.5 font-mono font-bold tracking-widest text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-pink-400"
                  placeholder="ПРОМОКОД"
                  aria-label="Промокод"
                />
                <button
                  onClick={activate}
                  disabled={busy || !code.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black py-3.5 px-6 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
                >
                  {busy ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name={isAuthenticated ? "Unlock" : "LogIn"} size={18} />}
                  {isAuthenticated ? "Активировать" : "Войти и активировать"}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-rose-300 flex items-center gap-1.5">
                  <Icon name="CircleAlert" size={15} /> {error}
                </p>
              )}
            </>
          )}
        </div>

        <section className="mb-8">
          <h2 className="font-montserrat font-black text-xl mb-4">Что входит</h2>
          <div className="space-y-3">
            {cfg.included.map((i) => (
              <div key={i.text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/25 to-amber-400/25 flex items-center justify-center flex-shrink-0">
                  <Icon name={i.icon} size={19} className="text-pink-200" />
                </div>
                <p className="text-white/80 text-sm md:text-base pt-2">{i.text}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-white/45 text-sm text-center">
          Карта не нужна, оплата не спишется. Вопросы — напишите нам через{" "}
          <Link to="/contacts" className="text-pink-200 hover:underline">форму обратной связи</Link>.
        </p>
      </main>
    </div>
  );
}
