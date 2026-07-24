import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { journalList, journalPost, JournalMsg, COACH_COURSE_ID } from "./api";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";

const COACH_PRICE = 10000;

export default function CoachJournal() {
  const { isAuthenticated, openLogin } = useAuth();
  const { buyCourse } = useAccess();

  const [loading, setLoading] = useState(true);
  const [coachAccess, setCoachAccess] = useState(false);
  const [messages, setMessages] = useState<JournalMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await journalList();
    if (res.ok) {
      setCoachAccess(!!res.coach_access);
      setMessages(res.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    const optimistic: JournalMsg = { id: Date.now(), role: "user", content, created_at: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    setText("");
    const res = await journalPost(content);
    if (!res.ok) {
      setError(res.message || "Не удалось отправить");
      if (res.status === 402) setCoachAccess(false);
    } else if (res.reply) {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "coach", content: res.reply!, created_at: new Date().toISOString() }]);
    }
    setSending(false);
  };

  const startPay = async () => {
    if (buying) return;
    setBuying(true);
    setError(null);
    const returnUrl = `${window.location.origin}/career-pro?coach=1`;
    const res = await buyCourse(COACH_COURSE_ID, "adult", "Наставник PRO — дневник-коуч", returnUrl);
    setBuying(false);
    if (!res.ok) {
      setError(res.message || "Не удалось оформить");
      return;
    }
    if (res.alreadyPurchased) {
      setCoachAccess(true);
      load();
      return;
    }
    if (res.paymentUrl) {
      window.location.href = res.paymentUrl;
    } else {
      setError("Оплата временно недоступна, попробуйте позже");
    }
  };

  // ── Состояние 1: не авторизован ──
  if (!isAuthenticated) {
    return (
      <Shell>
        <Locked
          title="Войдите, чтобы открыть наставника"
          text="Живой наставник-дневник доступен в личном кабинете. Войдите — и продолжим."
          buttonLabel="Войти"
          onClick={() => openLogin()}
        />
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <div className="py-10 text-center text-white/50">
          <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2 text-purple-300" />
          Загружаем ваш дневник…
        </div>
      </Shell>
    );
  }

  // ── Состояние 2: авторизован, но не оплатил ──
  if (!coachAccess) {
    return (
      <Shell>
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-2xl mx-auto mb-4">
            🧭
          </div>
          <h3 className="font-montserrat font-black text-white text-xl mb-2">
            Личный наставник-коуч
          </h3>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-5">
            Жёсткий, но справедливый наставник-психолог. Пишите ему как в дневник: «забросил»,
            «нет сил», «не получается» — он честно разберёт причину и даст конкретный шаг, чтобы
            вы не бросили свой 5-летний план.
          </p>
          <div className="grid sm:grid-cols-3 gap-2 max-w-lg mx-auto mb-6 text-left">
            {[
              { icon: "MessageCircleHeart", t: "Разбор «почему не получается»" },
              { icon: "NotebookPen", t: "Дневник с историей и поддержкой" },
              { icon: "Zap", t: "Честный «пинок» и шаги" },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Icon name={f.icon} size={18} className="text-amber-300 mb-1.5" />
                <div className="text-white/80 text-xs">{f.t}</div>
              </div>
            ))}
          </div>
          <button
            onClick={startPay}
            disabled={buying}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold px-8 py-3.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {buying ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Lock" size={18} />}
            Открыть наставника — {COACH_PRICE.toLocaleString("ru-RU")} ₽
          </button>
          {error && <div className="text-rose-300 text-xs mt-3">{error}</div>}
          <p className="text-white/35 text-[11px] mt-3">Разовая оплата. Доступ сохраняется в вашем кабинете.</p>
        </div>
      </Shell>
    );
  }

  // ── Состояние 3: оплачено — чат-дневник ──
  return (
    <Shell>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-lg">
          🧭
        </div>
        <div>
          <div className="font-bold text-white">Марк · ваш наставник-коуч</div>
          <div className="text-white/45 text-xs">Жёсткий, но всегда на вашей стороне</div>
        </div>
      </div>

      <div
        ref={listRef}
        className="max-h-[420px] overflow-y-auto space-y-3 mb-4 pr-1"
      >
        {messages.length === 0 && (
          <div className="text-white/55 text-sm bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            Здравствуйте. Я — ваш наставник. Расскажите честно, как идут дела с вашим планом:
            что получается, а что застопорилось? Не подбирайте слова — пишите как есть.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
                m.role === "user"
                  ? "bg-purple-500/20 border border-purple-400/30 text-white"
                  : "bg-white/[0.05] border border-white/10 text-white/85"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2.5 bg-white/[0.05] border border-white/10 text-white/50 text-sm">
              <Icon name="Loader2" size={14} className="animate-spin inline mr-1.5" /> Наставник думает…
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-rose-300 text-xs mb-2">{error}</div>}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
          placeholder="Напишите наставнику: что мешает, что чувствуете…"
          rows={2}
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 resize-none"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition-transform"
          aria-label="Отправить"
        >
          <Icon name="Send" size={18} />
        </button>
      </div>
      <p className="text-white/30 text-[11px] mt-2">
        Наставник — ИИ и не заменяет врача. В кризисной ситуации звоните 8-800-2000-122 (бесплатно).
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/8 to-rose-500/6 p-6 md:p-7">
      {children}
    </div>
  );
}

function Locked({
  title,
  text,
  buttonLabel,
  onClick,
}: {
  title: string;
  text: string;
  buttonLabel: string;
  onClick?: () => void;
}) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl mx-auto mb-4">
        🔐
      </div>
      <h3 className="font-montserrat font-black text-white text-xl mb-2">{title}</h3>
      <p className="text-white/70 text-sm max-w-md mx-auto mb-5">{text}</p>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-8 py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
      >
        <Icon name="LogIn" size={18} /> {buttonLabel}
      </button>
    </div>
  );
}