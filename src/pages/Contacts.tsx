import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Seo from "@/components/seo/Seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import { submitFeedback, FeedbackPayload } from "@/components/contact/api";

const SITE_URL = "https://xn--h1agdcde2c.xn--p1ai";

const SUBJECTS: { value: FeedbackPayload["subject"]; label: string; emoji: string }[] = [
  { value: "general",     label: "Общий вопрос",         emoji: "💬" },
  { value: "payment",     label: "Оплата и подписка",    emoji: "💳" },
  { value: "tech",        label: "Техническая проблема", emoji: "🛠" },
  { value: "idea",        label: "Идея или предложение", emoji: "💡" },
  { value: "cooperation", label: "Сотрудничество",       emoji: "🤝" },
  { value: "press",       label: "СМИ и пресса",         emoji: "📰" },
];

export default function Contacts() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<FeedbackPayload["subject"]>("general");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.length >= 2 && message.length >= 10 && (email || phone);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setSending(true);
    const res = await submitFeedback({
      contact_name: name.trim(),
      contact_email: email.trim() || undefined,
      contact_phone: phone.trim() || undefined,
      subject,
      message: message.trim(),
    });
    setSending(false);
    if (res.ok) {
      setSuccess(res.message || "Спасибо! Ответим в течение 24 часов.");
      setName(""); setEmail(""); setPhone(""); setMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError(res.message || "Не удалось отправить");
    }
  };

  return (
    <div className="min-h-screen bg-mesh font-golos text-white">
      <Seo
        title="Контакты и обратная связь · УЧИСЬПРО"
        description="Напиши нам по любому вопросу — об оплате, обучении, сотрудничестве или прессе. Ответим в течение 24 часов."
        canonical={`${SITE_URL}/contacts`}
      />

      <div className="border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg">✉️</div>
            <span className="font-montserrat font-black text-base gradient-text-purple group-hover:opacity-80 transition-opacity">УЧИСЬПРО</span>
          </Link>
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16">
        <section className="text-center mb-6">
          <h1 className="font-montserrat font-black text-3xl md:text-5xl mb-3">
            Напиши <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">нам</span>
          </h1>
          <p className="text-white/70">Любой вопрос, идея или предложение. Отвечаем в течение 24 часов.</p>
        </section>

        {/* Быстрые ссылки */}
        <div className="grid sm:grid-cols-3 gap-2 mb-6">
          <Link to="/help" className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-bold text-white text-sm">FAQ</p>
              <p className="text-white/55 text-xs">Готовые ответы</p>
            </div>
          </Link>
          <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noopener noreferrer" className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="text-2xl">💬</div>
            <div>
              <p className="font-bold text-white text-sm">Telegram</p>
              <p className="text-white/55 text-xs">Сообщество</p>
            </div>
          </a>
          <Link to="/reviews" className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-2xl p-4 flex items-center gap-3 transition-colors">
            <div className="text-2xl">⭐</div>
            <div>
              <p className="font-bold text-white text-sm">Отзывы</p>
              <p className="text-white/55 text-xs">Что говорят</p>
            </div>
          </Link>
        </div>

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/35 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <Icon name="CheckCircle2" size={20} className="text-emerald-300 flex-shrink-0" />
            <p className="text-white/85 text-sm">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/35 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <Icon name="AlertCircle" size={18} className="text-rose-300 flex-shrink-0 mt-0.5" />
            <p className="text-white/85 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-card/60 border border-white/10 rounded-3xl p-5 md:p-6 space-y-4">
          {/* Тема */}
          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-2">Тема обращения</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSubject(s.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${
                    subject === s.value
                      ? "bg-cyan-500/15 border-cyan-500/45 text-white"
                      : "bg-white/[0.03] border-white/10 text-white/65 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-xs font-bold">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Имя */}
          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">Имя <span className="text-rose-300">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={160}
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
              placeholder="Как тебя зовут?"
            />
          </div>

          {/* Контакты */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={200}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={40}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                placeholder="+7 (___) ___-__-__"
              />
            </div>
          </div>
          <p className="text-white/45 text-xs">Укажи email или телефон — хотя бы один</p>

          {/* Сообщение */}
          <div>
            <label className="text-white/55 text-[11px] uppercase tracking-wider font-bold block mb-1.5">Сообщение <span className="text-rose-300">*</span></label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              rows={6}
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 resize-y"
              placeholder="Опиши вопрос подробно — это поможет ответить точнее"
            />
            <p className="text-white/35 text-xs mt-1">{message.length} / 5000</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || sending}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black text-sm px-6 py-3.5 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
            Отправить
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
