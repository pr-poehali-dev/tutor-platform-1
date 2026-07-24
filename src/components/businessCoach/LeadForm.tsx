import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitCareerLead, collectUtm, CareerPlan, Answers } from "./api";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  goal: string;
  answers: Answers;
  plan: CareerPlan;
  price: number;
  onClose: () => void;
}

export default function LeadForm({ goal, answers, plan, price, onClose }: Props) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmail = contact.includes("@");
  const isPhone = /[\d\s+\-()]{7,}/.test(contact) && !isEmail;

  const submit = async () => {
    if (loading) return;
    if (name.trim().length < 2) return setError("Укажите имя");
    if (!isEmail && !isPhone) return setError("Укажите email или телефон для связи");

    setLoading(true);
    setError(null);
    const res = await submitCareerLead({
      contact_name: name.trim(),
      contact_email: isEmail ? contact.trim() : undefined,
      contact_phone: isPhone ? contact.trim() : undefined,
      goal,
      answers,
      plan,
      price,
      message: message.trim() || undefined,
      utm: collectUtm(),
    });
    setLoading(false);
    if (!res.ok) return setError(res.message || "Не удалось отправить");
    trackGoal("lead_form_success", { form_type: "business_coach" });
    setDone(true);
  };

  const inputCls =
    "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50";

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.08] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={28} className="text-emerald-300" />
        </div>
        <h3 className="font-montserrat font-black text-xl text-white mb-2">Заявка принята!</h3>
        <p className="text-white/70 text-sm">
          Мы согласуем детали вашей программы «{plan.course_title}» и свяжемся с вами в течение рабочего дня.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h3 className="font-montserrat font-black text-xl text-white">Заявка на индивидуальную программу</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white flex-shrink-0" aria-label="Закрыть">
          <Icon name="X" size={20} />
        </button>
      </div>
      <p className="text-white/55 text-sm mb-5">
        Оставьте контакт — согласуем программу «{plan.course_title}» и старт работы.
      </p>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как вас зовут?" className={inputCls} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email или телефон" className={inputCls} />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Комментарий или вопрос (необязательно)"
          rows={2}
          className={`${inputCls} resize-y`}
        />
      </div>

      {error && <div className="mt-3 text-rose-300 text-xs">{error}</div>}

      <button
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform"
      >
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Send" size={18} />}
        {loading ? "Отправляем..." : "Отправить заявку"}
      </button>
      <p className="text-white/35 text-[11px] text-center mt-3">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных. Никакого спама.
      </p>
    </div>
  );
}
