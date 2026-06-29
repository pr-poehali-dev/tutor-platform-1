import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import AITeacher from "@/components/AITeacher";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { isPromoActive } from "@/components/promo/dobroConfig";
import type { SuperCourse } from "@/components/teacher/superCourses";

const CANONICAL = "https://xn--h1agdcde2c.xn--p1ai/super-courses";

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Супер-курсы УЧИСЬПРО — физика, математика, информатика",
    description:
      "Супер-курсы уровня репетитора по физике, математике и информатике: полная школьная программа, профильный ЕГЭ, ДВИ. Уроки с ИИ-наставником и голосом.",
    url: CANONICAL,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://xn--h1agdcde2c.xn--p1ai/" },
      { "@type": "ListItem", position: 2, name: "Супер-курсы", item: CANONICAL },
    ],
  },
];

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function SuperCourses() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, openLogin, user } = useAuth();
  const { canAccessCourse, hasSubscription, buyCourse, confirmDemoPurchase, syncPayment } = useAccess();

  const [buyTarget, setBuyTarget] = useState<SuperCourse | null>(null);
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoPurchaseId, setDemoPurchaseId] = useState<number | null>(null);
  const promoOn = isPromoActive();

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user?.email]);

  // Возврат с кассы: дотягиваем доступ ретраями (webhook может задержаться).
  const returned = searchParams.get("paid") === "1";
  useEffect(() => {
    if (!returned) return;
    let cancelled = false;
    const tryS = (n: number) => {
      syncPayment().then(() => {
        if (cancelled) return;
        if (n < 15) setTimeout(() => tryS(n + 1), 3000);
      });
    };
    tryS(0);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returned]);

  // Доступ к супер-курсу: акция, подписка или покупка конкретного курса.
  const hasCourseAccess = (courseId: number) =>
    promoOn || hasSubscription || canAccessCourse(courseId);

  const openBuy = (course: SuperCourse) => {
    setError(null);
    setDemoPurchaseId(null);
    if (promoOn || hasSubscription) return; // доступ уже есть
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setBuyTarget(course);
  };

  const handlePay = async () => {
    if (!buyTarget) return;
    setError(null);
    if (!isValidEmail(email)) {
      setError("Укажи действующий email — на него придёт чек по 54-ФЗ");
      return;
    }
    setProcessing(true);
    const returnUrl = `${window.location.origin}/super-courses?paid=1`;
    const res = await buyCourse(
      buyTarget.courseId,
      "ege",
      `Супер-курс: ${buyTarget.subject}`,
      returnUrl,
      email.trim(),
    );
    setProcessing(false);
    if (!res.ok) {
      setError(res.message || "Не получилось оформить покупку");
      return;
    }
    if (res.alreadyPurchased) {
      setBuyTarget(null);
      return;
    }
    if (res.paymentUrl && /^https:\/\//.test(res.paymentUrl)) {
      window.location.href = res.paymentUrl;
      return;
    }
    if (res.demoMode && res.purchaseId) {
      setDemoPurchaseId(res.purchaseId);
      return;
    }
    setError("Не удалось перейти к оплате. Попробуй ещё раз через минуту.");
  };

  const handleDemoConfirm = async () => {
    if (!demoPurchaseId) return;
    setProcessing(true);
    const res = await confirmDemoPurchase(demoPurchaseId);
    setProcessing(false);
    if (!res.ok) {
      setError(res.message || "Не удалось подтвердить оплату");
      return;
    }
    setBuyTarget(null);
    setDemoPurchaseId(null);
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Супер-курсы УЧИСЬПРО — физика, математика, информатика с ИИ-наставником"
        description="Супер-курсы уровня репетитора: вся школьная программа + профильный ЕГЭ и ДВИ. Уроки с ИИ-наставником и голосом по физике, математике и информатике. Первый урок бесплатно."
        canonical={CANONICAL}
        keywords="супер-курсы, репетитор по физике, подготовка к егэ физика, математика профиль, информатика егэ, ии наставник, курсы с голосом"
        jsonLd={JSON_LD}
      />

      {/* Header bar */}
      <header className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" aria-label="Шапка сайта">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="На главную УЧИСЬПРО">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg" aria-hidden="true">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple tracking-wide group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/courses" }, { label: "Супер-курсы" }]} />
          </div>
          <Link
            to="/courses"
            className="hidden md:inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <Icon name="Library" size={14} aria-hidden="true" />
            Все курсы
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-2 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-4">
          <Icon name="Sparkles" size={14} className="text-cyan-300" />
          <span className="text-xs text-cyan-200 font-bold uppercase tracking-wider">Уровень репетитора · с голосом</span>
        </div>
        <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white leading-tight">
          Супер-курсы по <span className="gradient-text-purple">физике, математике</span> и информатике
        </h1>
        <p className="text-white/65 text-sm md:text-lg mt-4 max-w-2xl mx-auto">
          Полная школьная программа плюс профильный ЕГЭ и вступительные испытания технических вузов. Наставник ведёт каждый урок голосом, как живой репетитор. Первый урок каждого предмета — бесплатно.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-white/55 text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <Icon name="ShieldCheck" size={15} className="text-green-400" />
          Покупаешь один предмет — открываются все его уроки навсегда
        </div>
      </section>

      {/* Super courses + наставник */}
      <AITeacher showSuperCourses hasCourseAccess={hasCourseAccess} onBuySuper={openBuy} />

      {/* Buy modal */}
      {buyTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => !processing && setBuyTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-6 md:p-7"
            style={{ boxShadow: `0 0 60px ${buyTarget.accent}25` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{buyTarget.emoji}</span>
              <div className="flex-1">
                <h3 className="font-montserrat font-black text-lg text-white">Супер-курс: {buyTarget.subject}</h3>
                <p className="text-white/50 text-xs">{buyTarget.level}</p>
              </div>
              <button onClick={() => !processing && setBuyTarget(null)} className="text-white/40 hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="flex items-baseline gap-2 mb-4 flex-wrap">
              <span className="font-montserrat font-black text-3xl text-white">{buyTarget.price.toLocaleString("ru-RU")} ₽</span>
              <span className="text-white/40 text-sm line-through">{buyTarget.oldPrice.toLocaleString("ru-RU")} ₽</span>
              <span className="text-xs text-white/45">· разовая оплата, доступ навсегда</span>
            </div>

            {!demoPurchaseId ? (
              <>
                <label className="block text-white/60 text-xs mb-1.5">Email для чека (54-ФЗ)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:border-purple-500/50 mb-3"
                />
                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-3 rounded-2xl font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${buyTarget.accent}, ${buyTarget.accent}aa)` }}
                >
                  {processing ? "Создаём оплату…" : `Оплатить ${buyTarget.price.toLocaleString("ru-RU")} ₽`}
                </button>
                <p className="text-white/35 text-[11px] text-center mt-3">
                  Нажимая «Оплатить», вы соглашаетесь с условиями оферты. Оплата через ЮKassa.
                </p>
              </>
            ) : (
              <>
                <p className="text-white/70 text-sm mb-3">
                  Тестовый режим оплаты (касса не настроена). Нажми, чтобы активировать доступ.
                </p>
                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                <button
                  onClick={handleDemoConfirm}
                  disabled={processing}
                  className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-60"
                >
                  {processing ? "Активируем…" : "Активировать доступ"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
