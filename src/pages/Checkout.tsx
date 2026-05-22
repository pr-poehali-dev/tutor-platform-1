import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { isValidEmail } from "@/components/extensions/yookassa/useYookassa";

type PlanId = "trial" | "base" | "pro" | "family";

interface PlanDef {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  gradient: string;
}

const PLANS: Record<PlanId, PlanDef> = {
  trial: {
    id: "trial",
    name: "Пробный",
    price: 0,
    period: "7 дней",
    description: "Знакомство с платформой без оплаты",
    features: ["3 курса на выбор", "20 сообщений ИИ в день", "Базовая аналитика"],
    gradient: "from-white/12 to-white/5",
  },
  base: {
    id: "base",
    name: "Базовый",
    price: 590,
    period: "месяц",
    description: "Все курсы + ИИ-методист",
    features: ["Все 36+ курсов", "200 сообщений ИИ в день", "Голосовые ответы", "Полная аналитика"],
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  pro: {
    id: "pro",
    name: "Профи",
    price: 1290,
    period: "месяц",
    description: "Полная подготовка к ЕГЭ и ОГЭ",
    features: ["Всё из «Базового»", "Безлимитные сообщения ИИ", "Подготовка к ЕГЭ/ОГЭ", "Разбор сочинений", "Пробные экзамены"],
    gradient: "from-purple-500/25 to-pink-500/15",
  },
  family: {
    id: "family",
    name: "Семейный",
    price: 1990,
    period: "месяц",
    description: "До 3 учеников на одной подписке",
    features: ["Всё из «Профи»", "До 3 учеников", "Отдельный прогресс", "Родительский кабинет"],
    gradient: "from-emerald-500/20 to-green-500/10",
  },
};

export default function Checkout() {
  const { planId } = useParams<{ planId: string }>();
  const { user, isAuthenticated, loading, openLogin } = useAuth();
  const navigate = useNavigate();
  const plan = useMemo<PlanDef | null>(() => (planId && (planId in PLANS) ? PLANS[planId as PlanId] : null), [planId]);

  const { buySubscription } = useAccess();
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [name, setName] = useState<string>(user?.name ?? "");
  const [agree, setAgree] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    if (user?.name && !name) setName(user.name);
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (!loading && !isAuthenticated) openLogin();
  }, [loading, isAuthenticated, openLogin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Icon name="Loader2" size={28} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center text-white px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🤔</div>
          <h1 className="font-montserrat font-black text-2xl mb-2">Такого тарифа нет</h1>
          <Link to="/pricing" className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm">
            <Icon name="ArrowLeft" size={14} />
            К тарифам
          </Link>
        </div>
      </div>
    );
  }

  const isFree = plan.price === 0;

  const handlePay = async () => {
    setLocalError(null);
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError("Введи корректный email — он нужен для чека");
      return;
    }
    if (!agree) {
      setLocalError("Подтверди согласие с условиями");
      return;
    }

    const returnUrl = `${window.location.origin}/checkout/success?plan=${plan.id}`;
    setIsLoading(true);
    const res = await buySubscription(plan.id, returnUrl, email);
    setIsLoading(false);

    if (!res.ok) {
      setLocalError(res.message || "Не получилось оформить подписку");
      return;
    }
    if (res.alreadySubscribed) {
      navigate(`/checkout/success?plan=${plan.id}`);
      return;
    }
    if (res.paymentUrl) {
      window.location.href = res.paymentUrl;
      return;
    }
    if (res.demoMode) {
      // ЮKassa не настроена — отправляем на success, там есть демо-активация
      navigate(`/checkout/success?plan=${plan.id}&demo=${res.subscriptionId}`);
    }
  };

  const displayError = localError;

  return (
    <div className="min-h-screen bg-mesh font-golos text-white pb-16">
      <Seo
        title={`Оплата тарифа «${plan.name}» — УЧИСЬПРО`}
        description={`Оформление подписки «${plan.name}» через ЮKassa. Безопасная оплата картой Visa, Mastercard, МИР или СБП.`}
        canonical={`https://xn--h1agdcde2c.xn--p1ai/checkout/${plan.id}`}
      />

      <div className="max-w-3xl mx-auto px-4 pt-10 md:pt-14">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={16} />
          К тарифам
        </Link>

        <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Оформление подписки</p>
        <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-6">
          Тариф «{plan.name}»
        </h1>

        <div className={`rounded-3xl border border-white/12 bg-gradient-to-br ${plan.gradient} p-6 md:p-7 mb-6`}>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-montserrat font-black text-4xl md:text-5xl text-white">
              {plan.price === 0 ? "0" : plan.price.toLocaleString("ru-RU")}
            </span>
            <span className="text-white/65 text-base">₽ / {plan.period}</span>
          </div>
          <p className="text-white/70 text-sm md:text-base mb-4">{plan.description}</p>
          <ul className="space-y-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                <Icon name="Check" size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-7 mb-6">
          <h2 className="font-montserrat font-black text-lg text-white mb-4">Контактные данные</h2>

          <label className="block mb-4">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Имя</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как тебя зовут"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1.5 block">
              Email <span className="text-rose-300">*</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-colors"
              required
            />
            <span className="text-white/45 text-xs mt-1.5 block">Сюда пришлём чек об оплате</span>
          </label>

          {user?.phone && (
            <div className="mt-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/75">
              <Icon name="Phone" size={12} className="inline mr-1.5 text-purple-300" />
              Номер: <span className="text-white font-medium">{user.phone}</span>
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-purple-500"
          />
          <span className="text-white/65 text-xs leading-relaxed">
            Согласен с{" "}
            <Link to="/legal/offer" className="text-purple-300 hover:text-purple-200 underline">
              офертой
            </Link>
            ,{" "}
            <Link to="/legal/terms" className="text-purple-300 hover:text-purple-200 underline">
              условиями использования
            </Link>{" "}
            и{" "}
            <Link to="/legal/privacy" className="text-purple-300 hover:text-purple-200 underline">
              политикой обработки персональных данных
            </Link>
            . Подтверждаю, что мне больше 14 лет или согласие даёт законный представитель.
          </span>
        </label>

        {displayError && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200 text-sm flex items-start gap-2">
            <Icon name="AlertCircle" size={14} className="mt-0.5 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {isFree ? (
          <button
            onClick={() => navigate("/cabinet")}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold text-base hover:scale-[1.01] shadow-lg shadow-purple-500/30 transition-all"
          >
            <Icon name="Rocket" size={16} />
            Активировать пробный период
          </button>
        ) : (
          <button
            onClick={handlePay}
            disabled={isLoading}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-base transition-all ${
              isLoading
                ? "bg-white/10 text-white/40 cursor-wait"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:scale-[1.01] shadow-lg shadow-purple-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Готовим оплату...
              </>
            ) : (
              <>
                <Icon name="CreditCard" size={16} />
                Оплатить {plan.price.toLocaleString("ru-RU")} ₽
              </>
            )}
          </button>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="ShieldCheck" size={12} className="text-emerald-400" />
            Платёж через ЮKassa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="CreditCard" size={12} className="text-purple-300" />
            Visa, Mastercard, МИР, СБП
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="RotateCcw" size={12} className="text-cyan-300" />
            Возврат по 7-дневному правилу
          </span>
        </div>
      </div>
    </div>
  );
}