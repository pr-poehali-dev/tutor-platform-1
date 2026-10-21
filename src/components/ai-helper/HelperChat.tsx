import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { helperApi } from "./api";

interface Msg {
  role: "user" | "assistant";
  text: string;
  found?: boolean;
}

interface Props {
  slug: string;
  name: string;
  greeting: string;
  color: string;
  compact?: boolean;
}

/** Окно чата с помощником — и для клиентов по ссылке, и для проверки владельцем. */
export default function HelperChat({ slug, name, greeting, color, compact }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, busy]);

  const send = async () => {
    const q = text.trim();
    if (!q || busy) return;
    const history = msgs.map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setText("");
    setBusy(true);
    const r = await helperApi.ask(slug, q, history);
    setBusy(false);
    setMsgs((m) => [
      ...m,
      r.ok && r.data
        ? { role: "assistant", text: r.data.answer, found: r.data.found }
        : { role: "assistant", text: r.error || "Не получилось ответить. Попробуйте ещё раз." },
    ]);
  };

  return (
    <div className={`flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden ${compact ? "h-[460px]" : "h-[calc(100vh-180px)] min-h-[460px]"}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10" style={{ background: `${color}22` }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: color }}>
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-bold leading-tight truncate">{name}</p>
          <p className="text-xs text-white/50">ИИ-помощник · отвечает сразу</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <Bubble role="assistant" text={greeting || "Здравствуйте! Чем могу помочь?"} color={color} />
        {msgs.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.text} color={color} />
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Icon name="Loader2" size={15} className="animate-spin" /> Печатает…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={800}
          placeholder="Напишите вопрос…"
          className="flex-1 h-11 rounded-xl bg-white/[0.06] border border-white/10 px-3 text-sm outline-none focus:border-white/30"
        />
        <button
          onClick={send}
          disabled={busy || !text.trim()}
          className="h-11 w-11 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
          style={{ background: color }}
          aria-label="Отправить"
        >
          <Icon name="Send" size={18} />
        </button>
      </div>
    </div>
  );
}

function Bubble({ role, text, color }: { role: "user" | "assistant"; text: string; color: string }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${mine ? "text-white" : "bg-white/[0.07] text-white/90"}`}
        style={mine ? { background: color } : undefined}
      >
        {text}
      </div>
    </div>
  );
}
