import { useState } from "react";
import Icon from "@/components/ui/icon";
import { submitPartnerLead } from "@/components/contact/api";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const TEAM_SIZES = ["до 20", "20–100", "100–500", "500+"];

const GOALS = [
  { id: "onboarding", label: "Онбординг новых сотрудников", emoji: "🎯" },
  { id: "product", label: "Обучение продуктовой линейке", emoji: "🏭" },
  { id: "sales", label: "Прокачать продажи и возражения", emoji: "🤝" },
  { id: "automation", label: "Автоматизация КП и подбора", emoji: "⚙️" },
];

export default function CorporateLeadForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [team, setTeam] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEmail = contact.includes("@");
  const isPhone = /[\d\s+\-()]{7,}/.test(contact) && !isEmail;

  const toggleGoal = (id: string) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

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

    const goalLabels = GOALS.filter((g) => goals.includes(g.id)).map((g) => g.label);
    const message = [
      goalLabels.length ? `Цели: ${goalLabels.join(", ")}.` : "",
      topic.trim() ? `Продукт/задача: ${topic.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const res = await submitPartnerLead({
      contact_name: name.trim(),
      contact_email: isEmail ? contact.trim() : undefined,
      contact_phone: isPhone ? contact.trim() : undefined,
      company: company.trim() || undefined,
      audience_type: "business",
      students_est: team || undefined,
      topic: topic.trim() || undefined,
      message: message || undefined,
      utm,
    });

    setLoading(false);
    if (!res.ok) return setError(res.message || "Не удалось отправить");
    trackGoal("lead_form_success", { form_type: "corporate", team: team || "unknown" });
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
        <p className="text-white/45 text-xs mt-3">
          Свяжемся в течение рабочего дня, покажем демо и рассчитаем внедрение под вашу команду.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-montserrat font-black text-xl text-white mb-1">Заявка на корпоративное обучение</h3>
      <p className="text-white/55 text-sm mb-5">
        Оставьте контакт — покажем демо, соберём пилотный курс по вашему продукту и рассчитаем внедрение под команду.
      </p>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как вас зовут?" className={inputCls} />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email или телефон" className={inputCls} />
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Компания" className={inputCls} />

        <div>
          <p className="text-white/45 text-xs mb-2">Что нужно решить? (можно несколько)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-all ${
                  goals.includes(g.id)
                    ? "border-amber-400/60 bg-amber-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25"
                }`}
              >
                <span>{g.emoji}</span>
                <span className="truncate">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/45 text-xs mb-2">Размер команды на обучение</p>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTeam(team === s ? "" : s)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                  team === s
                    ? "border-amber-400/60 bg-amber-500/15 text-white"
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
          placeholder="Коротко о продукте или задаче (необязательно)"
          rows={2}
          className={`${inputCls} resize-y`}
        />
      </div>

      {error && <div className="mt-3 text-rose-300 text-xs">{error}</div>}

      <button
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-60 hover:scale-[1.01] transition-transform"
      >
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Send" size={18} />}
        {loading ? "Отправляем..." : "Получить демо и расчёт"}
      </button>
      <p className="text-white/35 text-[11px] text-center mt-3">
        Никакого спама. Только чтобы показать платформу и подготовить предложение под вашу задачу.
      </p>
    </div>
  );
}
