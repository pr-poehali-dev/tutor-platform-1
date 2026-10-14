import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { MarathonDay, MarathonTrack } from "./types";

const AI_URL = (func2url as Record<string, string>)["ai-chat"];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  day: MarathonDay;
  track: MarathonTrack;
}

/** ИИ-наставник урока: отвечает в рамках темы дня, опираясь на конспект урока. */
export default function MarathonMentor({ day, track }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const notes = day.sections
    .map((s) => `${s.title}\n${s.paragraphs.join("\n")}${s.bullets ? "\n" + s.bullets.join("\n") : ""}${s.tip ? "\nСовет: " + s.tip : ""}`)
    .join("\n\n");

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const history = messages.slice(-8);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    const role =
      track === "teacher"
        ? "Ты — ИИ-наставник марафона УЧИСЬПРО для педагогов, которые хотят преподавать скорочтение детям 6–12 лет. Отвечай как опытный методист: конкретно, с примерами упражнений и формулировками для родителей."
        : "Ты — ИИ-наставник марафона УЧИСЬПРО для родителей детей 6–11 лет, которые хотят, чтобы ребёнок читал быстрее и с удовольствием. Отвечай тепло и практично: игры и шаги на 10–15 минут в день, без давления на ребёнка.";
    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: "nika",
          voice_mode: false,
          course_title: `Марафон скорочтения: ${day.title}`,
          subject: "russian",
          lesson_notes: notes,
          history,
          message:
            `${role} Не обещай гарантированных цифр роста скорости. При признаках дислексии, проблем со зрением или речью советуй обратиться к логопеду или врачу. ` +
            `Отвечай по-русски, 3–8 предложений или короткий список.\n\nВопрос: ${q}`,
        }),
      });
      const data = await res.json();
      const reply = String(data?.reply || "Не получилось ответить, попробуйте переформулировать.")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/^#{1,4}\s*/gm, "");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Связь прервалась. Попробуйте ещё раз." }]);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xl">🦉</div>
        <div>
          <p className="font-montserrat font-black text-white">ИИ-наставник</p>
          <p className="text-white/50 text-xs">Отвечает по теме урока круглосуточно</p>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${m.role === "user" ? "bg-violet-500/20 text-white ml-8" : "bg-white/[0.06] text-white/85 mr-8"}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Icon name="Loader2" size={15} className="animate-spin" /> Наставник думает…
            </div>
          )}
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {day.mentorPrompts.map((p) => (
            <button key={p} onClick={() => ask(p)} className="text-left text-xs text-white/80 bg-white/[0.05] border border-white/10 hover:border-violet-400/50 rounded-xl px-3 py-2 transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Задайте вопрос по уроку"
          className="flex-1 min-w-0 bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-violet-400/60"
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-xl px-4 disabled:opacity-40" aria-label="Отправить">
          <Icon name="Send" size={18} />
        </button>
      </form>
    </div>
  );
}
