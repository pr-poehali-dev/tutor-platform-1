import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const CONTACT_URL = (func2url as Record<string, string>)["contact"];

const PERKS = [
  { icon: "Sparkles", text: "ИИ собирает курс из вашей темы за минуту" },
  { icon: "Wallet", text: "Приём оплат от учеников через ЮKassa" },
  { icon: "Users", text: "Управление учениками и доступами" },
  { icon: "Palette", text: "Свой бренд, логотип и домен школы" },
  { icon: "GraduationCap", text: "Личный ИИ-преподаватель по вашему курсу" },
];

export default function NoAccessGate() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (sending) return;
    if (name.trim().length < 2) return setError("Укажите имя");
    if (!email.includes("@")) return setError("Укажите email");
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`${CONTACT_URL}?action=partner_lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: name.trim(),
          contact_email: email.trim(),
          topic: topic.trim() || undefined,
          audience_type: "author",
          source: "builder-gate",
          message: "Заявка на доступ в конструктор школ (со страницы доступа).",
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) setDone(true);
      else setError(data.error || "Не удалось отправить заявку");
    } catch {
      setError("Сеть недоступна");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg">🚀</div>
            <span className="font-montserrat font-black text-base gradient-text-purple">УЧИСЬПРО</span>
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-5">
            <Icon name="Lock" size={30} className="text-violet-300" />
          </div>
          <h1 className="font-montserrat font-black text-2xl md:text-3xl mb-3">Конструктор школ — по приглашению</h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            Доступ к созданию собственной онлайн-школы открывается индивидуально. Оставьте заявку — мы свяжемся
            и вышлем персональную ссылку для входа.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-2 mb-8">
          {PERKS.map((p) => (
            <div key={p.text} className="rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-center">
              <Icon name={p.icon} size={18} className="text-violet-300 mx-auto mb-2" />
              <div className="text-white/70 text-xs leading-tight">{p.text}</div>
            </div>
          ))}
        </div>

        {done ? (
          <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.06] p-8 text-center">
            <Icon name="CircleCheck" size={30} className="text-emerald-300 mx-auto mb-3" />
            <h2 className="font-montserrat font-bold text-lg mb-1">Заявка отправлена!</h2>
            <p className="text-white/60 text-sm">Мы свяжемся с вами по email и пришлём персональную ссылку для входа в конструктор.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
            <h2 className="font-montserrat font-bold text-lg mb-4">Оставить заявку на доступ</h2>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email для приглашения"
                className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
              />
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="О чём ваши курсы? (необязательно)"
                className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
              />
              {error && <p className="text-rose-300 text-xs">{error}</p>}
              <button
                onClick={submit}
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-60"
              >
                {sending ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
                Отправить заявку
              </button>
              <p className="text-white/35 text-xs text-center">
                Уже получили ссылку-приглашение? Просто перейдите по ней, войдя в тот же email.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
