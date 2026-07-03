import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitLead } from "./api";
import { INTENSIVE_META } from "./data";
import { trackGoal } from "@/components/analytics/YandexMetrika";

interface Props {
  source?: string;
}

export default function LeadForm({ source = "landing" }: Props) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (loading) return;
    if (name.trim().length < 2) return setError("Укажи имя");
    if (contact.trim().length < 3) return setError("Укажи контакт для связи");
    setLoading(true);
    setError(null);
    const res = await submitLead({
      name: name.trim(),
      contact: contact.trim(),
      comment: comment.trim(),
      track: INTENSIVE_META.track,
      source,
    });
    setLoading(false);
    if (!res.ok) return setError(res.error || "Не удалось отправить");
    trackGoal("lead_form_success", { form_type: "intensive", track: INTENSIVE_META.track });
    setDone(res.message || "Заявка принята!");
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.08] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={28} className="text-emerald-300" />
        </div>
        <h3 className="font-montserrat font-black text-xl text-white mb-2">Готово!</h3>
        <p className="text-white/70 text-sm">{done}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-montserrat font-black text-xl text-white mb-1">Остались вопросы?</h3>
      <p className="text-white/55 text-sm mb-5">
        Оставь контакт — расскажем подробнее об интенсиве и поможем со стартом. Ответим в течение дня.
      </p>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как тебя зовут?"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Телефон, email или @ник в мессенджере"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий (необязательно): расскажи о себе или о цели"
          rows={2}
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40 resize-y"
        />
      </div>

      {error && <div className="mt-3 text-rose-300 text-xs">{error}</div>}

      <button
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform"
      >
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Rocket" size={18} />}
        {loading ? "Отправляем..." : "Оставить заявку"}
      </button>
      <p className="text-white/35 text-[11px] text-center mt-3">
        Это практический интенсив-наставничество. По итогу — портфолио и сертификат об участии.
      </p>
    </div>
  );
}