import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import useLessonNarrator, { NARRATOR_VOICES } from "@/hooks/useLessonNarrator";

const AI_CHAT_URL = "https://functions.poehali.dev/d2f39a05-0f9a-44a1-a65e-cace2e81c84b";

interface Props {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  courseEmoji: string;
  subject: string;        // "math" | "physics" | ...
  grade?: string;
  accent?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Сопоставление предмета курса с teacher_id из TTS/ai-chat
const SUBJECT_TO_TEACHER: Record<string, string> = {
  math: "alex",
  physics: "dmitry",
  english: "sofia",
  russian: "nika",
  literature: "nika",
  chemistry: "dmitry",
  biology: "dmitry",
  cs: "alex",
};

export default function CourseVoiceDialog({
  open,
  onClose,
  courseTitle,
  courseEmoji,
  subject,
  grade = "5-9",
  accent = "#a855f7",
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const teacherId = SUBJECT_TO_TEACHER[subject] || "alex";
  const narrator = useLessonNarrator();

  // При открытии — обновим голос под предмет курса (если пользователь не менял вручную)
  useEffect(() => {
    if (open) {
      narrator.setVoiceId(teacherId);
      // Приветствие
      if (messages.length === 0) {
        const greeting = `Привет! Я твой ИИ-репетитор по курсу «${courseTitle}». Можешь задать любой вопрос — голосом или текстом. С чего начнём?`;
        setMessages([{ role: "assistant", content: greeting }]);
        setTimeout(() => narrator.speak(greeting), 300);
      }
    } else {
      narrator.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Автоскролл вниз
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const sendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || thinking) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setTextInput("");
    setThinking(true);
    try {
      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacherId,
          history: next.slice(0, -1).slice(-10),
          message: trimmed,
          subject,
          grade,
          course_title: courseTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Ошибка ответа");
      const reply = (data?.reply || "").trim() || "Извини, не понял. Повтори, пожалуйста?";
      setMessages([...next, { role: "assistant", content: reply }]);
      // Озвучиваем ответ
      setTimeout(() => narrator.speak(reply), 100);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось получить ответ";
      setMessages([...next, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setThinking(false);
    }
  };

  const recorder = useVoiceRecorder((text) => {
    sendMessage(text);
  });

  if (!open) return null;

  const isRecording = recorder.state === "recording";
  const isProcessing = recorder.state === "processing";
  const voiceLabel = NARRATOR_VOICES.find((v) => v.id === narrator.voiceId)?.name || "ИИ-репетитор";

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card/95 backdrop-blur-2xl border-2 border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3 border-b border-white/10 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}20, transparent)` }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 relative"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
          >
            {courseEmoji}
            {narrator.status === "playing" && (
              <span
                className="absolute -inset-1 rounded-2xl border-2 animate-ping"
                style={{ borderColor: accent }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-tight truncate">Репетитор {voiceLabel}</p>
            <p className="text-white/55 text-xs leading-tight mt-0.5 truncate">{courseTitle}</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Сменить голос"
            className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Icon name="Settings2" size={16} className="text-white/70" />
          </button>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Icon name="X" size={16} className="text-white/70" />
          </button>
        </div>

        {/* Settings: voice picker */}
        {showSettings && (
          <div className="px-5 py-3 border-b border-white/10 bg-white/4 animate-fade-in flex-shrink-0">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Голос репетитора</p>
            <div className="grid grid-cols-4 gap-1.5">
              {NARRATOR_VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => narrator.setVoiceId(v.id)}
                  className={`px-2 py-2 rounded-xl text-center transition-all border text-xs ${
                    narrator.voiceId === v.id
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/8 bg-white/3 hover:bg-white/6 text-white/75"
                  }`}
                  style={narrator.voiceId === v.id ? { borderColor: accent + "90" } : {}}
                >
                  <p className="font-bold">{v.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[280px]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              {m.role === "assistant" && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
                >
                  {courseEmoji}
                </div>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl max-w-[78%] text-sm leading-relaxed ${
                  m.role === "user"
                    ? "text-white"
                    : "bg-white/[0.08] border border-white/12 text-white/95"
                }`}
                style={m.role === "user" ? { background: `linear-gradient(135deg, ${accent}, ${accent}cc)` } : {}}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button
                    onClick={() => narrator.speak(m.content)}
                    aria-label="Озвучить ответ"
                    className="ml-2 inline-flex items-center align-middle text-white/45 hover:text-white transition-colors"
                  >
                    <Icon name="Volume2" size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2.5 justify-start animate-fade-in">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
              >
                {courseEmoji}
              </div>
              <div className="bg-white/[0.08] border border-white/12 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Recording indicator */}
        {(isRecording || isProcessing) && (
          <div className="px-5 py-3 border-t border-white/10 bg-red-500/10 flex items-center gap-3 flex-shrink-0">
            {isRecording ? (
              <>
                <div className="relative">
                  <Icon name="Mic" size={18} className="text-red-400" />
                  <span className="absolute -inset-2 rounded-full border-2 border-red-400 animate-ping" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-bold">Слушаю тебя…</p>
                  <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-red-400 transition-all duration-100"
                      style={{ width: `${recorder.level * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={recorder.cancel}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
                  aria-label="Отменить"
                >
                  <Icon name="X" size={14} className="text-white" />
                </button>
                <button
                  onClick={recorder.stop}
                  className="px-4 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center gap-1.5"
                >
                  <Icon name="Check" size={14} /> Готово
                </button>
              </>
            ) : (
              <>
                <Icon name="Loader2" size={18} className="text-white/70 animate-spin" />
                <p className="text-white/80 text-sm">Распознаю речь…</p>
              </>
            )}
          </div>
        )}

        {recorder.error && (
          <div className="px-5 py-2 bg-red-500/15 text-red-200 text-xs border-t border-red-500/30 flex-shrink-0">
            ⚠️ {recorder.error}
          </div>
        )}

        {/* Input row */}
        <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2 flex-shrink-0 bg-card/60">
          {/* Микрофон — большая кнопка */}
          <button
            onClick={isRecording ? recorder.stop : recorder.start}
            disabled={thinking || isProcessing}
            aria-label={isRecording ? "Остановить запись" : "Записать голосовой вопрос"}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50 ${
              isRecording ? "bg-red-500 hover:bg-red-600" : "hover:scale-105"
            }`}
            style={!isRecording ? { background: `linear-gradient(135deg, ${accent}, ${accent}cc)` } : {}}
          >
            <Icon name={isRecording ? "Square" : "Mic"} size={20} className="text-white" />
          </button>

          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(textInput); } }}
            placeholder={isRecording ? "Запись…" : "Спроси что-нибудь или нажми микрофон"}
            disabled={isRecording || isProcessing || thinking}
            className="flex-1 bg-white/[0.09] border border-white/15 focus:border-white/30 focus:bg-white/[0.12] rounded-2xl px-4 h-12 text-white text-sm placeholder-white/40 outline-none disabled:opacity-60"
          />

          <button
            onClick={() => sendMessage(textInput)}
            disabled={!textInput.trim() || thinking}
            aria-label="Отправить"
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            <Icon name="Send" size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
