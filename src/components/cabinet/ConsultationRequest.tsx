import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitFeedback } from "@/components/contact/api";
import { useAuth } from "@/context/AuthContext";

/**
 * Блок заявки на консультацию в личном кабинете.
 * Закрывает узкое место воронки «Регистрация → Заявки»:
 * даёт вошедшему пользователю короткую форму прямо в кабинете.
 */
export default function ConsultationRequest() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (message.trim().length < 10) {
      setError("Опиши вопрос чуть подробнее (минимум 10 символов)");
      return;
    }
    setError("");
    setSending(true);
    const res = await submitFeedback({
      contact_name: user?.name || "Ученик",
      contact_phone: user?.phone || undefined,
      subject: "general",
      message: message.trim(),
    });
    setSending(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.message || "Не удалось отправить, попробуй ещё раз");
    }
  };

  if (done) {
    return (
      <div className="mt-6 rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 to-green-500/5 p-6 md:p-7 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
          <Icon name="Check" size={24} className="text-emerald-300" />
        </div>
        <h3 className="font-montserrat font-black text-xl text-white mb-1">Заявка отправлена</h3>
        <p className="text-white/65 text-sm">Наставник свяжется с тобой в течение 24 часов.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-white/12 bg-gradient-to-br from-purple-500/10 via-white/[0.03] to-cyan-500/10 p-6 md:p-7">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
          <Icon name="MessageSquareHeart" size={20} className="text-purple-300" fallback="MessageSquare" />
        </div>
        <div>
          <h3 className="font-montserrat font-black text-lg md:text-xl text-white mb-1">
            Нужна помощь с обучением?
          </h3>
          <p className="text-white/60 text-sm">
            Оставь заявку — подберём программу под твою цель и ответим на любой вопрос. Бесплатно.
          </p>
        </div>
      </div>

      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (error) setError("");
        }}
        rows={3}
        maxLength={1000}
        placeholder="Например: к какому экзамену готовиться и с чего начать?"
        className="w-full rounded-2xl bg-background/40 border border-white/12 focus:border-purple-400/50 focus:outline-none text-white text-sm placeholder:text-white/35 p-4 resize-none transition-colors"
      />

      {error && (
        <p className="text-rose-300 text-xs mt-2 flex items-center gap-1.5">
          <Icon name="CircleAlert" size={13} />
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={sending}
        className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm hover:scale-[1.02] shadow-lg shadow-purple-500/30 transition-all disabled:opacity-60 disabled:hover:scale-100"
      >
        {sending ? (
          <Icon name="Loader2" size={16} className="animate-spin" />
        ) : (
          <Icon name="Send" size={16} />
        )}
        {sending ? "Отправляем…" : "Получить консультацию"}
      </button>
    </div>
  );
}
