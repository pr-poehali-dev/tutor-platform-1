import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useYookassa, isValidEmail } from "@/components/extensions/yookassa/useYookassa";
import { setPaidEmail } from "@/components/intensive/api";
import { REPORT_PRICE, REPORT_TRACK } from "./reportContent";
import func2url from "../../../../backend/func2url.json";

const YOOKASSA_URL = (func2url as Record<string, string>)["yookassa-yookassa"];

/**
 * Оплата PDF-разбора по email без регистрации.
 * Переиспользует механизм интенсива: webhook (kind='intensive')
 * пишет доступ в intensive_access с track='bizreport'.
 */
export default function ReportPayForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const { createPayment, isLoading, error } = useYookassa({ apiUrl: YOOKASSA_URL });

  const handlePay = async () => {
    setLocalError(null);
    if (!isValidEmail(email)) {
      setLocalError("Введите корректный email — на него придёт чек и доступ");
      return;
    }
    if (!agree) {
      setLocalError("Подтвердите согласие с условиями");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    setPaidEmail(cleanEmail, REPORT_TRACK);
    const returnUrl = `${window.location.origin}/biz-report?paid=1`;
    const res = await createPayment({
      amount: REPORT_PRICE,
      userEmail: cleanEmail,
      userName: name.trim(),
      description: "PDF-разбор бизнес-идеи с расчётом экономики",
      returnUrl,
      cartItems: [
        {
          id: REPORT_TRACK,
          name: "PDF-разбор бизнес-идеи с расчётом экономики",
          price: REPORT_PRICE,
          quantity: 1,
        },
      ],
      metadata: {
        kind: "intensive",
        email: cleanEmail,
        name: name.trim(),
        track: REPORT_TRACK,
      },
    });
    if (res?.payment_url && /^https:\/\//.test(res.payment_url)) {
      window.location.href = res.payment_url;
    }
  };

  const displayError = localError || (error ? error.message : null);

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 md:p-7">
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <span className="font-montserrat font-black text-4xl md:text-5xl text-white">
          {REPORT_PRICE} ₽
        </span>
        <span className="text-white/40 text-lg line-through">2 900 ₽</span>
        <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300">
          цена запуска
        </span>
      </div>
      <p className="text-white/50 text-xs mb-5">
        Разовая оплата · документ остаётся у вас навсегда · чек по 54-ФЗ
      </p>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя (необязательно)"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/40"
        />
        <label className="block">
          <span className="block text-white text-xs font-bold mb-1.5">
            Email <span className="text-rose-300">*</span>
            <span className="text-white/50 font-normal"> — сюда придёт отчёт и чек</span>
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="example@mail.ru"
            className="w-full bg-white/[0.07] border-2 border-amber-400/35 rounded-xl px-4 py-3.5 text-base text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400/70"
          />
        </label>
      </div>

      <label className="flex items-start gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 accent-amber-500"
        />
        <span className="text-white/45 text-xs">
          Согласен с{" "}
          <Link to="/legal/offer" className="text-amber-300/80 hover:text-amber-200 underline">
            офертой
          </Link>{" "}
          и обработкой персональных данных
        </span>
      </label>

      {displayError && <div className="mt-3 text-rose-300 text-xs">{displayError}</div>}

      <button
        onClick={handlePay}
        disabled={isLoading}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-base py-4 rounded-2xl disabled:opacity-60 hover:scale-[1.01] transition-transform shadow-lg shadow-amber-500/20"
      >
        {isLoading ? (
          <Icon name="Loader2" size={18} className="animate-spin" />
        ) : (
          <Icon name="CreditCard" size={18} />
        )}
        {isLoading ? "Переходим к оплате..." : `Получить разбор за ${REPORT_PRICE} ₽`}
      </button>

      <div className="mt-4 grid gap-2 text-xs text-white/50">
        <span className="flex items-center gap-2">
          <Icon name="ShieldCheck" size={14} className="text-emerald-400 shrink-0" />
          Оплата через ЮKassa — картой или СБП, данные не хранятся на сайте
        </span>
        <span className="flex items-center gap-2">
          <Icon name="RotateCcw" size={14} className="text-emerald-400 shrink-0" />
          Возврат 100% в течение 7 дней без объяснения причин
        </span>
        <span className="flex items-center gap-2">
          <Icon name="UserX" size={14} className="text-emerald-400 shrink-0" />
          Без регистрации и подписки — только email для чека
        </span>
      </div>
    </div>
  );
}