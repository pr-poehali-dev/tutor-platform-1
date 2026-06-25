import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { COURSES, GRADES, getCoursePrice } from "@/components/courses/coursesData";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { useZnaika } from "@/context/ZnaikaContext";
import { isPromoActive } from "@/components/promo/dobroConfig";
import CourseDetailModal from "@/components/courses/CourseDetailModal";
import useReadyCourses from "@/hooks/useReadyCourses";
import CourseNotReadyNotice from "@/components/courses/checkout/CourseNotReadyNotice";
import CourseAccessGranted from "@/components/courses/checkout/CourseAccessGranted";
import CoursePaymentReturnNotice from "@/components/courses/checkout/CoursePaymentReturnNotice";
import CoursePurchaseForm from "@/components/courses/checkout/CoursePurchaseForm";

export default function CourseCheckout() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, openLogin, loading: authLoading, user } = useAuth();
  const { canAccessCourse, hasSubscription, buyCourse, confirmDemoPurchase, refreshAccess, syncPayment } = useAccess();
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
  const [showCourse, setShowCourse] = useState(false);

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
      // syncPayment сам опрашивает ЮKassa напрямую — доступ выдаётся,
      // даже если webhook от банка не пришёл.
      await syncPayment();
      if (cancelled) return;
      if (canAccessCourse(course.id)) {
        setCheckingReturn(false);
        return;
      }
      if (attempt < 20) {
        setTimeout(() => tryRefresh(attempt + 1), 3000);
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
    const cashback = Math.floor(price * 0.02);
    if (cashback <= 0) return;
    localStorage.setItem(key, "1");
    earnZnaika("purchase_cashback", cashback, `Кэшбек 2% за курс «${course.title}»`);
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
  const freeForever = !!course.freeForever;

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

    // Реальная оплата: редиректим на ЮKassa (только по валидному https-адресу)
    if (res.paymentUrl && /^https:\/\//.test(res.paymentUrl)) {
      window.location.href = res.paymentUrl;
      return;
    }
    // Демо-режим: ЮKassa не настроена — показываем кнопку активации
    if (res.demoMode) {
      setDemoMode(true);
      return;
    }
    // Ни ссылки оплаты, ни демо — не оставляем пользователя в подвешенном состоянии
    setError("Не удалось перейти к оплате. Попробуй ещё раз через минуту.");
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
        <Breadcrumbs
          className="mb-4"
          items={[
            { label: "Главная", href: "/" },
            { label: "Курсы", href: "/courses" },
            { label: `«${course.title}»` },
          ]}
        />
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-white/55 hover:text-white text-sm mb-6 transition-colors">
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
              <CourseNotReadyNotice />
            ) : alreadyHasAccess || done ? (
              <CourseAccessGranted
                freeForever={freeForever}
                promoOn={promoOn}
                hasSubscription={hasSubscription}
                onStart={() => setShowCourse(true)}
              />
            ) : returnedFromPayment ? (
              <CoursePaymentReturnNotice
                checkingReturn={checkingReturn}
                onRefresh={() => refreshAccess()}
                onRestart={() => { setPurchaseId(null); navigate(`/course-checkout/${course.id}`); }}
              />
            ) : (
              <CoursePurchaseForm
                course={course}
                price={price}
                amount={amount}
                isAuthenticated={isAuthenticated}
                email={email}
                setEmail={setEmail}
                error={error}
                processing={processing}
                demoMode={demoMode}
                purchaseId={purchaseId}
                openLogin={openLogin}
                onPay={handlePay}
                onDemoConfirm={handleDemoConfirm}
              />
            )}
          </div>
        </div>
      </div>

      {showCourse && (
        <CourseDetailModal
          course={course}
          onClose={() => setShowCourse(false)}
          onStartWithAI={() => setShowCourse(false)}
        />
      )}
    </main>
  );
}