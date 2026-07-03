import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { trackGoal } from "@/components/analytics/YandexMetrika";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planParam = params.get("plan") || "";
  const demoSubId = params.get("demo");
  // Куда вернуть пользователя после оплаты (страница курса, с которой он ушёл).
  // Принимаем только относительный внутренний путь — защита от чужих редиректов.
  const rawFrom = params.get("from") || "";
  const fromPath = /^\/[^/]/.test(rawFrom) ? rawFrom : "";
  const { refresh } = useAuth();
  const { hasSubscription, confirmDemoPurchase, syncPayment } = useAccess();
  const [status, setStatus] = useState<"checking" | "active" | "pending">("checking");
  const [demoActivating, setDemoActivating] = useState(false);
  const goalSent = useRef(false);

  // Цель конверсии в Метрику — один раз при подтверждении оплаты
  useEffect(() => {
    if (status === "active" && !goalSent.current) {
      goalSent.current = true;
      trackGoal("purchase_success", { plan: planParam || "subscription" });
    }
  }, [status, planParam]);

  // Поллинг доступа после возврата с ЮKassa (webhook может задержаться).
  // Ждём до 60 секунд — банк/ЮKassa иногда подтверждают платёж не сразу.
  useEffect(() => {
    refresh();
    let cancelled = false;
    let attempt = 0;
    const tick = async () => {
      attempt += 1;
      // Опрашиваем ЮKassa напрямую и активируем подписку, даже если webhook не пришёл
      await syncPayment();
      if (cancelled) return;
      if (hasSubscription) {
        setStatus("active");
        return;
      }
      if (attempt >= 20) {
        setStatus("pending");
        return;
      }
      setTimeout(tick, 3000);
    };
    tick();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasSubscription) setStatus("active");
  }, [hasSubscription]);

  // Подписка активна и есть курс, с которого пришли — мягко возвращаем туда.
  useEffect(() => {
    if (status === "active" && fromPath) {
      const t = setTimeout(() => navigate(fromPath), 1500);
      return () => clearTimeout(t);
    }
  }, [status, fromPath, navigate]);

  const handleDemoActivate = async () => {
    if (!demoSubId) return;
    setDemoActivating(true);
    const res = await confirmDemoPurchase(Number(demoSubId), "subscription");
    setDemoActivating(false);
    if (res.ok) setStatus("active");
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-4 py-10">
      <Seo title="Оплата завершена — УЧИСЬПРО" description="Подписка активирована, чек отправлен на email." canonical="https://xn--h1agdcde2c.xn--p1ai/checkout/success" noindex />

      <div className="max-w-lg w-full text-center">
        {status === "active" ? (
          <>
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
              <Icon name="Check" size={36} className="text-white" />
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-3">
              Подписка активна!
            </h1>
            <p className="text-white/70 text-base md:text-lg mb-6 leading-relaxed">
              Все курсы и индивидуальная программа открыты. Чек об оплате отправили на твой email.
              {fromPath && " Сейчас вернём тебя к курсу…"}
            </p>
            {fromPath && (
              <button
                onClick={() => navigate(fromPath)}
                className="mb-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-bold text-sm hover:scale-[1.02] shadow-lg shadow-emerald-500/30 transition-all"
              >
                <Icon name="ArrowRight" size={16} />
                Вернуться к курсу
              </button>
            )}
          </>
        ) : status === "checking" ? (
          <>
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/40">
              <Icon name="Loader2" size={36} className="text-white animate-spin" />
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-3">
              Проверяем оплату...
            </h1>
            <p className="text-white/70 text-base md:text-lg mb-6 leading-relaxed">
              Получаем подтверждение от ЮKassa. Обычно это занимает несколько секунд, иногда до минуты.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/40">
              <Icon name="Clock" size={36} className="text-white" />
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-3">
              Оплата ещё подтверждается
            </h1>
            <p className="text-white/70 text-base md:text-lg mb-6 leading-relaxed">
              Банк может присылать подтверждение до 1–2 минут. Обнови страницу или зайди в личный кабинет — там увидишь актуальный статус.
            </p>
            {demoSubId && (
              <button
                onClick={handleDemoActivate}
                disabled={demoActivating}
                className="mb-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold disabled:opacity-60"
              >
                {demoActivating ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="CheckCircle2" size={14} />}
                Активировать в демо-режиме
              </button>
            )}
            <div className="mb-6">
              <button
                onClick={() => { setStatus("checking"); syncPayment(); }}
                className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
              >
                <Icon name="RefreshCw" size={14} />
                Проверить ещё раз
              </button>
            </div>
          </>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            to="/cabinet"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-sm hover:scale-[1.02] shadow-lg shadow-purple-500/30 transition-all"
          >
            <Icon name="User" size={14} />
            В личный кабинет
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-white/15 text-white/80 hover:text-white hover:border-white/30 font-medium text-sm transition-all"
          >
            <Icon name="Home" size={14} />
            На главную
          </Link>
        </div>

        <p className="text-white/45 text-xs mt-6 leading-relaxed">
          Если подписка не активировалась через 5 минут — напиши в{" "}
          <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noreferrer" className="text-purple-300 hover:text-purple-200 underline">
            поддержку
          </a>
          {planParam ? `, укажи тариф «${planParam}».` : "."}
        </p>
      </div>
    </div>
  );
}