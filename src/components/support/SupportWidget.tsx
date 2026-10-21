import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { supportChat, supportTicket, ChatMsg } from "./api";

const HIDDEN_PREFIXES = ["/admin", "/h/", "/max", "/kids", "/malysh", "/silent/lesson", "/mini-course/", "/course/",
  "/checkout", "/course-checkout", "/school/learning", "/for-schools/presentation", "/for-kindergartens/presentation",
  "/repetitoram/presentation", "/parents/presentation", "/partner/presentation", "/pilot/", "/samara/leaflet", "/leaflet/"];
const QUICK = ["Сколько стоит подписка?", "Не открылся доступ после оплаты", "Как восстановить пароль?", "Хочу вернуть деньги"];
const STORE = "uchispro_support_chat_v1";

/** Плавающая кнопка поддержки: ИИ отвечает сразу, сложные вопросы уходят команде. */
export default function SupportWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(STORE) || "[]"); } catch { return []; }
  });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-20))); } catch { /* noop */ }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, busy, form]);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const send = async (q?: string) => {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    const history = msgs;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setText("");
    setBusy(true);
    const r = await supportChat(question, history, pathname);
    setBusy(false);
    setMsgs((m) => [...m, { role: "assistant", text: r.answer }]);
    if (r.escalate) setForm(true);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Написать в поддержку"
        className="fixed left-3 md:left-5 bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-5 z-[115] flex items-center gap-2 h-12 pl-3.5 pr-4 rounded-full bg-[#141225] border border-white/15 text-white shadow-xl shadow-black/40 hover:border-violet-400/60 transition-colors"
      >
        <Icon name="CircleHelp" fallback="MessageCircle" size={20} className="text-violet-300" />
        <span className="text-sm font-semibold hidden sm:inline">Поддержка</span>
      </button>
    );
  }

  return (
    <div className="fixed left-3 md:left-5 bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-5 z-[125] w-[min(92vw,380px)] h-[min(78vh,560px)] flex flex-col rounded-2xl border border-white/15 bg-[#100e1d] text-white shadow-2xl shadow-black/60 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600/40 to-cyan-600/25 border-b border-white/10">
        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center"><Icon name="Headphones" size={18} /></div>
        <div className="flex-1 min-w-0">
          <p className="font-bold leading-tight">Поддержка УЧИСЬПРО</p>
          <p className="text-xs text-white/60">ИИ отвечает сразу · команда — в течение 24 ч</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Свернуть" className="p-1.5 rounded-lg hover:bg-white/10">
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-sm">
        <Bubble role="assistant" text="Здравствуйте! Я помогу с вопросами об оплате, доступе, курсах и работе сайта. Если не смогу ответить — передам вопрос команде." />
        {!msgs.length && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)} className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-xs hover:border-violet-400/50">
                {q}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => <Bubble key={i} role={m.role} text={m.text} />)}
        {busy && <p className="text-white/50 flex items-center gap-2"><Icon name="Loader2" size={14} className="animate-spin" /> Печатает…</p>}
        {form ? (
          <TicketForm chat={msgs} page={pathname} onDone={(m) => { setForm(false); setMsgs((x) => [...x, { role: "assistant", text: m }]); }} onCancel={() => setForm(false)} />
        ) : msgs.length > 0 && (
          <button onClick={() => setForm(true)} className="text-xs text-violet-300 hover:underline flex items-center gap-1">
            <Icon name="UserRound" size={13} /> Написать команде
          </button>
        )}
        <div ref={endRef} />
      </div>

      {!form && (
        <div className="p-2.5 border-t border-white/10 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            maxLength={800}
            placeholder="Ваш вопрос…"
            className="flex-1 h-10 rounded-xl bg-white/[0.06] border border-white/10 px-3 text-sm outline-none focus:border-violet-400/60"
          />
          <button onClick={() => send()} disabled={busy || !text.trim()} aria-label="Отправить"
            className="h-10 w-10 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center disabled:opacity-40">
            <Icon name="Send" size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

function Bubble({ role, text }: ChatMsg) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-2xl px-3 py-2 leading-relaxed whitespace-pre-wrap ${mine ? "bg-violet-600 text-white" : "bg-white/[0.07] text-white/90"}`}>
        {text}
      </div>
    </div>
  );
}

function TicketForm({ chat, page, onDone, onCancel }: { chat: ChatMsg[]; page: string; onDone: (m: string) => void; onCancel: () => void }) {
  const lastQ = [...chat].reverse().find((m) => m.role === "user")?.text || "";
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState(lastQ);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const c = contact.trim();
    const isEmail = c.includes("@");
    setBusy(true);
    const r = await supportTicket({
      contact_name: name.trim(),
      contact_email: isEmail ? c : "",
      contact_phone: isEmail ? "" : c,
      message: message.trim(),
      subject: /оплат|деньг|возврат|чек/i.test(message) ? "payment" : /войти|парол|доступ/i.test(message) ? "access" : /ошибк|не работ|не открыва|завис/i.test(message) ? "tech" : "general",
      page, chat, website,
    });
    setBusy(false);
    if (r.ok) onDone(r.message || "Спасибо! Обращение получено — ответим в течение 24 часов.");
    else setError(r.error || "Не удалось отправить");
  };

  const cls = "w-full h-10 rounded-xl bg-white/[0.06] border border-white/10 px-3 text-sm outline-none focus:border-violet-400/60";
  return (
    <div className="rounded-xl border border-violet-400/30 bg-violet-500/[0.08] p-3 space-y-2">
      <p className="font-semibold text-sm">Передать вопрос команде</p>
      <input className={cls} placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} maxLength={160} />
      <input className={cls} placeholder="Email или телефон для ответа" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} />
      <textarea className={`${cls} h-20 py-2`} placeholder="Опишите вопрос" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} />
      <input className="hidden" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" />
      {error && <p className="text-xs text-rose-300">{error}</p>}
      <p className="text-[11px] text-white/45">Переписка с консультантом будет приложена — повторять не нужно. Не пишите пароли и данные карт.</p>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy || name.trim().length < 2 || contact.trim().length < 5 || message.trim().length < 5}
          className="flex-1 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-semibold disabled:opacity-40">
          {busy ? "Отправляю…" : "Отправить"}
        </button>
        <button onClick={onCancel} className="h-10 px-3 rounded-xl border border-white/15 text-sm text-white/70">Отмена</button>
      </div>
    </div>
  );
}
