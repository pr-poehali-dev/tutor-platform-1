import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { COURSES, GRADES, getCoursePrice } from "@/components/courses/coursesData";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { useZnaika } from "@/context/ZnaikaContext";
import { isPromoActive } from "@/components/promo/dobroConfig";
import ZnaikaCheckoutWidget from "@/components/znaika/ZnaikaCheckoutWidget";
import useReadyCourses from "@/hooks/useReadyCourses";
import {
  SocialProof,
  DiscountTimer,
  MoneyBackGuarantee,
  TrustBadges,
} from "@/components/courses/CheckoutBoosters";

const DISCOUNT_PERCENT = 15;

export default function CourseCheckout() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, openLogin, loading: authLoading, user } = useAuth();
  const { canAccessCourse, hasSubscription, buyCourse, confirmDemoPurchase, refreshAccess } = useAccess();
  const { earn: earnZnaika } = useZnaika();
  const { isReady, loaded: readyLoaded } = useReadyCourses();

  const course = useMemo(
    () => COURSES.find((c) => c.id === Number(courseId)) || null,
    [courseId]
  );

  // Курс не готов к продаже если у него только fallback-программа.
  // Принцип: не продавать продукт без качества.
  const courseNotReady = readyLoaded && course && !isReady(course.id);

  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [checkingReturn, setCheckingReturn] = useState(false);
  const [email, setEmail] = useState<string>(user?.email ?? "");

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user?.email]);

  const returnedFromPayment = searchParams.get("paid") === "1";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openLogin();
    }
  }, [authLoading, isAuthenticated, openLogin]);



  // Возврат с ЮKassa: рефрешим доступ с лёгкими ретраями (webhook может задержаться)
  useEffect(() => {
    if (!returnedFromPayment || !isAuthenticated || !course) return;
    let cancelled = false;
    setCheckingReturn(true);
    const tryRefresh = async (attempt: number) => {
      await refreshAccess();
      if (cancelled) return;
      if (canAccessCourse(course.id)) {
        setCheckingReturn(false);
        return;
      }
      if (attempt < 5) {
        setTimeout(() => tryRefresh(attempt + 1), 2000);
      } else {
        setCheckingReturn(false);
      }
    };
    tryRefresh(0);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedFromPayment, isAuthenticated, course?.id]);

  // Автоначисление 5% кэшбека ЗНАЙКАМИ после успешной покупки.
  // Каждая покупка — один раз, ключ в localStorage.
  useEffect(() => {
    if (!course || !isAuthenticated) return;
    const hasAccess = canAccessCourse(course.id);
    if (!hasAccess) return;
    const key = `znaika_cashback_course_${course.id}`;
    if (localStorage.getItem(key)) return;
    const price = getCoursePrice(course);
    const cashback = Math.floor(price * 0.05);
    if (cashback <= 0) return;
    localStorage.setItem(key, "1");
    earnZnaika("purchase_cashback", cashback, `Кэшбек 5% за курс «${course.title}»`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, isAuthenticated, canAccessCourse, earnZnaika]);

  if (!course) {
    return (
      <>
        <Seo
          title="Курс не найден"
          description="Запрошенный курс не найден. Вернись в каталог онлайн-курсов УЧИСЬПРО и выбери подходящий."
          noindex
        />
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
          <section className="text-center text-white/70">
            <p className="text-2xl mb-3">Курс не найден</p>
            <Link to="/" className="text-purple-300 underline">Вернуться в каталог</Link>
          </section>
        </main>
      </>
    );
  }

  const price = getCoursePrice(course);
  const gradeLabel = GRADES.find((g) => g.id === course.grade)?.label || course.grade;
  const alreadyHasAccess = canAccessCourse(course.id);
  const promoOn = isPromoActive();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handlePay = async () => {
    setError(null);
    if (courseNotReady) {
      setError("Курс ещё готовится к запуску — оплата временно недоступна");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Укажи действующий email — на него придёт чек по 54-ФЗ");
      return;
    }
    setProcessing(true);
    const returnUrl = `${window.location.origin}/course-checkout/${course.id}?paid=1`;
    const res = await buyCourse(course.id, course.grade, course.title, returnUrl, email.trim());
    setProcessing(false);
    if (!res.ok) {
      setError(res.message || "Не получилось оформить покупку");
      return;
    }
    if (res.alreadyPurchased) {
      setDone(true);
      return;
    }
    setPurchaseId(res.purchaseId ?? null);
    setAmount(res.amount ?? price);

    // Реальная оплата: редиректим на ЮKassa
    if (res.paymentUrl) {
      window.location.href = res.paymentUrl;
      return;
    }
    // Демо-режим: ЮKassa не настроена — показываем кнопку активации
    if (res.demoMode) {
      setDemoMode(true);
    }
  };

  const handleDemoConfirm = async () => {
    if (!purchaseId) return;
    setError(null);
    setProcessing(true);
    const res = await confirmDemoPurchase(purchaseId);
    setProcessing(false);
    if (!res.ok) {
      setError(res.message || "Не удалось подтвердить оплату");
      return;
    }
    setDone(true);
  };

  const courseJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `https://xn--h1agdcde2c.xn--p1ai/course-checkout/${course.id}`,
      name: course.title,
      description: course.description,
      url: `https://xn--h1agdcde2c.xn--p1ai/course-checkout/${course.id}`,
      provider: {
        "@type": "EducationalOrganization",
        name: "УЧИСЬПРО",
        sameAs: "https://xn--h1agdcde2c.xn--p1ai",
      },
      educationalLevel: gradeLabel,
      inLanguage: "ru-RU",
      teaches: course.tags.join(", "),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: course.rating,
        reviewCount: course.reviews,
        bestRating: 5,
        worstRating: 1,
      },
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: "RUB",
        availability: courseNotReady ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
        url: `https://xn--h1agdcde2c.xn--p1ai/course-checkout/${course.id}`,
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: course.format === "online" ? "online" : course.format === "offline" ? "onsite" : "online",
        courseWorkload: `PT${course.lessons * 30}M`,
      },
    },
  ];

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <Seo
        title={`Оплата курса «${course.title}» — УЧИСЬПРО`}
        description={`Покупка онлайн-курса «${course.title}» для ${gradeLabel}: ${course.lessons} уроков, доступ навсегда. Безопасная оплата через ЮKassa, чек по 54-ФЗ.`}
        canonical={`https://xn--h1agdcde2c.xn--p1ai/course-checkout/${course.id}`}
        type="product"
        noindex
        jsonLd={courseJsonLd}
      />
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          В каталог курсов
        </Link>

        <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${course.color}`} />
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-4xl flex-shrink-0`}>
                {course.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-white/45 text-xs uppercase tracking-widest mb-1">Покупка курса</p>
                <h1 className="font-montserrat font-black text-xl md:text-2xl text-white leading-snug">{course.title}</h1>
                <p className="text-white/55 text-sm mt-1">{gradeLabel} · {course.lessons} уроков</p>
              </div>
            </div>

            {!readyLoaded ? (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 mb-5 text-center">
                <Icon name="Loader2" size={28} className="animate-spin text-cyan-300 mx-auto mb-3" />
                <p className="text-cyan-200 font-bold text-sm">Проверяем доступность курса...</p>
              </div>
            ) : courseNotReady && !alreadyHasAccess ? (
              <div className="bg-amber-500/10 border border-amber-500/35 rounded-2xl p-5 mb-5">
                <p className="text-amber-200 font-black text-base flex items-center gap-2 mb-2">
                  <Icon name="Clock" size={18} />
                  Курс ещё готовится к запуску
                </p>
                <p className="text-white/75 text-sm mb-4">
                  Наши методисты дорабатывают программу этого курса. Мы не открываем продажи, пока курс не готов на 100% — деньги обратно потом получать никому не хочется. Загляни через пару дней или выбери другой курс из каталога.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Icon name="LayoutGrid" size={14} />
                    Все доступные курсы
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-white/12 transition-colors"
                  >
                    <Icon name="ArrowLeft" size={14} />
                    На главную
                  </Link>
                </div>
              </div>
            ) : alreadyHasAccess || done ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-5">
                <p className="text-green-300 font-bold text-sm flex items-center gap-2 mb-2">
                  <Icon name="CheckCircle2" size={18} />
                  {promoOn ? "Открыто бесплатно по акции ДОБРО ❤️" : hasSubscription ? "Курс уже открыт по подписке" : "Доступ к курсу открыт"}
                </p>
                <p className="text-white/70 text-sm">
                  {promoOn
                    ? "Во время акции все уроки этого курса открыты бесплатно — без оплаты и без карты. Учись прямо сейчас!"
                    : "Все уроки курса доступны навсегда. Открывай из каталога и продолжай с любого места."}
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  <Icon name="Play" size={14} />
                  Перейти к курсу
                </button>
              </div>
            ) : returnedFromPayment && checkingReturn ? (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 mb-5 text-center">
                <Icon name="Loader2" size={28} className="animate-spin text-cyan-300 mx-auto mb-3" />
                <p className="text-cyan-200 font-bold text-sm mb-1">Проверяем оплату...</p>
                <p className="text-white/60 text-xs">Получаем подтверждение от ЮKassa. Это занимает до 10 секунд.</p>
              </div>
            ) : returnedFromPayment && !checkingReturn ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-5">
                <p className="text-amber-200 font-bold text-sm flex items-center gap-2 mb-2">
                  <Icon name="Clock" size={16} />
                  Оплата ещё не подтверждена
                </p>
                <p className="text-white/70 text-sm mb-4">
                  Если ты только что оплатил — банк может отправлять подтверждение до 1–2 минут. Обнови страницу позже или начни заново.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => refreshAccess()}
                    className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-white/12 transition-colors"
                  >
                    <Icon name="RefreshCw" size={14} />
                    Проверить ещё раз
                  </button>
                  <button
                    onClick={() => { setPurchaseId(null); navigate(`/course-checkout/${course.id}`); }}
                    className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm px-4 py-2.5 transition-colors"
                  >
                    Начать заново
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Социальное доказательство */}
                <SocialProof courseId={course.id} popularity={course.students} />

                {/* Таймер скидки */}
                <DiscountTimer percent={DISCOUNT_PERCENT} />

                {/* Цена со скидкой */}
                <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      −{DISCOUNT_PERCENT}% сегодня
                    </span>
                    <span className="text-white/45 text-xs">экономия {Math.round((amount ?? price) * DISCOUNT_PERCENT / 100 / (1 - DISCOUNT_PERCENT / 100)).toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span className="text-white/55 text-sm">К оплате сейчас</span>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-white/35 text-lg line-through tabular-nums">
                        {Math.round((amount ?? price) / (1 - DISCOUNT_PERCENT / 100)).toLocaleString("ru-RU")} ₽
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
                      onClick={handleDemoConfirm}
                      disabled={processing}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {processing ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="CheckCircle2" size={16} />}
                      Активировать доступ
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePay}
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
}