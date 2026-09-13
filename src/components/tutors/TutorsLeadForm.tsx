import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitPartnerLead } from "@/components/contact/api";
import { trackGoal } from "@/components/analytics/YandexMetrika";

/**
 * Заявка репетитора на доступ к своей школе.
 *
 * Зачем отдельная форма: кабинет школы открывается по приглашению, поэтому
 * репетитору нужен канал «я хочу продавать курсы». Раньше такой человек
 * упирался в закрытую дверь и уходил.
 */
export default function TutorsLeadForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmail = contact.includes("@");

  const send = async () => {
    if (name.trim().length < 2) {
      setError("Как вас зовут?");
      return;
    }
    if (contact.trim().length < 5) {
      setError("Оставьте email или телефон — иначе мы не сможем ответить");
      return;
    }
    setError(null);
    setSending(true);
    const res = await submitPartnerLead({
      contact_name: name.trim(),
      contact_email: isEmail ? contact.trim() : undefined,
      contact_phone: isEmail ? undefined : contact.trim(),
      audience_type: "author",
      topic: subject.trim() || undefined,
      message: `Заявка репетитора на доступ к своей школе. Предмет: ${subject.trim() || "не указан"}`,
    });
    setSending(false);
    if (res.ok) {
      setDone(true);
      // Главная конверсия воронки репетиторов — на эту цель обучается Директ.
      trackGoal("tutor_lead_sent", { subject: subject.trim().slice(0, 60) });
    } else {
      setError(res.message || "Не удалось отправить. Попробуйте ещё раз");
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.07] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Icon name="CircleCheck" size={28} className="text-emerald-300" />
        </div>
        <h3 className="font-montserrat font-black text-xl text-white mb-2">Заявка принята</h3>
        <p className="text-white/65 text-sm max-w-md mx-auto">
          Свяжемся с вами и откроем доступ к кабинету школы. А пока — соберите
          первый курс в конструкторе, он уже доступен.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-montserrat font-black text-xl md:text-2xl text-white mb-2">
        Хочу продавать свои курсы
      </h3>
      <p className="text-white/60 text-sm mb-5">
        Откроем кабинет школы: приём оплат, свой бренд и ИИ-наставник для учеников.
      </p>

      <label className="block text-white/70 text-sm font-medium mb-2">Как вас зовут?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Анна Петрова"
        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 mb-4"
      />

      <label className="block text-white/70 text-sm font-medium mb-2">Email или телефон</label>
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="anna@mail.ru или +7 900 000-00-00"
        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 mb-4"
      />

      <label className="block text-white/70 text-sm font-medium mb-2">
        Что преподаёте? <span className="text-white/35">(необязательно)</span>
      </label>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Английский, математика, вокал…"
        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 mb-5"
      />

      {error && (
        <p className="text-rose-300 text-sm mb-4 flex items-center gap-2">
          <Icon name="CircleAlert" size={15} /> {error}
        </p>
      )}

      <button
        onClick={send}
        disabled={sending}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black py-3.5 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:hover:scale-100"
      >
        {sending ? (
          <>
            <Icon name="Loader2" size={18} className="animate-spin" /> Отправляю…
          </>
        ) : (
          <>
            <Icon name="Send" size={18} /> Оставить заявку
          </>
        )}
      </button>
      <p className="text-white/40 text-xs text-center mt-3">
        Обычно отвечаем в течение рабочего дня
      </p>
    </div>
  );
}