import { useCallback, useRef, useState } from "react";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";

const AI_CHAT_URL = "https://functions.poehali.dev/d2f39a05-0f9a-44a1-a65e-cace2e81c84b";
const TTS_URL = "https://functions.poehali.dev/fa3b03da-815c-4f28-baf2-1a88e36fca8d";

export interface DialogMessage {
  id: number;
  from: "student" | "teacher";
  text: string;
}

export type DialogPhase = "idle" | "listening" | "thinking" | "speaking" | "error";

interface VoiceDialogContext {
  teacherId: string;       // голос/персона преподавателя (alex/sofia/dmitry/nika)
  subject: string;         // предмет курса
  grade: string;           // класс/уровень
  courseTitle: string;     // название курса
  topic: string;           // тема урока
  lessonTitle?: string;    // название урока
}

/** Полный голосовой диалог «как Алиса»: микрофон → распознавание → ИИ-ответ
 *  с учётом темы урока и истории → озвучка. Поддерживает hands-free режим. */
export default function useVoiceDialog(ctx: VoiceDialogContext) {
  const [messages, setMessages] = useState<DialogMessage[]>([]);
  const [phase, setPhase] = useState<DialogPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [handsFree, setHandsFree] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const handsFreeRef = useRef(handsFree);
  handsFreeRef.current = handsFree;
  const historyRef = useRef<DialogMessage[]>([]);
  // Ссылка на функцию повторного прослушивания (для hands-free режима),
  // чтобы не зависеть от порядка объявления функций.
  const restartListenRef = useRef<(() => void) | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string, onDone: () => void) => {
    setPhase("speaking");
    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 4500), teacher_id: ctxRef.current.teacherId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.audio_base64) {
        // Без озвучки — не критично, просто показываем текст
        onDone();
        return;
      }
      stopAudio();
      const audio = new Audio(`data:${data.mime || "audio/mpeg"};base64,${data.audio_base64}`);
      audioRef.current = audio;
      audio.onended = () => { onDone(); };
      audio.onerror = () => { onDone(); };
      await audio.play().catch(() => onDone());
    } catch {
      onDone();
    }
  }, [stopAudio]);

  const askAI = useCallback(async (userText: string) => {
    const c = ctxRef.current;
    const userMsg: DialogMessage = { id: Date.now(), from: "student", text: userText };
    const history = [...historyRef.current, userMsg];
    historyRef.current = history;
    setMessages([...history]);
    setPhase("thinking");
    setError(null);

    // Тема урока добавляется в сообщение — ИИ держит контекст конкретного урока
    const contextualMessage = c.topic
      ? `Контекст урока: тема «${c.topic}»${c.lessonTitle ? `, урок «${c.lessonTitle}»` : ""}. Вопрос ученика: ${userText}`
      : userText;

    try {
      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: c.teacherId,
          message: contextualMessage,
          history: historyRef.current.slice(-12).map(m => ({
            role: m.from === "teacher" ? "assistant" : "user",
            content: m.text,
          })),
          subject: c.subject,
          grade: c.grade,
          course_title: c.courseTitle,
          voice_mode: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "ИИ-преподаватель не ответил");
      const reply = (data.reply || "").trim() || "Извини, не расслышал. Повтори, пожалуйста.";
      const teacherMsg: DialogMessage = { id: Date.now() + 1, from: "teacher", text: reply };
      historyRef.current = [...historyRef.current, teacherMsg];
      setMessages([...historyRef.current]);

      speak(reply, () => {
        // hands-free: после ответа снова слушаем
        if (handsFreeRef.current) {
          setPhase("idle");
          restartListenRef.current?.();
        } else {
          setPhase("idle");
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setPhase("error");
    }
     
  }, [speak]);

  const recorder = useVoiceRecorder((text: string) => {
    if (text.trim()) askAI(text.trim());
    else setPhase("idle");
  });

  const recorderRef = useRef(recorder);
  recorderRef.current = recorder;

  const startListening = useCallback(() => {
    stopAudio();
    setError(null);
    setPhase("listening");
    recorderRef.current.start();
  }, [stopAudio]);
  restartListenRef.current = startListening;

  const stopListening = useCallback(() => {
    recorderRef.current.stop();
    setPhase("thinking");
  }, []);

  const reset = useCallback(() => {
    stopAudio();
    recorderRef.current.cancel();
    historyRef.current = [];
    setMessages([]);
    setPhase("idle");
    setError(null);
    setHandsFree(false);
  }, [stopAudio]);

  // Синхронизируем фазу с реальным состоянием рекордера и его ошибками
  const recState = recorder.state;
  const effectivePhase: DialogPhase =
    recState === "recording" ? "listening" :
    recState === "processing" && phase !== "thinking" ? "thinking" :
    phase;

  const combinedError = error || recorder.error;

  return {
    messages,
    phase: combinedError && phase !== "speaking" ? "error" : effectivePhase,
    error: combinedError,
    level: recorder.level,
    handsFree,
    setHandsFree,
    startListening,
    stopListening,
    sendText: askAI,
    reset,
    isBusy: phase === "thinking" || phase === "speaking",
  };
}