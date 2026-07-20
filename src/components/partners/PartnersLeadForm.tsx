import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitPartnerLead } from "@/components/contact/api";

const STUDENT_SIZES = ["до 100", "100–500", "500–2000", "2000+"];

export default function PartnersLeadForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState("");
  const [students, setStudents] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Как к вам обращаться?");
    const c = contact.trim();
    const isEmail = /@/.test(c);
    const isPhone = /^[+\d][\d\s()-]{6,}$/.test(c);
    if (!isEmail && !isPhone) return setError("Оставьте email или телефон для связи");

    setLoading(true);
    const utm: Record<string, string> = {};
    try {
      new URLSearchParams(window.location.search).forEach((v, k) => {
        if (k.startsWith("utm_")) utm[k] = v;
      });
    } catch { /* utm необязательны */ }

    const res = await submitPartnerLead({
      contact_name: name.trim(),
      contact_email: isEmail ? c : undefined,
      contact_phone: isPhone ? c : undefined,
      company: company.trim() || undefined,
      audience_type: "school",
      topic: topic.trim() || undefined,
      students_est: students || undefined,
      message: message.trim() || undefined,
      utm: Object.keys(utm).length ? utm : undefined,
    });
    setLoading(false);
    if (!res.ok) return setError(res.message || "Не удалось отправить, попробуйте позже");
    setDone(res.message || "Спасибо! Мы свяжемся с вами в течение рабочего дня.");
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="font-montserrat font-black text-2xl text-white mb-2">Заявка отправлена</h3>
        <p className="text-white/75 text-sm md:text-base max-w-md mx-auto">{done}</p>
      </div>
    );
  }

  const field =
    "w-full bg-white/[0.06] border border-white/12 focus:border-violet-400/60 rounded-xl px-4 py-3 text-white placeholder:text-white/35 outline-none transition-colors";

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-cyan-900/25 p-6 md:p-8"
    >
      <h3 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-1.5">
        Оставьте заявку на сотрудничество
      </h3>
      <p className="text-white/70 text-sm mb-6">
        Ответим в течение рабочего дня и предложим формат партнёрства под вашу школу.
      </p>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input className={field} placeholder="Ваше имя *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={field} placeholder="Название школы" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <input
        className={`${field} mb-3`}
        placeholder="Email или телефон *"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />

      <input
        className={`${field} mb-3`}
        placeholder="Направление / ниша (например, английский для детей)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <div className="mb-3">
        <p className="text-white/55 text-xs font-bold uppercase tracking-wider mb-2">Сколько учеников сейчас</p>
        <div className="flex flex-wrap gap-2">
          {STUDENT_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStudents(students === s ? "" : s)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                students === s
                  ? "bg-violet-500/25 border-violet-400/60 text-white"
                  : "bg-white/[0.05] border-white/12 text-white/70 hover:border-white/25"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className={`${field} mb-4 min-h-[96px] resize-y`}
        placeholder="Кратко о задаче (необязательно)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {error && (
        <p className="text-rose-300 text-sm mb-3 flex items-center gap-1.5">
          <Icon name="TriangleAlert" size={15} /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-black px-7 py-3.5 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Send" size={18} />}
        {loading ? "Отправляем…" : "Отправить заявку"}
      </button>

      <p className="text-white/40 text-xs mt-3 text-center">
        Нажимая кнопку, вы соглашаетесь на обработку данных для связи по вашему запросу.
      </p>
    </form>
  );
}
