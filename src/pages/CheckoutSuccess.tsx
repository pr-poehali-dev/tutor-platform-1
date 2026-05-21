import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const planParam = params.get("plan") || "";
  const { refresh } = useAuth();
  const [pendingOrder, setPendingOrder] = useState<{ order_number?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("yookassa_pending_order");
      if (raw) setPendingOrder(JSON.parse(raw));
    } catch {
      // ignore
    }
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen bg-mesh font-golos text-white flex items-center justify-center px-4 py-10">
      <Seo title="Оплата завершена — УЧИСЬПРО" description="Подписка активирована, чек отправлен на email." canonical="https://xn--h1agdcde2c.xn--p1ai/checkout/success" />

      <div className="max-w-lg w-full text-center">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
          <Icon name="Check" size={36} className="text-white" />
        </div>

        <h1 className="font-montserrat font-black text-3xl md:text-4xl text-white mb-3">
          Спасибо за покупку!
        </h1>
        <p className="text-white/70 text-base md:text-lg mb-6 leading-relaxed">
          Платёж принят. Подписка активируется в течение минуты — обнови страницу кабинета, если статус ещё не обновился.
        </p>

        {pendingOrder?.order_number && (
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 mb-6">
            <p className="text-white/55 text-xs uppercase tracking-wide font-semibold mb-1">Номер заказа</p>
            <p className="text-white font-mono text-lg">{pendingOrder.order_number}</p>
          </div>
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
          Чек об оплате отправлен на твой email. Если подписка не активировалась через 5 минут — напиши нам в{" "}
          <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noreferrer" className="text-purple-300 hover:text-purple-200 underline">
            поддержку
          </a>
          {planParam ? `, укажи тариф «${planParam}» и номер заказа.` : "."}
        </p>
      </div>
    </div>
  );
}
