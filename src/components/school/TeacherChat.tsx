import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { fetchTeacherInfo, askTeacher, type ChatMessage } from "./teacherApi";

interface Props {
  courseId: number;
}

export default function TeacherChat({ courseId }: Props) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeacherInfo(courseId).then((r) => {
      if (r.ok && r.data) {
        setAvailable(r.data.enabled);
        setSchoolName(r.data.school_name);
      } else {
        setAvailable(false);
      }
    });
  }, [courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const history = messages.slice(-10);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    const res = await askTeacher(courseId, text, history);
    setSending(false);
    if (res.ok && res.data) {
      setMessages((m) => [...m, { role: "assistant", content: res.data!.reply }]);
    } else {
      setMessages((m) => [...m, { role: "assistant", content: res.error || "Не удалось получить ответ." }]);
    }
  };

  if (available === null || available === false) return null;

  return (
    <div className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/8 to-cyan-500/5 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Icon name="Sparkles" size={20} className="text-white" />
        </div>
        <div>
          <div className="font-montserrat font-bold text-white text-sm">ИИ-наставник</div>
          <div className="text-white/50 text-xs">{schoolName} · отвечает по вашему курсу 24/7</div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3 max-h-[420px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-white/60 text-sm mb-3">Задайте вопрос по материалам курса — я помогу разобраться.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Объясни первую тему простыми словами", "С чего начать обучение?", "Дай пример из практики"].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs text-violet-200 border border-violet-500/30 hover:bg-violet-500/10 rounded-lg px-3 py-1.5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-violet-500/25 text-white"
                  : "bg-white/[0.06] text-white/90 border border-white/8"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white/[0.06] border border-white/8 rounded-2xl px-4 py-3">
              <Icon name="Loader2" size={16} className="text-violet-300 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-5 py-4 border-t border-white/8 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Спросите о материалах курса…"
          className="flex-1 bg-white/[0.05] border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl hover:scale-[1.03] transition-transform disabled:opacity-50"
          aria-label="Отправить"
        >
          <Icon name="Send" size={17} />
        </button>
      </div>
    </div>
  );
}
