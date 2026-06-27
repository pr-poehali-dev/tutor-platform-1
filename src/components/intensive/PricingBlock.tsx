import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useYookassa, isValidEmail } from "@/components/extensions/yookassa/useYookassa";
import { PRICING, INTENSIVE_META } from "./data";
import { setPaidEmail } from "./api";
import func2url from "../../../backend/func2url.json";

const YOOKASSA_URL = (func2url as Record<string, string>)["yookassa-yookassa"];

export default function PricingBlock() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const { createPayment, isLoading, error } = useYookassa({ apiUrl: YOOKASSA_URL });

  const handlePay = async () => {
    setLocalError(null);
    if (!isValidEmail(email)) {
      setLocalError("Введи корректный email — на него придёт чек и доступ");
      return;
    }
    if (!agree) {
      setLocalError("Подтверди согласие с условиями");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    setPaidEmail(cleanEmail);
    const returnUrl = `${window.location.origin}/intensive?paid=1`;
    const res = await createPayment({
      amount: PRICING.price,
      userEmail: cleanEmail,
      userName: name.trim(),
      description: `Интенсив «${INTENSIVE_META.title}» — доступ с ИИ-наставником`,
      returnUrl,
      cartItems: [
        { id: "intensive-automation", name: PRICING.title, price: PRICING.price, quantity: 1 },
      ],
      metadata: {
        kind: "intensive",
        email: cleanEmail,
        name: name.trim(),
        track: INTENSIVE_META.track,
      },
    });
    if (res?.payment_url && /^https:\/\//.test(res.payment_url)) {
      window.location.href = res.payment_url;
    }
  };

  const displayError = localError || (error ? error.message : null);

  return (
    <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Что входит */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 mb-3">
            <Icon name="Bot" size={14} className="text-purple-300" />
            <span className="text-purple-300 text-xs font-bold uppercase tracking-wide">Наставник — ИИ, доступ 24/7</span>
          </div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1">{PRICING.title}</h2>
          <p className="text-white/50 text-sm mb-5">{PRICING.note}</p>

          <ul className="space-y-3">
            {PRICING.includes.map((it) => (
              <li key={it.text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={it.icon} size={16} className="text-purple-300" />
                </div>
                <span className="text-white/80 text-sm pt-1">{it.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Оплата */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 flex flex-col">
          <div className="flex items-end gap-3 mb-1">
            <span className="font-montserrat font-black text-4xl md:text-5xl text-white">
              {PRICING.price.toLocaleString("ru-RU")} ₽
            </span>
            <span className="text-white/40 text-lg line-through mb-1.5">
              {PRICING.oldPrice.toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <p className="text-emerald-300 text-xs font-semibold mb-5">
            Выгода {(PRICING.oldPrice - PRICING.price).toLocaleString("ru-RU")} ₽ при оплате сейчас
          </p>

          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email для чека и доступа"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
            />
          </div>

          <label className="flex items-start gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 accent-purple-500"
            />
            <span className="text-white/45 text-xs">
              Согласен с условиями оферты и обработкой персональных данных
            </span>
          </label>

          {displayError && <div className="mt-3 text-rose-300 text-xs">{displayError}</div>}

          <button
            onClick={handlePay}
            disabled={isLoading}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform"
          >
            {isLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="CreditCard" size={18} />}
            {isLoading ? "Переходим к оплате..." : "Оплатить и начать"}
          </button>

          <div className="flex items-center justify-center gap-2 mt-3 text-white/35 text-[11px]">
            <Icon name="ShieldCheck" size={13} />
            Безопасная оплата картой или СБП через ЮKassa
          </div>
        </div>
      </div>
    </div>
  );
}