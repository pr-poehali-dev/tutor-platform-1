import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import func2url from "../../../../backend/func2url.json";

const MKT_URL = (func2url as Record<string, string>)["marketing-strategy"];

interface ChatMessage {
  id?: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

const QUICK_PROMPTS = [
  "Бюджета нет. Откуда взять первые 100 клиентов?",
  "Как реактивировать спящих покупателей бесплатно?",
  "Какой контент-план в VK на месяц?",
  "Как использовать ЗНАЙКИ для виральности?",
];

interface Props {
  pin: string;
}

export default function ChatPanel({ pin }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    if (!pin) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${MKT_URL}?action=chat_history`, {
        headers: { "X-Admin-Pin": pin },
      });
      const data = await res.json();
      setMessages((data.messages || []).filter((m: ChatMessage) => m.role !== "system"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setHistoryLoading(false);
    }
  }, [pin]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Автоскролл вниз при новом сообщении
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setError(null);
    setLoading(true);
    setInput("");
    // Оптимистично добавляем сообщение пользователя
    setMessages((prev) => [...prev, { role: "user", content: msg, created_at: new Date().toISOString() }]);
    try {
      const res = await fetch(`${MKT_URL}?action=chat_send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Ошибка ${res.status}`);
      if (data.reply) {
        setMessages((prev) => [...prev, { id: data.reply.id, role: "assistant", content: data.reply.content, created_at: data.reply.created_at }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <Card className="border border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/[0.06] via-purple-500/[0.04] to-cyan-500/[0.04] p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center">
            <Icon name="MessageCircle" size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-montserrat text-base font-bold text-white">Чат с ИИ-маркетологом</h2>
            <p className="text-white/55 text-xs">Бюджет 0 ₽ — спрашивай про бесплатные методы. Я вижу все метрики продаж.</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={loadHistory} disabled={historyLoading} className="text-white/55 hover:text-white">
          <Icon name="RefreshCw" size={14} className={historyLoading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Лента сообщений */}
      <div
        ref={scrollRef}
        className="rounded-xl border border-white/10 bg-black/20 max-h-[400px] min-h-[200px] overflow-y-auto p-4 mb-3 space-y-3"
      >
        {historyLoading && (
          <div className="text-white/40 text-sm text-center py-8 flex items-center justify-center gap-2">
            <Icon name="Loader2" size={14} className="animate-spin" /> Загружаю историю...
          </div>
        )}
        {!historyLoading && messages.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <Icon name="Sparkles" size={28} className="text-fuchsia-300 mx-auto" />
            <div className="text-white/70 text-sm">Начни диалог — задай вопрос или выбери готовый промпт ниже</div>
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={m.id || i} message={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-white/55 text-sm">
            <Icon name="Loader2" size={14} className="animate-spin text-fuchsia-300" />
            ИИ-маркетолог думает...
          </div>
        )}
      </div>

      {/* Быстрые промпты */}
      {messages.length === 0 && !historyLoading && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100 hover:bg-fuchsia-500/20 transition-all disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-2 text-rose-200 text-xs mb-2 flex items-start gap-2">
          <Icon name="AlertCircle" size={14} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Напиши, что нужно — например, «как привести 100 лидов без бюджета»..."
          className="bg-white/[0.04] border-white/12 min-h-[48px] resize-none"
          rows={1}
          disabled={loading}
        />
        <Button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-400 hover:to-purple-400 flex-shrink-0"
        >
          <Icon name="Send" size={14} />
        </Button>
      </div>
      <p className="text-white/35 text-[10px] mt-1.5">Enter — отправить. Shift+Enter — новая строка.</p>
    </Card>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Icon name="Sparkles" size={12} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border border-purple-400/30 text-white"
            : "bg-white/[0.04] border border-white/10 text-white/90"
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
          <Icon name="User" size={12} className="text-white/70" />
        </div>
      )}
    </div>
  );
}
