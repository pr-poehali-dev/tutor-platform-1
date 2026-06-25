import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { useAuth } from "@/context/AuthContext";
import { isPromoActive, formatEndDate, PROMO_CODE } from "@/components/promo/dobroConfig";
import PlanComparison from "@/components/pricing/PlanComparison";
import PricingTestimonials from "@/components/pricing/PricingTestimonials";
import PricingBundles from "@/components/pricing/PricingBundles";
import PricingReferral from "@/components/pricing/PricingReferral";
import ZnaikaPayBanner from "@/components/pricing/ZnaikaPayBanner";

const PLANS = [
  {
    id: "trial",
    name: "Пробный",
    price: 0,
    period: "7 дней",
    badge: "Знакомство",
    color: "from-white/10 to-white/5",
    accent: "border-white/15",
    features: [
      "Доступ к 3 курсам на выбор",
      "До 20 сообщений ИИ-методисту в день",
      "Базовая аналитика прогресса",
      "Без оплаты, без карты",
    ],
    limitations: ["Без голосовых ответов", "Без подготовки к экзаменам"],
    cta: "Попробовать 7 дней",
    highlighted: false,
  },
  {
    id: "base",
    name: "Базовый",
    price: 590,
    oldPrice: 990,
    period: "в месяц",
    badge: "Старт",
    color: "from-cyan-500/15 to-blue-500/10",
    accent: "border-cyan-500/30",
    features: [
      "Все курсы платформы (36+ программ)",
      "До 200 сообщений ИИ-методисту в день",
      "Голосовые ответы преподавателей",
      "Полная аналитика прогресса",
      "Адаптивная программа",
    ],
    limitations: [],
    cta: "Оформить подписку",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Профи",
    price: 1290,
    oldPrice: 1990,
    period: "в месяц",
    badge: "Рекомендуем",
    color: "from-purple-500/20 to-pink-500/15",
    accent: "border-purple-500/40",
    features: [
      "Всё из тарифа «Базовый»",
      "Безлимитные сообщения ИИ-методисту",
      "Подготовка к ЕГЭ и ОГЭ",
      "Разбор сочинений и эссе с обратной связью",
      "Пробные экзамены с проверкой",
      "Приоритетная скорость ответов",
    ],
    limitations: [],
    cta: "Выбрать «Профи»",
    highlighted: true,
  },
  {
    id: "family",
    name: "Семейный",
    price: 1990,
    oldPrice: 2990,
    period: "в месяц",
    badge: "До 3 учеников",
    color: "from-green-500/15 to-emerald-500/10",
    accent: "border-green-500/30",
    features: [
      "Всё из тарифа «Профи»",
      "До 3 учеников на одной подписке",
      "Отдельный прогресс для каждого",
      "Родительский кабинет с отчётами",
      "Раздельные диалоги с ИИ",
    ],
    limitations: [],
    cta: "Оформить семейный",
    highlighted: false,
  },
];

const YEAR_DISCOUNT = 0.4; // -40% при годовой оплате

// Цена за год (со скидкой) — целое число рублей
function yearPrice(monthly: number): number {
  return Math.round(monthly * 12 * (1 - YEAR_DISCOUNT));
}

const FAQ = [
  {
    q: "Можно ли отменить подписку в любой момент?",
    a: "Да. Подписку можно отменить через личный кабинет в любой момент. После отмены доступ сохраняется до конца оплаченного периода. Возврат за неиспользованную часть возможен по заявлению (ст. 32 ЗоЗПП).",
  },
  {
    q: "Что входит в «пробный» доступ?",
    a: "Доступ к 3 курсам на выбор, до 20 сообщений ИИ-методисту в день, базовая аналитика. Карта не привязывается. Через 7 дней доступ автоматически прекращается — без списаний.",
  },
  {
    q: "Чем отличается «Базовый» от «Профи»?",
    a: "В «Базовом» — лимит 200 сообщений ИИ в день и без специализированной подготовки к ЕГЭ/ОГЭ. «Профи» добавляет безлимит сообщений, проверку сочинений, пробные экзамены и приоритетную скорость.",
  },
  {
    q: "Гарантируете ли вы определённый балл на ЕГЭ?",
    a: "Нет. Результаты экзаменов зависят от усилий и регулярности занятий ученика. Мы предоставляем материалы и инструменты, но конкретный балл законом запрещено гарантировать (38-ФЗ «О рекламе»).",
  },
  {
    q: "Подходит ли платформа для младших школьников?",
    a: "Да. Есть курсы для 1–4 классов. Регистрация лиц младше 14 лет производится с согласия законного представителя (ст. 28 ГК РФ).",
  },
  {
    q: "Как оплатить?",
    a: "Принимаем оплату российскими банковскими картами (Visa, Mastercard, МИР). Также доступна оплата через СБП. Чеки и счета формируются автоматически.",
  },
];

const PRICING_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function Pricing() {
  const { isAuthenticated, openLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState<"month" | "year">("year");

  const promoOn = isPromoActive();

  // Откуда пришёл пользователь (например, со страницы курса) — чтобы вернуть после оплаты.
  const rawFrom = searchParams.get("from") || "";
  const fromPath = /^\/[^/]/.test(rawFrom) ? rawFrom : "";

  const checkoutPath = (planId: string) => {
    const parts: string[] = [];
    if (period === "year") parts.push("period=year");
    if (fromPath) parts.push(`from=${encodeURIComponent(fromPath)}`);
    return `/checkout/${planId}${parts.length ? `?${parts.join("&")}` : ""}`;
  };

  const handlePlanClick = (planId: string) => {
    // Во время акции «ДОБРО» все оплаты заблокированы — перенаправляем на курсы
    if (promoOn) {
      navigate("/courses");
      return;
    }
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem("pending_checkout_plan", planId);
        sessionStorage.setItem("pending_checkout_period", period);
        if (fromPath) sessionStorage.setItem("pending_checkout_from", fromPath);
        else sessionStorage.removeItem("pending_checkout_from");
      } catch {
        // ignore
      }
      openLogin();
    } else {
      navigate(checkoutPath(planId));
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Тарифы и цены УЧИСЬПРО — подписка на ИИ-репетитора"
        description="Тарифные планы УЧИСЬПРО: пробный период 7 дней бесплатно, Базовый от 590 ₽/мес, Профи с подготовкой к ЕГЭ и ОГЭ. Оплата российскими картами и через СБП. Возврат по 7-дневному правилу. Подробности на учисьпро.рф/pricing."
        canonical="https://xn--h1agdcde2c.xn--p1ai/pricing"
        keywords="учисьпро тарифы, цены онлайн школа, подписка ии репетитор, стоимость подготовки егэ, тарифы репетитора"
        jsonLd={PRICING_JSON_LD}
      />
      <div className="border-b border-white/5 bg-background/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumbs items={[
            { label: "Главная", href: "/" },
            { label: "Тарифы и цены" },
          ]} />
        </div>
      </div>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3) + 1 + "px",
              height: (i % 3) + 1 + "px",
              left: ((i * 137.5) % 100) + "%",
              top: ((i * 97.3) % 100) + "%",
              opacity: 0.12 + (i % 4) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/55 hover:text-white text-sm mb-6 transition-colors">
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>

        {/* Баннер акции ДОБРО */}
        {promoOn && (
          <div className="mb-8 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-orange-500/20 border-2 border-rose-500/40 rounded-3xl p-5 md:p-6 flex items-start gap-3 flex-wrap">
            <div className="text-4xl flex-shrink-0">❤️</div>
            <div className="flex-1 min-w-[260px]">
              <p className="font-montserrat font-black text-white text-base md:text-lg mb-1">
                Акция «{PROMO_CODE}»: оплата на паузе до {formatEndDate()}
              </p>
              <p className="text-white/80 text-sm">
                Все тарифы доступны <strong>бесплатно</strong> прямо сейчас — без карты и подписки. Ниже описание тарифов на период после акции.
              </p>
            </div>
            <Link
              to="/courses"
              className="bg-white text-rose-600 font-black text-sm px-5 py-2.5 rounded-xl hover:scale-[1.03] transition-transform"
            >
              Открыть курсы
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/25 rounded-full px-4 py-1.5 mb-5">
              <Icon name="Sparkles" size={14} className="text-purple-300" />
              <span className="text-sm text-purple-300 font-medium">Тарифные планы</span>
            </div>
            <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white mb-4 leading-tight">
              Выбери подходящий <span className="gradient-text-purple">тариф</span>
            </h1>
            <p className="text-white/55 text-base md:text-lg mb-5">
              Подписка стоит дешевле одного занятия с репетитором. Без скрытых платежей. Отмена в любой момент.
            </p>
            <a
              href="#compare"
              className="inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-white/12 transition-all"
            >
              <Icon name="Table2" size={16} />
              Сравнить тарифы
            </a>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-white/10 glow-purple hidden md:block">
            <img
              src="https://cdn.poehali.dev/projects/b18d4f87-2b38-4fb5-a766-cc6cbae44e5a/files/2de2b71a-0b6a-4ae9-9c22-fd957545b027.jpg"
              alt="Ученица занимается за столом с планшетом и тетрадью"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Баннер оплаты ЗНАЙКАМИ */}
        {!promoOn && <ZnaikaPayBanner />}

        {/* Переключатель периода */}
        {!promoOn && (
          <div className="flex flex-col items-center mb-8">
            <div className="inline-flex items-center bg-white/5 border border-white/12 rounded-2xl p-1.5 relative">
              <button
                onClick={() => setPeriod("month")}
                className={`relative z-10 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  period === "month" ? "bg-white text-background" : "text-white/60 hover:text-white"
                }`}
              >
                Помесячно
              </button>
              <button
                onClick={() => setPeriod("year")}
                className={`relative z-10 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                  period === "year" ? "bg-white text-background" : "text-white/60 hover:text-white"
                }`}
              >
                На год
                <span className="bg-gradient-to-r from-emerald-400 to-green-500 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  −40%
                </span>
              </button>
            </div>
            {period === "year" && (
              <p className="text-emerald-300/90 text-sm font-medium mt-3">
                💰 Выгода до {(yearPrice(1990) ? (1990 * 12 - yearPrice(1990)) : 0).toLocaleString("ru-RU")} ₽ в год на «Семейном»
              </p>
            )}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-16">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br ${plan.color} border ${plan.accent} rounded-3xl p-6 flex flex-col ${
                plan.highlighted ? "md:scale-105 shadow-2xl shadow-purple-500/20" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Популярный
                </div>
              )}

              <div className="mb-5">
                <p className="text-white/55 text-xs font-medium mb-1">{plan.badge}</p>
                <h3 className="font-montserrat font-black text-2xl text-white mb-3">{plan.name}</h3>
                {plan.price === 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-montserrat font-black text-3xl text-white">0</span>
                    <span className="text-white/55 text-sm">₽ / {plan.period}</span>
                  </div>
                ) : period === "year" ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-montserrat font-black text-3xl text-white">
                        {yearPrice(plan.price).toLocaleString("ru-RU")}
                      </span>
                      <span className="text-white/55 text-sm">₽ / год</span>
                    </div>
                    <p className="text-emerald-300 text-xs font-bold mt-1">
                      ≈ {Math.round(yearPrice(plan.price) / 12).toLocaleString("ru-RU")} ₽/мес · экономия{" "}
                      {(plan.price * 12 - yearPrice(plan.price)).toLocaleString("ru-RU")} ₽
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-montserrat font-black text-3xl text-white">
                        {plan.price.toLocaleString("ru-RU")}
                      </span>
                      <span className="text-white/55 text-sm">₽ / {plan.period}</span>
                    </div>
                    {plan.oldPrice && (
                      <p className="text-white/35 text-xs line-through mt-1">{plan.oldPrice.toLocaleString("ru-RU")} ₽</p>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-2 mb-5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/75 text-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="Check" size={10} className="text-green-400" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
                {plan.limitations.map((l, i) => (
                  <li key={`l-${i}`} className="flex items-start gap-2 text-white/35 text-sm">
                    <div className="w-4 h-4 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="X" size={10} className="text-white/40" />
                    </div>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan.id)}
                className={`w-full font-bold text-sm py-3 rounded-2xl transition-all ${
                  promoOn
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-90"
                    : plan.highlighted
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    : plan.price === 0
                    ? "bg-white/8 border border-white/15 text-white hover:bg-white/12"
                    : "bg-white text-background hover:bg-white/90"
                }`}
              >
                {promoOn ? "❤️ Бесплатно по акции ДОБРО" : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Выгодные комплекты (апселл) */}
        <PricingBundles onSelect={handlePlanClick} />

        {/* Сравнение тарифов */}
        <PlanComparison />

        {/* Bonuses */}
        <div className="bg-card/60 border border-white/8 rounded-3xl p-6 md:p-8 mb-16">
          <h2 className="font-montserrat font-black text-xl md:text-2xl text-white mb-5 text-center">Что входит во все платные тарифы</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "♾", title: "Без ограничений по времени", desc: "Учись в любое время — круглосуточно" },
              { icon: "📱", title: "На любом устройстве", desc: "Телефон, планшет, компьютер" },
              { icon: "🇷🇺", title: "Серверы в России", desc: "Данные хранятся в РФ (152-ФЗ)" },
              { icon: "🔒", title: "Без скрытых платежей", desc: "Цена фиксирована на весь срок" },
            ].map(b => (
              <div key={b.title} className="text-center">
                <div className="text-3xl mb-2">{b.icon}</div>
                <p className="font-bold text-white text-sm mb-1">{b.title}</p>
                <p className="text-white/45 text-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Отзывы и результаты учеников */}
        <PricingTestimonials />

        {/* Реферальная программа */}
        <PricingReferral />

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-6 text-center">Частые вопросы</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ.map((item, i) => (
              <details key={i} className="bg-card/50 border border-white/8 rounded-2xl group">
                <summary className="p-5 cursor-pointer flex items-center justify-between gap-4 list-none">
                  <span className="font-bold text-white text-sm md:text-base">{item.q}</span>
                  <Icon name="ChevronDown" size={18} className="text-white/40 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 text-white/65 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Legal note */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5 text-white/45 text-xs leading-relaxed text-center max-w-3xl mx-auto">
          <p className="mb-2">
            Указанные цены действительны на дату публикации и могут изменяться. Изменения не распространяются на уже оплаченные подписки.
            Результаты обучения индивидуальны и не гарантируются.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            <Link to="/legal/offer" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">Публичная оферта</Link>
            <Link to="/legal/privacy" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">Политика конфиденциальности</Link>
            <Link to="/legal/terms" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">Пользовательское соглашение</Link>
          </div>
        </div>

      </div>
    </div>
  );
}