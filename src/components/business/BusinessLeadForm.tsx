import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitPartnerLead, PartnerLeadPayload } from "@/components/contact/api";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const AUDIENCE: { value: NonNullable<PartnerLeadPayload["audience_type"]>; label: string; emoji: string }[] = [
  { value: "author", label: "Автор / эксперт", emoji: "🎤" },
  { value: "school", label: "Онлайн-школа", emoji: "🏫" },
  { value: "business", label: "Компания", emoji: "🏢" },
  { value: "edu", label: "Учебное заведение", emoji: "🎓" },
];

const STUDENTS: string[] = ["до 100", "100–500", "500–2000", "2000+"];

interface Props {
  defaultPlan?: NonNullable<PartnerLeadPayload["plan_interest"]>;
}

export default function BusinessLeadForm({ defaultPlan }: Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [audience, setAudience] = useState<PartnerLeadPayload["audience_type"]>();
  const [students, setStudents] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEmail = contact.includes("@");
  const isPhone = /[\d\s+\-()]{7,}/.test(contact) && !isEmail;

  const submit = async () => {
    if (loading) return;
    if (name.trim().length < 2) return setError("Укажите имя");
    if (!isEmail && !isPhone) return setError("Укажите email или телефон для связи");
    setLoading(true);
    setError(null);

    let utm: Record<string, string> | undefined;
    try {
      const p = new URLSearchParams(window.location.search);
      const collected: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
        const v = p.get(k);
        if (v) collected[k] = v;
      });
      if (Object.keys(collected).length) utm = collected;
    } catch {
      /* ignore */
    }

    const res = await submitPartnerLead({
      contact_name: name.trim(),
      contact_email: isEmail ? contact.trim() : undefined,
      contact_phone: isPhone ? contact.trim() : undefined,
      company: company.trim() || undefined,
      audience_type: audience,
      students_est: students || undefined,
      topic: topic.trim() || undefined,
      plan_interest: defaultPlan,
      utm,
    });
    setLoading(false);
    if (!res.ok) return setError(res.error || res.message || "Не удалось отправить");
    trackGoal("lead_form_success", { form_type: "business", audience: audience || "unknown" });
    setDone(res.message || "Заявка принята!");
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.08] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={28} className="text-emerald-300" />
        </div>
        <h3 className="font-montserrat font-black text-xl text-white mb-2">Заявка отправлена!</h3>
        <p className="text-white/70 text-sm">{done}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-montserrat font-black text-xl text-white mb-1">Запустить свою школу</h3>
      <p className="text-white/55 text-sm mb-5">
        Оставьте контакт — покажем платформу и соберём первый курс на ИИ прямо на демо. Ответим в течение рабочего дня.
      </p>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как вас зовут?"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/40"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email или телефон"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/40"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Название школы или компании (необязательно)"
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/40"
        />

        <div>
          <p className="text-white/45 text-xs mb-2">Кто вы?</p>
          <div className="grid grid-cols-2 gap-2">
            {AUDIENCE.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAudience(a.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  audience === a.value
                    ? "border-violet-400/60 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25"
                }`}
              >
                <span>{a.emoji}</span>
                <span className="truncate">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/45 text-xs mb-2">Сколько учеников планируете?</p>
          <div className="flex flex-wrap gap-2">
            {STUDENTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStudents(students === s ? "" : s)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                  students === s
                    ? "border-violet-400/60 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="О чём хотите делать курсы? (необязательно)"
          rows={2}
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/40 resize-y"
        />
      </div>

      {error && <div className="mt-3 text-rose-300 text-xs">{error}</div>}

      <button
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform"
      >
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Rocket" size={18} />}
        {loading ? "Отправляем..." : "Получить демо и цену"}
      </button>
      <p className="text-white/35 text-[11px] text-center mt-3">
        Никакого спама. Только чтобы показать платформу и рассчитать тариф под вашу задачу.
      </p>
    </div>
  );
}