import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { AI_CHAT_URL, PsySection } from "./psychologyData";

interface Msg {
  id: number;
  from: "user" | "helper";
  text: string;
}

interface Props {
  section: PsySection;
}

/**
 * Бережный чат-помощник «психолог + наставник» для раздела психологической помощи.
 * Переиспользует backend ai-chat с психологическими персонами (teacher_id = psy_*).
 * Текстовый режим (voice_mode: false) — развёрнутые тёплые ответы.
 */
export default function PsyChat({ section }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, from: "helper", text: section.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Сброс при смене раздела
  useEffect(() => {
    setMessages([{ id: 0, from: "helper", text: section.greeting }]);
    setInput("");
    setError(null);
  }, [section.slug, section.greeting]);

  const send = async (textRaw: string) => {
    const text = textRaw.trim();
    if (!text || loading) return;
    const userMsg: Msg = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: section.teacherId,
          message: text,
          history,
          voice_mode: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось получить ответ");
      const reply = data.reply || "Извините, не смогла ответить. Попробуйте написать иначе.";
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: "helper", text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[560px]">
      {/* Шапка */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.03]">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-xl flex-shrink-0`}>
          {section.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold leading-tight">Ксюша · {section.title.toLowerCase()}</p>
          <p className="text-white/50 text-xs">Бережный психолог-наставник · разговор конфиденциален</p>
        </div>
      </div>

      {/* Сообщения */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.from === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-white/[0.06] text-white/90 rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.06] text-white/60 px-4 py-3 rounded-2xl rounded-bl-md text-sm flex items-center gap-2">
              <Icon name="Loader2" size={14} className="animate-spin" />
              Ксюша думает над ответом…
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-300 text-xs bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Подсказки-затравки */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {section.prompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading}
              className="text-xs text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Ввод */}
      <div className="px-4 py-3 border-t border-white/10 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Напишите, что вас тревожит…"
          className="flex-1 resize-none bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/25 max-h-32"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
          aria-label="Отправить"
        >
          <Icon name="Send" size={18} />
        </button>
      </div>
    </div>
  );
}
