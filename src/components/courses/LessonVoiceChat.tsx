import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { MathText } from "@/lib/mathFormat";
import useVoiceDialog from "@/hooks/useVoiceDialog";
import { teacherForSubject, TEACHER_DISPLAY } from "@/lib/teacherForSubject";

interface Props {
  subject: string;
  grade: string;
  courseTitle: string;
  topic: string;
  lessonTitle?: string;
  accent?: string;
  /** Вызывается при открытии диалога — чтобы остановить автоозвучку урока. */
  onOpen?: () => void;
}

const PHASE_LABEL: Record<string, string> = {
  idle: "Нажми и спроси голосом",
  listening: "Слушаю тебя…",
  thinking: "Думаю над ответом…",
  speaking: "Отвечаю…",
  error: "Что-то пошло не так",
};

export default function LessonVoiceChat({ subject, grade, courseTitle, topic, lessonTitle, accent = "#a855f7", onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const teacherId = teacherForSubject(subject);
  const teacher = TEACHER_DISPLAY[teacherId] || TEACHER_DISPLAY.alex;

  const dialog = useVoiceDialog({ teacherId, subject, grade, courseTitle, topic, lessonTitle });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [dialog.messages, dialog.phase]);

  const { phase, level } = dialog;
  const isListening = phase === "listening";
  const isBusy = phase === "thinking" || phase === "speaking";

  const handleMicClick = () => {
    if (isListening) {
      dialog.stopListening();
    } else if (phase === "speaking") {
      // прервать ответ и слушать снова
      dialog.startListening();
    } else if (!isBusy) {
      dialog.startListening();
    }
  };

  // Масштаб пульсации микрофона по уровню звука
  const pulse = isListening ? 1 + Math.min(level * 0.6, 0.6) : 1;

  if (!open) {
    return (
      <button
        onClick={() => { onOpen?.(); setOpen(true); }}
        className="fixed bottom-5 right-5 z-[130] flex items-center gap-2 px-4 py-3 rounded-full text-white font-bold shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, boxShadow: `0 8px 30px ${accent}66` }}
      >
        <Icon name="Mic" size={18} />
        <span className="text-sm">Спросить голосом</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[130] w-[min(92vw,380px)] animate-fade-in">
      <div className="bg-card/95 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "70vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ background: `${accent}18` }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${accent}30` }}>
              {teacher.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">Голосовой диалог · {teacher.name}</p>
              <p className="text-white/50 text-xs truncate">{topic || courseTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => dialog.setHandsFree(!dialog.handsFree)}
              title={dialog.handsFree ? "Режим разговора включён" : "Включить режим разговора"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                dialog.handsFree ? "bg-green-500/25 text-green-300" : "bg-white/10 text-white/50 hover:text-white"
              }`}
            >
              <Icon name="Repeat" size={14} />
            </button>
            <button
              onClick={() => { dialog.reset(); setOpen(false); }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <Icon name="X" size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-[120px]">
          {dialog.messages.length === 0 && (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🎙️</div>
              <p className="text-white/60 text-sm leading-relaxed">
                Спроси что угодно по теме <span className="text-white font-semibold">«{topic || courseTitle}»</span> —
                {teacher.name} ответит голосом, как живой преподаватель.
              </p>
              {dialog.handsFree && (
                <p className="text-green-300/80 text-xs mt-2">Режим разговора: после ответа я снова слушаю.</p>
              )}
            </div>
          )}
          {dialog.messages.map(m => (
            <div key={m.id} className={`flex ${m.from === "student" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.from === "student"
                    ? "bg-white/12 text-white rounded-br-md"
                    : "text-white rounded-bl-md"
                }`}
                style={m.from === "teacher" ? { background: `${accent}22`, border: `1px solid ${accent}33` } : undefined}
              >
                {m.from === "teacher" ? <MathText>{m.text}</MathText> : m.text}
              </div>
            </div>
          ))}
          {phase === "thinking" && (
            <div className="flex justify-start">
              <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-1" style={{ background: `${accent}22` }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {dialog.error && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-red-500/12 border border-red-500/25 text-red-300 text-xs leading-snug">
            {dialog.error}
          </div>
        )}

        {/* Mic control */}
        <div className="px-4 py-4 border-t border-white/10 flex flex-col items-center gap-2">
          <button
            onClick={handleMicClick}
            disabled={phase === "thinking"}
            className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
            style={{
              background: isListening
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              transform: `scale(${pulse})`,
              boxShadow: isListening ? "0 0 0 8px rgba(239,68,68,0.18)" : `0 6px 24px ${accent}55`,
            }}
          >
            {phase === "thinking" ? (
              <Icon name="Loader2" size={26} className="text-white animate-spin" />
            ) : phase === "speaking" ? (
              <Icon name="Volume2" size={26} className="text-white" />
            ) : (
              <Icon name={isListening ? "Square" : "Mic"} size={24} className="text-white" />
            )}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-2 border-red-400/40 animate-ping" />
            )}
          </button>
          <p className="text-white/60 text-xs">{PHASE_LABEL[phase] || PHASE_LABEL.idle}</p>
        </div>
      </div>
    </div>
  );
}