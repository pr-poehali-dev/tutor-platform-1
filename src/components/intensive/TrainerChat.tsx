import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { trainerTurn, getSessionId, TrainerMessage } from "./api";

interface Props {
  scenarioKey: string;
  title: string;
  greeting: string;
}

export default function TrainerChat({ scenarioKey, title, greeting }: Props) {
  const [messages, setMessages] = useState<TrainerMessage[]>([{ from: "client", text: greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ from: "client", text: greeting }]);
    setError(null);
  }, [scenarioKey, greeting]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: TrainerMessage = { from: "user", text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    const res = await trainerTurn(getSessionId(), scenarioKey, text, next);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Ошибка");
      return;
    }
    setMessages((prev) => [...prev, { from: "client", text: res.reply || "" }]);
  };

  return (
    <div className="bg-card border border-purple-500/20 rounded-3xl overflow-hidden flex flex-col h-[480px]">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-purple-500/[0.07]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center">
          <Icon name="Bot" size={18} className="text-purple-300" />
        </div>
        <div>
          <div className="font-montserrat font-bold text-white text-sm">ИИ-тренажёр</div>
          <div className="text-white/50 text-xs">{title}</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.from === "user"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/[0.06] text-white/85 border border-white/10"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3">
              <Icon name="Loader2" size={16} className="animate-spin text-purple-300" />
            </div>
          </div>
        )}
      </div>

      {error && <div className="px-4 py-2 text-rose-300 text-xs">{error}</div>}

      <div className="border-t border-white/10 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Твой ход — напиши ответ клиенту..."
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 rounded-xl disabled:opacity-50 transition-opacity"
          aria-label="Отправить"
        >
          <Icon name="Send" size={18} />
        </button>
      </div>
    </div>
  );
}
