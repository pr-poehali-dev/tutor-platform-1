import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { trackGoal } from "@/components/analytics/YandexMetrika";

const AI_URL = (func2url as Record<string, string>)["ai-chat"];

const EXAMPLES = [
  "Не понимаю производные",
  "Как решать задачи на проценты?",
  "Объясни теорему Пифагора",
  "Разбор задания 13 ЕГЭ",
];

type Msg = { role: "user" | "assistant"; text: string };

/**
 * Живая проба ИИ-репетитора прямо на первом экране.
 * Без регистрации и без перехода на другую страницу: человек задаёт вопрос,
 * за пару секунд получает настоящий ответ и убеждается, что продукт работает.
 * Регистрацию предлагаем только после первого полученного ответа.
 */
export default function HeroTryTutor() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setError(null);
    const history = msgs.map((m) => ({ role: m.role, content: m.text }));
    setMsgs((p) => [...p, { role: "user", text: q }]);
    setLoading(true);
    trackGoal("hero_try_ask", { first: msgs.length === 0 });

    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history, voice_mode: false }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.reply) throw new Error("no reply");
      setMsgs((p) => [...p, { role: "assistant", text: String(data.reply) }]);
      trackGoal("hero_try_answer");
    } catch {
      setError("Репетитор сейчас занят. Попробуй ещё раз через минуту.");
    } finally {
      setLoading(false);
    }
  };

  const answered = msgs.some((m) => m.role === "assistant");

  return (
    <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-sm p-4 sm:p-5 shadow-2xl shadow-purple-500/10">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>
        <p className="text-sm font-bold text-white">
          Спроси репетитора прямо сейчас
        </p>
        <span className="ml-auto text-[11px] text-white/55 whitespace-nowrap">
          без регистрации
        </span>
      </div>

      {msgs.length > 0 && (
        <div
          ref={scrollRef}
          className="mb-3 max-h-64 overflow-y-auto space-y-2.5 pr-1"
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-purple-500/25 border border-purple-400/30 px-3.5 py-2 text-sm text-white"
                  : "mr-auto max-w-[92%] rounded-2xl rounded-bl-md bg-white/8 border border-white/12 px-3.5 py-2 text-sm text-white/90 whitespace-pre-wrap leading-relaxed"
              }
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="mr-auto flex items-center gap-2 rounded-2xl bg-white/8 border border-white/12 px-3.5 py-2.5">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-white/70 animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
              <span className="text-xs text-white/60 ml-1">думает…</span>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напиши, что не понимаешь…"
          aria-label="Вопрос ИИ-репетитору"
          className="flex-1 min-w-0 rounded-xl bg-white/8 border border-white/15 px-3.5 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-purple-400/60 focus:bg-white/12 transition"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Отправить вопрос"
          className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition"
        >
          <Icon name={loading ? "Loader2" : "Send"} size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </form>

      {msgs.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => ask(ex)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] sm:text-xs text-white/75 hover:bg-white/12 hover:text-white transition"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2.5 text-xs text-rose-300 flex items-center gap-1.5">
          <Icon name="TriangleAlert" size={13} /> {error}
        </p>
      )}

      {answered && (
        <div className="mt-3.5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3.5">
          <p className="text-sm text-white/90 mb-2.5 leading-snug">
            Так он объясняет любую тему — и помнит, что ты уже прошёл.
            Сохрани прогресс и получи персональный план.
          </p>
          <Link
            to="/courses"
            onClick={() => trackGoal("hero_try_cta")}
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white hover:scale-[1.02] transition"
          >
            Продолжить бесплатно
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
