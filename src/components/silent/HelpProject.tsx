import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitFeedback } from "@/components/contact/api";

const ROLES = [
  { id: "Носитель РЖЯ", label: "Носитель РЖЯ", icon: "Hand" },
  { id: "Педагог / сурдопедагог", label: "Педагог", icon: "GraduationCap" },
  { id: "Родитель", label: "Родитель", icon: "Heart" },
  { id: "Хочу поддержать", label: "Поддержать", icon: "Sparkles" },
];

export default function HelpProject() {
  const [role, setRole] = useState(ROLES[0].id);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isEmail = contact.includes("@");

  const handleSubmit = async () => {
    setError(null);
    if (name.trim().length < 2) { setError("Укажи имя"); return; }
    if (!contact.trim()) { setError("Укажи email или телефон для связи"); return; }
    setSending(true);
    const res = await submitFeedback({
      contact_name: name.trim(),
      contact_email: isEmail ? contact.trim() : undefined,
      contact_phone: isEmail ? undefined : contact.trim(),
      subject: "cooperation",
      message: `[Помощь курсу для глухих детей]\nРоль: ${role}\n${note.trim() || "Хочу помочь проекту."}`,
    });
    setSending(false);
    if (res.ok) {
      setDone(true);
      setName(""); setContact(""); setNote("");
    } else {
      setError(res.message || "Не удалось отправить");
    }
  };

  return (
    <section id="help" className="mb-14 scroll-mt-24">
      <div className="rounded-3xl border border-teal-400/25 bg-gradient-to-br from-teal-500/[0.1] via-transparent to-purple-500/[0.08] p-6 md:p-9">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <Icon name="HeartHandshake" size={18} className="text-teal-300" />
          </div>
          <span className="text-teal-200 text-sm font-bold uppercase tracking-wider">Помочь проекту</span>
        </div>
        <h2 className="font-montserrat font-black text-2xl md:text-3xl text-white mb-2">
          Учиться могут все — помогите нам это доказать
        </h2>
        <p className="text-white/70 max-w-2xl mb-6 leading-relaxed">
          Мы хотим записать настоящие видео жестов с носителями РЖЯ и расширять курс.
          Если вы носитель жестового языка, педагог или родитель — откликнитесь, будем рады
          сделать проект вместе.
        </p>

        {done ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="CircleCheck" size={22} className="text-emerald-300" />
            </div>
            <div>
              <p className="font-bold text-white">Спасибо! Заявка отправлена.</p>
              <p className="text-white/70 text-sm">Мы свяжемся с вами в ближайшее время.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* Роль */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
                    role === r.id
                      ? "bg-teal-500/25 border-teal-400/50 text-teal-100"
                      : "bg-white/5 border-white/12 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <Icon name={r.icon} size={14} />
                  {r.label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут"
                className="w-full rounded-xl bg-white/5 border border-white/12 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-teal-400/50"
              />
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email или телефон"
                className="w-full rounded-xl bg-white/5 border border-white/12 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-teal-400/50"
              />
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Пара слов о себе и чем можете помочь (необязательно)"
              rows={3}
              className="w-full rounded-xl bg-white/5 border border-white/12 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-teal-400/50 resize-none mb-3"
            />

            {error && <p className="text-rose-300 text-sm mb-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-7 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon name={sending ? "Loader" : "Send"} size={18} className={sending ? "animate-spin" : ""} />
              {sending ? "Отправляем…" : "Откликнуться"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}