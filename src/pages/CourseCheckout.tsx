import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { COURSES, GRADES, getCoursePrice } from "@/components/courses/coursesData";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";

export default function CourseCheckout() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, openLogin, loading: authLoading } = useAuth();
  const { canAccessCourse, hasSubscription, buyCourse, confirmDemoPurchase, refreshAccess } = useAccess();

  const course = useMemo(
    () => COURSES.find((c) => c.id === Number(courseId)) || null,
    [courseId]
  );

  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [checkingReturn, setCheckingReturn] = useState(false);

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

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center text-white/70">
          <p className="text-2xl mb-3">Курс не найден</p>
          <Link to="/" className="text-purple-300 underline">Вернуться в каталог</Link>
        </div>
      </div>
    );
  }

  const price = getCoursePrice(course);
  const gradeLabel = GRADES.find((g) => g.id === course.grade)?.label || course.grade;
  const alreadyHasAccess = canAccessCourse(course.id);

  const handlePay = async () => {
    setError(null);
    setProcessing(true);
    const returnUrl = `${window.location.origin}/course-checkout/${course.id}?paid=1`;
    const res = await buyCourse(course.id, course.grade, course.title, returnUrl);
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

  return (
    <div className="min-h-screen bg-background py-10 px-4">
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

            {alreadyHasAccess || done ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-5">
                <p className="text-green-300 font-bold text-sm flex items-center gap-2 mb-2">
                  <Icon name="CheckCircle2" size={18} />
                  {hasSubscription ? "Курс уже открыт по подписке" : "Доступ к курсу открыт"}
                </p>
                <p className="text-white/70 text-sm">Все уроки курса доступны навсегда. Открывай из каталога и продолжай с любого места.</p>
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
                <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-white/55 text-sm">Стоимость</span>
                    <span className="font-montserrat font-black text-3xl text-white">{(amount ?? price).toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <p className="text-white/45 text-xs">Разовая оплата · доступ навсегда</p>
                </div>

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
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-4 rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    <Icon name="LogIn" size={16} />
                    Войти, чтобы купить
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
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold px-5 py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {processing ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="CreditCard" size={16} />}
                    Перейти к оплате
                  </button>
                )}

                <div className="flex items-center justify-center gap-4 mt-5 text-white/40 text-xs">
                  <span className="flex items-center gap-1.5"><Icon name="ShieldCheck" size={12} /> Безопасная оплата ЮKassa</span>
                  <span className="flex items-center gap-1.5"><Icon name="RefreshCw" size={12} /> Возврат по 152-ФЗ</span>
                </div>

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
    </div>
  );
}
