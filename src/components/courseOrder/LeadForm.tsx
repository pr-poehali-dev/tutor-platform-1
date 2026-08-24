import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitOrder, collectUtm, OrderPlan, OrderRequest, MIN_PRICE } from "./api";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  req: OrderRequest;
  plan: OrderPlan | null;
  onClose: () => void;
}

export default function LeadForm({ req, plan, onClose }: Props) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmail = contact.includes("@");
  const isPhone = /[\d\s+\-()]{7,}/.test(contact) && !isEmail;

  const inputCls =
    "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50";

  const submit = async () => {
    if (loading) return;
    if (name.trim().length < 2) return setError("Укажите имя");
    if (!isEmail && !isPhone) return setError("Укажите email или телефон для связи");

    setLoading(true);
    setError(null);
    const res = await submitOrder({
      ...req,
      contact_name: name.trim(),
      contact_email: isEmail ? contact.trim() : undefined,
      contact_phone: isPhone ? contact.trim() : undefined,
      details: [req.details, comment.trim()].filter(Boolean).join("\n") || undefined,
      matched: plan || undefined,
      price: MIN_PRICE,
      utm: collectUtm(),
    });
    setLoading(false);
    if (!res.ok) return setError(res.message || "Не удалось отправить");
    trackGoal("lead_form_success", { form_type: "course_order" });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
      <div className="w-full md:max-w-lg bg-[#12121c] border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-8 max-h-[92vh] overflow-y-auto">
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <Icon name="Check" size={30} className="text-emerald-300" />
            </div>
            <h3 className="font-montserrat font-black text-2xl text-white mb-2">Заявка принята!</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Методист изучит ваш запрос, соберёт программу и свяжется с вами в течение рабочего дня.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform"
            >
              Понятно
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="font-montserrat font-black text-2xl text-white">Заявка на курс</h3>
                <p className="text-white/55 text-sm mt-1">
                  Оставьте контакты — обсудим детали и точную стоимость
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
              >
                <Icon name="X" size={22} />
              </button>
            </div>

            {plan?.course_title && (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 mb-5">
                <div className="text-white/45 text-xs mb-0.5">Ваш курс</div>
                <div className="text-white text-sm font-semibold">{plan.course_title}</div>
              </div>
            )}

            <div className="space-y-3">
              <input
                className={inputCls}
                placeholder="Как вас зовут *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={160}
              />
              <input
                className={inputCls}
                placeholder="Email или телефон *"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={200}
              />
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                placeholder="Комментарий (необязательно)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 flex items-center gap-2">
                <Icon name="TriangleAlert" size={15} />
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full mt-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icon name="LoaderCircle" size={17} className="animate-spin" />
                  Отправляем…
                </>
              ) : (
                "Отправить заявку"
              )}
            </button>
            <p className="text-white/35 text-xs text-center mt-3">
              Нажимая кнопку, вы соглашаетесь на обработку персональных данных
            </p>
          </>
        )}
      </div>
    </div>
  );
}
