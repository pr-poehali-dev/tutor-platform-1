import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useVoiceInput } from "@/components/teacher/useVoiceInput";
import { AI_CHAT_URL, TTS_URL, PsySection } from "./psychologyData";

interface Msg {
  id: number;
  from: "user" | "helper";
  text: string;
}

interface Props {
  section: PsySection;
}

/**
 * Бережный голосовой чат-помощник «психолог + наставник».
 * Диалог: человек пишет или говорит голосом → Ксюша отвечает текстом
 * и мягким спокойным голосом (Yandex TTS, голос alena, friendly, замедленный темп).
 * Backend ai-chat с психологическими персонами (teacher_id = psy_*).
 */
export default function PsyChat({ section }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, from: "helper", text: section.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  // Озвучка ответа Ксюши мягким голосом
  const speak = useCallback(
    async (text: string) => {
      if (!voiceOn) return;
      try {
        stopSpeaking();
        const res = await fetch(TTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, teacher_id: section.teacherId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.audio_base64) return;
        const audio = new Audio(`data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`);
        audioRef.current = audio;
        setSpeaking(true);
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        await audio.play().catch(() => setSpeaking(false));
      } catch {
        setSpeaking(false);
      }
    },
    [voiceOn, section.teacherId, stopSpeaking],
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Сброс при смене раздела
  useEffect(() => {
    stopSpeaking();
    setMessages([{ id: 0, from: "helper", text: section.greeting }]);
    setInput("");
    setError(null);
  }, [section.slug, section.greeting, stopSpeaking]);

  // Остановить звук при размонтировании
  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const send = useCallback(
    async (textRaw: string) => {
      const text = textRaw.trim();
      if (!text || loading) return;
      stopSpeaking();
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
        speak(reply);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка соединения");
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, section.teacherId, speak, stopSpeaking],
  );

  // Голосовой ввод: распознанный текст сразу отправляем
  const { isRecording, isTranscribing, voiceError, start, stop, setVoiceError } = useVoiceInput(
    (transcript) => send(transcript),
  );

  const toggleMic = () => {
    setError(null);
    setVoiceError(null);
    if (isRecording) stop();
    else start();
  };

  const toggleVoice = () => {
    if (voiceOn) stopSpeaking();
    setVoiceOn((v) => !v);
  };

  const busy = loading || isTranscribing;

  return (
    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[560px]">
      {/* Шапка */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.03]">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-xl flex-shrink-0 ${speaking ? "animate-pulse" : ""}`}>
          {section.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold leading-tight">Ксюша · {section.title.toLowerCase()}</p>
          <p className="text-white/50 text-xs">
            {speaking ? "Ксюша говорит…" : "Бережный психолог-наставник · можно голосом"}
          </p>
        </div>
        <button
          onClick={toggleVoice}
          aria-label={voiceOn ? "Выключить голос" : "Включить голос"}
          title={voiceOn ? "Голос включён" : "Голос выключен"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            voiceOn ? "bg-white/[0.08] text-white" : "bg-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <Icon name={voiceOn ? "Volume2" : "VolumeX"} size={17} />
        </button>
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
        {(error || voiceError) && (
          <div className="text-red-300 text-xs bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
            {error || voiceError}
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
              disabled={busy}
              className="text-xs text-white/70 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Ввод */}
      <div className="px-4 py-3 border-t border-white/10 flex items-end gap-2">
        {/* Микрофон — голосовой ответ */}
        <button
          onClick={toggleMic}
          disabled={loading}
          aria-label={isRecording ? "Остановить запись" : "Сказать голосом"}
          title={isRecording ? "Идёт запись — нажмите, чтобы остановить" : "Сказать голосом"}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-white/[0.06] text-white/80 hover:bg-white/[0.12]"
          }`}
        >
          <Icon name={isTranscribing ? "Loader2" : "Mic"} size={18} className={isTranscribing ? "animate-spin" : ""} />
        </button>

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
          placeholder={isRecording ? "Говорите…" : "Напишите или скажите, что вас тревожит…"}
          disabled={isRecording}
          className="flex-1 resize-none bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/25 max-h-32 disabled:opacity-60"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
          aria-label="Отправить"
        >
          <Icon name="Send" size={18} />
        </button>
      </div>
    </div>
  );
}
