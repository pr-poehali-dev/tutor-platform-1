import { useEffect, useRef, useState } from "react";
import func2url from "../../../backend/func2url.json";
import Icon from "@/components/ui/icon";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import { haptic } from "./maxBridge";

const AI_URL = (func2url as Record<string, string>)["ai-chat"];
const TTS_URL = (func2url as Record<string, string>)["tts"];
const HISTORY_KEY = "max_tutor_history_v1";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = ["Объясни дроби простыми словами", "Как найти дискриминант?", "Чем причастие отличается от деепричастия?", "Помоги подготовиться к ОГЭ"];

function gradeBand(grade?: string | null): string | undefined {
  const g = Number(grade);
  if (!g) return undefined;
  return g <= 4 ? "1-4" : g <= 9 ? "5-9" : "10-11";
}

export default function TutorTab({ grade, name }: { grade?: string | null; name?: string | null }) {
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceAnswers, setVoiceAnswers] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-20)));
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  const speak = async (text: string) => {
    try {
      const r = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 1500), teacher_id: "alex" }),
      });
      const d = await r.json();
      if (!d.audio_base64) return;
      audioRef.current?.pause();
      audioRef.current = new Audio(`data:${d.mime || "audio/mpeg"};base64,${d.audio_base64}`);
      audioRef.current.play().catch(() => {});
    } catch {
      /* без озвучки текст всё равно на экране */
    }
  };

  const send = async (text: string, viaVoice = false) => {
    const q = text.trim();
    if (!q || busy) return;
    haptic();
    setError("");
    setInput("");
    const history = msgs.slice(-10);
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const r = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          history,
          teacher_id: "alex",
          grade: gradeBand(grade),
          voice_mode: viaVoice || voiceAnswers,
          user_profile: name ? { name } : undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.reply) throw new Error(d.error || "Репетитор не ответил");
      setMsgs((m) => [...m, { role: "assistant", content: d.reply }]);
      if (viaVoice || voiceAnswers) speak(d.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Нет связи. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const rec = useVoiceRecorder((t) => send(t, true));
  const recording = rec.state === "recording";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div>
          <h1 className="text-xl font-bold">Репетитор</h1>
          <p className="text-xs text-white/50">Объясняет, а не решает за тебя</p>
        </div>
        <button
          onClick={() => setVoiceAnswers((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${voiceAnswers ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/70"}`}
        >
          <Icon name={voiceAnswers ? "Volume2" : "VolumeX"} size={14} />
          Озвучка
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {!msgs.length && (
          <div className="pt-6">
            <p className="mb-4 text-center text-white/60">Спроси что угодно по школьной программе — текстом или голосом</p>
            <div className="grid gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-left text-[15px] active:bg-white/10">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                m.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-white/[0.08]"
              }`}
            >
              {m.content}
              {m.role === "assistant" && (
                <button onClick={() => speak(m.content)} className="mt-2 flex items-center gap-1 text-xs text-white/50" aria-label="Озвучить">
                  <Icon name="Volume2" size={13} />
                  Послушать
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Icon name="Loader2" size={16} className="animate-spin" />
            Репетитор думает…
          </div>
        )}
        {error && <p className="text-sm text-rose-300">{error}</p>}
        {rec.error && <p className="text-sm text-rose-300">{rec.error}</p>}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/10 bg-background/95 p-3">
        {recording || rec.state === "processing" ? (
          <button
            onClick={() => (recording ? rec.stop() : undefined)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 text-base font-semibold text-white"
          >
            <Icon name={recording ? "Square" : "Loader2"} size={18} className={recording ? "" : "animate-spin"} />
            {recording ? "Остановить и отправить" : "Распознаю…"}
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <button type="button" onClick={() => rec.start()} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10" aria-label="Голосом">
              <Icon name="Mic" size={22} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="Твой вопрос…"
              className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[15px] outline-none focus:border-primary/60"
            />
            <button type="submit" disabled={!input.trim() || busy} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-40" aria-label="Отправить">
              <Icon name="Send" size={20} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
