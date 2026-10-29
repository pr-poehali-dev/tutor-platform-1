import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useYookassa, isValidEmail } from "@/components/extensions/yookassa/useYookassa";
import { setPaidEmail } from "@/components/intensive/api";
import { trackGoal } from "@/components/analytics/YandexMetrika";
import { SPY_META, SPY_OLD_PRICE, SPY_PRICE } from "./data";
import func2url from "../../../backend/func2url.json";

const YOOKASSA_URL = (func2url as Record<string, string>)["yookassa-yookassa"];

const INCLUDES = [
  { icon: "BookOpen", text: "30 дней программы: 28 тем, большое повторение и итоговый экзамен" },
  { icon: "Layers", text: "1008 частотных слов с произношением и примерами" },
  { icon: "Repeat", text: "Интервальные повторения: слово возвращается, пока не закрепится" },
  { icon: "ShieldCheck", text: "Ежедневный зачёт с порогом 80%" },
  { icon: "Bot", text: "ИИ-инструктор проверяет письменные задания" },
  { icon: "Globe", text: "8 языков на выбор — в одной оплате" },
];

export default function PayBlock() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const { createPayment, isLoading, error } = useYookassa({ apiUrl: YOOKASSA_URL });

  const pay = async () => {
    setLocalError(null);
    if (!isValidEmail(email)) {
      setLocalError("Введите корректный email — на него придёт чек и доступ");
      return;
    }
    if (!agree) {
      setLocalError("Подтвердите согласие с условиями");
      return;
    }
    const clean = email.trim().toLowerCase();
    setPaidEmail(clean, SPY_META.track);
    trackGoal("spy_language_pay_click", { price: SPY_PRICE });
    const res = await createPayment({
      amount: SPY_PRICE,
      userEmail: clean,
      userName: name.trim(),
      description: `Интенсив «${SPY_META.title}»`,
      returnUrl: `${window.location.origin}/yazyk-za-30-dney?paid=1`,
      cartItems: [{ id: "course-spy-language", name: SPY_META.title, price: SPY_PRICE, quantity: 1 }],
      metadata: { kind: "intensive", email: clean, name: name.trim(), track: SPY_META.track },
    });
    if (res?.payment_url && /^https:\/\//.test(res.payment_url)) {
      window.location.href = res.payment_url;
      return;
    }
    setLocalError("Не удалось открыть страницу оплаты. Попробуйте ещё раз — деньги не списаны.");
  };

  const displayError = localError || (error ? error.message : null);

  return (
    <div className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1">Полный доступ к интенсиву</h2>
          <p className="text-white/55 text-sm mb-5">Разовая оплата · доступ навсегда · старт сразу после оплаты</p>
          <ul className="space-y-3">
            {INCLUDES.map((it) => (
              <li key={it.text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={it.icon} size={16} className="text-amber-300" />
                </div>
                <span className="text-white/80 text-sm pt-1">{it.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 flex flex-col">
          <div className="flex items-end gap-3 mb-1">
            <span className="font-montserrat font-black text-4xl md:text-5xl text-white">{SPY_PRICE.toLocaleString("ru-RU")} ₽</span>
            <span className="text-white/40 text-lg line-through mb-1.5">{SPY_OLD_PRICE.toLocaleString("ru-RU")} ₽</span>
          </div>
          <p className="text-white/50 text-xs mb-5">Оплата картой или СБП · чек по 54-ФЗ</p>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email — сюда придёт доступ и чек"
              className="w-full bg-white/[0.07] border-2 border-amber-400/35 rounded-xl px-4 py-3.5 text-base text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/70"
            />
          </div>
          <label className="flex items-start gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-amber-500" />
            <span className="text-white/45 text-xs">Согласен с условиями оферты и обработкой персональных данных</span>
          </label>
          {displayError && <div className="mt-3 text-rose-300 text-xs">{displayError}</div>}
          <button
            onClick={pay}
            disabled={isLoading}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform"
          >
            {isLoading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="CreditCard" size={18} />}
            {isLoading ? "Переходим к оплате..." : "Оплатить и начать"}
          </button>
          <div className="flex items-center justify-center gap-2 mt-3 text-white/35 text-[11px]">
            <Icon name="ShieldCheck" size={13} />
            Безопасная оплата через ЮKassa
          </div>
        </div>
      </div>
    </div>
  );
}
